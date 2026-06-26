# 🚗 RentCar — Análise Completa do Sistema

> Sistema web completo para gerenciamento de locadoras de veículos, desenvolvido como projeto acadêmico da disciplina de **Projeto e Desenvolvimento de Software** (7º período — Sistemas de Informação).
> 
> **Equipe:** Aryane, Letícia, Lucas e Rafael  
> **Professor:** Drº Matheus Guedes

---

## 📋 Visão Geral

O **RentCar** é uma aplicação full-stack que gerencia todo o ciclo de vida de uma locadora de veículos: desde o cadastro de clientes e frota até o controle de aluguéis, devoluções e cálculo automático de multas por atraso.

---

## 🏗️ Arquitetura do Sistema

```mermaid
graph TB
    subgraph Frontend["🌐 Frontend — React 18 + Vite"]
        UI[Páginas React]
        CTX[AuthContext]
        SVC[Services / Axios]
    end

    subgraph Backend["⚙️ Backend — Spring Boot 3.3.5"]
        CTRL[Controllers REST]
        SEC[Spring Security + JWT]
        SERV[Services]
        REPO[Repositories / JPA]
    end

    subgraph DB["🗄️ Banco de Dados — PostgreSQL 15"]
        T1[(usuarios)]
        T2[(veiculos)]
        T3[(alugueis)]
    end

    UI --> CTX
    CTX --> SVC
    SVC -->|HTTP REST + JWT| CTRL
    CTRL --> SEC
    SEC --> SERV
    SERV --> REPO
    REPO --> T1
    REPO --> T2
    REPO --> T3
```

---

## 🗂️ Estrutura de Módulos do Backend

```mermaid
graph LR
    subgraph Features
        A[auth] --> A1[AuthController]
        A --> A2[AuthService]
        A --> A3[LoginRequest / Response]
        A --> A4[RecuperarSenhaRequest]
        A --> A5[RedefinirSenhaRequest]

        B[usuario] --> B1[UsuarioController]
        B --> B2[UsuarioService]
        B --> B3[PerfilController]
        B --> B4[TipoUsuario enum]
        B --> B5[UsuarioRepository]

        C[veiculo] --> C1[VeiculoController]
        C --> C2[VeiculoService]
        C --> C3[VeiculoRepository]

        D[aluguel] --> D1[AluguelController]
        D --> D2[AluguelService]
        D --> D3[AluguelRepository]
        D --> D4[StatusAluguel enum]

        E[dashboard] --> E1[DashboardController]
        E --> E2[DashboardService]

        F[relatorio] --> F1[RelatorioController]
        F --> F2[RelatorioService]
    end

    subgraph Common
        G[security] --> G1[JwtTokenProvider]
        G --> G2[JwtAuthenticationFilter]
        G --> G3[SecurityConfig]
        G --> G4[CustomUserDetailsService]
        H[exception] --> H1[BusinessException]
        H --> H2[GlobalExceptionHandler]
        I[validation] --> I1[CpfValidator]
        I --> I2[CnhValidator]
    end
```

---

## 🗃️ Diagrama de Entidades (Modelo de Dados)

```mermaid
erDiagram
    USUARIOS {
        bigint id PK
        varchar nome_completo
        varchar email UK
        varchar cpf UK
        date data_nascimento
        varchar telefone
        varchar endereco
        varchar numero_cnh
        varchar categoria_cnh
        date validade_cnh
        varchar tipo "ADMIN | CLIENTE"
        varchar senha
        varchar reset_token
        timestamp reset_token_expira
    }

    VEICULOS {
        bigint id PK
        varchar modelo
        varchar fabricante
        integer ano
        varchar placa UK
        varchar cor
        varchar categoria
        varchar combustivel
        varchar cambio
        integer portas
        integer passageiros
        integer km
        decimal valor_diaria
        varchar imagem
        boolean em_manutencao
    }

    ALUGUEIS {
        bigint id PK
        bigint usuario_id FK
        bigint veiculo_id FK
        date data_retirada
        date data_entrega
        varchar forma_pagamento
        decimal valor_total
        varchar status "ATIVO | FINALIZADO | CANCELADO"
        timestamp finalizado_em
        date data_devolucao_real
        integer dias_reais
        decimal multa_atraso
        decimal valor_final
    }

    USUARIOS ||--o{ ALUGUEIS : "realiza"
    VEICULOS ||--o{ ALUGUEIS : "é associado a"
```

