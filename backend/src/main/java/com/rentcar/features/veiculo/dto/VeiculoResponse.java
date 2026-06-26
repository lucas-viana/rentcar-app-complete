package com.rentcar.features.veiculo.dto;

import com.rentcar.features.veiculo.Veiculo;

import java.math.BigDecimal;

public record VeiculoResponse(
    Long id,
    String modelo,
    String fabricante,
    Integer ano,
    String placa,
    String cor,
    String categoria,
    String combustivel,
    String cambio,
    Integer portas,
    Integer passageiros,
    Integer km,
    Boolean disponivel,
    Boolean emManutencao,
    String status,
    BigDecimal valorDiaria,
    String imagem
) {
    // RF06: status calculado para hoje — "disponivel", "locado",
    // "aguardando_limpeza" ou "manutencao".
    public static VeiculoResponse from(Veiculo v, boolean disponivel, String status) {
        return new VeiculoResponse(
            v.getId(), v.getModelo(), v.getFabricante(), v.getAno(), v.getPlaca(),
            v.getCor(), v.getCategoria(), v.getCombustivel(), v.getCambio(),
            v.getPortas(), v.getPassageiros(), v.getKm(), disponivel,
            v.isEmManutencao(), status, v.getValorDiaria(), v.getImagem()
        );
    }
}
