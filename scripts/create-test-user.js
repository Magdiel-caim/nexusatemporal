const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'nexus_admin',
    password: process.env.DB_PASSWORD || '6uyJZdc0xsCe7ymief3x2Izi9QubcTYP',
    database: process.env.DB_DATABASE || 'nexus_master',
  });

  try {
    await client.connect();
    console.log('Conectado ao banco de dados');

    // Hash da senha
    const password = 'teste123';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Verificar se o usuário já existe
    const checkUser = await client.query(
      'SELECT * FROM users WHERE email = $1',
      ['teste@nexusatemporal.com.br']
    );

    if (checkUser.rows.length > 0) {
      console.log('❌ Usuário já existe!');
      console.log('\n📧 Email: teste@nexusatemporal.com.br');
      console.log('🔑 Senha: teste123');
      return;
    }

    // Criar usuário de teste
    const result = await client.query(
      `INSERT INTO users (
        email,
        password,
        name,
        role,
        status,
        "emailVerified",
        "createdAt",
        "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, email, name, role`,
      [
        'teste@nexusatemporal.com.br',
        hashedPassword,
        'Usuário Teste',
        'admin',
        'active',
        true
      ]
    );

    console.log('✅ Usuário criado com sucesso!');
    console.log('\n📧 Email: teste@nexusatemporal.com.br');
    console.log('🔑 Senha: teste123');
    console.log('👤 Nome: Usuário Teste');
    console.log('🎭 Role: admin');
    console.log(`\n🆔 ID: ${result.rows[0].id}`);

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  } finally {
    await client.end();
  }
}

createTestUser();
