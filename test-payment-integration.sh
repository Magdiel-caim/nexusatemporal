#!/bin/bash

# Script de Teste - Integração de Pagamento
# Este script testa o fluxo completo de pagamento

echo "======================================"
echo "🧪 TESTE DE INTEGRAÇÃO DE PAGAMENTO"
echo "======================================"
echo ""

# Configurações
EMAIL_TESTE="teste-integracao-$(date +%s)@example.com"
NOME_TESTE="Usuário Teste $(date +%H:%M:%S)"
PLANO="essencial"

echo "📧 Email de teste: $EMAIL_TESTE"
echo "👤 Nome: $NOME_TESTE"
echo "📦 Plano: $PLANO"
echo ""

# PASSO 1: Criar sessão de checkout no Stripe
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASSO 1: Criando sessão de checkout..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vamos precisar verificar se o backend do site está rodando
# e então criar uma sessão via API

echo ""
echo "⚠️  IMPORTANTE: Para testar o fluxo completo, você precisa:"
echo ""
echo "1. Acessar o Stripe Dashboard em modo TEST:"
echo "   https://dashboard.stripe.com/test/payments"
echo ""
echo "2. Criar um checkout usando cartão de teste:"
echo "   Número: 4242 4242 4242 4242"
echo "   Data: Qualquer data futura (ex: 12/34)"
echo "   CVV: Qualquer 3 dígitos (ex: 123)"
echo "   CEP: Qualquer CEP (ex: 12345)"
echo ""
echo "3. Ou podemos criar uma sessão de checkout via API..."
echo ""

read -p "Deseja criar uma sessão de checkout via API? (s/n): " CRIAR_API

if [ "$CRIAR_API" = "s" ]; then
    echo ""
    echo "Criando sessão via API..."

    # Aqui você precisaria ter o endpoint do backend do site rodando
    # Por enquanto, vamos mostrar o comando curl que você pode executar

    echo ""
    echo "Execute este comando para criar uma sessão de checkout:"
    echo ""
    echo "curl -X POST http://localhost:3001/api/payments/create-session \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{"
    echo "    \"planId\": \"$PLANO\","
    echo "    \"userEmail\": \"$EMAIL_TESTE\","
    echo "    \"userName\": \"$NOME_TESTE\","
    echo "    \"successUrl\": \"https://one.nexusatemporal.com.br/success\","
    echo "    \"cancelUrl\": \"https://one.nexusatemporal.com.br/cancel\""
    echo "  }'"
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASSO 2: Testar via Stripe CLI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Você também pode simular um pagamento usando o Stripe CLI:"
echo ""
echo "stripe trigger checkout.session.completed"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASSO 3: Verificar se usuário foi criado"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Após completar o pagamento, verifique no banco de dados:"
echo ""
echo "PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm \\"
echo "  -c \"SELECT id, email, name, role, status FROM users WHERE email = '$EMAIL_TESTE';\""
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PASSO 4: Verificar pedido registrado"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm \\"
echo "  -c \"SELECT id, user_email, plan, amount, status FROM orders WHERE user_email = '$EMAIL_TESTE';\""
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Checklist de Validação"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "[ ] Sessão de checkout criada com sucesso"
echo "[ ] Pagamento processado no Stripe"
echo "[ ] Webhook recebido pelo backend do site"
echo "[ ] API do sistema principal chamada"
echo "[ ] Usuário criado no banco de dados"
echo "[ ] Pedido registrado na tabela orders"
echo "[ ] Email de boas-vindas enviado"
echo "[ ] Link de definir senha válido por 7 dias"
echo ""
