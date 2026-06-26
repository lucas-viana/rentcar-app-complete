package com.rentcar.features.auth;

import com.rentcar.common.security.CustomUserDetails;
import com.rentcar.features.auth.dto.LoginRequest;
import com.rentcar.features.auth.dto.LoginResponse;
import com.rentcar.features.auth.dto.RecuperarSenhaRequest;
import com.rentcar.features.auth.dto.RecuperarSenhaResponse;
import com.rentcar.features.auth.dto.RedefinirSenhaRequest;
import com.rentcar.features.auth.dto.RegisterRequest;
import com.rentcar.features.usuario.dto.UsuarioResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/registrar")
    public ResponseEntity<LoginResponse> registrar(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.registrar(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> me(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(UsuarioResponse.from(userDetails.getUsuario()));
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<RecuperarSenhaResponse> recuperarSenha(@Valid @RequestBody RecuperarSenhaRequest request) {
        return ResponseEntity.ok(authService.recuperarSenha(request));
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<Map<String, String>> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequest request) {
        authService.redefinirSenha(request);
        return ResponseEntity.ok(Map.of("mensagem", "Senha redefinida com sucesso. Faca login com a nova senha"));
    }
}
