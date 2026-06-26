# RentCar - Sistema de Locacao de Veiculos

Sistema web completo para gerenciamento de locadoras de veiculos, desenvolvido como projeto academico da disciplina de Projeto e Desenvolvimento de Software ministrada pelo Prof. Drº Matheus Guedes, durante o 7º período da Graduação em Sistemas de Informação. Permite o controle de frota, cadastro de clientes, registro de alugueis e acompanhamento de devolucoes com calculo automatico de multas por atraso.

Projeto desenvolvido em grupo pelos alunos (as): Aryane, Letícia, Lucas e Rafael. 

## Tecnologias

**Backend**
- Java 17+
- Spring Boot 3.3.5 (Web, Data JPA, Security, Validation)
- PostgreSQL 15+
- JWT para autenticacao (jjwt 0.12.6)
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
│   │   │   ├── aluguel/       # Gestao de locacoes e devolucoes
│   │   │   ├── auth/          # Login, registro e recuperacao de senha
│   │   │   ├── dashboard/     # Estatisticas e resumos
│   │   │   ├── relatorio/     # Relatorios de alugueis
│   │   │   ├── usuario/       # Cadastro e perfil de usuarios
│   │   │   └── veiculo/       # Cadastro e controle de frota
│   │   └── DataSeeder.java    # Carga inicial de dados
│   └── src/main/resources/
│       └── application.yml    # Configuracoes da aplicacao
└── frontend/         # SPA React
    └── src/
```

## Pre-requisitos

- Java 17 ou superior
- Maven 3.6 ou superior
- Node.js 18 ou superior com npm
- PostgreSQL 15 ou superior em execucao na porta 5432

## Configuracao do Banco de Dados

Crie o banco de dados antes de iniciar o backend:

```sql
CREATE DATABASE rentcar;
```

As credenciais padrao esperadas pelo `application.yml` sao:

| Parametro | Valor           |
|-----------|-----------------|
| Host      | localhost:5432  |
| Banco     | rentcar         |
| Usuario   | postgres        |
| Senha     | 353742Ap$       |

Para usar credenciais diferentes, edite o arquivo `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/rentcar
    username: postgres
    password: sua_senha
```

O Hibernate esta configurado com `ddl-auto: update`, portanto as tabelas sao criadas automaticamente na primeira execucao.

## Como Executar

### 1. Backend

```bash
cd backend
mvn spring-boot:run
```

A API sera iniciada em `http://localhost:8080`. Na primeira execucao, o `DataSeeder` popula automaticamente o banco com usuarios, veiculos e alugueis de exemplo.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend sera iniciado em `http://localhost:5173`.

Ambos os servicos precisam estar rodando ao mesmo tempo para o sistema funcionar.

## Usuarios Padrao (DataSeeder)

| Perfil  | E-mail               | Senha      |
|---------|----------------------|------------|
| Admin   | admin@rental.com     | admin123   |
| Cliente | cliente@rental.com   | cliente123 |
| Cliente | mariana@email.com    | maria123   |
| Cliente | joao@email.com       | joao123    |

## Funcionalidades

**Perfil Admin**
- Dashboard com totais de frota, alugueis ativos e receita
- Cadastro, edicao e remocao de veiculos
- Cadastro e gerenciamento de clientes
- Registro de novos alugueis
- Processamento de devolucoes com calculo de multa por atraso
- Relatorios de locacoes por periodo

**Perfil Cliente**
- Visualizacao de veiculos disponiveis
- Historico de alugueis proprios
- Edicao de perfil pessoal

## Endpoints Principais da API

| Metodo | Rota                        | Descricao                     |
|--------|-----------------------------|-------------------------------|
| POST   | /api/auth/login             | Autenticacao                  |
| GET    | /api/veiculos               | Listar veiculos               |
| POST   | /api/veiculos               | Cadastrar veiculo (admin)     |
| GET    | /api/usuarios               | Listar usuarios (admin)       |
| POST   | /api/alugueis               | Registrar aluguel             |
| POST   | /api/alugueis/{id}/devolver | Processar devolucao           |
| GET    | /api/dashboard              | Estatisticas (admin)          |
| GET    | /api/relatorio              | Relatorio de locacoes (admin) |

## Observacoes

- O token JWT tem validade de 24 horas (configuravel em `jwt.expiration` no `application.yml`).
- Veiculos marcados como "em manutencao" nao aparecem como disponiveis para locacao.
- O calculo de multa por atraso e feito automaticamente no momento da devolucao com base nos dias excedentes e no valor da diaria.
