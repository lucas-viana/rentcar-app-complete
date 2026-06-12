package com.rentcar.features.aluguel;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum StatusAluguel {
    ATIVO("ativo"),
    FINALIZADO("finalizado"),
    CANCELADO("cancelado");

    private final String value;

    StatusAluguel(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static StatusAluguel fromValue(String value) {
        for (StatusAluguel status : values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Status invalido: " + value);
    }
}
