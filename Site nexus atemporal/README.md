# Nexus Atemporal - Website

Site institucional do Nexus Atemporal com sistema de vendas integrado.

## 🚀 Deploy

### ✅ Status Atual

**DEPLOYED** - Website rodando em produção!

- **Service**: nexus-website_website
- **Status**: Running (1/1 replicas)
- **Image**: nexus-website:latest
- **Build**: Next.js 15.5.6 com Tailwind CSS v4
- **Traefik**: ✅ Configurado e roteando corretamente
- **HTTPS**: ✅ Funcionando (Let's Encrypt)

### Build da Imagem

```bash
cd "/root/nexusatemporal/Site nexus atemporal"
docker build -t nexus-website:latest -f website/Dockerfile website/
```

### Deploy no Docker Swarm

```bash
docker stack deploy -c docker-compose.yml nexus-website
```

### Verificar Status

```bash
docker service ls | grep website
docker service logs nexus-website_website --tail 50
```

### Testar Acesso

```bash
# Via IP com Host header
curl -k -H "Host: nexusatemporal.com" https://72.60.5.29 -I

# Via domínio (se DNS configurado)
curl -I https://nexusatemporal.com
```

### Atualizar

```bash
# Rebuild
docker build -t nexus-website:latest -f website/Dockerfile website/

# Update service
docker service update --image nexus-website:latest nexus-website_website
```

## 🌐 URLs

- Website: https://nexusatemporal.com
- App: https://app.nexusatemporal.com

## ⚙️ Configuração

### Variáveis de Ambiente

- `NODE_ENV`: production
- `NEXT_PUBLIC_APP_URL`: https://app.nexusatemporal.com
- `NEXT_PUBLIC_API_URL`: https://api.nexusatemporal.com

### DNS

Certifique-se de que o DNS aponta para: `72.60.5.29`

```
nexusatemporal.com       A    72.60.5.29
www.nexusatemporal.com   A    72.60.5.29
app.nexusatemporal.com   A    72.60.5.29
api.nexusatemporal.com   A    72.60.5.29
```

## 📝 Desenvolvimento Local

```bash
cd website
npm install
npm run dev
```

Acesse: http://localhost:3000

## 🎨 Cores da Logo

- Primary (Azul): #0ea5e9
- Secondary (Roxo): #a855f7
- Accent (Laranja): #f97316

## 📦 Estrutura

```
website/
├── app/              # Next.js App Router
│   ├── page.tsx      # Landing Page
│   ├── planos/       # Página de Planos
│   ├── checkout/     # Checkout
│   └── obrigado/     # Pós-compra
├── components/       # Componentes React
├── public/           # Assets estáticos
│   └── logos/        # Logos do Nexus
└── Dockerfile        # Build de produção
```

## ✅ Features Implementadas

### Frontend (Completo)
- ✅ Next.js 15.5.6 com App Router
- ✅ TypeScript
- ✅ Tailwind CSS v4
- ✅ Dark/Light Mode (next-themes)
- ✅ Responsive Design
- ✅ SEO Otimizado
- ✅ Docker Ready
- ✅ Traefik Integration
- ✅ Landing Page completa
- ✅ Página de Planos (4 tiers)
- ✅ Página de Checkout (mockup)
- ✅ Página de Agradecimento
- ✅ Componentes modulares reutilizáveis
- ✅ Cores da logo Nexus Atemporal

## 🔄 Próximas Etapas

### 1. Verificar DNS
- Confirmar que o domínio `nexustemporal.com.br` aponta para `72.60.5.29`
- Testar acesso público ao site

### 2. Integração Backend (Pendente)
- [ ] Criar endpoints de API para registro de clientes
- [ ] Integrar checkout com backend do Nexus
- [ ] Criar tenant automaticamente no banco
- [ ] Gerar credenciais de acesso
- [ ] Enviar email de boas-vindas

### 3. Payment Gateways (Pendente)
- [ ] Integração com PagBank
- [ ] Integração com Stripe
- [ ] Webhook handlers para confirmação de pagamento

### 4. Email (Parcialmente Configurado)
- [ ] Integrar com SendGrid
- [ ] Templates de email (boas-vindas, confirmação, etc.)
- ✅ SMTP já configurado no backend

### 5. Trial Management
- [ ] Sistema de trial de 10 dias (sem cartão)
- [ ] Notificações de expiração
- [ ] Upgrade/downgrade de planos

### 6. Add-ons
- [ ] Sistema de compra de add-ons
- [ ] Ativação automática no tenant
