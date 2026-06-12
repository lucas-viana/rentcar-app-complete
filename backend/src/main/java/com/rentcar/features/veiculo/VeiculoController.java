package com.rentcar.features.veiculo;

import com.rentcar.features.veiculo.dto.VeiculoRequest;
import com.rentcar.features.veiculo.dto.VeiculoResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/veiculos")
public class VeiculoController {

    private final VeiculoService veiculoService;

    public VeiculoController(VeiculoService veiculoService) {
        this.veiculoService = veiculoService;
    }

    @GetMapping
    public ResponseEntity<List<VeiculoResponse>> listar() {
        return ResponseEntity.ok(veiculoService.listar());
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<List<VeiculoResponse>> listarDisponiveis(
            @RequestParam(name = "data_retirada", required = false) String dataRetirada,
            @RequestParam(name = "data_entrega", required = false) String dataEntrega) {
        return ResponseEntity.ok(veiculoService.listarDisponiveis(dataRetirada, dataEntrega));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VeiculoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(veiculoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<VeiculoResponse> criar(@Valid @RequestBody VeiculoRequest request) {
        return ResponseEntity.ok(veiculoService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VeiculoResponse> atualizar(@PathVariable Long id, @Valid @RequestBody VeiculoRequest request) {
        return ResponseEntity.ok(veiculoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        veiculoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
