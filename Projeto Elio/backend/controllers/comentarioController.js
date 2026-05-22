// CRUD de comentários
const { Comentario, Utilizador, Tweet } = require('../models');

const listar = async (req, res) => {
  const tweet_id = req.params.id;
  try {
    const comentarios = await Comentario.findAll({
      where: { tweet_id },
      include: [{
        model: Utilizador,
        attributes: ['utilizador_id', 'username', 'foto_perfil']
      }],
      order: [['data_criacao', 'DESC']]
    });
    return res.json(comentarios);
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
    const tweet = await Tweet.findByPk(tweet_id);
    if (!tweet) return res.status(404).json({ error: 'Tweet não encontrado.' });

    const comentario = await Comentario.create({
      conteudo: conteudo.trim(),
      tweet_id,
      utilizador_id
    });

    // retorna com dados do utilizador
    const resultado = await Comentario.findByPk(comentario.comentario_id, {
      include: [{ model: Utilizador, attributes: ['utilizador_id', 'username', 'foto_perfil'] }]
    });

    return res.status(201).json(resultado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar comentário.' });
  }
};

const apagar = async (req, res) => {
  const { utilizador_id, is_admin } = req.utilizador;
  const { cid } = req.params;

  try {
    const comentario = await Comentario.findByPk(cid);
    if (!comentario) return res.status(404).json({ error: 'Comentário não encontrado.' });

    if (!is_admin && comentario.utilizador_id !== utilizador_id)
      return res.status(403).json({ error: 'Sem permissão para apagar este comentário.' });

    await comentario.destroy();
    return res.json({ message: 'Comentário apagado com sucesso.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao apagar comentário.' });
  }
};

module.exports = { listar, criar, apagar };
