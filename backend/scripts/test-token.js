/**
 * Test PagBank Token
 * Testa se o token PagBank está válido fazendo uma chamada simples à API
 */

const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.pagbank') });

const token = process.env.PAGBANK_SANDBOX_TOKEN;

console.log('\n=== Teste de Token PagBank ===\n');
console.log('Token:', token?.substring(0, 20) + '...');
console.log('Comprimento:', token?.length);
console.log('');

async function testToken() {
  const baseURL = 'https://sandbox.api.pagseguro.com';

  console.log('Testando endpoint: GET /customers');
  console.log('URL completa:', baseURL + '/customers');
  console.log('Header Authorization: Bearer ' + token?.substring(0, 20) + '...');
  console.log('');

  try {
    const response = await axios.get(baseURL + '/customers', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      params: {
        limit: 1
      }
    });

    console.log('✅ Token válido!');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Erro na API');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data?.error_messages?.[0]?.description || error.response?.data?.message || error.message);
    console.log('');
    console.log('Resposta completa:', JSON.stringify(error.response?.data, null, 2));
    console.log('');
    console.log('=== Instruções ===');
    console.log('1. Verifique se o token foi copiado corretamente (sem espaços extras)');
    console.log('2. Certifique-se que é um token de SANDBOX (não produção)');
    console.log('3. Gere um novo token em: https://dev.pagseguro.uol.com.br/');
    console.log('4. Atualize o .env.pagbank com o token correto');
    console.log('5. Execute: npm run setup:pagbank novamente');
  }
}

testToken();
