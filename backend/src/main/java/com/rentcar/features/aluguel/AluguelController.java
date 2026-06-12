package com.rentcar.features.aluguel;

import com.rentcar.features.aluguel.dto.AluguelRequest;
import com.rentcar.features.aluguel.dto.AluguelResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alugueis")
public class AluguelController {

    private final AluguelService aluguelService;

    public AluguelController(AluguelService aluguelService) {
        this.aluguelService = aluguelService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AluguelResponse>> listar() {
        return ResponseEntity.ok(aluguelService.listar());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<AluguelResponse>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(aluguelService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AluguelResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(aluguelService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<AluguelResponse> criar(@Valid @RequestBody AluguelRequest request) {
        return ResponseEntity.ok(aluguelService.criar(request));
    }

    @PutMapping("/{id}/finalizar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AluguelResponse> finalizar(@PathVariable Long id) {
        return ResponseEntity.ok(aluguelService.finalizar(id));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<AluguelResponse> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(aluguelService.cancelar(id));
    }
}
