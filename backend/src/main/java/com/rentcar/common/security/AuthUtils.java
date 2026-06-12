package com.rentcar.common.security;

import com.rentcar.features.usuario.TipoUsuario;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class AuthUtils {

    private AuthUtils() {}

    public static CustomUserDetails getUsuarioLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails details) {
            return details;
        }
        return null;
    }

    public static boolean isAdmin() {
        CustomUserDetails details = getUsuarioLogado();
        return details != null && details.getUsuario().getTipo() == TipoUsuario.ADMIN;
    }
}
