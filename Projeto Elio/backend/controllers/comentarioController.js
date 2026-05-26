// CRUD de comentários
const db = require('../db');

const listar = async (req, res) => {
  const tweet_id = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT c.comentario_id, c.conteudo, c.data_criacao, c.utilizador_id,
             u.username, u.foto_perfil
      FROM COMENTARIO c
      INNER JOIN UTILIZADOR u ON u.utilizador_id = c.utilizador_id
      WHERE c.tweet_id = ?
      ORDER BY c.data_criacao DESC
    `, [tweet_id]);

    // formatar para o frontend esperar { Utilizador: { username, foto_perfil } }
    const resultado = rows.map(c => ({
      comentario_id: c.comentario_id,
      conteudo:      c.conteudo,
      data_criacao:  c.data_criacao,
      utilizador_id: c.utilizador_id,
      Utilizador: {
        utilizador_id: c.utilizador_id,
        username:      c.username,
        foto_perfil:   c.foto_perfil
      }
    }));

    return res.json(resultado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao carregar comentários.' });
  }
};

const criar = async (req, res) => {
  const tweet_id = req.params.id;
  const { utilizador_id } = req.utilizador;
  const { conteudo } = req.body;

  if (!conteudo || conteudo.trim().length === 0)
    return res.status(400).json({ error: 'O comentário não pode estar vazio.' });
  if (conteudo.length > 280)
    return res.status(400).json({ error: 'Comentário não pode ter mais de 280 caracteres.' });

  try {
    const [tweet] = await db.query('SELECT tweet_id FROM TWEET WHERE tweet_id = ?', [tweet_id]);
    if (tweet.length === 0) return res.status(404).json({ error: 'Tweet não encontrado.' });

    const [result] = await db.query(
      'INSERT INTO COMENTARIO (conteudo, tweet_id, utilizador_id) VALUES (?, ?, ?)',
      [conteudo.trim(), tweet_id, utilizador_id]
    );

    const [rows] = await db.query(`
      SELECT c.comentario_id, c.conteudo, c.data_criacao, c.utilizador_id,
             u.username, u.foto_perfil
      FROM COMENTARIO c
      INNER JOIN UTILIZADOR u ON u.utilizador_id = c.utilizador_id
      WHERE c.comentario_id = ?
    `, [result.insertId]);

    const c = rows[0];
    return res.status(201).json({
      comentario_id: c.comentario_id,
      conteudo:      c.conteudo,
      data_criacao:  c.data_criacao,
      utilizador_id: c.utilizador_id,
      Utilizador: {
        utilizador_id: c.utilizador_id,
        username:      c.username,
        foto_perfil:   c.foto_perfil
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar comentário.' });
  }
};

const apagar = async (req, res) => {
  const { utilizador_id, is_admin } = req.utilizador;
  const { cid } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT utilizador_id FROM COMENTARIO WHERE comentario_id = ?',
      [cid]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Comentário não encontrado.' });

    if (!is_admin && rows[0].utilizador_id !== utilizador_id)
      return res.status(403).json({ error: 'Sem permissão para apagar este comentário.' });

    await db.query('DELETE FROM COMENTARIO WHERE comentario_id = ?', [cid]);
    return res.json({ message: 'Comentário apagado com sucesso.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao apagar comentário.' });
  }
};

module.exports = { listar, criar, apagar };
