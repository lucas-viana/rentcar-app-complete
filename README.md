# RentCar - Sistema de Locação de Veículos

Sistema web completo para gerenciamento de locadoras de veículos, desenvolvido como projeto acadêmico da disciplina de Projeto e Desenvolvimento de Software ministrada pelo Prof. Drº Matheus Guedes, durante o 7º período da Graduação em Sistemas de Informação. Permite o controle de frota, cadastro de clientes, registro de aluguéis e acompanhamento de devoluções com cálculo automático de multas por atraso.

Projeto desenvolvido em grupo pelos alunos (as): Aryane, Letícia, Lucas e Rafael.

## Tecnologias

**Backend**
- Java 17+
- Spring Boot 3.3.5 (Web, Data JPA, Security, Validation)
- PostgreSQL 15+
- JWT para autenticação (jjwt 0.12.6)
- Maven 3.6+

**Frontend**
- React 18 com Vite 5
- React Router DOM 6
- Tailwind CSS 3
- Axios

## Estrutura do Projeto

```
rentcar-app-complete/
├── backend/          # API REST Spring Boot
│   ├── src/main/java/com/rentcar/
│   │   ├── features/
│   │   │   ├── aluguel/       # Gestão de locações e devoluções
│   │   │   ├── auth/          # Login, registro e recuperação de senha
│   │   │   ├── dashboard/     # Estatísticas e resumos
│   │   │   ├── relatorio/     # Relatórios de aluguéis
│   │   │   ├── usuario/       # Cadastro e perfil de usuários
│   │   │   └── veiculo/       # Cadastro e controle de frota
│   │   └── DataSeeder.java    # Carga inicial de dados
│   └── src/main/resources/
│       └── application.yml    # Configurações da aplicação
└── frontend/         # SPA React
    └── src/
```

## Pré-requisitos

- Java 17 ou superior
- Maven 3.6 ou superior
- Node.js 18 ou superior com npm
- PostgreSQL 15 ou superior em execução na porta 5432

## Configuração do Banco de Dados

Crie o banco de dados antes de iniciar o backend:

```sql
CREATE DATABASE rentcar;
```

As credenciais padrão esperadas pelo `application.yml` são:

| Parâmetro | Valor          |
|-----------|----------------|
| Host      | localhost:5432 |
| Banco     | rentcar        |
| Usuário   | postgres       |
| Senha     | 353742Ap$      |

Para usar credenciais diferentes, edite o arquivo `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/rentcar
    username: postgres
    password: sua_senha
```

O Hibernate está configurado com `ddl-auto: update`, portanto as tabelas são criadas automaticamente na primeira execução.

## Como Executar

### 1. Backend

```bash
cd backend
mvn spring-boot:run
```

A API será iniciada em `http://localhost:8080`. Na primeira execução, o `DataSeeder` popula automaticamente o banco com usuários, veículos e aluguéis de exemplo.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend será iniciado em `http://localhost:5173`.

Ambos os serviços precisam estar rodando ao mesmo tempo para o sistema funcionar.

## Usuários Padrão (DataSeeder)

| Perfil  | E-mail               | Senha      |
|---------|----------------------|------------|
| Admin   | admin@rental.com     | admin123   |
| Cliente | cliente@rental.com   | cliente123 |
| Cliente | mariana@email.com    | maria123   |
| Cliente | joao@email.com       | joao123    |

## Funcionalidades

**Perfil Admin**
- Dashboard com totais de frota, aluguéis ativos e receita
- Cadastro, edição e remoção de veículos
- Cadastro e gerenciamento de clientes
- Registro de novos aluguéis
- Processamento de devoluções com cálculo de multa por atraso
- Relatórios de locações por período

**Perfil Cliente**
- Visualização de veículos disponíveis
- Histórico de aluguéis próprios
- Edição de perfil pessoal

## Endpoints Principais da API

| Método | Rota                        | Descrição                      |
|--------|-----------------------------|--------------------------------|
| POST   | /api/auth/login             | Autenticação                   |
| GET    | /api/veiculos               | Listar veículos                |
| POST   | /api/veiculos               | Cadastrar veículo (admin)      |
| GET    | /api/usuarios               | Listar usuários (admin)        |
| POST   | /api/alugueis               | Registrar aluguel              |
| POST   | /api/alugueis/{id}/devolver | Processar devolução            |
| GET    | /api/dashboard              | Estatísticas (admin)           |
| GET    | /api/relatorio              | Relatório de locações (admin)  |

## Observações

- O token JWT tem validade de 24 horas (configurável em `jwt.expiration` no `application.yml`).
- Veículos marcados como "em manutenção" não aparecem como disponíveis para locação.
- O cálculo de multa por atraso é feito automaticamente no momento da devolução com base nos dias excedentes e no valor da diária.
