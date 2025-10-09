#!/bin/bash

# ====================================
# NEXUS ATEMPORAL - PRE-DEPLOY SCRIPT
# ====================================
# Este script SEMPRE executa antes de qualquer deploy
# Garante backup do banco de dados antes de mudanças

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}NEXUS ATEMPORAL - PRE-DEPLOY CHECK${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# 1. Fazer backup do banco de dados
echo -e "${YELLOW}🔒 PASSO 1: Fazendo backup do banco de dados...${NC}"
bash /root/nexusatemporal/scripts/backup-database.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ ERRO: Falha no backup do banco de dados!${NC}"
    echo -e "${RED}❌ DEPLOY ABORTADO POR SEGURANÇA!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Backup concluído com sucesso!${NC}"
echo ""

# 2. Verificar serviços críticos
echo -e "${YELLOW}🔍 PASSO 2: Verificando serviços críticos...${NC}"

# Verifica PostgreSQL
if docker ps | grep -q nexus_postgres; then
    echo -e "${GREEN}✅ PostgreSQL rodando${NC}"
else
    echo -e "${RED}❌ PostgreSQL não está rodando!${NC}"
fi

# Verifica Redis
if docker ps | grep -q nexus_redis; then
    echo -e "${GREEN}✅ Redis rodando${NC}"
else
    echo -e "${YELLOW}⚠️  Redis não está rodando${NC}"
fi

# Verifica RabbitMQ
if docker ps | grep -q nexus_rabbitmq; then
    echo -e "${GREEN}✅ RabbitMQ rodando${NC}"
else
    echo -e "${YELLOW}⚠️  RabbitMQ não está rodando${NC}"
fi

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}✅ PRE-DEPLOY CHECK COMPLETO!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "${BLUE}🚀 Sistema pronto para deploy!${NC}"
echo ""
