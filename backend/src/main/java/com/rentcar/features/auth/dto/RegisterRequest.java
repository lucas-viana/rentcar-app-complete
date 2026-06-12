package com.rentcar.features.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Nome completo e obrigatorio")
    String nomeCompleto,

    @NotBlank(message = "E-mail e obrigatorio")
    @Email(message = "E-mail invalido")
    String email,

    @NotBlank(message = "CPF e obrigatorio")
    String cpf,

    String dataNascimento,
    String telefone,
    String endereco,

    @NotBlank(message = "Senha e obrigatoria")
    @Size(min = 6, message = "Senha deve ter pelo menos 6 caracteres")
    String senha
) {}
