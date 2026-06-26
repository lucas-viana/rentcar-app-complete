package com.rentcar.features.veiculo;

import com.rentcar.common.exception.BusinessException;
import com.rentcar.features.aluguel.AluguelRepository;
import com.rentcar.features.aluguel.StatusAluguel;
import com.rentcar.features.veiculo.dto.VeiculoRequest;
import com.rentcar.features.veiculo.dto.VeiculoResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class VeiculoService {

    // RF06: estados possiveis calculados dinamicamente
    public static final String STATUS_DISPONIVEL = "disponivel";
    public static final String STATUS_LOCADO = "locado";
    public static final String STATUS_AGUARDANDO_LIMPEZA = "aguardando_limpeza";
    public static final String STATUS_MANUTENCAO = "manutencao";

    private final VeiculoRepository veiculoRepository;
    private final AluguelRepository aluguelRepository;

    public VeiculoService(VeiculoRepository veiculoRepository, AluguelRepository aluguelRepository) {
        this.veiculoRepository = veiculoRepository;
        this.aluguelRepository = aluguelRepository;
    }

    public List<VeiculoResponse> listar() {
        LocalDate hoje = LocalDate.now();
        Set<Long> locadosHoje = new HashSet<>(aluguelRepository.findVeiculoIdsLocadosNoDia(StatusAluguel.ATIVO, hoje));
        Set<Long> ocupadosComBuffer = new HashSet<>(aluguelRepository.findVeiculoIdsOcupados(
                StatusAluguel.ATIVO, hoje.minusDays(1), hoje));

        return veiculoRepository.findAll().stream()
                .map(v -> {
                    String status = calcularStatus(v, locadosHoje, ocupadosComBuffer);
                    return VeiculoResponse.from(v, STATUS_DISPONIVEL.equals(status), status);
                })
                .toList();
    }

    /**
     * Lista veiculos disponiveis para locacao. Sem datas: disponiveis hoje.
     * Com periodo (retirada/entrega): disponiveis no periodo inteiro,
     * respeitando o buffer de 1 dia entre alugueis consecutivos.
     * Veiculos em manutencao (RF06) nunca aparecem como disponiveis.
     */
    public List<VeiculoResponse> listarDisponiveis(String dataRetiradaStr, String dataEntregaStr) {
        boolean comPeriodo = dataRetiradaStr != null && !dataRetiradaStr.isBlank()
                && dataEntregaStr != null && !dataEntregaStr.isBlank();

        Set<Long> ocupados;
        if (comPeriodo) {
            LocalDate retirada = parseData(dataRetiradaStr, "Data de retirada invalida. Use o formato AAAA-MM-DD");
            LocalDate entrega = parseData(dataEntregaStr, "Data de entrega invalida. Use o formato AAAA-MM-DD");

            if (retirada.isBefore(LocalDate.now())) {
                throw new BusinessException("Data de retirada nao pode ser anterior a hoje");
            }
            if (!entrega.isAfter(retirada)) {
                throw new BusinessException("Data de entrega deve ser posterior a data de retirada");
            }

            ocupados = new HashSet<>(aluguelRepository.findVeiculoIdsOcupados(
                    StatusAluguel.ATIVO, retirada.minusDays(1), entrega.plusDays(1)));
        } else {
            ocupados = getVeiculoIdsOcupadosHoje();
        }

        return veiculoRepository.findAll().stream()
                .filter(v -> !v.isEmManutencao())
                .filter(v -> !ocupados.contains(v.getId()))
                .map(v -> VeiculoResponse.from(v, true, STATUS_DISPONIVEL))
                .toList();
    }

    public VeiculoResponse buscarPorId(Long id) {
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Veiculo nao encontrado", HttpStatus.NOT_FOUND));
        String status = calcularStatusHoje(veiculo);
        return VeiculoResponse.from(veiculo, STATUS_DISPONIVEL.equals(status), status);
    }

    public VeiculoResponse criar(VeiculoRequest request) {
        if (veiculoRepository.existsByPlaca(request.placa())) {
            throw new BusinessException("Placa ja cadastrada");
        }

        Veiculo veiculo = new Veiculo();
        aplicarDados(veiculo, request);

        veiculo = veiculoRepository.save(veiculo);
        String status = calcularStatusHoje(veiculo);
        return VeiculoResponse.from(veiculo, STATUS_DISPONIVEL.equals(status), status);
    }

    public VeiculoResponse atualizar(Long id, VeiculoRequest request) {
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Veiculo nao encontrado", HttpStatus.NOT_FOUND));

        if (!veiculo.getPlaca().equals(request.placa()) && veiculoRepository.existsByPlaca(request.placa())) {
            throw new BusinessException("Placa ja cadastrada");
        }

        aplicarDados(veiculo, request);

        veiculo = veiculoRepository.save(veiculo);
        String status = calcularStatusHoje(veiculo);
        return VeiculoResponse.from(veiculo, STATUS_DISPONIVEL.equals(status), status);
    }

    public void deletar(Long id) {
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Veiculo nao encontrado", HttpStatus.NOT_FOUND));

        boolean temAluguelAtivo = !aluguelRepository.findByVeiculoIdAndStatus(id, StatusAluguel.ATIVO).isEmpty();
        if (temAluguelAtivo) {
            throw new BusinessException("Nao e possivel excluir um veiculo com alugueis ativos ou reservas futuras");
        }

        veiculoRepository.delete(veiculo);
    }

    private void aplicarDados(Veiculo veiculo, VeiculoRequest request) {
        veiculo.setModelo(request.modelo());
        veiculo.setFabricante(request.fabricante());
        veiculo.setAno(request.ano());
        veiculo.setPlaca(request.placa());
        veiculo.setCor(request.cor());
        veiculo.setCategoria(request.categoria());
        veiculo.setCombustivel(request.combustivel());
        veiculo.setCambio(request.cambio());
        veiculo.setPortas(request.portas());
        veiculo.setPassageiros(request.passageiros());
        veiculo.setKm(request.km());
        veiculo.setValorDiaria(request.valorDiaria());
        veiculo.setImagem(request.imagem());
        veiculo.setEmManutencao(request.emManutencao() != null && request.emManutencao());
    }

    // RF06: calcula o status considerando manutencao manual + locacoes do dia
    private String calcularStatus(Veiculo v, Set<Long> locadosHoje, Set<Long> ocupadosComBuffer) {
        if (v.isEmManutencao()) return STATUS_MANUTENCAO;
        if (locadosHoje.contains(v.getId())) return STATUS_LOCADO;
        if (ocupadosComBuffer.contains(v.getId())) return STATUS_AGUARDANDO_LIMPEZA;
        return STATUS_DISPONIVEL;
    }

    private String calcularStatusHoje(Veiculo v) {
        if (v.isEmManutencao()) return STATUS_MANUTENCAO;
        LocalDate hoje = LocalDate.now();
        boolean locadoHoje = aluguelRepository.existsConflito(v.getId(), StatusAluguel.ATIVO, hoje, hoje);
        if (locadoHoje) return STATUS_LOCADO;
        boolean noBuffer = aluguelRepository.existsConflito(v.getId(), StatusAluguel.ATIVO, hoje.minusDays(1), hoje);
        if (noBuffer) return STATUS_AGUARDANDO_LIMPEZA;
        return STATUS_DISPONIVEL;
    }

    private Set<Long> getVeiculoIdsOcupadosHoje() {
        LocalDate hoje = LocalDate.now();
        return new HashSet<>(aluguelRepository.findVeiculoIdsOcupados(
                StatusAluguel.ATIVO, hoje.minusDays(1), hoje));
    }

    private LocalDate parseData(String valor, String mensagemErro) {
        try {
            return LocalDate.parse(valor);
        } catch (DateTimeParseException e) {
            throw new BusinessException(mensagemErro);
        }
    }
}
