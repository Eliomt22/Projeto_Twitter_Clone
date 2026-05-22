// seed.js — Inserir utilizadores iniciais na base de dados remota
// Executa: node seed.js
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('🌱 A iniciar seed da base de dados...\n');

  try {
    // Limpar dados existentes (mantém estrutura)
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE GOSTO');
    await db.query('TRUNCATE TABLE SEGUIDOR');
    await db.query('TRUNCATE TABLE TWEET');
    await db.query('TRUNCATE TABLE UTILIZADOR');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🗑️  Tabelas limpas.\n');

    // Gerar hashes
    const hashAdmin = await bcrypt.hash('123456', 10);
    const hashCR7   = await bcrypt.hash('critiano', 10);

    // Inserir utilizadores
    const [r1] = await db.query(
      `INSERT INTO UTILIZADOR (username, email, password_hash, bio, is_admin)
       VALUES (?, ?, ?, ?, ?)`,
      ['admin', 'admin123@gmail.com', hashAdmin, 'Administrador do sistema.', 1]
    );
    console.log(`✅ Utilizador 'admin' criado (id=${r1.insertId})`);

    const [r2] = await db.query(
      `INSERT INTO UTILIZADOR (username, email, password_hash, bio, is_admin)
       VALUES (?, ?, ?, ?, ?)`,
      ['CR7', 'ronaldosiu7@gmail.com', hashCR7, 'SIUUUU!', 0]
    );
    console.log(`✅ Utilizador 'CR7' criado (id=${r2.insertId})`);

    // Tweets de exemplo
    await db.query(
      `INSERT INTO TWEET (conteudo, utilizador_id) VALUES (?, ?)`,
      ['Bem-vindos ao Twitter Clone! 🎉', r1.insertId]
    );
    await db.query(
      `INSERT INTO TWEET (conteudo, utilizador_id) VALUES (?, ?)`,
      ['SIUUUU! Primeiro tweet! ⚽', r2.insertId]
    );
    console.log('✅ Tweets de exemplo criados.');

    // CR7 segue admin
    await db.query(
      `INSERT INTO SEGUIDOR (seguidor_id, seguido_id) VALUES (?, ?)`,
      [r2.insertId, r1.insertId]
    );
    console.log('✅ CR7 segue admin.');

    console.log('\n✅ Seed concluído com sucesso!');
    console.log('   admin   → password: 123456');
    console.log('   CR7     → password: critiano');

  } catch (err) {
    console.error('❌ Erro no seed:', err.message);
  } finally {
    process.exit(0);
  }
}

seed();
