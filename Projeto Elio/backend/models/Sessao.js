const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sessao = sequelize.define('Sessao', {
  sessao_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  utilizador_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true  // um utilizador, uma sessão
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  data_criacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  data_expiracao: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'SESSAO',
  timestamps: false
});

module.exports = Sessao;
