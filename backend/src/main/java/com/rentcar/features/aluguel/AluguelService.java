package com.rentcar.features.aluguel;

import com.rentcar.common.exception.BusinessException;
import com.rentcar.common.security.AuthUtils;
import com.rentcar.common.security.CustomUserDetails;
import com.rentcar.features.aluguel.dto.AluguelRequest;
import com.rentcar.features.aluguel.dto.AluguelResponse;
import com.rentcar.features.usuario.Usuario;
import com.rentcar.features.usuario.UsuarioRepository;
import com.rentcar.features.veiculo.Veiculo;
import com.rentcar.features.veiculo.VeiculoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

        LocalDate dataRetirada = parseData(request.dataRetirada(), "Data de retirada invalida. Use o formato AAAA-MM-DD");
        LocalDate dataEntrega = parseData(request.dataEntrega(), "Data de entrega invalida. Use o formato AAAA-MM-DD");

        LocalDate hoje = LocalDate.now();
        if (dataRetirada.isBefore(hoje)) {
            throw new BusinessException("Data de retirada nao pode ser anterior a hoje");
        }
        if (!dataEntrega.isAfter(dataRetirada)) {
            throw new BusinessException("Data de entrega deve ser posterior a data de retirada");
        }

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
    public AluguelResponse finalizar(Long id) {
        Aluguel aluguel = aluguelRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Aluguel nao encontrado", HttpStatus.NOT_FOUND));

        if (aluguel.getStatus() != StatusAluguel.ATIVO) {
            throw new BusinessException("Apenas alugueis ativos podem ser finalizados");
        }

        aluguel.setStatus(StatusAluguel.FINALIZADO);
        aluguel.setFinalizadoEm(LocalDateTime.now());

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
