/**
 * Script de teste para validar credenciais Stripe
 *
 * Execução: node test-stripe.js
 */

require('dotenv').config();
const Stripe = require('stripe');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, emoji, message) {
  console.log(`${color}${emoji} ${message}${COLORS.reset}`);
}

async function testStripeConnection() {
  console.log('\n' + '='.repeat(60));
  log(COLORS.cyan, '🔐', 'TESTE DE INTEGRAÇÃO STRIPE');
  console.log('='.repeat(60) + '\n');

  // 1. Verificar variáveis de ambiente
  log(COLORS.blue, '📋', 'Verificando variáveis de ambiente...');

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || secretKey === 'sk_test_51placeholder') {
    log(COLORS.red, '❌', 'ERRO: STRIPE_SECRET_KEY não configurada!');
    process.exit(1);
  }

  log(COLORS.green, '✅', `Secret Key encontrada: ${secretKey.substring(0, 20)}...`);
  log(COLORS.yellow, '⚠️', `Webhook Secret: ${webhookSecret === 'whsec_temp_will_be_updated_after_webhook_setup' ? 'Temporário (OK para teste)' : 'Configurado'}`);

  // 2. Inicializar Stripe
  log(COLORS.blue, '\n🔧', 'Inicializando cliente Stripe...');

  let stripe;
  try {
    stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
    log(COLORS.green, '✅', 'Cliente Stripe inicializado com sucesso!');
  } catch (error) {
    log(COLORS.red, '❌', `Erro ao inicializar Stripe: ${error.message}`);
    process.exit(1);
  }

  // 3. Testar conexão com API
  log(COLORS.blue, '\n🌐', 'Testando conexão com API Stripe...');

  try {
    const balance = await stripe.balance.retrieve();
    log(COLORS.green, '✅', 'Conexão com API Stripe estabelecida!');
    log(COLORS.cyan, '💰', `Saldo disponível: ${balance.available[0]?.amount || 0} ${balance.available[0]?.currency?.toUpperCase() || 'USD'}`);
    log(COLORS.cyan, '💵', `Saldo pendente: ${balance.pending[0]?.amount || 0} ${balance.pending[0]?.currency?.toUpperCase() || 'USD'}`);
  } catch (error) {
    log(COLORS.red, '❌', `Erro ao conectar com Stripe API: ${error.message}`);
    if (error.type === 'StripeAuthenticationError') {
      log(COLORS.yellow, '⚠️', 'Verifique se a STRIPE_SECRET_KEY está correta!');
    }
    process.exit(1);
  }

  // 4. Testar criação de sessão de checkout (simulação)
  log(COLORS.blue, '\n🛒', 'Testando criação de sessão de checkout...');

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Plano Teste - Nexus Atemporal',
              description: 'Teste de integração',
            },
            unit_amount: 10000, // R$ 100.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'https://nexusatemporal.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://nexusatemporal.com/cancel',
      customer_email: 'teste@example.com',
      metadata: {
        test: 'true',
        order_id: 'test-order-123',
      },
    });

    log(COLORS.green, '✅', 'Sessão de checkout criada com sucesso!');
    log(COLORS.cyan, '🔗', `Session ID: ${session.id}`);
    log(COLORS.cyan, '🌐', `URL de checkout: ${session.url}`);
    log(COLORS.yellow, '📝', 'Nota: Esta é uma sessão de teste, não será processada.');
  } catch (error) {
    log(COLORS.red, '❌', `Erro ao criar sessão: ${error.message}`);
    process.exit(1);
  }

  // 5. Verificar modo da conta
  log(COLORS.blue, '\n🔍', 'Verificando modo da conta...');

  if (secretKey.startsWith('sk_test_')) {
    log(COLORS.yellow, '🧪', 'Modo: TEST (Teste/Desenvolvimento)');
    log(COLORS.cyan, '📌', 'Use cartões de teste: 4242 4242 4242 4242');
  } else if (secretKey.startsWith('sk_live_')) {
    log(COLORS.green, '🚀', 'Modo: LIVE (Produção)');
    log(COLORS.red, '⚠️', 'ATENÇÃO: Cobranças reais serão processadas!');
  } else {
    log(COLORS.red, '❌', 'Formato de chave desconhecido!');
  }

  // 6. Listar produtos/preços (se houver)
  log(COLORS.blue, '\n📦', 'Verificando produtos cadastrados...');

  try {
    const products = await stripe.products.list({ limit: 5 });
    if (products.data.length > 0) {
      log(COLORS.green, '✅', `${products.data.length} produto(s) encontrado(s):`);
      products.data.forEach((product, index) => {
        log(COLORS.cyan, '  📦', `${index + 1}. ${product.name} (${product.id})`);
      });
    } else {
      log(COLORS.yellow, '📦', 'Nenhum produto cadastrado (OK para uso com price_data)');
    }
  } catch (error) {
    log(COLORS.yellow, '⚠️', `Não foi possível listar produtos: ${error.message}`);
  }

  // Resumo Final
  console.log('\n' + '='.repeat(60));
  log(COLORS.green, '🎉', 'VALIDAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log('='.repeat(60));

  log(COLORS.cyan, '\n📋', 'PRÓXIMOS PASSOS:');
  console.log('  1. Configure o webhook secret (use Stripe CLI ou Dashboard)');
  console.log('  2. Inicie o backend: npm run dev');
  console.log('  3. Inicie o frontend: cd ../frontend && npm run dev');
  console.log('  4. Teste o checkout: http://localhost:5173');
  console.log('  5. Use cartão de teste: 4242 4242 4242 4242\n');

  log(COLORS.cyan, '📚', 'DOCUMENTAÇÃO:');
  console.log('  - Guia completo: INTEGRACAO_STRIPE_GUIA.md');
  console.log('  - Quick start: QUICK_START_STRIPE.md');
  console.log('  - Cartões de teste: https://stripe.com/docs/testing\n');

  process.exit(0);
}

// Executar teste
testStripeConnection().catch(error => {
  log(COLORS.red, '❌', `Erro inesperado: ${error.message}`);
  console.error(error);
  process.exit(1);
});
