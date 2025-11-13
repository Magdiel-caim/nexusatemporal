#!/bin/bash

# Script de teste rápido do sistema de logs PagBank
# Uso: ./TESTE_RAPIDO_LOGS.sh

echo "================================================"
echo "  TESTE RÁPIDO - SISTEMA DE LOGS PAGBANK"
echo "================================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar se PAGBANK_DETAILED_LOGS está habilitado
echo -e "${BLUE}1. Verificando configuração...${NC}"
if [ "$PAGBANK_DETAILED_LOGS" = "true" ]; then
    echo -e "${GREEN}✅ PAGBANK_DETAILED_LOGS está habilitado${NC}"
else
    echo -e "${YELLOW}⚠️  PAGBANK_DETAILED_LOGS não está habilitado${NC}"
    echo -e "${YELLOW}   Execute: export PAGBANK_DETAILED_LOGS=true${NC}"
    echo ""
    echo -e "${YELLOW}Deseja habilitar agora? (s/n)${NC}"
    read -r resposta
    if [ "$resposta" = "s" ] || [ "$resposta" = "S" ]; then
        export PAGBANK_DETAILED_LOGS=true
        echo -e "${GREEN}✅ Habilitado para esta sessão${NC}"
    fi
fi
echo ""

# 2. Verificar se o servidor está rodando
echo -e "${BLUE}2. Verificando se o servidor está rodando...${NC}"
if curl -s http://localhost:3333/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Servidor está rodando${NC}"
else
    echo -e "${RED}❌ Servidor não está rodando${NC}"
    echo -e "${YELLOW}   Execute em outro terminal: cd backend && npm start${NC}"
    exit 1
fi
echo ""

# 3. Obter token JWT (se disponível)
echo -e "${BLUE}3. Obtendo token de autenticação...${NC}"
echo -e "${YELLOW}   Digite seu token JWT (ou deixe em branco para pular testes autenticados):${NC}"
read -r JWT_TOKEN

if [ -z "$JWT_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Token não fornecido. Alguns testes serão pulados.${NC}"
else
    echo -e "${GREEN}✅ Token configurado${NC}"
fi
echo ""

# 4. Fazer teste de conexão (se token disponível)
if [ ! -z "$JWT_TOKEN" ]; then
    echo -e "${BLUE}4. Testando conexão com PagBank...${NC}"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        "http://localhost:3333/api/payment-gateway/test/pagbank" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Teste bem-sucedido${NC}"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        echo -e "${RED}❌ Erro no teste (HTTP $HTTP_CODE)${NC}"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
    echo ""
fi

# 5. Verificar diretório de logs
echo -e "${BLUE}5. Verificando diretório de logs...${NC}"
LOG_DIR="/root/nexusatemporalv1/logs/pagbank"

if [ -d "$LOG_DIR" ]; then
    echo -e "${GREEN}✅ Diretório de logs existe${NC}"
    echo "   $LOG_DIR"

    # Listar arquivos de log
    echo ""
    echo -e "${BLUE}   Arquivos de log encontrados:${NC}"
    ls -lh "$LOG_DIR"/*.json 2>/dev/null || echo "   Nenhum arquivo de log ainda"

    # Verificar log de hoje
    TODAY=$(date +%Y-%m-%d)
    LOG_FILE="$LOG_DIR/pagbank_sandbox_$TODAY.json"

    if [ -f "$LOG_FILE" ]; then
        echo ""
        echo -e "${GREEN}✅ Arquivo de log de hoje encontrado${NC}"

        # Contar entradas
        NUM_LOGS=$(jq 'length' "$LOG_FILE" 2>/dev/null || echo "0")
        echo "   Total de entradas: $NUM_LOGS"

        if [ "$NUM_LOGS" -gt 0 ]; then
            echo ""
            echo -e "${BLUE}   Últimas 3 entradas:${NC}"
            jq '.[-3:] | .[] | {
                type: .type,
                timestamp: .timestamp,
                requestId: .requestId,
                url: (.request.url // .url),
                status: (.response.status // .error.statusCode // "N/A")
            }' "$LOG_FILE" 2>/dev/null || echo "   Erro ao ler logs"
        fi
    else
        echo -e "${YELLOW}⚠️  Arquivo de log de hoje não existe ainda${NC}"
        echo "   Faça uma requisição ao PagBank para gerar logs"
    fi
else
    echo -e "${YELLOW}⚠️  Diretório de logs não existe${NC}"
    echo "   Será criado automaticamente na primeira requisição"
fi
echo ""

# 6. Exportar logs via API (se token disponível)
if [ ! -z "$JWT_TOKEN" ] && [ -f "$LOG_FILE" ]; then
    echo -e "${BLUE}6. Exportando logs via API...${NC}"

    EXPORT_FILE="/tmp/pagbank_logs_export_$(date +%Y%m%d_%H%M%S).json"

    HTTP_CODE=$(curl -s -w "%{http_code}" -o "$EXPORT_FILE" \
        "http://localhost:3333/api/payment-gateway/pagbank/logs" \
        -H "Authorization: Bearer $JWT_TOKEN")

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Logs exportados com sucesso${NC}"
        echo "   Arquivo: $EXPORT_FILE"

        # Mostrar resumo
        echo ""
        echo -e "${BLUE}   Resumo do export:${NC}"
        jq '{
            exportedAt: .exportedAt,
            environment: .environment,
            totalLogs: .totalLogs
        }' "$EXPORT_FILE" 2>/dev/null || echo "   Erro ao ler export"

        echo ""
        echo -e "${GREEN}✅ Este arquivo pode ser enviado ao suporte PagBank!${NC}"
    else
        echo -e "${RED}❌ Erro ao exportar logs (HTTP $HTTP_CODE)${NC}"
        cat "$EXPORT_FILE"
        rm -f "$EXPORT_FILE"
    fi
fi
echo ""

# 7. Comandos úteis
echo "================================================"
echo -e "${BLUE}COMANDOS ÚTEIS:${NC}"
echo "================================================"
echo ""
echo "1. Ver logs em tempo real:"
echo "   tail -f $LOG_DIR/pagbank_sandbox_\$(date +%Y-%m-%d).json | jq"
echo ""
echo "2. Contar logs do dia:"
echo "   jq 'length' $LOG_DIR/pagbank_sandbox_\$(date +%Y-%m-%d).json"
echo ""
echo "3. Filtrar apenas erros:"
echo "   jq '.[] | select(.type == \"ERROR\")' $LOG_DIR/pagbank_sandbox_\$(date +%Y-%m-%d).json"
echo ""
echo "4. Exportar via API:"
echo "   curl -X GET \"http://localhost:3333/api/payment-gateway/pagbank/logs\" \\"
echo "     -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "     -o pagbank_logs.json"
echo ""
echo "5. Ver último Request ID:"
echo "   jq '.[-1].requestId' $LOG_DIR/pagbank_sandbox_\$(date +%Y-%m-%d).json"
echo ""
echo "================================================"
echo -e "${GREEN}✅ Teste concluído!${NC}"
echo "================================================"
echo ""
echo -e "${YELLOW}📚 Para mais informações, leia:${NC}"
echo "   - GUIA_LOGS_PAGBANK.md (guia completo)"
echo "   - RESUMO_IMPLEMENTACAO_LOGS_PAGBANK.md (resumo executivo)"
echo "   - EXEMPLO_LOG_PAGBANK.json (exemplo de log exportado)"
echo ""
