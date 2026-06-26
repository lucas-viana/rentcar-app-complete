package com.rentcar.features.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * RF04: dados que o proprio cliente pode atualizar no seu perfil. CPF, tipo de
 * perfil e data de nascimento nao sao editaveis pelo cliente.
 */
public record PerfilRequest(
    @NotBlank(message = "Nome completo e obrigatorio")
    String nomeCompleto,

    @NotBlank(message = "E-mail e obrigatorio")
    @Email(message = "E-mail invalido")
    String email,

    String telefone,
    String endereco,
    String numeroCnh,
    String categoriaCnh,
    String validadeCnh,
    String senhaAtual,
    String novaSenha
) {}
