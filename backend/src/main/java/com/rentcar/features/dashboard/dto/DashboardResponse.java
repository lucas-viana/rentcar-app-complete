package com.rentcar.features.dashboard.dto;

import java.math.BigDecimal;

public record DashboardResponse(
    long totalVeiculos,
    long veiculosDisponiveis,
    long alugueisAtivos,
    long totalClientes,
    BigDecimal receitaTotal
) {}
