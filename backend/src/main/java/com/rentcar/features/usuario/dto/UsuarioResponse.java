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
    String numeroCnh,
    String categoriaCnh,
    String validadeCnh,
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
            usuario.getNumeroCnh(),
            usuario.getCategoriaCnh(),
            usuario.getValidadeCnh() != null ? usuario.getValidadeCnh().toString() : null,
            usuario.getTipo().getValue()
        );
    }
}
