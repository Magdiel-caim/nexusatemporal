#!/bin/bash

# Script de Verificação - Mídias WhatsApp no S3
# Criado: 2025-10-14
# Objetivo: Verificar se o workflow N8N está salvando mídias corretamente no S3

set -e

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuração S3
export AWS_ACCESS_KEY_ID="ZaIdY59FGaL8BdtRjZtL"
export AWS_SECRET_ACCESS_KEY="wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj"
S3_ENDPOINT="https://c1k7.va.idrivee2-46.com"
S3_BUCKET="backupsistemaonenexus"

echo "=========================================="
echo "🔍 VERIFICAÇÃO: Mídias WhatsApp no S3"
echo "=========================================="
echo ""

# 1. Verificar conectividade com S3
echo "1️⃣  Testando conexão com S3/IDrive..."
if aws s3 ls "s3://${S3_BUCKET}/" --endpoint-url "${S3_ENDPOINT}" --no-verify-ssl > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Conexão com S3 OK${NC}"
else
    echo -e "${RED}❌ ERRO: Não foi possível conectar ao S3${NC}"
    echo "   Verifique credenciais e endpoint"
    exit 1
fi
echo ""

# 2. Verificar pasta whatsapp existe
echo "2️⃣  Verificando pasta whatsapp/ no S3..."
if aws s3 ls "s3://${S3_BUCKET}/whatsapp/" --endpoint-url "${S3_ENDPOINT}" --no-verify-ssl > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Pasta whatsapp/ encontrada${NC}"
else
    echo -e "${YELLOW}⚠️  Pasta whatsapp/ não existe (será criada ao receber primeira mídia)${NC}"
fi
echo ""

# 3. Listar arquivos mais recentes
echo "3️⃣  Listando mídias mais recentes (últimas 10)..."
RECENT_FILES=$(aws s3 ls "s3://${S3_BUCKET}/whatsapp/" \
  --endpoint-url "${S3_ENDPOINT}" \
  --no-verify-ssl \
  --recursive \
  --human-readable \
  2>/dev/null | tail -n 10)

if [ -z "$RECENT_FILES" ]; then
    echo -e "${YELLOW}⚠️  Nenhuma mídia encontrada ainda${NC}"
    echo "   → Envie uma imagem via WhatsApp para testar"
else
    echo -e "${GREEN}✅ Arquivos encontrados:${NC}"
    echo "$RECENT_FILES" | while read -r line; do
        echo "   📄 $line"
    done
fi
echo ""

# 4. Estatísticas de armazenamento
echo "4️⃣  Estatísticas de armazenamento..."
TOTAL_SIZE=$(aws s3 ls "s3://${S3_BUCKET}/whatsapp/" \
  --endpoint-url "${S3_ENDPOINT}" \
  --no-verify-ssl \
  --recursive \
  --summarize \
  2>/dev/null | grep "Total Size" | awk '{print $3, $4}')

TOTAL_FILES=$(aws s3 ls "s3://${S3_BUCKET}/whatsapp/" \
  --endpoint-url "${S3_ENDPOINT}" \
  --no-verify-ssl \
  --recursive \
  --summarize \
  2>/dev/null | grep "Total Objects" | awk '{print $3}')

if [ -z "$TOTAL_FILES" ]; then
    echo -e "${YELLOW}   Total de arquivos: 0${NC}"
    echo -e "${YELLOW}   Espaço usado: 0 MB${NC}"
else
    echo -e "${GREEN}   Total de arquivos: ${TOTAL_FILES}${NC}"
    echo -e "${GREEN}   Espaço usado: ${TOTAL_SIZE}${NC}"
fi
echo ""

# 5. Testar URL pública
echo "5️⃣  Testando acesso público a URLs..."
LATEST_FILE=$(aws s3 ls "s3://${S3_BUCKET}/whatsapp/" \
  --endpoint-url "${S3_ENDPOINT}" \
  --no-verify-ssl \
  --recursive \
  2>/dev/null | tail -n 1 | awk '{print $4}')

if [ -n "$LATEST_FILE" ]; then
    PUBLIC_URL="${S3_ENDPOINT}/${S3_BUCKET}/${LATEST_FILE}"
    echo "   📎 URL de teste: ${PUBLIC_URL}"

    HTTP_CODE=$(curl -s -k -o /dev/null -w "%{http_code}" "${PUBLIC_URL}")

    if [ "$HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}   ✅ Arquivo acessível publicamente (HTTP 200)${NC}"
    else
        echo -e "${RED}   ❌ Erro ao acessar arquivo (HTTP ${HTTP_CODE})${NC}"
        echo "      Verifique configurações de ACL do bucket"
    fi
else
    echo -e "${YELLOW}   ⚠️  Nenhum arquivo para testar${NC}"
fi
echo ""

# 6. Verificar backend está recebendo URLs do S3
echo "6️⃣  Verificando banco de dados..."
DB_CONTAINER=$(docker ps -q -f name=nexus_postgres | head -1)

if [ -n "$DB_CONTAINER" ]; then
    RECENT_MEDIA=$(docker exec "$DB_CONTAINER" psql -U nexus_admin -d nexus_chat -t -c \
      "SELECT media_url FROM chat_messages WHERE message_type IN ('image', 'video', 'audio') ORDER BY created_at DESC LIMIT 5;" \
      2>/dev/null)

    if [ -n "$RECENT_MEDIA" ]; then
        echo -e "${GREEN}✅ Mensagens com mídia no banco:${NC}"
        echo "$RECENT_MEDIA" | while read -r url; do
            if [[ $url == *"idrivee2"* ]]; then
                echo -e "   ${GREEN}✅ URL S3: $url${NC}"
            elif [[ $url == *"mmg.whatsapp.net"* ]]; then
                echo -e "   ${YELLOW}⚠️  URL WhatsApp (temporária): $url${NC}"
            elif [[ $url == *"data:image"* ]] || [[ $url == *"base64"* ]]; then
                echo -e "   ${RED}❌ Base64 (antigo): ${url:0:50}...${NC}"
            else
                echo -e "   ${YELLOW}⚠️  Outra URL: $url${NC}"
            fi
        done
    else
        echo -e "${YELLOW}   ⚠️  Nenhuma mensagem com mídia no banco ainda${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Container PostgreSQL não encontrado${NC}"
fi
echo ""

# 7. Resumo
echo "=========================================="
echo "📊 RESUMO DA VERIFICAÇÃO"
echo "=========================================="

if [ -n "$TOTAL_FILES" ] && [ "$TOTAL_FILES" -gt 0 ]; then
    echo -e "${GREEN}✅ Sistema funcionando corretamente!${NC}"
    echo ""
    echo "📈 Estatísticas:"
    echo "   • Arquivos no S3: ${TOTAL_FILES}"
    echo "   • Espaço usado: ${TOTAL_SIZE}"
    echo ""
    echo "🎯 Próximos Passos:"
    echo "   1. Continue enviando mídias via WhatsApp"
    echo "   2. Monitore execuções no N8N: https://workflow.nexusatemporal.com"
    echo "   3. Verifique se imagens aparecem no frontend"
else
    echo -e "${YELLOW}⚠️  Sistema configurado, mas sem mídias ainda${NC}"
    echo ""
    echo "🎯 Para testar:"
    echo "   1. Envie uma IMAGEM via WhatsApp"
    echo "   2. Aguarde 5 segundos"
    echo "   3. Execute este script novamente"
    echo "   4. Verifique execuções no N8N: https://workflow.nexusatemporal.com"
fi

echo ""
echo "=========================================="
