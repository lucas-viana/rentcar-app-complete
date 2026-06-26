package com.rentcar.features.aluguel.dto;

/**
 * RF13: data real da devolucao informada pelo operador. Se nula, assume a data
 * de hoje.
 */
public record DevolucaoRequest(
    String dataDevolucaoReal
) {}
