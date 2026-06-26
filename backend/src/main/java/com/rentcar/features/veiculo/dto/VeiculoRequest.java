package com.rentcar.features.veiculo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record VeiculoRequest(
    @NotBlank(message = "Modelo e obrigatorio")
    String modelo,

    @NotBlank(message = "Fabricante e obrigatorio")
    String fabricante,

    @NotNull(message = "Ano e obrigatorio")
    @Min(value = 1950, message = "Ano deve ser maior que 1950")
    @Max(value = 2100, message = "Ano invalido")
    Integer ano,

    @NotBlank(message = "Placa e obrigatoria")
    String placa,

    String cor,
    String categoria,
    String combustivel,
    String cambio,

    @Min(value = 2, message = "Numero de portas invalido")
    @Max(value = 6, message = "Numero de portas invalido")
    Integer portas,

    @Min(value = 1, message = "Numero de passageiros invalido")
    @Max(value = 12, message = "Numero de passageiros invalido")
    Integer passageiros,

    @PositiveOrZero(message = "Quilometragem nao pode ser negativa")
    Integer km,

    Boolean disponivel,

    @NotNull(message = "Valor da diaria e obrigatorio")
    @Positive(message = "Valor da diaria deve ser maior que zero")
    BigDecimal valorDiaria,

    String imagem,

    Boolean emManutencao
) {}
