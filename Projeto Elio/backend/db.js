// pool de ligações MySQL (raw queries)
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'twitter_clone',
  port:     process.env.DB_PORT     || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00'
});

// testa a ligação ao iniciar
pool.getConnection()
  .then(conn => {
    console.log('✅ Ligado à base de dados MySQL com sucesso!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erro ao ligar à base de dados:', err.message);
  });

module.exports = pool;
