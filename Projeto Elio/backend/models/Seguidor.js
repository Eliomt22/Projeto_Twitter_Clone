// tabela SEGUIDOR (junção Utilizador ↔ Utilizador)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Seguidor = sequelize.define('Seguidor', {
  seguidor_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  seguido_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  data_follow: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'SEGUIDOR',
  timestamps: false
});

module.exports = Seguidor;
