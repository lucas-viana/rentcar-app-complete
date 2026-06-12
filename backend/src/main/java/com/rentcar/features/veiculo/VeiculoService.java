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

    private final VeiculoRepository veiculoRepository;
    private final AluguelRepository aluguelRepository;

    public VeiculoService(VeiculoRepository veiculoRepository, AluguelRepository aluguelRepository) {
        this.veiculoRepository = veiculoRepository;
        this.aluguelRepository = aluguelRepository;
    }

    public List<VeiculoResponse> listar() {
        Set<Long> ocupados = getVeiculoIdsOcupadosHoje();
        return veiculoRepository.findAll().stream()
                .map(v -> VeiculoResponse.from(v, !ocupados.contains(v.getId())))
                .toList();
    }

    /**
     * Lista veiculos disponiveis. Sem datas: disponiveis hoje.
     * Com periodo (retirada/entrega): disponiveis no periodo inteiro,
     * respeitando o buffer de 1 dia entre alugueis consecutivos.
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
                .filter(v -> !ocupados.contains(v.getId()))
                .map(v -> VeiculoResponse.from(v, true))
                .toList();
    }

    public VeiculoResponse buscarPorId(Long id) {
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Veiculo nao encontrado", HttpStatus.NOT_FOUND));
        boolean disponivel = !isOcupadoHoje(id);
        return VeiculoResponse.from(veiculo, disponivel);
    }

    public VeiculoResponse criar(VeiculoRequest request) {
        if (veiculoRepository.existsByPlaca(request.placa())) {
            throw new BusinessException("Placa ja cadastrada");
        }

        Veiculo veiculo = new Veiculo();
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

        veiculo = veiculoRepository.save(veiculo);
        return VeiculoResponse.from(veiculo, true);
    }

    public VeiculoResponse atualizar(Long id, VeiculoRequest request) {
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Veiculo nao encontrado", HttpStatus.NOT_FOUND));

        if (!veiculo.getPlaca().equals(request.placa()) && veiculoRepository.existsByPlaca(request.placa())) {
            throw new BusinessException("Placa ja cadastrada");
        }

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

        veiculo = veiculoRepository.save(veiculo);
        boolean disponivel = !isOcupadoHoje(id);
        return VeiculoResponse.from(veiculo, disponivel);
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

    private Set<Long> getVeiculoIdsOcupadosHoje() {
        LocalDate hoje = LocalDate.now();
        return new HashSet<>(aluguelRepository.findVeiculoIdsOcupados(
                StatusAluguel.ATIVO, hoje.minusDays(1), hoje));
    }

    private boolean isOcupadoHoje(Long veiculoId) {
        LocalDate hoje = LocalDate.now();
        return aluguelRepository.existsConflito(veiculoId, StatusAluguel.ATIVO, hoje.minusDays(1), hoje);
    }

    private LocalDate parseData(String valor, String mensagemErro) {
        try {
            return LocalDate.parse(valor);
        } catch (DateTimeParseException e) {
            throw new BusinessException(mensagemErro);
        }
    }
}
