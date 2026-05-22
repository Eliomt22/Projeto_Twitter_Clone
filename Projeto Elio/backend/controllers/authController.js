// registo, login e logout
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { Utilizador, Sessao } = require('../models');

const register = async (req, res) => {
  const { username, email, password, bio } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: 'username, email e password são obrigatórios.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'A password deve ter pelo menos 6 caracteres.' });

  try {
    const existe = await Utilizador.findOne({
      where: { username },
      attributes: ['utilizador_id']
    });
    if (existe) return res.status(409).json({ error: 'Username ou email já está em uso.' });

    const existeEmail = await Utilizador.findOne({ where: { email }, attributes: ['utilizador_id'] });
    if (existeEmail) return res.status(409).json({ error: 'Username ou email já está em uso.' });

    const password_hash = await bcrypt.hash(password, 10);
    const novoUser = await Utilizador.create({ username, email, password_hash, bio: bio || null });

    const token = jwt.sign(
      { utilizador_id: novoUser.utilizador_id, username, is_admin: 0 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // guardar sessão
    await Sessao.upsert({
      utilizador_id: novoUser.utilizador_id,
      token,
      data_expiracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return res.status(201).json({
      message: 'Utilizador registado com sucesso!',
      token,
      utilizador: {
        utilizador_id: novoUser.utilizador_id,
        username,
        email,
        bio: bio || null,
        is_admin: 0
      }
    });
  } catch (err) {
    console.error('Erro no registo:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username e password são obrigatórios.' });

  try {
    const utilizador = await Utilizador.findOne({ where: { username, ativo: 1 } });
    if (!utilizador)
      return res.status(401).json({ error: 'Credenciais inválidas ou conta desativada.' });

    const passwordCorreta = await bcrypt.compare(password, utilizador.password_hash);
    if (!passwordCorreta)
      return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign(
      { utilizador_id: utilizador.utilizador_id, username: utilizador.username, is_admin: utilizador.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // atualizar sessão
    await Sessao.upsert({
      utilizador_id: utilizador.utilizador_id,
      token,
      data_expiracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return res.json({
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
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const logout = async (req, res) => {
  try {
    const { utilizador_id } = req.utilizador;
    await Sessao.destroy({ where: { utilizador_id } });
    return res.json({ message: 'Logout efetuado com sucesso.' });
  } catch (err) {
    console.error('Erro no logout:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { register, login, logout };
