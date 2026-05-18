// server.js — Servidor principal Express
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares globais ──
app.use(cors({
  origin: 'http://localhost:3000', // URL do React em desenvolvimento
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rotas ──
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/tweets',        require('./routes/tweets'));
app.use('/api/utilizadores',  require('./routes/utilizadores'));
app.use('/api/admin',         require('./routes/admin'));

// ── Rota de teste ──
app.get('/', (req, res) => {
  res.json({ message: '🐦 Twitter Clone API — SGBD I 2025/2026', status: 'online' });
});

// ── Tratamento de erros global ──
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// ── Iniciar servidor ──
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr em http://localhost:${PORT}`);
});
