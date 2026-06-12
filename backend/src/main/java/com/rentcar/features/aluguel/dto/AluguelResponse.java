package com.rentcar.features.aluguel.dto;

import com.rentcar.features.aluguel.Aluguel;

import java.math.BigDecimal;

public record AluguelResponse(
    Long id,
    Long usuarioId,
    Long veiculoId,
    String dataRetirada,
    String dataEntrega,
    String formaPagamento,
    BigDecimal valorTotal,
    String status,
    String finalizadoEm,
    String usuario,
    String veiculo,
    String placa
) {
    public static AluguelResponse from(Aluguel a) {
        return new AluguelResponse(
            a.getId(),
            a.getUsuario().getId(),
            a.getVeiculo().getId(),
            a.getDataRetirada().toString(),
            a.getDataEntrega().toString(),
            a.getFormaPagamento(),
            a.getValorTotal(),
            a.getStatus().getValue(),
            a.getFinalizadoEm() != null ? a.getFinalizadoEm().toString() : null,
            a.getUsuario().getNomeCompleto(),
            a.getVeiculo().getModelo(),
            a.getVeiculo().getPlaca()
        );
    }
}
