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
    BigDecimal valorDiaria,
    String imagem
) {
    public static VeiculoResponse from(Veiculo v, boolean disponivel) {
        return new VeiculoResponse(
            v.getId(), v.getModelo(), v.getFabricante(), v.getAno(), v.getPlaca(),
            v.getCor(), v.getCategoria(), v.getCombustivel(), v.getCambio(),
            v.getPortas(), v.getPassageiros(), v.getKm(), disponivel,
            v.getValorDiaria(), v.getImagem()
        );
    }
}
