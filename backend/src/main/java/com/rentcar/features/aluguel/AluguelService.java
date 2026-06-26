package com.rentcar.features.aluguel;

import com.rentcar.common.exception.BusinessException;
import com.rentcar.common.security.AuthUtils;
import com.rentcar.common.security.CustomUserDetails;
import com.rentcar.common.validation.CnhValidator;
import com.rentcar.features.aluguel.dto.AluguelRequest;
import com.rentcar.features.aluguel.dto.AluguelResponse;
import com.rentcar.features.aluguel.dto.DevolucaoRequest;
import com.rentcar.features.usuario.Usuario;
import com.rentcar.features.usuario.UsuarioRepository;
import com.rentcar.features.veiculo.Veiculo;
import com.rentcar.features.veiculo.VeiculoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AluguelService {

    private final AluguelRepository aluguelRepository;
    private final UsuarioRepository usuarioRepository;
    private final VeiculoRepository veiculoRepository;

    public AluguelService(AluguelRepository aluguelRepository, UsuarioRepository usuarioRepository,
                          VeiculoRepository veiculoRepository) {
        this.aluguelRepository = aluguelRepository;
        this.usuarioRepository = usuarioRepository;
        this.veiculoRepository = veiculoRepository;
    }

    public List<AluguelResponse> listar() {
        return aluguelRepository.findAll().stream()
                .map(AluguelResponse::from)
                .toList();
    }

    public List<AluguelResponse> listarPorUsuario(Long usuarioId) {
        validarAcessoAoUsuario(usuarioId, "Voce so pode visualizar seus proprios alugueis");
        return aluguelRepository.findByUsuarioId(usuarioId).stream()
                .map(AluguelResponse::from)
                .toList();
    }

    public AluguelResponse buscarPorId(Long id) {
        Aluguel aluguel = aluguelRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Aluguel nao encontrado", HttpStatus.NOT_FOUND));
        validarAcessoAoUsuario(aluguel.getUsuario().getId(), "Voce so pode visualizar seus proprios alugueis");
        return AluguelResponse.from(aluguel);
    }

    @Transactional
    public AluguelResponse criar(AluguelRequest request) {
        validarAcessoAoUsuario(request.usuarioId(), "Voce so pode criar alugueis para si mesmo");

        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new BusinessException("Usuario nao encontrado", HttpStatus.NOT_FOUND));
        Veiculo veiculo = veiculoRepository.findById(request.veiculoId())
                .orElseThrow(() -> new BusinessException("Veiculo nao encontrado", HttpStatus.NOT_FOUND));

        // RF06: veiculo em manutencao nao pode ser alugado
        if (veiculo.isEmManutencao()) {
            throw new BusinessException("Veiculo em manutencao. Selecione outro veiculo");
        }

        LocalDate dataRetirada = parseData(request.dataRetirada(), "Data de retirada invalida. Use o formato AAAA-MM-DD");
        LocalDate dataEntrega = parseData(request.dataEntrega(), "Data de entrega invalida. Use o formato AAAA-MM-DD");

        LocalDate hoje = LocalDate.now();
        if (dataRetirada.isBefore(hoje)) {
            throw new BusinessException("Data de retirada nao pode ser anterior a hoje");
        }
        if (!dataEntrega.isAfter(dataRetirada)) {
            throw new BusinessException("Data de entrega deve ser posterior a data de retirada");
        }

        // RF12: condutor precisa de CNH valida (formato + validade) na retirada
        validarCnh(usuario, dataRetirada);

        // Buffer de 1 dia entre alugueis consecutivos: cada aluguel ocupa o veiculo
        // de dataRetirada ate dataEntrega + 1 dia. Conflito se os intervalos se cruzam:
        // existente.dataEntrega + 1 >= novaRetirada AND existente.dataRetirada <= novaEntrega + 1
        boolean conflito = aluguelRepository.existsConflito(
                veiculo.getId(), StatusAluguel.ATIVO,
                dataRetirada.minusDays(1),
                dataEntrega.plusDays(1));

        if (conflito) {
            throw new BusinessException(
                    "Veiculo ja reservado neste periodo. Lembre-se: ha um intervalo de 1 dia apos cada devolucao",
                    HttpStatus.CONFLICT);
        }

        long dias = ChronoUnit.DAYS.between(dataRetirada, dataEntrega);
        BigDecimal valorTotal = veiculo.getValorDiaria().multiply(BigDecimal.valueOf(dias));

        Aluguel aluguel = new Aluguel();
        aluguel.setUsuario(usuario);
        aluguel.setVeiculo(veiculo);
        aluguel.setDataRetirada(dataRetirada);
        aluguel.setDataEntrega(dataEntrega);
        aluguel.setFormaPagamento(request.formaPagamento());
        aluguel.setValorTotal(valorTotal);
        aluguel.setStatus(StatusAluguel.ATIVO);

        return AluguelResponse.from(aluguelRepository.save(aluguel));
    }

    @Transactional
    public AluguelResponse finalizar(Long id, DevolucaoRequest request) {
        Aluguel aluguel = aluguelRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Aluguel nao encontrado", HttpStatus.NOT_FOUND));

        if (aluguel.getStatus() != StatusAluguel.ATIVO) {
            throw new BusinessException("Apenas alugueis ativos podem ser finalizados");
        }

        // RF13: data real da devolucao (default: hoje)
        LocalDate dataDevolucao = (request != null && request.dataDevolucaoReal() != null
                && !request.dataDevolucaoReal().isBlank())
                ? parseData(request.dataDevolucaoReal(), "Data de devolucao invalida. Use o formato AAAA-MM-DD")
                : LocalDate.now();

        if (dataDevolucao.isBefore(aluguel.getDataRetirada())) {
            throw new BusinessException("Data de devolucao nao pode ser anterior a data de retirada");
        }

        BigDecimal diaria = aluguel.getVeiculo().getValorDiaria();

        // RF13: cobra pelas diarias realmente utilizadas (minimo de 1 diaria)
        long diasReais = ChronoUnit.DAYS.between(aluguel.getDataRetirada(), dataDevolucao);
        if (diasReais < 1) diasReais = 1;
        BigDecimal valorBase = diaria.multiply(BigDecimal.valueOf(diasReais));

        // RF14: atraso gera multa de 50% sobre a diaria por dia excedente
        BigDecimal multa = BigDecimal.ZERO;
        if (dataDevolucao.isAfter(aluguel.getDataEntrega())) {
            long diasAtraso = ChronoUnit.DAYS.between(aluguel.getDataEntrega(), dataDevolucao);
            multa = diaria.multiply(BigDecimal.valueOf(diasAtraso)).multiply(new BigDecimal("0.5"));
        }
        multa = multa.setScale(2, RoundingMode.HALF_UP);
        BigDecimal valorFinal = valorBase.add(multa).setScale(2, RoundingMode.HALF_UP);

        aluguel.setStatus(StatusAluguel.FINALIZADO);
        aluguel.setFinalizadoEm(LocalDateTime.now());
        aluguel.setDataDevolucaoReal(dataDevolucao);
        aluguel.setDiasReais((int) diasReais);
        aluguel.setMultaAtraso(multa);
        aluguel.setValorFinal(valorFinal);

        return AluguelResponse.from(aluguelRepository.save(aluguel));
    }

    @Transactional
    public AluguelResponse cancelar(Long id) {
        Aluguel aluguel = aluguelRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Aluguel nao encontrado", HttpStatus.NOT_FOUND));

        validarAcessoAoUsuario(aluguel.getUsuario().getId(), "Voce so pode cancelar seus proprios alugueis");

        if (aluguel.getStatus() != StatusAluguel.ATIVO) {
            throw new BusinessException("Apenas alugueis ativos podem ser cancelados");
        }

        aluguel.setStatus(StatusAluguel.CANCELADO);

        return AluguelResponse.from(aluguelRepository.save(aluguel));
    }

    // RF12: valida a habilitacao do condutor antes de confirmar a reserva
    private void validarCnh(Usuario usuario, LocalDate dataRetirada) {
        if (usuario.getNumeroCnh() == null || usuario.getNumeroCnh().isBlank()) {
            throw new BusinessException(
                    "Cliente sem CNH cadastrada. Atualize o perfil com os dados da habilitacao antes de alugar");
        }
        if (!CnhValidator.formatoValido(usuario.getNumeroCnh())) {
            throw new BusinessException("CNH invalida. O numero deve conter 11 digitos");
        }
        if (usuario.getValidadeCnh() == null) {
            throw new BusinessException("Validade da CNH nao informada. Atualize o perfil do cliente");
        }
        if (usuario.getValidadeCnh().isBefore(dataRetirada)) {
            throw new BusinessException(
                    "CNH vencida (validade em " + usuario.getValidadeCnh() + "). Renove a habilitacao antes de alugar");
        }
    }

    private LocalDate parseData(String valor, String mensagemErro) {
        try {
            return LocalDate.parse(valor);
        } catch (DateTimeParseException e) {
            throw new BusinessException(mensagemErro);
        }
    }

    private void validarAcessoAoUsuario(Long usuarioId, String mensagem) {
        if (AuthUtils.isAdmin()) return;
        CustomUserDetails logado = AuthUtils.getUsuarioLogado();
        if (logado == null || !logado.getId().equals(usuarioId)) {
            throw new BusinessException(mensagem, HttpStatus.FORBIDDEN);
        }
    }
}
