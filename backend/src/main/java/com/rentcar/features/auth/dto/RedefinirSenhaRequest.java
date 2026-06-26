package com.rentcar.features.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedefinirSenhaRequest(
    @NotBlank(message = "Token e obrigatorio")
    String token,

    @NotBlank(message = "Nova senha e obrigatoria")
    @Size(min = 6, message = "Senha deve ter pelo menos 6 caracteres")
    String novaSenha
) {}
