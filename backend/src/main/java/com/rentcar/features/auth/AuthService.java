package com.rentcar.features.auth;

import com.rentcar.common.exception.BusinessException;
import com.rentcar.common.security.CustomUserDetails;
import com.rentcar.common.security.JwtTokenProvider;
import com.rentcar.common.validation.CpfValidator;
import com.rentcar.features.auth.dto.LoginRequest;
import com.rentcar.features.auth.dto.LoginResponse;
import com.rentcar.features.auth.dto.RecuperarSenhaRequest;
import com.rentcar.features.auth.dto.RecuperarSenhaResponse;
import com.rentcar.features.auth.dto.RedefinirSenhaRequest;
import com.rentcar.features.auth.dto.RegisterRequest;
import com.rentcar.features.usuario.TipoUsuario;
import com.rentcar.features.usuario.Usuario;
import com.rentcar.features.usuario.UsuarioRepository;
import com.rentcar.features.usuario.dto.UsuarioResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider,
                       UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.senha())
            );
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String token = jwtTokenProvider.generateToken(userDetails);
            return new LoginResponse(token, UsuarioResponse.from(userDetails.getUsuario()));
        } catch (BadCredentialsException e) {
            throw new BusinessException("E-mail ou senha invalidos", HttpStatus.UNAUTHORIZED);
        }
    }

    public LoginResponse registrar(RegisterRequest request) {
        if (!CpfValidator.isValido(request.cpf())) {
            throw new BusinessException("CPF invalido");
        }
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new BusinessException("E-mail ja cadastrado");
        }
        if (usuarioRepository.existsByCpf(request.cpf())) {
            throw new BusinessException("CPF ja cadastrado");
        }

        LocalDate dataNascimento = parseDataNascimento(request.dataNascimento());

        Usuario usuario = new Usuario();
        usuario.setNomeCompleto(request.nomeCompleto());
        usuario.setEmail(request.email());
        usuario.setCpf(request.cpf());
        usuario.setDataNascimento(dataNascimento);
        usuario.setTelefone(request.telefone());
        usuario.setEndereco(request.endereco());
        usuario.setTipo(TipoUsuario.CLIENTE);
        usuario.setSenha(passwordEncoder.encode(request.senha()));

        usuario = usuarioRepository.save(usuario);

        CustomUserDetails userDetails = new CustomUserDetails(usuario);
        String token = jwtTokenProvider.generateToken(userDetails);
        return new LoginResponse(token, UsuarioResponse.from(usuario));
    }

    // RF03: gera um token de redefinicao e "envia" por e-mail (simulado: o link
    // e retornado na resposta para permitir o teste do fluxo no trabalho).
    public RecuperarSenhaResponse recuperarSenha(RecuperarSenhaRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Nenhuma conta encontrada com este e-mail", HttpStatus.NOT_FOUND));

        String token = UUID.randomUUID().toString();
        usuario.setResetToken(token);
        usuario.setResetTokenExpira(LocalDateTime.now().plusMinutes(30));
        usuarioRepository.save(usuario);

        return new RecuperarSenhaResponse(
                "Link de redefinicao gerado. Em um sistema real ele seria enviado para " + usuario.getEmail() + ".",
                "/redefinir-senha?token=" + token,
                token);
    }

    // RF03: valida o token (existencia + expiracao) e troca a senha
    public void redefinirSenha(RedefinirSenhaRequest request) {
        Usuario usuario = usuarioRepository.findByResetToken(request.token())
                .orElseThrow(() -> new BusinessException("Token invalido ou ja utilizado"));

        if (usuario.getResetTokenExpira() == null || usuario.getResetTokenExpira().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Token expirado. Solicite um novo link de redefinicao");
        }

        usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
        usuario.setResetToken(null);
        usuario.setResetTokenExpira(null);
        usuarioRepository.save(usuario);
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
            throw new BusinessException("E necessario ter pelo menos 18 anos para se cadastrar");
        }
        return data;
    }
}