---

## 👥 Perfis de Usuário e Funcionalidades

```mermaid
mindmap
  root((RentCar))
    Admin
      Dashboard
        Total de veículos
        Veículos disponíveis
        Aluguéis ativos
        Total de clientes
        Receita total
      Gestão de Veículos
        Cadastrar veículo
        Editar veículo
        Remover veículo
        Marcar em manutenção
      Gestão de Usuários
        Cadastrar cliente
        Editar cliente
        Listar clientes
      Gestão de Aluguéis
        Registrar aluguel
        Processar devolução
        Calcular multa por atraso
      Relatórios
        Relatório por período
    Cliente
      Frota
        Ver veículos disponíveis
        Ver detalhes do veículo
      Reserva
        Selecionar datas
        Escolher pagamento
        Confirmar reserva
      Meus Aluguéis
        Histórico de aluguéis
        Cancelar aluguel ativo
      Perfil
        Editar dados pessoais
        Atualizar CNH
    Público
      Login
      Recuperar Senha
      Redefinir Senha
```

---

## 🔄 Fluxo de Autenticação (JWT)

```mermaid
sequenceDiagram
    actor Usuário
    participant Frontend
    participant AuthController
    participant AuthService
    participant JwtTokenProvider
    participant DB as PostgreSQL

    Usuário->>Frontend: Informa e-mail e senha
    Frontend->>AuthController: POST /api/auth/login
    AuthController->>AuthService: autenticar(email, senha)
    AuthService->>DB: buscar usuário por e-mail
    DB-->>AuthService: Usuario encontrado
    AuthService->>AuthService: verificar senha (BCrypt)
    alt Senha válida
        AuthService->>JwtTokenProvider: gerar token JWT (24h)
        JwtTokenProvider-->>AuthService: token
        AuthService-->>AuthController: LoginResponse (token + tipo)
        AuthController-->>Frontend: 200 OK + { token, tipo }
        Frontend->>Frontend: salva token no localStorage
        Frontend->>Usuário: redireciona (Admin→/dashboard, Cliente→/frota)
    else Senha inválida
        AuthService-->>AuthController: BusinessException 401
        AuthController-->>Frontend: 401 Unauthorized
        Frontend->>Usuário: exibe mensagem de erro
    end
```

---

## 🔑 Fluxo de Recuperação de Senha

```mermaid
flowchart TD
    A([Usuário clica em 'Esqueci minha senha']) --> B[Informa e-mail]
    B --> C{E-mail cadastrado?}
    C -->|Não| D[Exibe erro: e-mail não encontrado]
    C -->|Sim| E[Gera reset_token temporário]
    E --> F[Salva token + expiração no banco]
    F --> G[Exibe o token na resposta da API]
    G --> H[Usuário acessa /redefinir-senha]
    H --> I[Informa token + nova senha]
    I --> J{Token válido e não expirado?}
    J -->|Não| K[Erro: token inválido ou expirado]
    J -->|Sim| L[Atualiza senha com BCrypt]
    L --> M[Limpa token do banco]
    M --> N([Senha redefinida com sucesso])
```

---

## 🚗 Fluxo de Reserva de Veículo (Cliente)

