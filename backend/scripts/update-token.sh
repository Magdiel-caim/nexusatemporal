#!/bin/bash

# Script para atualizar token PagBank de forma segura

echo ""
echo "======================================"
echo "  Atualizar Token PagBank"
echo "======================================"
echo ""
echo "Este script vai atualizar seu token de forma segura."
echo ""
echo "⚠️  IMPORTANTE:"
echo "1. Copie o token COMPLETO do portal PagBank"
echo "2. Certifique-se que é o token de SANDBOX"
echo "3. Cole aqui sem adicionar espaços extras"
echo ""
echo "--------------------------------------"
echo ""

# Solicitar novo token
read -p "Cole o novo token PagBank aqui: " NEW_TOKEN

# Remover espaços no início e fim
NEW_TOKEN=$(echo "$NEW_TOKEN" | xargs)

# Validar que não está vazio
if [ -z "$NEW_TOKEN" ]; then
    echo ""
    echo "❌ Erro: Token vazio!"
    echo ""
    exit 1
fi

# Mostrar preview
echo ""
echo "Token informado (preview):"
echo "${NEW_TOKEN:0:20}...${NEW_TOKEN: -20}"
echo "Comprimento: ${#NEW_TOKEN} caracteres"
echo ""

# Confirmar
read -p "Está correto? (s/n): " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    echo ""
    echo "❌ Operação cancelada."
    echo ""
    exit 1
fi

# Fazer backup do arquivo atual
cp .env.pagbank .env.pagbank.backup.$(date +%Y%m%d_%H%M%S)
echo ""
echo "✅ Backup criado: .env.pagbank.backup.$(date +%Y%m%d_%H%M%S)"

# Atualizar token no arquivo
sed -i "s|PAGBANK_SANDBOX_TOKEN=.*|PAGBANK_SANDBOX_TOKEN=$NEW_TOKEN|g" .env.pagbank

echo "✅ Token atualizado no .env.pagbank"
echo ""

# Verificar se atualizou
NEW_TOKEN_CHECK=$(grep "PAGBANK_SANDBOX_TOKEN=" .env.pagbank | cut -d'=' -f2)

if [ "$NEW_TOKEN_CHECK" = "$NEW_TOKEN" ]; then
    echo "✅ Verificação: Token atualizado com sucesso!"
    echo ""
    echo "======================================"
    echo "  Próximos Passos"
    echo "======================================"
    echo ""
    echo "1. Execute: npm run setup:pagbank"
    echo "2. Teste: node scripts/test-token.js"
    echo "3. Valide: npm run test:pagbank"
    echo ""
else
    echo "❌ Erro: Token não foi atualizado corretamente"
    echo ""
    exit 1
fi
