package com.rentcar.features.usuario;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TipoUsuario {
    ADMIN("admin"),
    CLIENTE("cliente");

    private final String value;

    TipoUsuario(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static TipoUsuario fromValue(String value) {
        for (TipoUsuario tipo : values()) {
            if (tipo.value.equalsIgnoreCase(value)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Tipo de usuario invalido: " + value);
    }
}
