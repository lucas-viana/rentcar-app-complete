package com.rentcar;

import com.rentcar.features.aluguel.Aluguel;
import com.rentcar.features.aluguel.AluguelRepository;
import com.rentcar.features.aluguel.StatusAluguel;
import com.rentcar.features.usuario.TipoUsuario;
import com.rentcar.features.usuario.Usuario;
import com.rentcar.features.usuario.UsuarioRepository;
import com.rentcar.features.veiculo.Veiculo;
import com.rentcar.features.veiculo.VeiculoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final VeiculoRepository veiculoRepository;
    private final AluguelRepository aluguelRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UsuarioRepository usuarioRepository, VeiculoRepository veiculoRepository,
                      AluguelRepository aluguelRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.veiculoRepository = veiculoRepository;
        this.aluguelRepository = aluguelRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) return;

        criarUsuario("Admin Sistema", "admin@rental.com", "123.456.789-09",
                LocalDate.of(1990, 3, 15), "(11) 99999-0001", "Rua das Flores, 100 - Sao Paulo/SP",
                TipoUsuario.ADMIN, "admin123");

        Usuario carlos = criarUsuario("Carlos Eduardo Santos", "cliente@rental.com", "987.654.321-00",
                LocalDate.of(1995, 7, 22), "(21) 98888-0002", "Av. Atlantica, 500 - Rio de Janeiro/RJ",
                TipoUsuario.CLIENTE, "cliente123");

        Usuario mariana = criarUsuario("Mariana Oliveira Costa", "mariana@email.com", "111.444.777-35",
                LocalDate.of(1988, 11, 4), "(31) 97777-0003", "Rua Savassi, 200 - Belo Horizonte/MG",
                TipoUsuario.CLIENTE, "maria123");

        Usuario joao = criarUsuario("Joao Paulo Ferreira", "joao@email.com", "529.982.247-25",
                LocalDate.of(1992, 5, 18), "(47) 96666-0004", "Rua XV de Novembro, 800 - Joinville/SC",
                TipoUsuario.CLIENTE, "joao123");

        Veiculo onix = criarVeiculo("Onix Plus", "Chevrolet", 2023, "BRA2E19", "Prata", "Economico",
                "Flex", "Automatico", 4, 5, 12400, "129.90");
        Veiculo compass = criarVeiculo("Compass Longitude", "Jeep", 2024, "ABC1D23", "Branco", "SUV",
                "Flex", "Automatico", 4, 5, 8200, "289.90");
        Veiculo hb20 = criarVeiculo("HB20 Sense", "Hyundai", 2022, "MER3F45", "Vermelho", "Economico",
                "Flex", "Manual", 4, 5, 31500, "99.90");
        criarVeiculo("Hilux CD SRX", "Toyota", 2024, "TOY4G56", "Cinza", "Picape",
                "Diesel", "Automatico", 4, 5, 5100, "399.90");
        criarVeiculo("Pulse Drive", "Fiat", 2023, "FIA5H67", "Azul", "SUV",
                "Flex", "CVT", 4, 5, 18700, "199.90");
        Veiculo corolla = criarVeiculo("Corolla Altis", "Toyota", 2024, "TOY6I78", "Preto", "Sedan",
                "Hibrido", "Automatico", 4, 5, 3300, "359.90");
        criarVeiculo("Kwid Zen", "Renault", 2022, "REN7J89", "Laranja", "Economico",
                "Flex", "Manual", 4, 5, 44200, "79.90");
        criarVeiculo("EcoSport Storm", "Ford", 2023, "FOR8K90", "Verde", "SUV",
                "Flex", "Automatico", 4, 5, 21600, "249.90");

        LocalDate hoje = LocalDate.now();

        // Historico: finalizado ha algumas semanas (5 dias x 129.90)
        criarAluguel(carlos, onix, hoje.minusDays(30), hoje.minusDays(25),
                "cartao_credito", "649.50", StatusAluguel.FINALIZADO,
                hoje.minusDays(25).atTime(14, 30));

        // Em andamento: cobre a data de hoje (5 dias x 289.90)
        criarAluguel(mariana, compass, hoje.minusDays(2), hoje.plusDays(3),
                "pix", "1449.50", StatusAluguel.ATIVO, null);

        // Historico: finalizado (2 dias x 99.90)
        criarAluguel(joao, hb20, hoje.minusDays(20), hoje.minusDays(18),
                "dinheiro", "199.80", StatusAluguel.FINALIZADO,
                hoje.minusDays(18).atTime(9, 0));

        // Reserva futura: nao bloqueia o veiculo hoje (7 dias x 359.90)
        criarAluguel(carlos, corolla, hoje.plusDays(5), hoje.plusDays(12),
                "cartao_debito", "2519.30", StatusAluguel.ATIVO, null);
    }

    private Usuario criarUsuario(String nome, String email, String cpf, LocalDate nascimento,
                                  String telefone, String endereco, TipoUsuario tipo, String senha) {
        Usuario u = new Usuario();
        u.setNomeCompleto(nome);
        u.setEmail(email);
        u.setCpf(cpf);
        u.setDataNascimento(nascimento);
        u.setTelefone(telefone);
        u.setEndereco(endereco);
        u.setTipo(tipo);
        u.setSenha(passwordEncoder.encode(senha));
        return usuarioRepository.save(u);
    }

    private Veiculo criarVeiculo(String modelo, String fabricante, int ano, String placa, String cor,
                                  String categoria, String combustivel, String cambio, int portas,
                                  int passageiros, int km, String valorDiaria) {
        Veiculo v = new Veiculo();
        v.setModelo(modelo);
        v.setFabricante(fabricante);
        v.setAno(ano);
        v.setPlaca(placa);
        v.setCor(cor);
        v.setCategoria(categoria);
        v.setCombustivel(combustivel);
        v.setCambio(cambio);
        v.setPortas(portas);
        v.setPassageiros(passageiros);
        v.setKm(km);
        v.setValorDiaria(new BigDecimal(valorDiaria));
        return veiculoRepository.save(v);
    }

    private void criarAluguel(Usuario usuario, Veiculo veiculo, LocalDate retirada, LocalDate entrega,
                               String pagamento, String valor, StatusAluguel status, LocalDateTime finalizadoEm) {
        Aluguel a = new Aluguel();
        a.setUsuario(usuario);
        a.setVeiculo(veiculo);
        a.setDataRetirada(retirada);
        a.setDataEntrega(entrega);
        a.setFormaPagamento(pagamento);
        a.setValorTotal(new BigDecimal(valor));
        a.setStatus(status);
        a.setFinalizadoEm(finalizadoEm);
        aluguelRepository.save(a);
    }
}
