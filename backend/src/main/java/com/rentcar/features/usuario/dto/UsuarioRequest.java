package com.rentcar.features.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioRequest(
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
    String tipo,
    String senha
) {}
