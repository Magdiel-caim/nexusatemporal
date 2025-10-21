#!/bin/bash

# Teste Completo do Workflow N8N
# Simula exatamente o que a WAHA envia

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "=========================================="
echo "🧪 TESTE COMPLETO - Workflow N8N"
echo "=========================================="
echo ""

# Webhook do N8N (onde a WAHA envia)
N8N_WEBHOOK="https://workflow.nexusatemporal.com/webhook/waha-receive-message"

echo -e "${BLUE}📍 Webhook N8N:${NC} $N8N_WEBHOOK"
echo ""

# Teste 1: Mensagem de TEXTO (simula WAHA)
echo "=========================================="
echo "1️⃣  Testando MENSAGEM DE TEXTO"
echo "=========================================="
echo ""

TEXT_WAHA_PAYLOAD='{
  "event": "message",
  "session": "atemporal_main",
  "payload": {
    "id": "test-text-'$(date +%s)'",
    "from": "554198549563@c.us",
    "fromMe": false,
    "body": "🧪 Teste automático - Mensagem de texto via N8N",
    "type": "text",
    "timestamp": '$(date +%s)',
    "_data": {
      "Info": {
        "PushName": "Teste Automático"
      }
    }
  }
}'

echo -e "${YELLOW}Payload WAHA (Texto):${NC}"
echo "$TEXT_WAHA_PAYLOAD" | jq '.'
echo ""

echo -e "${CYAN}➡️  Enviando para N8N...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "$TEXT_WAHA_PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✅ N8N recebeu (HTTP $HTTP_CODE)${NC}"
  echo -e "${YELLOW}Resposta:${NC}"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

  # Aguardar processamento
  echo ""
  echo -e "${CYAN}⏳ Aguardando 3 segundos para processamento...${NC}"
  sleep 3

  # Verificar no banco
  echo -e "${CYAN}🔍 Verificando no banco de dados...${NC}"
  DB_CONTAINER=$(docker ps -q -f name=nexus_postgres | head -1)

  if [ -n "$DB_CONTAINER" ]; then
    LAST_MESSAGE=$(docker exec "$DB_CONTAINER" psql -U nexus_admin -d nexus_chat -t -c \
      "SELECT
        id,
        message_type,
        content,
        contact_name,
        created_at
      FROM chat_messages
      WHERE content LIKE '%Teste automático%'
      ORDER BY created_at DESC
      LIMIT 1;" 2>/dev/null)

    if [ -n "$LAST_MESSAGE" ]; then
      echo -e "${GREEN}✅ Mensagem encontrada no banco!${NC}"
      echo "$LAST_MESSAGE"
    else
      echo -e "${YELLOW}⚠️  Mensagem ainda não apareceu no banco (pode levar alguns segundos)${NC}"
    fi
  fi
else
  echo -e "${RED}❌ Erro no N8N (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""
echo "=========================================="
echo ""

# Teste 2: Mensagem com IMAGEM (simula WAHA)
echo "=========================================="
echo "2️⃣  Testando MENSAGEM COM IMAGEM"
echo "=========================================="
echo ""

# Usar uma imagem de teste pública do WhatsApp
IMAGE_WAHA_PAYLOAD='{
  "event": "message",
  "session": "atemporal_main",
  "payload": {
    "id": "test-image-'$(date +%s)'",
    "from": "554198549563@c.us",
    "fromMe": false,
    "body": "🖼️ Teste de imagem",
    "type": "image",
    "timestamp": '$(date +%s)',
    "hasMedia": true,
    "_data": {
      "mediaUrl": "https://i.imgur.com/placeholder.jpg",
      "Info": {
        "PushName": "Teste Automático"
      }
    }
  }
}'

echo -e "${YELLOW}Payload WAHA (Imagem):${NC}"
echo "$IMAGE_WAHA_PAYLOAD" | jq '.'
echo ""

