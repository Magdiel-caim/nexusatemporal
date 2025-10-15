#!/bin/bash

# Script para testar endpoint N8N do backend
# Simula o que o N8N envia para o backend

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🧪 Teste do Endpoint N8N Backend"
echo "=========================================="
echo ""

# Endpoint
ENDPOINT="https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message"

echo -e "${BLUE}📍 Endpoint:${NC} $ENDPOINT"
echo ""

# Teste 1: Mensagem de Texto
echo "1️⃣  Testando mensagem de TEXTO..."
echo "---"

TEXT_PAYLOAD='{
  "sessionName": "atemporal_main",
  "phoneNumber": "554198549563",
  "contactName": "Teste N8N",
  "direction": "incoming",
  "messageType": "text",
  "content": "Teste de mensagem via N8N - Script automático",
  "wahaMessageId": "test-'$(date +%s)'",
  "status": "received",
  "timestamp": '$(date +%s000)'
}'

echo -e "${YELLOW}Payload:${NC}"
echo "$TEXT_PAYLOAD" | jq '.'
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "$TEXT_PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✅ Sucesso (HTTP $HTTP_CODE)${NC}"
  echo -e "${YELLOW}Resposta:${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}❌ Erro (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""
echo "=========================================="
echo ""

# Teste 2: Mensagem com Mídia (URL S3)
echo "2️⃣  Testando mensagem com MÍDIA (URL S3)..."
echo "---"

MEDIA_PAYLOAD='{
  "sessionName": "atemporal_main",
  "phoneNumber": "554198549563",
  "contactName": "Teste N8N",
  "direction": "incoming",
  "messageType": "image",
  "content": "",
  "mediaUrl": "https://c1k7.va.idrivee2-46.com/backupsistemaonenexus/whatsapp/atemporal_main/test-image-'$(date +%s)'.jpg",
  "wahaMessageId": "test-media-'$(date +%s)'",
  "status": "received",
  "timestamp": '$(date +%s000)'
}'

echo -e "${YELLOW}Payload:${NC}"
echo "$MEDIA_PAYLOAD" | jq '.'
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "$MEDIA_PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✅ Sucesso (HTTP $HTTP_CODE)${NC}"
  echo -e "${YELLOW}Resposta:${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}❌ Erro (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""
echo "=========================================="
echo ""

# Verificar mensagens no banco
echo "3️⃣  Verificando mensagens no banco de dados..."
echo "---"

DB_CONTAINER=$(docker ps -q -f name=nexus_postgres | head -1)

if [ -n "$DB_CONTAINER" ]; then
  echo "SELECT
    id,
    session_name,
    phone_number,
    message_type,
    content,
    SUBSTRING(media_url, 1, 60) as media_url_preview,
    created_at
  FROM chat_messages
  WHERE contact_name = 'Teste N8N'
  ORDER BY created_at DESC
  LIMIT 5;" | \
  docker exec -i "$DB_CONTAINER" psql -U nexus_admin -d nexus_chat -x 2>/dev/null

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Mensagens encontradas no banco${NC}"
  else
    echo -e "${RED}❌ Erro ao consultar banco${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Container PostgreSQL não encontrado${NC}"
fi

echo ""
echo "=========================================="
echo ""

# Resumo
echo "📊 RESUMO"
echo "=========================================="
echo ""
echo "✅ Se os testes acima mostraram HTTP 200 e 'success: true', o endpoint está funcionando!"
echo ""
echo "🎯 Próximos passos:"
echo "   1. Configure o workflow N8N com o arquivo CORRIGIDO"
echo "   2. Certifique-se de usar JSON direto (jsonParameters: true)"
echo "   3. NÃO use autenticação no nó de envio ao backend"
echo "   4. Envie uma mensagem real via WhatsApp para testar"
echo ""
echo "📂 Arquivo do workflow corrigido:"
echo "   /root/nexusatemporal/n8n-workflows/n8n_workflow_2_receber_mensagens_COM_S3_CORRIGIDO.json"
echo ""
echo "📖 Documentação das correções:"
echo "   /root/nexusatemporal/n8n-workflows/CORRECOES-WORKFLOW.md"
echo ""
echo "=========================================="
