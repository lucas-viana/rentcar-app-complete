package com.rentcar.features.usuario;

import com.rentcar.common.exception.BusinessException;
import com.rentcar.common.validation.CpfValidator;
import com.rentcar.features.usuario.dto.UsuarioRequest;
import com.rentcar.features.usuario.dto.UsuarioResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponse::from)
                .toList();
    }

    public UsuarioResponse buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(UsuarioResponse::from)
                .orElseThrow(() -> new BusinessException("Usuario nao encontrado", HttpStatus.NOT_FOUND));
    }

    public UsuarioResponse criar(UsuarioRequest request) {
        if (!CpfValidator.isValido(request.cpf())) {
            throw new BusinessException("CPF invalido");
        }
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new BusinessException("E-mail ja cadastrado");
        }
        if (usuarioRepository.existsByCpf(request.cpf())) {
            throw new BusinessException("CPF ja cadastrado");
        }
        if (request.senha() == null || request.senha().isBlank()) {
            throw new BusinessException("Senha e obrigatoria");
        }
        if (request.senha().length() < 6) {
            throw new BusinessException("Senha deve ter pelo menos 6 caracteres");
        }

        Usuario usuario = new Usuario();
        usuario.setNomeCompleto(request.nomeCompleto());
        usuario.setEmail(request.email());
        usuario.setCpf(request.cpf());
        usuario.setDataNascimento(parseDataNascimento(request.dataNascimento()));
        usuario.setTelefone(request.telefone());
        usuario.setEndereco(request.endereco());
        usuario.setTipo(request.tipo() != null ? TipoUsuario.fromValue(request.tipo()) : TipoUsuario.CLIENTE);
        usuario.setSenha(passwordEncoder.encode(request.senha()));

        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    public UsuarioResponse atualizar(Long id, UsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario nao encontrado", HttpStatus.NOT_FOUND));

        if (!CpfValidator.isValido(request.cpf())) {
            throw new BusinessException("CPF invalido");
        }
        if (!usuario.getEmail().equals(request.email()) && usuarioRepository.existsByEmail(request.email())) {
            throw new BusinessException("E-mail ja cadastrado");
        }
        if (!usuario.getCpf().equals(request.cpf()) && usuarioRepository.existsByCpf(request.cpf())) {
            throw new BusinessException("CPF ja cadastrado");
        }

        usuario.setNomeCompleto(request.nomeCompleto());
        usuario.setEmail(request.email());
        usuario.setCpf(request.cpf());
        usuario.setDataNascimento(parseDataNascimento(request.dataNascimento()));
        usuario.setTelefone(request.telefone());
        usuario.setEndereco(request.endereco());
        if (request.tipo() != null) {
            usuario.setTipo(TipoUsuario.fromValue(request.tipo()));
        }
        if (request.senha() != null && !request.senha().isBlank()) {
            if (request.senha().length() < 6) {
                throw new BusinessException("Senha deve ter pelo menos 6 caracteres");
            }
            usuario.setSenha(passwordEncoder.encode(request.senha()));
        }

        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    public void deletar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Usuario nao encontrado", HttpStatus.NOT_FOUND));
        if (usuario.getTipo() == TipoUsuario.ADMIN) {
            throw new BusinessException("Nao e possivel excluir um administrador");
        }
        usuarioRepository.delete(usuario);
    }

    private LocalDate parseDataNascimento(String valor) {
        if (valor == null || valor.isBlank()) return null;
        LocalDate data;
        try {
            data = LocalDate.parse(valor);
        } catch (DateTimeParseException e) {
            throw new BusinessException("Data de nascimento invalida. Use o formato AAAA-MM-DD");
        }
        long idade = ChronoUnit.YEARS.between(data, LocalDate.now());
        if (idade < 18) {
            throw new BusinessException("Usuario deve ter pelo menos 18 anos");
        }
        return data;
    }
}
