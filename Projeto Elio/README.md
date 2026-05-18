# 🐦 Twitter/X Clone — SGBD I 2025/2026

Projeto final da disciplina **Sistemas Gestores de Bases de Dados I**  
Escola Superior de Tecnologias e Gestão — Universidade da Madeira

---

## 📁 Estrutura do Projeto

```
twitter-clone/
├── backend/                  ← API Node.js + Express
│   ├── server.js             ← Servidor principal
│   ├── db.js                 ← Ligação MySQL
│   ├── .env.example          ← Variáveis de ambiente (copiar para .env)
│   ├── middleware/
│   │   └── auth.js           ← Verificação JWT
│   └── routes/
│       ├── auth.js           ← Registo e Login
│       ├── tweets.js         ← CRUD de tweets
│       ├── utilizadores.js   ← Perfis e seguimentos
│       └── admin.js          ← Backoffice
│
├── frontend/                 ← Interface React
│   ├── public/index.html
│   └── src/
│       ├── App.js            ← Rotas principais
│       ├── App.css           ← Estilos globais (tema escuro)
│       ├── index.js
│       ├── context/
│       │   └── AuthContext.js ← Estado global de autenticação
│       ├── services/
│       │   └── api.js        ← Todas as chamadas à API
│       ├── components/
│       │   ├── Layout.js     ← Sidebar + estrutura
│       │   └── TweetCard.js  ← Cartão de tweet
│       └── pages/
│           ├── Login.js
│           ├── Registo.js
│           ├── Feed.js       ← Início + Explorar
│           ├── Perfil.js
│           └── Admin.js      ← Backoffice
│
└── twitter_clone.sql         ← Script completo da base de dados
```

---

## 🚀 Como correr o projeto

### 1. Base de Dados

```bash
# Importar o script SQL no MySQL WorkBench ou via terminal:
mysql -u root -p < twitter_clone.sql
```

### 2. Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar ficheiro .env a partir do exemplo
cp .env.example .env
# Editar .env com os teus dados de MySQL

# Iniciar servidor (desenvolvimento)
npm run dev

# O servidor fica disponível em: http://localhost:5000
```

### 3. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar aplicação React
npm start

# A aplicação abre em: http://localhost:3000
```

---

## 🔑 Conta de Administrador

Após importar o SQL, existe um utilizador administrador de exemplo:
- **Username:** `admin`
- **Password:** (definires tu após o registo — o hash no SQL é de exemplo)

Para criar um admin real, regista um utilizador normal e depois executa:
```sql
UPDATE UTILIZADOR SET is_admin = 1 WHERE username = 'o_teu_username';
```

---

## 📡 Endpoints da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | /api/auth/register | Registar utilizador | ❌ |
| POST | /api/auth/login | Login | ❌ |
| GET | /api/tweets/feed | Feed do utilizador | ✅ |
| GET | /api/tweets/explore | Todos os tweets | ✅ |
| POST | /api/tweets | Publicar tweet | ✅ |
| DELETE | /api/tweets/:id | Apagar tweet | ✅ |
| POST | /api/tweets/:id/gosto | Dar/retirar gosto | ✅ |
| GET | /api/utilizadores/:username | Ver perfil | ✅ |
| GET | /api/utilizadores/:username/tweets | Tweets de utilizador | ✅ |
| POST | /api/utilizadores/:id/seguir | Seguir/deixar de seguir | ✅ |
| PUT | /api/utilizadores/perfil/editar | Editar perfil | ✅ |
| GET | /api/admin/utilizadores | Listar utilizadores | 👑 |
| PUT | /api/admin/utilizadores/:id | Editar utilizador | 👑 |
| DELETE | /api/admin/utilizadores/:id | Apagar utilizador | 👑 |
| GET | /api/admin/tweets | Listar todos tweets | 👑 |
| DELETE | /api/admin/tweets/:id | Apagar tweet | 👑 |

✅ Requer login &nbsp;|&nbsp; 👑 Requer ser admin

---

## ☁️ Deploy no Azure

1. Aceder a https://azure.microsoft.com/pt-pt/free/students/ com email institucional
2. Criar recurso: **Azure Database for MySQL — Flexible Server**
3. Configurar firewall para permitir o teu IP
4. Ligar via MySQL WorkBench ao servidor remoto
5. Executar `twitter_clone.sql` no servidor Azure
6. Atualizar `.env` do backend com as credenciais do Azure

---

## 🛠️ Tecnologias

- **Base de Dados:** MySQL 8.0
- **Backend:** Node.js + Express + JWT + bcryptjs
- **Frontend:** React 18 + React Router v6 + Axios
- **Cloud:** Microsoft Azure (MySQL Flexible Server)
