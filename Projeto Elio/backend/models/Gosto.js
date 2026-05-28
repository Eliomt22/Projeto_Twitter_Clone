const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Gosto = sequelize.define('Gosto', {
  utilizador_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  tweet_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  data_gosto: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'GOSTO',
  timestamps: false
});

module.exports = Gosto;
