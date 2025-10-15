#!/bin/bash

# Script para executar migration da Agenda no banco CRM
# Banco: nexus_crm na VPS 46.202.144.210

set -e

echo "========================================="
echo "Migration: Criar módulo de Agenda"
echo "========================================="
echo ""

# Variáveis do banco
DB_HOST="46.202.144.210"
DB_PORT="5432"
DB_NAME="nexus_crm"
DB_USER="nexus_admin"
DB_PASSWORD="nexus2024@secure"

# Arquivo de migration
MIGRATION_FILE="/root/nexusatemporal/backend/src/database/migrations/create-agenda-tables.sql"

echo "📋 Informações:"
echo "   Host: $DB_HOST"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Verificar se o arquivo existe
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Erro: Arquivo de migration não encontrado!"
  echo "   Procurando em: $MIGRATION_FILE"
  exit 1
fi

echo "✓ Arquivo de migration encontrado"
echo ""

# Confirmar execução
read -p "Deseja executar a migration? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  echo "❌ Operação cancelada"
  exit 0
fi

echo ""
echo "🚀 Executando migration..."
echo ""

# Executar migration
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration executada com sucesso!"
  echo ""

  # Verificar tabelas criadas
  echo "📊 Verificando tabelas criadas..."
  echo ""

  PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -c "SELECT
          table_name,
          pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size
        FROM information_schema.tables
        WHERE table_name IN ('appointments', 'appointment_returns', 'appointment_notifications')
        ORDER BY table_name;"

  echo ""
  echo "✅ Módulo de Agenda criado com sucesso!"
  echo ""
  echo "📋 Próximos passos:"
  echo "   1. Executar: cd /root/nexusatemporal/backend && npm run build"
  echo "   2. Reiniciar o backend"
  echo "   3. Testar endpoints em /api/appointments"
  echo ""
else
  echo ""
  echo "❌ Erro ao executar migration!"
  exit 1
fi
