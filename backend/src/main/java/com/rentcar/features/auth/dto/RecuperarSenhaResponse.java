package com.rentcar.features.auth.dto;

/**
 * RF03: numa aplicacao real o link de redefinicao seria enviado por e-mail.
 * Como este e um trabalho academico, o "envio" e simulado e o link/token e
 * retornado na resposta para permitir o teste do fluxo.
 */
public record RecuperarSenhaResponse(
    String mensagem,
    String linkRedefinicao,
    String token
) {}
