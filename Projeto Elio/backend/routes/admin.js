// rotas de administração
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

router.get('/utilizadores', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.utilizador_id, u.username, u.email, u.is_admin, u.ativo, u.data_registo,
             COUNT(t.tweet_id) AS total_tweets
      FROM UTILIZADOR u
      LEFT JOIN TWEET t ON t.utilizador_id = u.utilizador_id
      GROUP BY u.utilizador_id
      ORDER BY u.data_registo DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar utilizadores.' });
  }
});

router.put('/utilizadores/:id', async (req, res) => {
  const { id } = req.params;
  const { bio, is_admin, ativo } = req.body;

  try {
    await db.query(
      'UPDATE UTILIZADOR SET bio = ?, is_admin = ?, ativo = ? WHERE utilizador_id = ?',
      [bio, is_admin ? 1 : 0, ativo ? 1 : 0, id]
    );
    res.json({ message: 'Utilizador atualizado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar utilizador.' });
  }
});

router.delete('/utilizadores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM UTILIZADOR WHERE utilizador_id = ?', [id]);
    res.json({ message: 'Utilizador apagado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao apagar utilizador.' });
  }
});

router.get('/tweets', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.tweet_id, t.conteudo, t.imagem_url, t.data_publicacao,
             u.username, u.utilizador_id,
             COUNT(g.utilizador_id) AS total_gostos
      FROM TWEET t
      INNER JOIN UTILIZADOR u ON t.utilizador_id = u.utilizador_id
      LEFT JOIN GOSTO g ON g.tweet_id = t.tweet_id
      GROUP BY t.tweet_id
      ORDER BY t.data_publicacao DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar tweets.' });
  }
});

router.put('/tweets/:id', async (req, res) => {
  const { id } = req.params;
  const { conteudo, imagem_url } = req.body;

  if (!conteudo || conteudo.trim().length === 0) {
    return res.status(400).json({ error: 'O conteúdo do tweet não pode estar vazio.' });
  }
  if (conteudo.length > 280) {
    return res.status(400).json({ error: 'O tweet não pode ter mais de 280 caracteres.' });
  }

  try {
    await db.query(
      'UPDATE TWEET SET conteudo = ?, imagem_url = ? WHERE tweet_id = ?',
      [conteudo.trim(), imagem_url || null, id]
    );
    const [rows] = await db.query(
      `SELECT t.tweet_id, t.conteudo, t.imagem_url, t.data_publicacao, u.username, u.utilizador_id, COUNT(g.utilizador_id) AS total_gostos
       FROM TWEET t
       INNER JOIN UTILIZADOR u ON t.utilizador_id = u.utilizador_id
       LEFT JOIN GOSTO g ON g.tweet_id = t.tweet_id
       WHERE t.tweet_id = ?
       GROUP BY t.tweet_id`,
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao editar tweet.' });
  }
});

router.delete('/tweets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM TWEET WHERE tweet_id = ?', [id]);
    res.json({ message: 'Tweet apagado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao apagar tweet.' });
  }
});

module.exports = router;
