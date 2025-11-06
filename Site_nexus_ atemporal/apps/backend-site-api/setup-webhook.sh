#!/bin/bash

# Script para configurar webhook do Stripe localmente
# Autor: Claude Code
# Data: 04/11/2025

COLORS_GREEN='\033[0;32m'
COLORS_RED='\033[0;31m'
COLORS_YELLOW='\033[0;33m'
COLORS_BLUE='\033[0;34m'
COLORS_CYAN='\033[0;36m'
COLORS_RESET='\033[0m'

echo -e "${COLORS_CYAN}"
echo "============================================================"
echo "🔐 CONFIGURAÇÃO DE WEBHOOK STRIPE - NEXUS ATEMPORAL"
echo "============================================================"
echo -e "${COLORS_RESET}\n"

# Verificar se Stripe CLI está instalado
echo -e "${COLORS_BLUE}📋 Verificando Stripe CLI...${COLORS_RESET}"
if ! command -v stripe &> /dev/null; then
    echo -e "${COLORS_RED}❌ Stripe CLI não está instalado!${COLORS_RESET}"
    echo -e "${COLORS_YELLOW}Instalando Stripe CLI...${COLORS_RESET}"

    curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | tee /usr/share/keyrings/stripe.gpg > /dev/null
    echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | tee -a /etc/apt/sources.list.d/stripe.list
    apt update > /dev/null 2>&1
    apt install stripe -y > /dev/null 2>&1
fi

echo -e "${COLORS_GREEN}✅ Stripe CLI instalado: $(stripe version | head -n1)${COLORS_RESET}\n"

# Login no Stripe
echo -e "${COLORS_BLUE}🔑 Fazendo login no Stripe...${COLORS_RESET}"
echo -e "${COLORS_YELLOW}⚠️  Você será redirecionado para o navegador para autenticar.${COLORS_RESET}"
echo -e "${COLORS_YELLOW}⚠️  Pressione ENTER para continuar ou CTRL+C para cancelar${COLORS_RESET}"
read -r

stripe login

if [ $? -ne 0 ]; then
    echo -e "${COLORS_RED}❌ Erro ao fazer login no Stripe!${COLORS_RESET}"
    exit 1
fi

echo -e "${COLORS_GREEN}✅ Login realizado com sucesso!${COLORS_RESET}\n"

# Configurar webhook
echo -e "${COLORS_BLUE}🌐 Configurando webhook local...${COLORS_RESET}"
echo -e "${COLORS_CYAN}📍 URL: http://localhost:3001/api/payments/webhook/stripe${COLORS_RESET}\n"

echo -e "${COLORS_YELLOW}⚠️  O webhook ficará ativo enquanto este processo estiver rodando.${COLORS_RESET}"
echo -e "${COLORS_YELLOW}⚠️  Mantenha esta janela aberta!${COLORS_RESET}\n"

echo -e "${COLORS_GREEN}🚀 Iniciando encaminhamento de webhooks...${COLORS_RESET}"
echo -e "${COLORS_CYAN}📝 Copie o WEBHOOK SECRET que aparecer abaixo!${COLORS_RESET}\n"

# Executar stripe listen
stripe listen --forward-to http://localhost:3001/api/payments/webhook/stripe

echo -e "\n${COLORS_YELLOW}⚠️  Webhook encerrado!${COLORS_RESET}"
