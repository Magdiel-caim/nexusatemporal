#!/bin/bash

# ====================================
# NEXUS ATEMPORAL - DATABASE BACKUP SCRIPT
# ====================================
# Este script faz backup do PostgreSQL e envia para IDrive E2

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/root/nexusatemporal/backups"
BACKUP_FILE="nexus_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Credenciais do PostgreSQL
DB_CONTAINER=$(docker ps -q -f name=nexus_postgres)
DB_USER="nexus_admin"
DB_NAME="nexus_master"
DB_PASSWORD="6uyJZdc0xsCe7ymief3x2Izi9QubcTYP"

# IDrive E2 S3 Configuration
S3_ENDPOINT="https://c1k7.va.idrivee2-46.com"
S3_ACCESS_KEY="ZaIdY59FGaL8BdtRjZtL"
S3_SECRET_KEY="wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj"
S3_BUCKET="onenexus"
S3_PATH="backups/database"

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}NEXUS ATEMPORAL - DATABASE BACKUP${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Verifica se o container do PostgreSQL está rodando
if [ -z "$DB_CONTAINER" ]; then
    echo -e "${RED}❌ Erro: Container do PostgreSQL não encontrado!${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Criando backup do banco de dados...${NC}"

# Faz o backup
docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME > "$BACKUP_PATH"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    echo -e "${GREEN}✅ Backup criado: ${BACKUP_FILE} (${BACKUP_SIZE})${NC}"
else
    echo -e "${RED}❌ Erro ao criar backup!${NC}"
    exit 1
fi

# Compacta o backup
echo -e "${YELLOW}🗜️  Compactando backup...${NC}"
gzip "$BACKUP_PATH"
BACKUP_PATH="${BACKUP_PATH}.gz"
BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
echo -e "${GREEN}✅ Backup compactado: ${BACKUP_FILE}.gz (${BACKUP_SIZE})${NC}"

# Upload para IDrive E2 usando AWS CLI
echo -e "${YELLOW}☁️  Enviando para IDrive E2...${NC}"

# Configura AWS CLI para IDrive E2
export AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY"

# Verifica se aws-cli está instalado
if ! command -v aws &> /dev/null; then
    echo -e "${YELLOW}⚙️  Instalando AWS CLI...${NC}"
    apt-get update -qq && apt-get install -y -qq awscli > /dev/null 2>&1
fi

# Faz upload para S3
aws s3 cp "$BACKUP_PATH" \
    "s3://${S3_BUCKET}/${S3_PATH}/${BACKUP_FILE}.gz" \
    --endpoint-url "$S3_ENDPOINT" \
    --no-verify-ssl

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup enviado para IDrive E2: ${S3_PATH}/${BACKUP_FILE}.gz${NC}"
else
    echo -e "${RED}❌ Erro ao enviar backup para IDrive E2!${NC}"
    echo -e "${YELLOW}⚠️  Backup local salvo em: ${BACKUP_PATH}${NC}"
fi

# Lista backups locais
echo ""
echo -e "${YELLOW}📁 Backups locais:${NC}"
ls -lh "$BACKUP_DIR" | tail -5

# Remove backups locais com mais de 7 dias
echo ""
echo -e "${YELLOW}🗑️  Removendo backups locais antigos (>7 dias)...${NC}"
find "$BACKUP_DIR" -name "nexus_backup_*.sql.gz" -mtime +7 -delete
echo -e "${GREEN}✅ Limpeza concluída${NC}"

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}✅ BACKUP CONCLUÍDO COM SUCESSO!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "📁 Backup local: ${BACKUP_PATH}"
echo -e "☁️  Backup remoto: s3://${S3_BUCKET}/${S3_PATH}/${BACKUP_FILE}.gz"
echo ""
