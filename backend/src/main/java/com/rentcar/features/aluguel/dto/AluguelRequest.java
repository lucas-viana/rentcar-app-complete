package com.rentcar.features.aluguel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AluguelRequest(
    @NotNull(message = "Cliente e obrigatorio")
    Long usuarioId,

    @NotNull(message = "Veiculo e obrigatorio")
    Long veiculoId,

    @NotBlank(message = "Data de retirada e obrigatoria")
    String dataRetirada,

    @NotBlank(message = "Data de entrega e obrigatoria")
    String dataEntrega,

    @NotBlank(message = "Forma de pagamento e obrigatoria")
    String formaPagamento
) {}
