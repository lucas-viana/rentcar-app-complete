package com.rentcar.features.relatorio;

import com.rentcar.features.aluguel.Aluguel;
import com.rentcar.features.aluguel.AluguelRepository;
import com.rentcar.features.aluguel.StatusAluguel;
import com.rentcar.features.relatorio.dto.RelatorioResponse;
import com.rentcar.features.relatorio.dto.RelatorioResponse.FaturamentoMes;
import com.rentcar.features.relatorio.dto.RelatorioResponse.VeiculoRanking;
import com.rentcar.features.veiculo.VeiculoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;

@Service
public class RelatorioService {

    private static final int JANELA_OCIOSIDADE_DIAS = 30;
    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    private final AluguelRepository aluguelRepository;
    private final VeiculoRepository veiculoRepository;

    public RelatorioService(AluguelRepository aluguelRepository, VeiculoRepository veiculoRepository) {
        this.aluguelRepository = aluguelRepository;
        this.veiculoRepository = veiculoRepository;
    }

    public RelatorioResponse gerar() {
        List<Aluguel> todos = aluguelRepository.findAll();

        long ativas = todos.stream().filter(a -> a.getStatus() == StatusAluguel.ATIVO).count();
        long finalizadas = todos.stream().filter(a -> a.getStatus() == StatusAluguel.FINALIZADO).count();
        long canceladas = todos.stream().filter(a -> a.getStatus() == StatusAluguel.CANCELADO).count();

        // Faturamento considera locacoes ativas + finalizadas (mesma regra do dashboard)
        List<Aluguel> contabilizaveis = todos.stream()
                .filter(a -> a.getStatus() == StatusAluguel.ATIVO || a.getStatus() == StatusAluguel.FINALIZADO)
                .toList();

        BigDecimal faturamentoTotal = contabilizaveis.stream()
                .map(this::valorContabil)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal ticketMedio = contabilizaveis.isEmpty()
                ? BigDecimal.ZERO
                : faturamentoTotal.divide(BigDecimal.valueOf(contabilizaveis.size()), 2, RoundingMode.HALF_UP);

        BigDecimal totalMultas = todos.stream()
                .map(a -> a.getMultaAtraso() != null ? a.getMultaAtraso() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalVeiculos = veiculoRepository.count();

        return new RelatorioResponse(
                todos.size(), ativas, finalizadas, canceladas,
                faturamentoTotal.setScale(2, RoundingMode.HALF_UP),
                ticketMedio,
                totalMultas.setScale(2, RoundingMode.HALF_UP),
                calcularTaxaOciosidade(todos, totalVeiculos),
                (int) totalVeiculos,
                (int) (totalVeiculos - veiculosLocadosHoje()),
                faturamentoMensal(contabilizaveis),
                topVeiculos(contabilizaveis));
    }

    // RF15: valor que entra no faturamento (valor final recalculado quando houver)
    private BigDecimal valorContabil(Aluguel a) {
        if (a.getStatus() == StatusAluguel.FINALIZADO && a.getValorFinal() != null) {
            return a.getValorFinal();
        }
        return a.getValorTotal() != null ? a.getValorTotal() : BigDecimal.ZERO;
    }

    // RF15: faturamento agrupado por mes (YYYY-MM), ordenado cronologicamente
    private List<FaturamentoMes> faturamentoMensal(List<Aluguel> contabilizaveis) {
        Map<String, BigDecimal> totalPorMes = new TreeMap<>();
        Map<String, Long> qtdPorMes = new TreeMap<>();

        for (Aluguel a : contabilizaveis) {
            String chave = String.format("%04d-%02d", a.getDataRetirada().getYear(), a.getDataRetirada().getMonthValue());
            totalPorMes.merge(chave, valorContabil(a), BigDecimal::add);
            qtdPorMes.merge(chave, 1L, Long::sum);
        }

        List<FaturamentoMes> resultado = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> e : totalPorMes.entrySet()) {
            resultado.add(new FaturamentoMes(
                    rotuloMes(e.getKey()),
                    e.getValue().setScale(2, RoundingMode.HALF_UP),
                    qtdPorMes.get(e.getKey())));
        }
        return resultado;
    }

    private String rotuloMes(String chave) {
        String[] partes = chave.split("-");
        int ano = Integer.parseInt(partes[0]);
        int mes = Integer.parseInt(partes[1]);
        String nome = java.time.Month.of(mes).getDisplayName(TextStyle.SHORT, PT_BR);
        nome = nome.substring(0, 1).toUpperCase(PT_BR) + nome.substring(1).replace(".", "");
        return nome + "/" + ano;
    }

    // RF15: ranking de veiculos mais locados por receita
    private List<VeiculoRanking> topVeiculos(List<Aluguel> contabilizaveis) {
        Map<Long, VeiculoAcumulado> mapa = new LinkedHashMap<>();
        for (Aluguel a : contabilizaveis) {
            mapa.computeIfAbsent(a.getVeiculo().getId(),
                    k -> new VeiculoAcumulado(a.getVeiculo().getModelo(), a.getVeiculo().getPlaca()))
                .somar(valorContabil(a));
        }
        return mapa.values().stream()
                .sorted(Comparator.comparing((VeiculoAcumulado v) -> v.receita).reversed())
                .limit(5)
                .map(v -> new VeiculoRanking(v.modelo, v.placa, v.locacoes, v.receita.setScale(2, RoundingMode.HALF_UP)))
                .toList();
    }

    // RF15: taxa de ociosidade = % de "veiculo-dias" sem locacao nos ultimos 30 dias
    private BigDecimal calcularTaxaOciosidade(List<Aluguel> todos, long totalVeiculos) {
        if (totalVeiculos == 0) return BigDecimal.ZERO;

        LocalDate hoje = LocalDate.now();
        LocalDate inicioJanela = hoje.minusDays(JANELA_OCIOSIDADE_DIAS - 1L);
        long diasLocados = 0;

        for (Aluguel a : todos) {
            if (a.getStatus() == StatusAluguel.CANCELADO) continue;
            LocalDate fimReal = a.getDataDevolucaoReal() != null ? a.getDataDevolucaoReal() : a.getDataEntrega();
            LocalDate ini = a.getDataRetirada().isBefore(inicioJanela) ? inicioJanela : a.getDataRetirada();
            LocalDate fim = fimReal.isAfter(hoje) ? hoje : fimReal;
            if (!fim.isBefore(ini)) {
                diasLocados += java.time.temporal.ChronoUnit.DAYS.between(ini, fim) + 1;
            }
        }

        double totalVeiculoDias = totalVeiculos * (double) JANELA_OCIOSIDADE_DIAS;
        double ociosidade = (1.0 - (diasLocados / totalVeiculoDias)) * 100.0;
        ociosidade = Math.max(0.0, Math.min(100.0, ociosidade));
        return BigDecimal.valueOf(ociosidade).setScale(1, RoundingMode.HALF_UP);
    }

    private long veiculosLocadosHoje() {
        return aluguelRepository.findVeiculoIdsLocadosNoDia(StatusAluguel.ATIVO, LocalDate.now()).size();
    }

    private static final class VeiculoAcumulado {
        final String modelo;
        final String placa;
        long locacoes = 0;
        BigDecimal receita = BigDecimal.ZERO;

        VeiculoAcumulado(String modelo, String placa) {
            this.modelo = modelo;
            this.placa = placa;
        }

        void somar(BigDecimal valor) {
            this.locacoes++;
            this.receita = this.receita.add(valor);
        }
    }
}