```mermaid
flowchart TD
    A([Cliente acessa /frota]) --> B[Visualiza veículos disponíveis]
    B --> C[Clica em um veículo]
    C --> D[Vê detalhes do veículo]
    D --> E[Clica em 'Reservar']
    E --> F[Informa data de retirada e entrega]
    F --> G{CNH cadastrada e válida?}
    G -->|Não| H[Erro: atualizar perfil com dados da CNH]
    G -->|Sim| I{Veículo em manutenção?}
    I -->|Sim| J[Erro: selecione outro veículo]
    I -->|Não| K{Data de retirada >= hoje?}
    K -->|Não| L[Erro: data inválida]
    K -->|Sim| M{Data entrega > data retirada?}
    M -->|Não| N[Erro: datas inválidas]
    M -->|Sim| O{Conflito de período\npara o veículo?}
    O -->|Sim| P[Erro: veículo já reservado neste período]
    O -->|Não| Q[Calcula valor total\n dias × valor_diaria]
    Q --> R[Cliente escolhe forma de pagamento]
    R --> S[Confirma reserva]
    S --> T[Aluguel criado com status ATIVO]
    T --> U([Reserva realizada com sucesso!])
```

---

## 📦 Fluxo de Devolução de Veículo (Admin)

```mermaid
flowchart TD
    A([Admin acessa lista de aluguéis]) --> B[Seleciona aluguel ATIVO]
    B --> C[Clica em 'Processar Devolução']
    C --> D{Informa data real de devolução?}
    D -->|Não| E[Usa data de hoje como padrão]
    D -->|Sim| E2[Usa data informada]
    E --> F{Data devolução >= data retirada?}
    E2 --> F
    F -->|Não| G[Erro: data inválida]
    F -->|Sim| H[Calcula dias reais utilizados\nmínimo = 1 dia]
    H --> I{Devolução com atraso?\ndata_devolucao_real > data_entrega}
    I -->|Sim| J[Calcula multa:\ndias_atraso × diária × 50%]
    I -->|Não| K[Multa = R$ 0,00]
    J --> L[valor_final = valor_base + multa]
    K --> L
    L --> M[Atualiza status para FINALIZADO]
    M --> N[Registra data/hora de finalização]
    N --> O([Devolução processada com sucesso!])
```

---

## 🗺️ Mapa de Rotas do Frontend

```mermaid
graph TD
    subgraph Público
        R1["/login"]
        R2["/recuperar-senha"]
        R3["/redefinir-senha"]
    end

    subgraph Admin["🔐 Apenas Admin"]
        R4["/dashboard"]
        R5["/veiculos"]
        R6["/veiculos/novo"]
        R7["/veiculos/:id/editar"]
        R8["/usuarios"]
        R9["/usuarios/novo"]
        R10["/usuarios/:id/editar"]
        R11["/alugueis"]
        R12["/alugueis/novo"]
        R13["/relatorios"]
    end

    subgraph Compartilhado["👤 Admin + Cliente"]
        R14["/frota"]
        R15["/veiculos/:id"]
        R16["/reservar/:id"]
        R17["/meus-alugueis"]
        R18["/perfil"]
    end

    ROOT("/") -->|não autenticado| R1
    ROOT -->|Admin| R4
    ROOT -->|Cliente| R14
```

---

## 🔗 Diagrama de Componentes Frontend

```mermaid
graph TD
    APP["App.jsx"] --> BROWSER["BrowserRouter"]
    BROWSER --> AUTH_PROV["AuthProvider (AuthContext)"]
    AUTH_PROV --> ROUTES["AppRoutes"]

    ROUTES --> LOGIN_PG["LoginPage"]
    ROUTES --> SENHA_PG["RecuperarSenhaPage / RedefinirSenhaPage"]
    ROUTES --> DASHBOARD_PG["DashboardPage (Admin)"]
    ROUTES --> VEICULOS_PG["VeiculosPage (Admin)"]
    ROUTES --> VEICULO_FORM["VeiculoFormPage (Admin)"]
    ROUTES --> USUARIOS_PG["UsuariosPage (Admin)"]
    ROUTES --> ALUGUEIS_PG["AlugueisPage (Admin)"]
    ROUTES --> RELATORIOS_PG["RelatoriosPage (Admin)"]
    ROUTES --> FROTA_PG["FrotaClientePage"]
    ROUTES --> RESERVA_PG["ReservaFluxoPage"]
    ROUTES --> MEUS_AL["MeusAlugueisPage"]
    ROUTES --> PERFIL_PG["PerfilPage"]

    subgraph Services
        SVC1[authService.js]
        SVC2[veiculoService.js]
        SVC3[aluguelService.js]
        SVC4[usuarioService.js]
        SVC5[dashboardService.js]
        SVC6[relatorioService.js]
        SVC7[perfilService.js]
        API[api.js — Axios + Interceptor JWT]
    end

    SVC1 --> API
    SVC2 --> API
    SVC3 --> API
    SVC4 --> API
    SVC5 --> API
    SVC6 --> API
    SVC7 --> API
```

