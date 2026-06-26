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
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final VeiculoRepository veiculoRepository;
    private final AluguelRepository aluguelRepository;
    private final PasswordEncoder passwordEncoder;

    // Fotos reais dos modelos (Wikimedia Commons — tamanho 500px, suportado pela API),
    // indexadas pela placa
    private static final Map<String, String> IMAGENS_POR_PLACA = Map.of(
        "BRA2E19", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/2022_Chevrolet_Onix_RS_1.0_Turbo.jpg/500px-2022_Chevrolet_Onix_RS_1.0_Turbo.jpg",
        "ABC1D23", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Jeep_Compass_%28MP%29_PHEV_Facelift_1X7A0140.jpg/500px-Jeep_Compass_%28MP%29_PHEV_Facelift_1X7A0140.jpg",
        "MER3F45", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/2023_Hyundai_HB20_1.0_T-GDi_Platinum_Plus_%28Brazil%29_front_view.png/500px-2023_Hyundai_HB20_1.0_T-GDi_Platinum_Plus_%28Brazil%29_front_view.png",
        "TOY4G56", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Toyota_Hilux_2.4_E_4x2_2020.jpg/500px-Toyota_Hilux_2.4_E_4x2_2020.jpg",
        "FIA5H67", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/2023_Fiat_Pulse_Impetus_%28Colombia%29_front_view_01.jpg/500px-2023_Fiat_Pulse_Impetus_%28Colombia%29_front_view_01.jpg",
        "TOY6I78", "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Toyota_Corolla_Limousine_Hybrid_Genf_2019_1Y7A5576.jpg/500px-Toyota_Corolla_Limousine_Hybrid_Genf_2019_1Y7A5576.jpg",
        "REN7J89", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/2023_Renault_Kwid_Iconic_%28Colombia%29_front_view_01.png/500px-2023_Renault_Kwid_Iconic_%28Colombia%29_front_view_01.png",
        "FOR8K90", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/2018_Ford_Ecosport_ST-Line_TDCi_1.5.jpg/500px-2018_Ford_Ecosport_ST-Line_TDCi_1.5.jpg"
    );

    // CNH (simulada) dos clientes, indexada pelo e-mail: numero|categoria|anosDeValidade
    private static final Map<String, String> CNH_POR_EMAIL = Map.of(
        "cliente@rental.com", "12345678901|B|3",
        "mariana@email.com",  "98765432100|B|2",
        "joao@email.com",     "45678912300|AB|5"
    );

    public DataSeeder(UsuarioRepository usuarioRepository, VeiculoRepository veiculoRepository,
                      AluguelRepository aluguelRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.veiculoRepository = veiculoRepository;
        this.aluguelRepository = aluguelRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            seedInicial();
        }
        // Garante imagens e CNH mesmo em bancos ja populados de execucoes anteriores
        backfill();
    }

    private void seedInicial() {
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
        Veiculo ecosport = criarVeiculo("EcoSport Storm", "Ford", 2023, "FOR8K90", "Verde", "SUV",
                "Flex", "Automatico", 4, 5, 21600, "249.90");

        // RF06: um veiculo inicia em manutencao para demonstrar o status
        ecosport.setEmManutencao(true);
        veiculoRepository.save(ecosport);

        LocalDate hoje = LocalDate.now();

        // Em andamento: cobre a data de hoje (5 dias x 289.90)
        criarAluguel(mariana, compass, hoje.minusDays(2), hoje.plusDays(3),
                "pix", "1449.50", StatusAluguel.ATIVO, null);

        // Historico: finalizado ha algumas semanas (5 dias x 129.90)
        criarAluguel(carlos, onix, hoje.minusDays(30), hoje.minusDays(25),
                "cartao_credito", "649.50", StatusAluguel.FINALIZADO,
                hoje.minusDays(25).atTime(14, 30));

        // Historico: finalizado (2 dias x 99.90)
        criarAluguel(joao, hb20, hoje.minusDays(20), hoje.minusDays(18),
                "dinheiro", "199.80", StatusAluguel.FINALIZADO,
                hoje.minusDays(18).atTime(9, 0));

        // Reserva futura: nao bloqueia o veiculo hoje (7 dias x 359.90)
        criarAluguel(carlos, corolla, hoje.plusDays(5), hoje.plusDays(12),
                "cartao_debito", "2519.30", StatusAluguel.ATIVO, null);
    }

    // Preenche dados novos (imagem/CNH) em registros que ja existiam no banco
    private void backfill() {
        veiculoRepository.findAll().forEach(v -> {
            String url = IMAGENS_POR_PLACA.get(v.getPlaca());
            // Atualiza se nulo/vazio OU se ainda aponta para 640px (tamanho descontinuado)
            boolean precisaAtualizar = url != null &&
                (v.getImagem() == null || v.getImagem().isBlank() || v.getImagem().contains("/640px-"));
            if (precisaAtualizar) {
                v.setImagem(url);
                veiculoRepository.save(v);
            }
        });

        usuarioRepository.findAll().forEach(u -> {
            String cnh = CNH_POR_EMAIL.get(u.getEmail());
            if (cnh != null && (u.getNumeroCnh() == null || u.getNumeroCnh().isBlank())) {
                String[] partes = cnh.split("\\|");
                u.setNumeroCnh(partes[0]);
                u.setCategoriaCnh(partes[1]);
                u.setValidadeCnh(LocalDate.now().plusYears(Long.parseLong(partes[2])));
                usuarioRepository.save(u);
            }
        });
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

        String cnh = CNH_POR_EMAIL.get(email);
        if (cnh != null) {
            String[] partes = cnh.split("\\|");
            u.setNumeroCnh(partes[0]);
            u.setCategoriaCnh(partes[1]);
            u.setValidadeCnh(LocalDate.now().plusYears(Long.parseLong(partes[2])));
        }
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
        v.setImagem(IMAGENS_POR_PLACA.get(placa));
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
        // Locacoes finalizadas no seed: valor final igual ao previsto (sem atraso)
        if (status == StatusAluguel.FINALIZADO) {
            a.setDataDevolucaoReal(entrega);
            a.setValorFinal(new BigDecimal(valor));
            a.setMultaAtraso(BigDecimal.ZERO);
        }
        aluguelRepository.save(a);
    }
}
