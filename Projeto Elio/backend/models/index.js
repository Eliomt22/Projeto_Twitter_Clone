// associações entre modelos Sequelize
const sequelize  = require('../config/database');
const Utilizador = require('./Utilizador');
const Tweet      = require('./Tweet');
const Gosto      = require('./Gosto');
const Seguidor   = require('./Seguidor');
const Comentario = require('./Comentario');
const Sessao     = require('./Sessao');

// 1:1 — um utilizador tem uma sessão
Utilizador.hasOne(Sessao, {
  foreignKey: 'utilizador_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Sessao.belongsTo(Utilizador, {
  foreignKey: 'utilizador_id'
});

// 1:N — um utilizador tem muitos tweets
Utilizador.hasMany(Tweet, {
  foreignKey: 'utilizador_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Tweet.belongsTo(Utilizador, {
  foreignKey: 'utilizador_id'
});

// 1:N — um tweet tem muitos comentários
Tweet.hasMany(Comentario, {
  foreignKey: 'tweet_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Comentario.belongsTo(Tweet, {
  foreignKey: 'tweet_id'
});

// 1:N — um utilizador tem muitos comentários
Utilizador.hasMany(Comentario, {
  foreignKey: 'utilizador_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Comentario.belongsTo(Utilizador, {
  foreignKey: 'utilizador_id'
});

// N:M — utilizador segue utilizador (via SEGUIDOR)
Utilizador.belongsToMany(Utilizador, {
  through: Seguidor,
  as: 'Seguidos',
  foreignKey: 'seguidor_id',
  otherKey: 'seguido_id'
});
Utilizador.belongsToMany(Utilizador, {
  through: Seguidor,
  as: 'Seguidores',
  foreignKey: 'seguido_id',
  otherKey: 'seguidor_id'
});

// N:M — utilizador gosta de tweet (via GOSTO)
Utilizador.belongsToMany(Tweet, {
  through: Gosto,
  foreignKey: 'utilizador_id',
  otherKey: 'tweet_id',
  as: 'TweetsGostados'
});
Tweet.belongsToMany(Utilizador, {
  through: Gosto,
  foreignKey: 'tweet_id',
  otherKey: 'utilizador_id',
  as: 'UtilizadoresGosto'
});

module.exports = { sequelize, Utilizador, Tweet, Gosto, Seguidor, Comentario, Sessao };
