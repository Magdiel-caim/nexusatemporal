#!/bin/bash

# ====================================
# NEXUS ATEMPORAL - DEPLOY SCRIPT
# ====================================
# Script de deploy seguro com backup automático

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}🚀 NEXUS ATEMPORAL - DEPLOY v30${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# 1. Executar pre-deploy (backup automático)
echo -e "${YELLOW}📋 Executando verificações pré-deploy...${NC}"
bash /root/nexusatemporal/scripts/pre-deploy.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ DEPLOY ABORTADO: Falha nas verificações pré-deploy!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Verificações pré-deploy concluídas!${NC}"
echo ""

# 2. Build das imagens
echo -e "${YELLOW}🔨 Buildando imagens Docker...${NC}"
cd /root/nexusatemporal

echo -e "${BLUE}  → Buildando backend...${NC}"
docker compose build backend

echo -e "${BLUE}  → Buildando frontend...${NC}"
docker compose build frontend

echo -e "${GREEN}✅ Imagens buildadas com sucesso!${NC}"
echo ""

# 3. Deploy usando Docker Stack
echo -e "${YELLOW}🚢 Fazendo deploy no Docker Swarm...${NC}"

# Remove stack antigo
echo -e "${BLUE}  → Removendo stack antigo...${NC}"
docker stack rm nexus 2>/dev/null || true
sleep 15

# Deploy novo stack
echo -e "${BLUE}  → Deployando novo stack...${NC}"
docker stack deploy -c docker-compose.yml nexus

echo ""
echo -e "${GREEN}✅ Deploy iniciado!${NC}"
echo ""

# 4. Aguardar serviços ficarem prontos
echo -e "${YELLOW}⏳ Aguardando serviços ficarem prontos...${NC}"
sleep 20

# Verificar status
echo ""
echo -e "${YELLOW}📊 Status dos serviços:${NC}"
docker stack ps nexus --filter "desired-state=running" --format "table {{.Name}}\t{{.CurrentState}}"

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}✅ DEPLOY CONCLUÍDO!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "🌐 Frontend: ${BLUE}https://one.nexusatemporal.com.br${NC}"
echo -e "🔗 Backend:  ${BLUE}https://api.nexusatemporal.com.br${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo -e "  1. Testar login no frontend"
echo -e "  2. Verificar logs: ${BLUE}docker service logs nexus_backend${NC}"
echo -e "  3. Verificar backups: ${BLUE}ls -lh /root/nexusatemporal/backups/${NC}"
echo ""