echo -e "${CYAN}➡️  Enviando para N8N...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "$IMAGE_WAHA_PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✅ N8N recebeu (HTTP $HTTP_CODE)${NC}"
  echo -e "${YELLOW}Resposta:${NC}"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

  echo ""
  echo -e "${CYAN}⏳ Aguardando 5 segundos para processamento (download + upload S3)...${NC}"
  sleep 5

  # Verificar no banco
  echo -e "${CYAN}🔍 Verificando no banco de dados...${NC}"
  DB_CONTAINER=$(docker ps -q -f name=nexus_postgres | head -1)

  if [ -n "$DB_CONTAINER" ]; then
    LAST_IMAGE=$(docker exec "$DB_CONTAINER" psql -U nexus_admin -d nexus_chat -t -c \
      "SELECT
        id,
        message_type,
        SUBSTRING(media_url, 1, 80) as media_url_preview,
        contact_name,
        created_at
      FROM chat_messages
      WHERE message_type = 'image'
      AND contact_name = 'Teste Automático'
      ORDER BY created_at DESC
      LIMIT 1;" 2>/dev/null)

    if [ -n "$LAST_IMAGE" ]; then
      echo -e "${GREEN}✅ Imagem encontrada no banco!${NC}"
      echo "$LAST_IMAGE"

      # Verificar se é URL do S3
      if echo "$LAST_IMAGE" | grep -q "idrivee2"; then
        echo -e "${GREEN}🎉 URL do S3 detectada! Workflow funcionando 100%!${NC}"
      else
        echo -e "${YELLOW}⚠️  URL não é do S3 (pode ser da URL original)${NC}"
      fi
    else
      echo -e "${YELLOW}⚠️  Imagem ainda não apareceu no banco${NC}"
    fi
  fi
else
  echo -e "${RED}❌ Erro no N8N (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""
echo "=========================================="
echo ""

# Verificar credencial S3
echo "3️⃣  Verificando Credencial S3"
echo "=========================================="
echo ""

export AWS_ACCESS_KEY_ID="ZaIdY59FGaL8BdtRjZtL"
export AWS_SECRET_ACCESS_KEY="wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj"
S3_ENDPOINT="https://c1k7.va.idrivee2-46.com"
S3_BUCKET="backupsistemaonenexus"

echo -e "${CYAN}🔍 Testando conexão com S3...${NC}"
if aws s3 ls "s3://${S3_BUCKET}/" --endpoint-url "${S3_ENDPOINT}" --no-verify-ssl > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Credencial S3 funcionando!${NC}"

  # Listar arquivos recentes
  echo ""
  echo -e "${CYAN}📂 Arquivos mais recentes no S3:${NC}"
  aws s3 ls "s3://${S3_BUCKET}/whatsapp/" \
    --endpoint-url "${S3_ENDPOINT}" \
    --no-verify-ssl \
    --recursive \
    --human-readable \
    2>/dev/null | tail -n 5 || echo "   (Nenhum arquivo ainda)"
else
  echo -e "${RED}❌ Erro na credencial S3${NC}"
  echo "   Verifique se a credencial 'IDrive S3 - Nexus' está configurada no N8N"
fi

echo ""
echo "=========================================="
echo ""

# Resumo
echo "📊 RESUMO DOS TESTES"
echo "=========================================="
echo ""
echo "✅ Checklist de Verificação:"
echo ""
echo "   [ ] N8N recebeu webhook (HTTP 200)"
echo "   [ ] Mensagem de texto salva no banco"
echo "   [ ] Mensagem de imagem processada"
echo "   [ ] URL do S3 aparece no banco (idrivee2)"
echo "   [ ] Credencial S3 funcionando"
echo ""
echo "🎯 Próximos Passos:"
echo ""
echo "   1. Verifique execuções no N8N:"
echo "      https://workflow.nexusatemporal.com/executions"
echo ""
echo "   2. Teste real enviando imagem via WhatsApp"
echo ""
echo "   3. Verifique no frontend:"
echo "      https://painel.nexusatemporal.com.br"
echo ""
echo "=========================================="
