package com.rentcar.features.relatorio.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * RF15: dados consolidados para a gestao — historico de locacoes, faturamento
 * mensal e taxa de ociosidade da frota.
 */
public record RelatorioResponse(
    long totalLocacoes,
    long locacoesAtivas,
    long locacoesFinalizadas,
    long locacoesCanceladas,
    BigDecimal faturamentoTotal,
    BigDecimal ticketMedio,
    BigDecimal totalMultas,
    BigDecimal taxaOciosidade,
    int totalVeiculos,
    int veiculosOciososHoje,
    List<FaturamentoMes> faturamentoMensal,
    List<VeiculoRanking> topVeiculos
) {
    public record FaturamentoMes(String mes, BigDecimal total, long quantidade) {}

    public record VeiculoRanking(String veiculo, String placa, long locacoes, BigDecimal receita) {}
}
