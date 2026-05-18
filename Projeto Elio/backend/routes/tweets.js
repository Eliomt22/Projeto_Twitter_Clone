// routes/tweets.js — CRUD de Tweets
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/tweets/feed — Feed do utilizador autenticado (só quem segue + os próprios)
router.get('/feed', authMiddleware, async (req, res) => {
  const { utilizador_id } = req.utilizador;
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const [tweets] = await db.query(`
      SELECT t.tweet_id, t.conteudo, t.imagem_url, t.data_publicacao,
             u.utilizador_id, u.username, u.foto_perfil,
             COUNT(DISTINCT g.utilizador_id) AS total_gostos,
             MAX(CASE WHEN g.utilizador_id = ? THEN 1 ELSE 0 END) AS eu_gostei
      FROM TWEET t
      INNER JOIN UTILIZADOR u ON t.utilizador_id = u.utilizador_id
      LEFT JOIN GOSTO g ON g.tweet_id = t.tweet_id
      WHERE u.ativo = 1
        AND (
          t.utilizador_id = ?
          OR t.utilizador_id IN (
            SELECT seguido_id FROM SEGUIDOR WHERE seguidor_id = ?
          )
        )
      GROUP BY t.tweet_id, t.conteudo, t.imagem_url, t.data_publicacao, u.utilizador_id, u.username, u.foto_perfil
      ORDER BY t.data_publicacao DESC
      LIMIT ? OFFSET ?
    `, [utilizador_id, utilizador_id, utilizador_id, limit, offset]);

    res.json(tweets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar feed.' });
  }
});

// GET /api/tweets/explore — Todos os tweets (explorar), com pesquisa opcional ?q=
router.get('/explore', authMiddleware, async (req, res) => {
  const { utilizador_id } = req.utilizador;
  const page = parseInt(req.query.page) || 1;
  // Remove o @ inicial se o utilizador pesquisar "@username"
  const q = (req.query.q?.trim() || '').replace(/^@/, '');
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    // Se começa com @ pesquisa só por username; caso contrário pesquisa no conteúdo e username
    const eraPesquisaUsername = (req.query.q?.trim() || '').startsWith('@');
    const filtro = q
      ? eraPesquisaUsername
        ? `AND u.username LIKE ?`
        : `AND (t.conteudo LIKE ? OR u.username LIKE ?)`
      : '';
    const params = q
      ? eraPesquisaUsername
        ? [utilizador_id, `%${q}%`, limit, offset]
        : [utilizador_id, `%${q}%`, `%${q}%`, limit, offset]
      : [utilizador_id, limit, offset];

    const [tweets] = await db.query(`
      SELECT t.tweet_id, t.conteudo, t.imagem_url, t.data_publicacao,
             u.utilizador_id, u.username, u.foto_perfil,
             COUNT(DISTINCT g.utilizador_id) AS total_gostos,
             MAX(CASE WHEN g.utilizador_id = ? THEN 1 ELSE 0 END) AS eu_gostei
      FROM TWEET t
      INNER JOIN UTILIZADOR u ON t.utilizador_id = u.utilizador_id
      LEFT JOIN GOSTO g ON g.tweet_id = t.tweet_id
      WHERE u.ativo = 1 ${filtro}
      GROUP BY t.tweet_id, t.conteudo, t.imagem_url, t.data_publicacao, u.utilizador_id, u.username, u.foto_perfil
      ORDER BY t.data_publicacao DESC
      LIMIT ? OFFSET ?
    `, params);

    res.json(tweets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar tweets.' });
  }
});

// POST /api/tweets — Publicar tweet
router.post('/', authMiddleware, async (req, res) => {
  const { utilizador_id } = req.utilizador;
  const { conteudo, imagem_url } = req.body;

  if (!conteudo || conteudo.trim().length === 0) {
    return res.status(400).json({ error: 'O conteúdo do tweet não pode estar vazio.' });
  }
  if (conteudo.length > 280) {
    return res.status(400).json({ error: 'O tweet não pode ter mais de 280 caracteres.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO TWEET (conteudo, utilizador_id, imagem_url) VALUES (?, ?, ?)',
      [conteudo.trim(), utilizador_id, imagem_url || null]
    );

    const [rows] = await db.query(`
      SELECT t.tweet_id, t.conteudo, t.imagem_url, t.data_publicacao,
             u.utilizador_id, u.username, u.foto_perfil,
             0 AS total_gostos, 0 AS eu_gostei
      FROM TWEET t
      INNER JOIN UTILIZADOR u ON t.utilizador_id = u.utilizador_id
      WHERE t.tweet_id = ?
    `, [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao publicar tweet.' });
  }
});

// DELETE /api/tweets/:id — Apagar tweet
router.delete('/:id', authMiddleware, async (req, res) => {
  const { utilizador_id, is_admin } = req.utilizador;
  const tweet_id = req.params.id;

  try {
    const [rows] = await db.query('SELECT utilizador_id FROM TWEET WHERE tweet_id = ?', [tweet_id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tweet não encontrado.' });
    }
    if (!is_admin && rows[0].utilizador_id !== utilizador_id) {
      return res.status(403).json({ error: 'Não tens permissão para apagar este tweet.' });
    }

    await db.query('DELETE FROM TWEET WHERE tweet_id = ?', [tweet_id]);
    res.json({ message: 'Tweet apagado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao apagar tweet.' });
  }
});

// POST /api/tweets/:id/gosto — Dar/retirar gosto
router.post('/:id/gosto', authMiddleware, async (req, res) => {
  const { utilizador_id } = req.utilizador;
  const tweet_id = req.params.id;

  try {
    const [existe] = await db.query(
      'SELECT 1 FROM GOSTO WHERE utilizador_id = ? AND tweet_id = ?',
      [utilizador_id, tweet_id]
    );

    if (existe.length > 0) {
      await db.query('DELETE FROM GOSTO WHERE utilizador_id = ? AND tweet_id = ?', [utilizador_id, tweet_id]);
      res.json({ gostou: false });
    } else {
      await db.query('INSERT INTO GOSTO (utilizador_id, tweet_id) VALUES (?, ?)', [utilizador_id, tweet_id]);
      res.json({ gostou: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar gosto.' });
  }
});

module.exports = router;
