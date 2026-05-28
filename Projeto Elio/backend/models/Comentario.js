const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comentario = sequelize.define('Comentario', {
  comentario_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conteudo: {
    type: DataTypes.STRING(280),
    allowNull: false,
    validate: { len: [1, 280] }
  },
  data_criacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  tweet_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  utilizador_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'COMENTARIO',
  timestamps: false
});

module.exports = Comentario;
