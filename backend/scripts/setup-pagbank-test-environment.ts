/**
 * Setup PagBank Test Environment
 *
 * Este script configura um ambiente de testes isolado para validação da API PagBank
 * Cria configuração de sandbox com credenciais do desenvolvedor
 */

import { Pool } from 'pg';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.pagbank
dotenv.config({ path: path.join(__dirname, '..', '.env.pagbank') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function setupTestEnvironment() {
  console.log('\n=== Configuração de Ambiente de Testes PagBank ===\n');

  // Collect developer credentials
  const email = await question('Email do desenvolvedor: ');
  const apiKey = await question('API Key (Token) do PagBank Sandbox: ');
  const webhookSecret = await question('Webhook Secret (opcional, pressione Enter para pular): ');

  console.log('\n=== Informações do Ambiente ===');
  console.log('Ambiente: SANDBOX (Testes)');
  console.log('URL Base: https://sandbox.api.pagseguro.com');
  console.log('Email:', email);
  console.log('API Key:', apiKey.substring(0, 10) + '...');

  const confirm = await question('\nConfirmar configuração? (s/n): ');

  if (confirm.toLowerCase() !== 's') {
    console.log('Configuração cancelada.');
    rl.close();
    process.exit(0);
  }

  // Connect to database (CRM Database)
  const pool = new Pool({
    host: process.env.CRM_DB_HOST || '46.202.144.210',
    port: parseInt(process.env.CRM_DB_PORT || '5432'),
    database: process.env.CRM_DB_DATABASE || 'nexus_crm',
    user: process.env.CRM_DB_USERNAME || 'nexus_admin',
    password: process.env.CRM_DB_PASSWORD || 'nexus2024@secure',
  });

  try {
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
    const userId = 'developer-' + email.split('@')[0];

    const query = `
      INSERT INTO payment_configs (
        "tenantId", gateway, environment, "apiKey", "apiSecret",
        "webhookSecret", "isActive", config, "createdBy", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      ON CONFLICT ("tenantId", gateway, environment)
      DO UPDATE SET
        "apiKey" = EXCLUDED."apiKey",
        "webhookSecret" = EXCLUDED."webhookSecret",
        "isActive" = EXCLUDED."isActive",
        config = EXCLUDED.config,
        "updatedBy" = EXCLUDED."updatedBy",
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
      userId,
    ]);

    console.log('\n✅ Ambiente de testes configurado com sucesso!');
    console.log('ID da configuração:', result.rows[0].id);
    console.log('Tenant ID:', tenantId);
    console.log('User ID:', userId);

    // Create test data file
    const testData = {
      environment: 'sandbox',
      tenantId: tenantId,
      userId: userId,
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

    const fs = require('fs');
    const path = require('path');

    const testDataPath = path.join(__dirname, '../test-data/pagbank-test-config.json');
    fs.mkdirSync(path.dirname(testDataPath), { recursive: true });
    fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));

    console.log('\n📄 Arquivo de dados de teste criado:', testDataPath);

    console.log('\n=== Próximos Passos ===');
    console.log('1. Execute o script de validação: npm run test:pagbank');
    console.log('2. Acesse os endpoints de teste em: http://localhost:3000/api/payment-gateway/test/pagbank');
    console.log('3. Consulte a documentação em: backend/docs/PAGBANK_TESTING.md');

  } catch (error: any) {
    console.error('\n❌ Erro ao configurar ambiente:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
    rl.close();
  }
}

setupTestEnvironment().catch(console.error);
