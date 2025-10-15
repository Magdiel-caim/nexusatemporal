#!/bin/bash

# Diagnóstico Completo do Workflow N8N

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "🔍 DIAGNÓSTICO WORKFLOW N8N"
echo "=========================================="
echo ""

# 1. Testar Backend
echo -e "${BLUE}1️⃣  Testando Backend...${NC}"
BACKEND_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message" \
  -H "Content-Type: application/json" \
  -d '{"test": true}')

HTTP_CODE=$(echo "$BACKEND_RESPONSE" | tail -n1)
BODY=$(echo "$BACKEND_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "500" ]; then
  echo -e "${GREEN}✅ Backend respondendo (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${RED}❌ Backend com problema (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# 2. Testar S3
echo -e "${BLUE}2️⃣  Testando S3...${NC}"
export AWS_ACCESS_KEY_ID="ZaIdY59FGaL8BdtRjZtL"
export AWS_SECRET_ACCESS_KEY="wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj"

if aws s3 ls s3://backupsistemaonenexus/ --endpoint-url https://c1k7.va.idrivee2-46.com --no-verify-ssl > /dev/null 2>&1; then
  echo -e "${GREEN}✅ S3 acessível${NC}"
else
  echo -e "${RED}❌ S3 inacessível${NC}"
fi
echo ""

# 3. Enviar teste ao N8N
echo -e "${BLUE}3️⃣  Enviando teste ao N8N...${NC}"
TIMESTAMP=$(date +%s)
N8N_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://workflow.nexusatemporal.com/webhook/waha-receive-message" \
  -H "Content-Type: application/json" \
  -d '{
  "event": "message",
  "session": "atemporal_main",
  "payload": {
    "id": "diag-'$TIMESTAMP'",
    "from": "554198549563@c.us",
    "fromMe": false,
    "body": "Diagnóstico '$TIMESTAMP'",
    "type": "text",
    "timestamp": '$TIMESTAMP',
    "_data": {
      "Info": {
        "PushName": "Diagnóstico"
      }
    }
  }
}')

HTTP_CODE=$(echo "$N8N_RESPONSE" | tail -n1)
BODY=$(echo "$N8N_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✅ N8N recebeu webhook (HTTP $HTTP_CODE)${NC}"
  echo "   Resposta: $BODY"
else
  echo -e "${RED}❌ N8N não respondeu (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# 4. Aguardar processamento
echo -e "${BLUE}4️⃣  Aguardando 5 segundos...${NC}"
sleep 5
echo ""

# 5. Verificar no banco
echo -e "${BLUE}5️⃣  Verificando banco de dados...${NC}"
CONTAINER=$(docker ps -q -f name=nexus_postgres | head -1)

if [ -n "$CONTAINER" ]; then
  RESULT=$(docker exec "$CONTAINER" psql -U nexus_admin -d nexus_master -t -c \
    "SELECT content FROM chat_messages WHERE content LIKE 'Diagnóstico%' ORDER BY created_at DESC LIMIT 1;" 2>/dev/null | xargs)

  if [ -n "$RESULT" ]; then
    echo -e "${GREEN}✅ Mensagem encontrada no banco!${NC}"
    echo "   Conteúdo: $RESULT"
  else
    echo -e "${RED}❌ Mensagem NÃO encontrada no banco${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  PROBLEMA DETECTADO:${NC}"
    echo "   • N8N recebeu o webhook"
    echo "   • MAS não salvou no banco"
    echo ""
    echo -e "${YELLOW}📋 VERIFIQUE NO N8N:${NC}"
    echo "   1. Abra: https://workflow.nexusatemporal.com"
    echo "   2. Vá em: Executions (menu lateral)"
    echo "   3. Procure execução mais recente"
    echo "   4. Se estiver VERMELHA (erro), clique nela"
    echo "   5. Veja qual nó falhou (vermelho)"
    echo "   6. Clique no nó vermelho → aba 'Error'"
    echo ""
    echo -e "${YELLOW}🔧 PROVÁVEIS CAUSAS:${NC}"
    echo "   • Credencial 'IDrive S3 - Nexus' não configurada"
    echo "   • Workflow não está ATIVO (toggle verde)"
    echo "   • Erro no código JavaScript de algum nó"
  fi
else
  echo -e "${RED}❌ Container PostgreSQL não encontrado${NC}"
fi

echo ""
echo "=========================================="
echo -e "${BLUE}📊 RESUMO${NC}"
echo "=========================================="
echo ""
echo "Se a mensagem NÃO chegou no banco, você PRECISA:"
echo ""
echo "1. Abrir N8N → Executions"
echo "2. Ver a última execução (deve estar VERMELHA)"
echo "3. Clicar nela e ver qual nó falhou"
echo "4. Me informar o erro"
echo ""
echo "=========================================="