---

## 📡 Endpoints da API REST

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `POST` | `/api/auth/login` | Público | Autenticação e geração de token JWT |
| `POST` | `/api/auth/register` | Público | Registro de novo usuário |
| `POST` | `/api/auth/recuperar-senha` | Público | Solicita recuperação de senha |
| `POST` | `/api/auth/redefinir-senha` | Público | Redefine senha com token |
| `GET` | `/api/veiculos` | Autenticado | Listar todos os veículos |
| `POST` | `/api/veiculos` | Admin | Cadastrar novo veículo |
| `PUT` | `/api/veiculos/:id` | Admin | Editar veículo |
| `DELETE` | `/api/veiculos/:id` | Admin | Remover veículo |
| `GET` | `/api/usuarios` | Admin | Listar usuários |
| `POST` | `/api/usuarios` | Admin | Cadastrar usuário |
| `PUT` | `/api/usuarios/:id` | Admin | Editar usuário |
| `GET` | `/api/alugueis` | Admin | Listar todos os aluguéis |
| `POST` | `/api/alugueis` | Autenticado | Registrar aluguel |
| `POST` | `/api/alugueis/:id/devolver` | Admin | Processar devolução |
| `DELETE` | `/api/alugueis/:id` | Autenticado | Cancelar aluguel |
| `GET` | `/api/alugueis/usuario/:id` | Autenticado | Aluguéis de um usuário |
| `GET` | `/api/dashboard` | Admin | Estatísticas do dashboard |
| `GET` | `/api/relatorio` | Admin | Relatório de locações por período |
| `GET/PUT` | `/api/perfil` | Autenticado | Ver/editar perfil próprio |

---

## 🔐 Regras de Negócio Implementadas

| # | Regra | Descrição |
|---|-------|-----------|
| RF03 | Recuperação de senha | Token temporário com expiração de 15 minutos |
| RF06 | Manutenção de veículo | Veículo em manutenção não pode ser alugado |
| RF12 | Validação de CNH | CNH obrigatória com formato (11 dígitos) e validade verificados antes do aluguel |
| RF13 | Cálculo real | Cobra por dias efetivamente usados (mínimo 1 dia) |
| RF14 | Multa por atraso | 50% do valor da diária por dia excedente |
| — | Buffer entre aluguéis | Intervalo de 1 dia após cada devolução antes de nova reserva |
| — | Validação de CPF | CPF único por usuário com formato validado |
| — | Controle de acesso | Clientes só veem/modificam seus próprios dados e aluguéis |

---

## 🧮 Fórmula de Cálculo de Valores

### Valor base do aluguel:
$$\text{Valor Total} = \text{Valor Diária} \times \text{Dias Contratados}$$

### Cálculo na devolução (com ou sem atraso):
$$\text{Valor Base Real} = \text{Valor Diária} \times \max(\text{Dias Reais}, 1)$$

$$\text{Multa} = \text{Valor Diária} \times \text{Dias de Atraso} \times 0{,}5$$

$$\text{Valor Final} = \text{Valor Base Real} + \text{Multa}$$

---

## 🛠️ Stack Tecnológico Completo

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | React | 18 |
| **Frontend** | Vite | 5 |
| **Frontend** | React Router DOM | 6 |
| **Frontend** | Tailwind CSS | 3 |
| **Frontend** | Axios | — |
| **Backend** | Java | 17+ |
| **Backend** | Spring Boot | 3.3.5 |
| **Backend** | Spring Security | — |
| **Backend** | Spring Data JPA | — |
| **Backend** | JWT (jjwt) | 0.12.6 |
| **Backend** | Maven | 3.6+ |
| **Banco** | PostgreSQL | 15+ |
