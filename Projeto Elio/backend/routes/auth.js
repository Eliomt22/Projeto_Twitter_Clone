// routes/auth.js — Registo e Login
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// POST /api/auth/register — Registar novo utilizador
router.post('/register', async (req, res) => {
  const { username, email, password, bio } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email e password são obrigatórios.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'A password deve ter pelo menos 6 caracteres.' });
  }

  try {
    // Verificar se username ou email já existem
    const [existe] = await db.query(
      'SELECT utilizador_id FROM UTILIZADOR WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existe.length > 0) {
      return res.status(409).json({ error: 'Username ou email já está em uso.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO UTILIZADOR (username, email, password_hash, bio) VALUES (?, ?, ?, ?)',
      [username, email, password_hash, bio || null]
    );

    const token = jwt.sign(
      { utilizador_id: result.insertId, username, is_admin: 0 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Utilizador registado com sucesso!',
      token,
      utilizador: { utilizador_id: result.insertId, username, email, bio: bio || null, is_admin: 0 }
    });
  } catch (err) {
    console.error('Erro no registo:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// POST /api/auth/login — Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password são obrigatórios.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM UTILIZADOR WHERE username = ? AND ativo = 1',
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas ou conta desativada.' });
    }

    const utilizador = rows[0];
    const passwordCorreta = await bcrypt.compare(password, utilizador.password_hash);
    if (!passwordCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { utilizador_id: utilizador.utilizador_id, username: utilizador.username, is_admin: utilizador.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login efetuado com sucesso!',
      token,
      utilizador: {
        utilizador_id: utilizador.utilizador_id,
        username: utilizador.username,
        email: utilizador.email,
        bio: utilizador.bio,
        foto_perfil: utilizador.foto_perfil,
        is_admin: utilizador.is_admin
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

module.exports = router;
