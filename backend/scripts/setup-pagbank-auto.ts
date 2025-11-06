/**
 * Setup PagBank Test Environment - Automated
 * Lê credenciais do .env.pagbank e configura automaticamente
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env.pagbank
dotenv.config({ path: path.join(__dirname, '..', '.env.pagbank') });

async function setupTestEnvironment() {
  console.log('\n=== Configuração Automática de Ambiente de Testes PagBank ===\n');

  // Get credentials from environment
  const email = process.env.PAGBANK_DEVELOPER_EMAIL;
  const apiKey = process.env.PAGBANK_SANDBOX_TOKEN;
  const webhookSecret = process.env.PAGBANK_WEBHOOK_SECRET || '';

  if (!email || !apiKey) {
    console.error('❌ Erro: Credenciais não encontradas no .env.pagbank');
    console.error('');
    console.error('Certifique-se de configurar:');
    console.error('  PAGBANK_DEVELOPER_EMAIL=seu-email@example.com');
    console.error('  PAGBANK_SANDBOX_TOKEN=seu-token-aqui');
    process.exit(1);
  }

  console.log('=== Informações do Ambiente ===');
  console.log('Ambiente: SANDBOX (Testes)');
  console.log('URL Base: https://sandbox.api.pagseguro.com');
  console.log('Email:', email);
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  console.log('');

  // Connect to database (CRM Database)
  const pool = new Pool({
    host: process.env.CRM_DB_HOST || '46.202.144.210',
    port: parseInt(process.env.CRM_DB_PORT || '5432'),
    database: process.env.CRM_DB_DATABASE || 'nexus_crm',
    user: process.env.CRM_DB_USERNAME || 'nexus_admin',
    password: process.env.CRM_DB_PASSWORD || 'nexus2024@secure',
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão com banco estabelecida\n');

    // Create encryption helpers
    const crypto = require('crypto');

    const encrypt = (text: string): string => {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-me', 'salt', 32);
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return iv.toString('hex') + ':' + encrypted;
    };

    const encryptedApiKey = encrypt(apiKey);
    const encryptedWebhookSecret = webhookSecret ? encrypt(webhookSecret) : null;

    // Insert test configuration
    const tenantId = 'test-environment'; // Special tenant for testing
    const developerNote = 'developer: ' + email;

    console.log('💾 Salvando configuração no banco de dados...');

    const query = `
      INSERT INTO payment_configs (
        "tenantId", gateway, environment, "apiKey", "apiSecret",
        "webhookSecret", "isActive", config, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      ON CONFLICT ("tenantId", gateway, environment)
      DO UPDATE SET
        "apiKey" = EXCLUDED."apiKey",
        "webhookSecret" = EXCLUDED."webhookSecret",
        "isActive" = EXCLUDED."isActive",
        config = EXCLUDED.config,
        "updatedAt" = NOW()
      RETURNING id
    `;

    const config = {
      developerEmail: email,
      testMode: true,
      createdAt: new Date().toISOString(),
      notes: 'Ambiente de testes criado automaticamente para validação da integração PagBank'
    };

    const result = await pool.query(query, [
      tenantId,
      'pagbank',
      'sandbox',
      encryptedApiKey,
      null, // apiSecret not used by PagBank
      encryptedWebhookSecret,
      true, // isActive
      JSON.stringify(config),
    ]);

    console.log('✅ Configuração salva com sucesso!');
    console.log('   ID da configuração:', result.rows[0].id);
    console.log('   Tenant ID:', tenantId);
    console.log('   Email:', email);
    console.log('');

    // Create test data file
    console.log('📄 Criando arquivo de dados de teste...');

    const testData = {
      environment: 'sandbox',
      tenantId: tenantId,
      email: email,
      apiKeyPreview: apiKey.substring(0, 10) + '...',
      baseUrl: 'https://sandbox.api.pagseguro.com',
      webhooksConfigured: !!webhookSecret,
      testCards: {
        visa_approved: {
          number: '4111111111111111',
          cvv: '123',
          expiry: '12/2030',
          holder: 'TESTE APROVADO'
        },
        mastercard_approved: {
          number: '5555555555554444',
          cvv: '123',
          expiry: '12/2030',
          holder: 'TESTE APROVADO'
        },
        visa_declined: {
          number: '4000000000000002',
          cvv: '123',
          expiry: '12/2030',
          holder: 'TESTE RECUSADO'
        }
      },
      testCPF: '123.456.789-09',
      testPhone: '11999999999',
      createdAt: new Date().toISOString()
    };

    const testDataPath = path.join(__dirname, '../test-data/pagbank-test-config.json');
    fs.mkdirSync(path.dirname(testDataPath), { recursive: true });
    fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));

    console.log('✅ Arquivo criado:', testDataPath);
    console.log('');

    console.log('=== ✅ Configuração Concluída com Sucesso! ===\n');
    console.log('Próximos passos:');
    console.log('1. Execute os testes: npm run test:pagbank');
    console.log('2. Ou teste via API: POST http://localhost:3000/api/payment-gateway/test/pagbank');
    console.log('3. Documentação: backend/docs/PAGBANK_TESTING.md');
    console.log('');

  } catch (error: any) {
    console.error('\n❌ Erro ao configurar ambiente:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupTestEnvironment().catch(console.error);
