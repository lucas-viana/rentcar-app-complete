package com.rentcar.features.dashboard;

import com.rentcar.features.aluguel.AluguelRepository;
import com.rentcar.features.aluguel.StatusAluguel;
import com.rentcar.features.dashboard.dto.DashboardResponse;
import com.rentcar.features.usuario.TipoUsuario;
import com.rentcar.features.usuario.UsuarioRepository;
import com.rentcar.features.veiculo.VeiculoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Service
public class DashboardService {

    private final VeiculoRepository veiculoRepository;
    private final AluguelRepository aluguelRepository;
    private final UsuarioRepository usuarioRepository;

    public DashboardService(VeiculoRepository veiculoRepository, AluguelRepository aluguelRepository,
                            UsuarioRepository usuarioRepository) {
        this.veiculoRepository = veiculoRepository;
        this.aluguelRepository = aluguelRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public DashboardResponse getDashboard() {
        long totalVeiculos = veiculoRepository.count();

        LocalDate hoje = LocalDate.now();
        Set<Long> ocupados = new HashSet<>(aluguelRepository.findVeiculoIdsOcupados(
                StatusAluguel.ATIVO, hoje.minusDays(1), hoje));
        long veiculosDisponiveis = totalVeiculos - ocupados.size();

        long alugueisAtivos = aluguelRepository.countByStatus(StatusAluguel.ATIVO);
        long totalClientes = usuarioRepository.findAll().stream()
                .filter(u -> u.getTipo() == TipoUsuario.CLIENTE)
                .count();
        BigDecimal receitaTotal = aluguelRepository.findAll().stream()
                .filter(a -> a.getStatus() == StatusAluguel.FINALIZADO || a.getStatus() == StatusAluguel.ATIVO)
                .map(a -> a.getValorTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardResponse(totalVeiculos, veiculosDisponiveis, alugueisAtivos, totalClientes, receitaTotal);
    }
}
