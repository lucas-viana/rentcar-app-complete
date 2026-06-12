# 🚗 RentCar — Frontend React (SPA)

Sistema de Locação de Veículos — Front-end desacoplado em React, construído com **Vite** e **CSS puro**, utilizando dados simulados (mocks) para simular uma API RESTful (futuramente Spring Boot).

---

## 🧰 Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19.x | Biblioteca de UI |
| Vite | 8.x | Bundler / Dev Server |
| React Router DOM | 6.x | Roteamento SPA |
| Lucide React | latest | Ícones |
| Inter (Google Fonts) | — | Tipografia |

---

## ⚡ Como Instalar e Rodar Localmente

### Pré-requisitos

- **Node.js** v18+ → [https://nodejs.org](https://nodejs.org)
- **npm** v9+ (vem com o Node)

### 1. Instalar dependências

Abra o terminal na pasta `frontend/`:

```bash
cd c:\xampp\htdocs\scbit\aluguel-de-carro\frontend
npm install
```

### 2. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse no navegador: **http://localhost:5173**

### 3. Build de produção (opcional)

```bash
npm run build
npm run preview
```

---

## 🔐 Credenciais de Acesso (Mock)

| Perfil | E-mail | Senha | Acesso |
|--------|--------|-------|--------|
| **Admin** | `admin@rental.com` | `admin123` | Dashboard completo, frota, usuários, locações |
| **Cliente** | `cliente@rental.com` | `cliente123` | Galeria, reserva, meus aluguéis |

> ⚠️ Estes são dados simulados. Nenhum token real é gerado.

---

## 📁 Estrutura do Projeto

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminLayout.jsx      # Sidebar fixa (Admin)
│   │   │   └── ClienteLayout.jsx    # Header fixo (Cliente)
│   │   └── ui/
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── Input.jsx (+ Select)
│   │       ├── Modal.jsx (+ ConfirmModal)
│   │       ├── Spinner.jsx
│   │       └── Toast.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx          # Estado de autenticação global
│   ├── pages/
│   │   ├── Login/LoginPage.jsx
│   │   ├── Dashboard/DashboardPage.jsx
│   │   ├── Veiculos/
│   │   │   ├── VeiculosPage.jsx
│   │   │   ├── VeiculoFormPage.jsx
│   │   │   └── VeiculoDetalhesPage.jsx
│   │   ├── Usuarios/
│   │   │   ├── UsuariosPage.jsx
│   │   │   └── UsuarioFormPage.jsx
│   │   ├── Alugueis/
│   │   │   ├── AlugueisPage.jsx
│   │   │   └── AluguelFormPage.jsx
│   │   ├── Frota/FrotaClientePage.jsx
│   │   ├── Reserva/ReservaFluxoPage.jsx
│   │   ├── MeusAlugueis/MeusAlugueisPage.jsx
│   │   └── NotFound/NotFoundPage.jsx
│   ├── routes/
│   │   ├── AppRoutes.jsx            # Roteamento central
│   │   └── PrivateRoute.jsx         # Guards por perfil
│   ├── services/
│   │   ├── mockData.js              # Dados estáticos JSON
│   │   ├── authService.js           # Login simulado + mock token
│   │   ├── veiculoService.js        # CRUD de veículos (mock)
│   │   ├── usuarioService.js        # CRUD de usuários (mock)
│   │   └── aluguelService.js        # Locações (mock com regras de negócio)
│   └── utils/
│       └── validators.js            # CPF, placa, e-mail, datas, formatadores
├── index.html
├── package.json
└── vite.config.js
```

---

## 🗺️ Rotas da Aplicação

### Públicas
| Rota | Tela |
|------|------|
| `/login` | Login |

### Perfil ADMIN
| Rota | Tela |
|------|------|
| `/dashboard` | Dashboard com KPIs |
| `/veiculos` | Listagem da frota |
| `/veiculos/novo` | Cadastro de veículo |
| `/veiculos/:id/editar` | Edição de veículo |
| `/veiculos/:id` | Detalhes do veículo |
| `/usuarios` | Listagem de usuários |
| `/usuarios/novo` | Cadastro de usuário |
| `/usuarios/:id/editar` | Edição de usuário |
| `/alugueis` | Lista de locações |
| `/alugueis/novo` | Nova locação |

### Perfil CLIENTE
| Rota | Tela |
|------|------|
| `/frota` | Galeria de veículos disponíveis |
| `/veiculos/:id` | Detalhes + botão de reserva |
| `/reservar/:id` | Fluxo de reserva (3 etapas) |
| `/meus-alugueis` | Histórico de locações |

---

## 🧪 Dados Mock

Todos os dados são armazenados em **memória** (arrays em `mockData.js`) e sobrevivem enquanto a aba do navegador estiver aberta. Os serviços simulam latência de ~400ms com `Promise + setTimeout`.

**Veículos pré-cadastrados**: 8 (de categorias Econômico, SUV, Sedan, Picape)  
**Usuários pré-cadastrados**: 4 (1 Admin, 3 Clientes)  
**Locações pré-cadastradas**: 4 (2 ativas, 2 finalizadas)

---

## 🏗️ Próximos Passos (Back-end)

Quando o back-end Spring Boot estiver pronto, basta substituir as funções em `src/services/` por chamadas HTTP reais usando `fetch` ou `axios`:

```js
// Antes (mock):
async listar() {
  await delay(400);
  return [...mockVeiculos];
}

// Depois (API real):
async listar() {
  const res = await fetch('/api/veiculos', {
    headers: { Authorization: `Bearer ${authService.getToken()}` }
  });
  return res.json();
}
```

---

## 👥 Equipe

- **Letícia Carvalho** 
- **Lucas Viana da Silva**
- **Rafael da Silva Rabelo**
- **Aryane Cassimiro Machado**
