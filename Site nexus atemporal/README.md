# Site Nexus Atemporal

Site institucional do Sistema One Nexus Atemporal com checkout integrado, desenvolvido conforme especificação do documento `site nexus.pdf`.

## 🎯 Visão Geral

Landing page one-page com:
- ✅ **React 18 + Vite + TypeScript**
- ✅ **TailwindCSS 3.4** com design system customizado
- ✅ **Dark/Light mode** (Zustand)
- ✅ **i18n pt-BR / en-US** (react-i18next)
- 🚧 Checkout com 3 gateways (Stripe, Asaas, PagSeguro)
- 🚧 Backend API (Node 20 + Express + TypeORM)
- 🚧 Integração n8n webhook
- 🚧 E-mail transacional (Nodemailer)
- 🚧 LGPD compliant
- 🚧 Docker Swarm + Traefik

## 📊 Status: ~35% Completo

Ver detalhes completos em: [`STATUS_IMPLEMENTACAO.md`](./STATUS_IMPLEMENTACAO.md)

## 🏗️ Arquitetura

```
apps/
├── frontend/          # React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Button, Card
│   │   │   ├── sections/     # Hero, Benefits, Plans, etc
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── pages/            # Privacy, Terms
│   │   ├── i18n/             # pt-BR.json, en-US.json
│   │   ├── store/            # Zustand stores (theme, language, lgpd)
│   │   ├── styles/           # TailwindCSS global
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── backend-site-api/  # Node 20 + Express + TypeScript
    ├── src/
    │   ├── modules/
    │   │   ├── auth/
    │   │   ├── payments/     # stripe.ts, asaas.ts, pagseguro.ts
    │   │   └── webhook/      # n8n integration
    │   ├── entities/         # Order, PaymentEvent
    │   └── index.ts
    └── package.json
```

## 🚀 Quick Start

### Frontend

```bash
cd apps/frontend

# Instalar dependências
npm install

# Desenvolvimento (localhost:5173)
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Backend (Em desenvolvimento)

```bash
cd apps/backend-site-api

# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

## 🎨 Design System

### Cores

```css
/* Primary */
--brand-500: #6D4CFF

/* Accent */
--accent: #23F0C7

/* Blue */
--blue: #2463FF

/* Dark */
--dark: #121212
```

### Tipografia

- **Títulos**: Poppins 600/700
- **Texto**: Inter 400/500/600
- **Numérico**: Space Mono 700

## 🌍 Internacionalização

Idiomas suportados:
- 🇧🇷 Português (pt-BR) - padrão
- 🇺🇸 English (en-US)

Toggle no header (ícone globo).

## 🌓 Dark Mode

Toggle no header (ícone sol/lua).
Persistência automática em localStorage.

## 📦 Dependências Principais

### Frontend
- React 18.3.1
- Vite 5.4.8
- TailwindCSS 3.4.13
- Zustand 4.5.5
- TanStack Query 5.56.2
- react-i18next 15.0.2
- framer-motion 11.5.6
- lottie-react 2.4.0

### Backend (A instalar)
- Express 4.18
- TypeORM 0.3.19
- PostgreSQL (pg)
- JWT
- Nodemailer
- Stripe SDK
- Axios

## 🐳 Docker Deploy

### Build Local

```bash
# Frontend
cd apps/frontend
docker build -t nexus-site-frontend:latest .

# Backend
cd apps/backend-site-api
docker build -t nexus-site-backend:latest .
```

### Docker Swarm

```bash
# Criar rede externa
docker network create --driver overlay nexusatnet

# Deploy stack
docker stack deploy -c docker-compose.yml nexus-site

# Verificar serviços
docker stack services nexus-site

# Logs
docker service logs nexus-site_frontend -f
docker service logs nexus-site_backend -f
```

## 🔧 Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```env
# Database
DB_HOST=72.60.139.52
DB_PORT=5432
DB_NAME=nexus_crm
DB_USER=nexus_admin
DB_PASS=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Asaas
ASAAS_API_KEY=
ASAAS_WEBHOOK_TOKEN=

# PagSeguro
PAGSEGURO_TOKEN=
PAGSEGURO_EMAIL=

# n8n
N8N_WEBHOOK_URL=
N8N_WEBHOOK_TOKEN=

# SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=contato@nexusatemporal.com.br
SMTP_PASS=

# System
ONE_NEXUS_API_URL=https://one.nexusatemporal.com.br/api
ONE_NEXUS_API_KEY=
```

## 🌐 URLs de Produção

- **Site**: https://nexusatemporal.com
- **API**: https://api.nexusatemporal.com
- **Dashboard**: https://one.nexusatemporal.com.br

## 📋 Checklist de Implementação

- [x] Estrutura base do projeto
- [x] Frontend: React + Vite configurado
- [x] TailwindCSS com design system
- [x] i18n pt-BR / en-US
- [x] Dark/Light mode (Zustand)
- [x] Header com navegação responsiva
- [x] Hero section
- [ ] Benefits section
- [ ] Plans section (4 planos)
- [ ] FAQ section
- [ ] Contact section
- [ ] Footer
- [ ] LGPD Banner
- [ ] Backend API estrutura
- [ ] Módulos de pagamento (Stripe, Asaas, PagSeguro)
- [ ] Webhooks unificados
- [ ] n8n integration
- [ ] Nodemailer + templates HTML
- [ ] Migrations PostgreSQL
- [ ] Dockerfiles
- [ ] docker-compose.yml
- [ ] Testes QA
- [ ] Deploy produção

## 📚 Documentação

- [`STATUS_IMPLEMENTACAO.md`](./STATUS_IMPLEMENTACAO.md) - Status detalhado da implementação
- [`site nexus.pdf`](./site%20nexus.pdf) - Documento mestre de especificação
- `docs/LGPD.md` - Políticas de privacidade (a criar)
- `docs/payments-flow.drawio` - Fluxograma de pagamentos (a criar)

## 🧑‍💻 Desenvolvimento

### Estrutura de Commits

```bash
git commit -m "feat: adiciona seção de benefícios"
git commit -m "fix: corrige toggle de tema"
git commit -m "docs: atualiza README"
```

### Cronograma (15 dias)

- **Dias 1-4**: Frontend base ✅
- **Dias 5-8**: Integrações de pagamento 🚧
- **Dias 9-10**: LGPD + E-mail 🚧
- **Dias 11-12**: Docker + README 🚧
- **Dias 13-14**: QA + Ajustes 🚧
- **Dia 15**: Deploy produção 🚧

## 🤝 Contribuindo

1. Seguir especificação do `site nexus.pdf`
2. Manter padrões de código (TypeScript strict)
3. Testar responsividade (320px → 4K)
4. Garantir acessibilidade (WCAG AA)
5. Lighthouse score ≥ 90

## 📄 Licença

© 2025 Nexus Atemporal. Todos os direitos reservados.

---

**Próximos passos**: Ver [`STATUS_IMPLEMENTACAO.md`](./STATUS_IMPLEMENTACAO.md) para detalhes completos.
