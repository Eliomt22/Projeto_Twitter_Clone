// models/Tweet.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tweet = sequelize.define('Tweet', {
  tweet_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conteudo: {
    type: DataTypes.STRING(280),
    allowNull: false,
    validate: {
      len: [1, 280]
    }
  },
  imagem_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  data_publicacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  utilizador_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'TWEET',
  timestamps: false
});

module.exports = Tweet;
