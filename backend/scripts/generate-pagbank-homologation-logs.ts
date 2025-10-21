/**
 * Script para gerar logs de homologação PagBank
 *
 * Este script realiza chamadas de teste à API do PagBank e registra
 * as requisições e respostas para validação da integração.
 *
 * Uso: ts-node backend/scripts/generate-pagbank-homologation-logs.ts
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Configurações
const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN || '';
const ENVIRONMENT = process.env.PAGBANK_ENV || 'sandbox';
const BASE_URL = ENVIRONMENT === 'production'
  ? 'https://api.pagseguro.com'
  : 'https://sandbox.api.pagseguro.com';

interface LogEntry {
  timestamp: string;
  method: string;
  endpoint: string;
  paymentMethod: string;
  request: {
    headers: Record<string, string>;
    body: any;
  };
  response: {
    status: number;
    headers: Record<string, string>;
    body: any;
  };
}

const logs: LogEntry[] = [];

/**
 * Faz uma requisição e registra no log
 */
async function makeRequestAndLog(
  method: string,
  endpoint: string,
  paymentMethod: string,
  data?: any
): Promise<any> {
  const config: AxiosRequestConfig = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PAGBANK_TOKEN}`,
    },
    data,
  };

  try {
    const response: AxiosResponse = await axios(config);

    // Registrar log
    logs.push({
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      paymentMethod,
      request: {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer [TOKEN_OCULTO]',
        },
        body: data,
      },
      response: {
        status: response.status,
        headers: response.headers as Record<string, string>,
        body: response.data,
      },
    });

    console.log(`✅ ${paymentMethod} - ${method} ${endpoint} - Status: ${response.status}`);
    return response.data;

  } catch (error: any) {
    // Mesmo em caso de erro, registrar no log
    logs.push({
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      paymentMethod,
      request: {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer [TOKEN_OCULTO]',
        },
        body: data,
      },
      response: {
        status: error.response?.status || 0,
        headers: error.response?.headers || {},
        body: error.response?.data || { error: error.message },
      },
    });

    console.log(`❌ ${paymentMethod} - ${method} ${endpoint} - Status: ${error.response?.status || 'ERROR'}`);
    return error.response?.data || { error: error.message };
  }
}

/**
 * Gera exemplo de cliente
 */
function generateCustomerData() {
  return {
    name: 'Cliente Teste Homologação',
    email: 'cliente.teste@homologacao.com',
    tax_id: '12345678909',
    phones: [
      {
        country: '55',
        area: '11',
        number: '987654321',
        type: 'MOBILE' as const,
      },
    ],
    address: {
      street: 'Rua Teste',
      number: '123',
      complement: 'Sala 456',
      locality: 'Centro',
      city: 'São Paulo',
      region_code: 'SP',
      country: 'BRA',
      postal_code: '01310100',
    },
  };
}

/**
 * Teste 1: Criar cobrança PIX
 */
async function testPixCharge() {
  console.log('\n📱 Testando cobrança PIX...');

  const customerData = generateCustomerData();

  const orderData = {
    reference_id: `TEST_PIX_${Date.now()}`,
    customer: {
      name: customerData.name,
      email: customerData.email,
      tax_id: customerData.tax_id,
      phones: customerData.phones,
    },
    items: [
      {
        reference_id: 'ITEM_001',
        name: 'Consulta Médica',
        quantity: 1,
        unit_amount: 15000, // R$ 150,00 em centavos
      },
    ],
    charges: [
      {
        reference_id: `CHARGE_PIX_${Date.now()}`,
        description: 'Pagamento via PIX - Teste Homologação',
        amount: {
          value: 15000,
          currency: 'BRL' as const,
        },
        payment_method: {
          type: 'PIX' as const,
          capture: true,
        },
        notification_urls: [
          'https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/pagbank',
        ],
      },
    ],
    notification_urls: [
      'https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/pagbank',
    ],
  };

  const result = await makeRequestAndLog('POST', '/orders', 'PIX', orderData);

  // Se criado com sucesso, buscar QR Code
  if (result.id) {
    const chargeId = result.charges?.[0]?.id;
    if (chargeId) {
      await makeRequestAndLog('GET', `/charges/${chargeId}`, 'PIX - Consulta');

      // Tentar obter QR Code
      try {
        await makeRequestAndLog('GET', `/charges/${chargeId}/qrcode`, 'PIX - QR Code');
      } catch (error) {
        console.log('⚠️  QR Code endpoint pode não estar disponível no sandbox');
      }
    }
  }

  return result;
}

/**
 * Teste 2: Criar cobrança Boleto
 */
async function testBoletoCharge() {
  console.log('\n📄 Testando cobrança Boleto...');

  const customerData = generateCustomerData();

  const orderData = {
    reference_id: `TEST_BOLETO_${Date.now()}`,
    customer: {
      name: customerData.name,
      email: customerData.email,
      tax_id: customerData.tax_id,
      phones: customerData.phones,
    },
    items: [
      {
        reference_id: 'ITEM_002',
        name: 'Procedimento Estético',
        quantity: 1,
        unit_amount: 25000, // R$ 250,00
      },
    ],
    charges: [
      {
        reference_id: `CHARGE_BOLETO_${Date.now()}`,
        description: 'Pagamento via Boleto - Teste Homologação',
        amount: {
          value: 25000,
          currency: 'BRL' as const,
        },
        payment_method: {
          type: 'BOLETO' as const,
          capture: true,
        },
        notification_urls: [
          'https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/pagbank',
        ],
      },
    ],
  };

  const result = await makeRequestAndLog('POST', '/orders', 'BOLETO', orderData);

  // Consultar cobrança criada
  if (result.id) {
    const chargeId = result.charges?.[0]?.id;
    if (chargeId) {
      await makeRequestAndLog('GET', `/charges/${chargeId}`, 'BOLETO - Consulta');
    }
  }

  return result;
}

/**
 * Teste 3: Criar cobrança Cartão de Crédito
 */
async function testCreditCardCharge() {
  console.log('\n💳 Testando cobrança Cartão de Crédito...');

  const customerData = generateCustomerData();

  const orderData = {
    reference_id: `TEST_CREDIT_${Date.now()}`,
    customer: {
      name: customerData.name,
      email: customerData.email,
      tax_id: customerData.tax_id,
      phones: customerData.phones,
    },
    items: [
      {
        reference_id: 'ITEM_003',
        name: 'Pacote de Consultas',
        quantity: 1,
        unit_amount: 50000, // R$ 500,00
      },
    ],
    charges: [
      {
        reference_id: `CHARGE_CREDIT_${Date.now()}`,
        description: 'Pagamento via Cartão de Crédito - Teste Homologação',
        amount: {
          value: 50000,
          currency: 'BRL' as const,
        },
        payment_method: {
          type: 'CREDIT_CARD' as const,
          installments: 3,
          capture: true,
          soft_descriptor: 'NEXUS',
          card: {
            // Dados de cartão de teste do PagBank
            encrypted: 'ENCRYPTED_CARD_DATA',
            security_code: '123',
            holder: {
              name: 'CLIENTE TESTE HOMOLOGACAO',
            },
            store: true,
          },
        },
        notification_urls: [
          'https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/pagbank',
        ],
      },
    ],
  };

  const result = await makeRequestAndLog('POST', '/orders', 'CARTÃO DE CRÉDITO', orderData);

  return result;
}

/**
 * Teste 4: Criar cobrança Cartão de Débito
 */
async function testDebitCardCharge() {
  console.log('\n💳 Testando cobrança Cartão de Débito...');

  const customerData = generateCustomerData();

  const orderData = {
    reference_id: `TEST_DEBIT_${Date.now()}`,
    customer: {
      name: customerData.name,
      email: customerData.email,
      tax_id: customerData.tax_id,
      phones: customerData.phones,
    },
    items: [
      {
        reference_id: 'ITEM_004',
        name: 'Consulta Especializada',
        quantity: 1,
        unit_amount: 30000, // R$ 300,00
      },
    ],
    charges: [
      {
        reference_id: `CHARGE_DEBIT_${Date.now()}`,
        description: 'Pagamento via Cartão de Débito - Teste Homologação',
        amount: {
          value: 30000,
          currency: 'BRL' as const,
        },
        payment_method: {
          type: 'DEBIT_CARD' as const,
          capture: true,
          card: {
            encrypted: 'ENCRYPTED_CARD_DATA',
            security_code: '123',
            holder: {
              name: 'CLIENTE TESTE HOMOLOGACAO',
            },
          },
        },
        notification_urls: [
          'https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/pagbank',
        ],
      },
    ],
  };

  const result = await makeRequestAndLog('POST', '/orders', 'CARTÃO DE DÉBITO', orderData);

  return result;
}

/**
 * Teste 5: Listar clientes
 */
async function testListCustomers() {
  console.log('\n👥 Testando listagem de clientes...');

  await makeRequestAndLog('GET', '/customers?limit=10', 'CLIENTES - Listagem');
}

/**
 * Teste 6: Criar cliente
 */
async function testCreateCustomer() {
  console.log('\n👤 Testando criação de cliente...');

  const customerData = generateCustomerData();

  await makeRequestAndLog('POST', '/customers', 'CLIENTES - Criação', customerData);
}

/**
 * Gera documento de homologação
 */
function generateHomologationDocument() {
  const outputPath = path.join(__dirname, '../../logs/pagbank-homologation-logs.json');
  const markdownPath = path.join(__dirname, '../../logs/pagbank-homologation-logs.md');

  // Criar diretório de logs se não existir
  const logsDir = path.dirname(outputPath);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Salvar JSON completo
  fs.writeFileSync(outputPath, JSON.stringify(logs, null, 2));

  // Gerar Markdown formatado
  let markdown = `# Logs de Homologação - Integração PagBank

