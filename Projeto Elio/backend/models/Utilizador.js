const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilizador = sequelize.define('Utilizador', {
  utilizador_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  foto_perfil: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  data_registo: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_admin: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    validate: { isIn: [[0, 1]] }
  },
  ativo: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    validate: { isIn: [[0, 1]] }
  }
}, {
  tableName: 'UTILIZADOR',
  timestamps: false
});

module.exports = Utilizador;
