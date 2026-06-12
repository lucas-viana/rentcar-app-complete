package com.rentcar.features.auth.dto;

import com.rentcar.features.usuario.dto.UsuarioResponse;

public record LoginResponse(
    String token,
    UsuarioResponse usuario
) {}
