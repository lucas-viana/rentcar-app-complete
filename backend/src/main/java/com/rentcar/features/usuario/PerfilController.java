package com.rentcar.features.usuario;

import com.rentcar.features.usuario.dto.PerfilRequest;
import com.rentcar.features.usuario.dto.UsuarioResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * RF04: endpoints que o proprio cliente (ou admin) usa para ver e editar o
 * seu perfil. Diferente de /api/usuarios (exclusivo do admin), aqui qualquer
 * usuario autenticado acessa apenas os seus proprios dados.
 */
@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    private final UsuarioService usuarioService;

    public PerfilController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<UsuarioResponse> meuPerfil() {
        return ResponseEntity.ok(usuarioService.buscarPerfilLogado());
    }

    @PutMapping
    public ResponseEntity<UsuarioResponse> atualizar(@Valid @RequestBody PerfilRequest request) {
        return ResponseEntity.ok(usuarioService.atualizarPerfil(request));
    }
}
