package com.rentcar.features.usuario.dto;

import com.rentcar.features.usuario.Usuario;

public record UsuarioResponse(
    Long id,
    String nomeCompleto,
    String email,
    String cpf,
    String dataNascimento,
    String telefone,
    String endereco,
    String tipo
) {
    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
            usuario.getId(),
            usuario.getNomeCompleto(),
            usuario.getEmail(),
            usuario.getCpf(),
            usuario.getDataNascimento() != null ? usuario.getDataNascimento().toString() : null,
            usuario.getTelefone(),
            usuario.getEndereco(),
            usuario.getTipo().getValue()
        );
    }
}