**Sistema:** Nexus Atemporal CRM
**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Ambiente:** ${ENVIRONMENT.toUpperCase()}
**URL Base:** ${BASE_URL}

---

## Informações da Integração

- **Webhook URL:** https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/pagbank
- **Métodos de Pagamento:** PIX, Boleto, Cartão de Crédito, Cartão de Débito
- **Versão da API:** v4

---

`;

  logs.forEach((log, index) => {
    markdown += `## ${index + 1}. ${log.paymentMethod}\n\n`;
    markdown += `**Timestamp:** ${new Date(log.timestamp).toLocaleString('pt-BR')}\n`;
    markdown += `**Método HTTP:** ${log.method}\n`;
    markdown += `**Endpoint:** ${log.endpoint}\n\n`;

    markdown += `### Requisição\n\n`;
    markdown += `**Headers:**\n\`\`\`json\n${JSON.stringify(log.request.headers, null, 2)}\n\`\`\`\n\n`;
    markdown += `**Body:**\n\`\`\`json\n${JSON.stringify(log.request.body, null, 2)}\n\`\`\`\n\n`;

    markdown += `### Resposta\n\n`;
    markdown += `**Status:** ${log.response.status}\n\n`;
    markdown += `**Body:**\n\`\`\`json\n${JSON.stringify(log.response.body, null, 2)}\n\`\`\`\n\n`;

    markdown += `---\n\n`;
  });

  markdown += `## Resumo dos Testes\n\n`;
  markdown += `Total de requisições: ${logs.length}\n\n`;

  const groupedByMethod = logs.reduce((acc, log) => {
    const method = log.paymentMethod.split(' - ')[0];
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  markdown += `**Por método de pagamento:**\n`;
  Object.entries(groupedByMethod).forEach(([method, count]) => {
    markdown += `- ${method}: ${count} requisição(ões)\n`;
  });

  markdown += `\n---\n\n`;
  markdown += `**Documento gerado automaticamente**\n`;
  markdown += `**Desenvolvido com** [Claude Code](https://claude.com/claude-code)\n`;

  fs.writeFileSync(markdownPath, markdown);

  console.log(`\n✅ Logs salvos em:`);
  console.log(`   - JSON: ${outputPath}`);
  console.log(`   - Markdown: ${markdownPath}`);
}

/**
 * Função principal
 */
async function main() {
  console.log('🏦 Gerando logs de homologação PagBank...\n');

  if (!PAGBANK_TOKEN) {
    console.error('❌ PAGBANK_TOKEN não configurado!');
    console.log('Configure a variável de ambiente:');
    console.log('export PAGBANK_TOKEN="seu_token_aqui"');
    process.exit(1);
  }

  console.log(`🔧 Ambiente: ${ENVIRONMENT}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);

  try {
    // Executar todos os testes
    await testCreateCustomer();
    await testListCustomers();
    await testPixCharge();
    await testBoletoCharge();
    await testCreditCardCharge();
    await testDebitCardCharge();

    // Gerar documento
    generateHomologationDocument();

    console.log('\n✅ Processo concluído com sucesso!');
    console.log('\n📧 Próximos passos:');
    console.log('1. Revisar os arquivos gerados em logs/');
    console.log('2. Enviar o arquivo pagbank-homologation-logs.md ao PagBank');
    console.log('3. Aguardar validação da equipe PagBank');

  } catch (error: any) {
    console.error('\n❌ Erro ao executar testes:', error.message);

    // Mesmo com erro, tentar gerar o documento com o que foi possível
    if (logs.length > 0) {
      console.log('\n⚠️  Gerando documento parcial com os logs coletados...');
      generateHomologationDocument();
    }

    process.exit(1);
  }
}

// Executar
main();
