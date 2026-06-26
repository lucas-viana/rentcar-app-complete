package com.rentcar.features.usuario;

import com.rentcar.common.exception.BusinessException;
import com.rentcar.common.security.AuthUtils;
import com.rentcar.common.security.CustomUserDetails;
import com.rentcar.common.validation.CnhValidator;
import com.rentcar.common.validation.CpfValidator;
import com.rentcar.features.usuario.dto.PerfilRequest;
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
        aplicarCnh(usuario, request.numeroCnh(), request.categoriaCnh(), request.validadeCnh());
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
        aplicarCnh(usuario, request.numeroCnh(), request.categoriaCnh(), request.validadeCnh());
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

    // RF04: o proprio usuario logado consulta seu perfil
    public UsuarioResponse buscarPerfilLogado() {
        return UsuarioResponse.from(getLogadoOuFalhar());
    }

    // RF04: o proprio usuario logado atualiza seus dados de contato e a CNH.
    // CPF, perfil e data de nascimento nao sao editaveis aqui.
    public UsuarioResponse atualizarPerfil(PerfilRequest request) {
        Usuario usuario = getLogadoOuFalhar();

        if (!usuario.getEmail().equals(request.email()) && usuarioRepository.existsByEmail(request.email())) {
            throw new BusinessException("E-mail ja cadastrado");
        }

        usuario.setNomeCompleto(request.nomeCompleto());
        usuario.setEmail(request.email());
        usuario.setTelefone(request.telefone());
        usuario.setEndereco(request.endereco());
        aplicarCnh(usuario, request.numeroCnh(), request.categoriaCnh(), request.validadeCnh());

        if (request.novaSenha() != null && !request.novaSenha().isBlank()) {
            if (request.novaSenha().length() < 6) {
                throw new BusinessException("A nova senha deve ter pelo menos 6 caracteres");
            }
            if (request.senhaAtual() == null || !passwordEncoder.matches(request.senhaAtual(), usuario.getSenha())) {
                throw new BusinessException("Senha atual incorreta");
            }
            usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
        }

        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    private Usuario getLogadoOuFalhar() {
        CustomUserDetails logado = AuthUtils.getUsuarioLogado();
        if (logado == null) {
            throw new BusinessException("Nao autenticado", HttpStatus.UNAUTHORIZED);
        }
        return usuarioRepository.findById(logado.getId())
                .orElseThrow(() -> new BusinessException("Usuario nao encontrado", HttpStatus.NOT_FOUND));
    }

    // RF12: aplica os dados da CNH validando o formato (quando informado)
    private void aplicarCnh(Usuario usuario, String numero, String categoria, String validade) {
        if (numero != null && !numero.isBlank()) {
            if (!CnhValidator.formatoValido(numero)) {
                throw new BusinessException("CNH invalida. O numero deve conter 11 digitos");
            }
            usuario.setNumeroCnh(numero.replaceAll("\\D", ""));
        } else {
            usuario.setNumeroCnh(null);
        }
        usuario.setCategoriaCnh(categoria != null && !categoria.isBlank() ? categoria : null);
        usuario.setValidadeCnh(parseValidadeCnh(validade));
    }

    private LocalDate parseValidadeCnh(String valor) {
        if (valor == null || valor.isBlank()) return null;
        try {
            return LocalDate.parse(valor);
        } catch (DateTimeParseException e) {
            throw new BusinessException("Validade da CNH invalida. Use o formato AAAA-MM-DD");
        }
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
