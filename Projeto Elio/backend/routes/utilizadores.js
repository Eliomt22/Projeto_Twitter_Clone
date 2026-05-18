// routes/utilizadores.js — Perfis e seguimentos
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/utilizadores/sugestoes — Utilizadores que ainda não segues
router.get('/sugestoes/lista', authMiddleware, async (req, res) => {
  const { utilizador_id } = req.utilizador;
  try {
    const [rows] = await db.query(`
      SELECT u.utilizador_id, u.username, u.foto_perfil, u.bio
      FROM UTILIZADOR u
      WHERE u.ativo = 1
        AND u.utilizador_id != ?
        AND u.utilizador_id NOT IN (
          SELECT seguido_id FROM SEGUIDOR WHERE seguidor_id = ?
        )
      ORDER BY RAND()
      LIMIT 3
    `, [utilizador_id, utilizador_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar sugestões.' });
  }
});

// GET /api/utilizadores/:username — Perfil público
router.get('/:username', authMiddleware, async (req, res) => {
  const { username } = req.params;
  const { utilizador_id: eu_id } = req.utilizador;

  try {
    const [rows] = await db.query(`
      SELECT u.utilizador_id, u.username, u.bio, u.foto_perfil, u.data_registo,
             (SELECT COUNT(*) FROM TWEET WHERE utilizador_id = u.utilizador_id) AS total_tweets,
             (SELECT COUNT(*) FROM SEGUIDOR WHERE seguido_id = u.utilizador_id) AS total_seguidores,
             (SELECT COUNT(*) FROM SEGUIDOR WHERE seguidor_id = u.utilizador_id) AS total_seguindo,
             (SELECT COUNT(*) FROM SEGUIDOR WHERE seguidor_id = ? AND seguido_id = u.utilizador_id) AS eu_sigo
      FROM UTILIZADOR u
      WHERE u.username = ? AND u.ativo = 1
    `, [eu_id, username]);

    if (rows.length === 0) return res.status(404).json({ error: 'Utilizador não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar perfil.' });
  }
});

// GET /api/utilizadores/:username/tweets — Tweets de um utilizador
router.get('/:username/tweets', authMiddleware, async (req, res) => {
  const { username } = req.params;
  const { utilizador_id: eu_id } = req.utilizador;

  try {
    const [tweets] = await db.query(`
      SELECT t.tweet_id, t.conteudo, t.imagem_url, t.data_publicacao,
             u.utilizador_id, u.username, u.foto_perfil,
             COUNT(DISTINCT g.utilizador_id) AS total_gostos,
             MAX(CASE WHEN g.utilizador_id = ? THEN 1 ELSE 0 END) AS eu_gostei
      FROM TWEET t
      INNER JOIN UTILIZADOR u ON t.utilizador_id = u.utilizador_id
      LEFT JOIN GOSTO g ON g.tweet_id = t.tweet_id
      WHERE u.username = ?
      GROUP BY t.tweet_id, t.conteudo, t.imagem_url, t.data_publicacao, u.utilizador_id, u.username, u.foto_perfil
      ORDER BY t.data_publicacao DESC
    `, [eu_id, username]);

    res.json(tweets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar tweets.' });
  }
});

// POST /api/utilizadores/:id/seguir — Seguir/deixar de seguir
router.post('/:id/seguir', authMiddleware, async (req, res) => {
  const { utilizador_id: seguidor_id } = req.utilizador;
  const seguido_id = parseInt(req.params.id);

  if (seguidor_id === seguido_id) {
    return res.status(400).json({ error: 'Não podes seguir-te a ti próprio.' });
  }

  try {
    const [existe] = await db.query(
      'SELECT 1 FROM SEGUIDOR WHERE seguidor_id = ? AND seguido_id = ?',
      [seguidor_id, seguido_id]
    );

    if (existe.length > 0) {
      await db.query('DELETE FROM SEGUIDOR WHERE seguidor_id = ? AND seguido_id = ?', [seguidor_id, seguido_id]);
      res.json({ a_seguir: false });
    } else {
      await db.query('INSERT INTO SEGUIDOR (seguidor_id, seguido_id) VALUES (?, ?)', [seguidor_id, seguido_id]);
      res.json({ a_seguir: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar seguimento.' });
  }
});

// PUT /api/utilizadores/perfil — Atualizar o meu perfil
router.put('/perfil/editar', authMiddleware, async (req, res) => {
  const { utilizador_id } = req.utilizador;
  const { bio, foto_perfil } = req.body;

  try {
    await db.query(
      'UPDATE UTILIZADOR SET bio = ?, foto_perfil = ? WHERE utilizador_id = ?',
      [bio || null, foto_perfil || null, utilizador_id]
    );
    res.json({ message: 'Perfil atualizado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

module.exports = router;
