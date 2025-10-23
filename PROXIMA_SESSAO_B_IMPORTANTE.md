# ⚠️ IMPORTANTE - Próxima Sessão B

**Data**: 2025-10-22 23:07
**Status**: Sistema em ROLLBACK (v119 backend + v120.1 frontend)

---

## 🚨 O QUE ACONTECEU

### Tentativa de Deploy v122 (Signed URLs)
✅ **Funcionalidade implementada COM SUCESSO**:
- MediaProxyController (signed URLs do S3)
- Hook useMediaUrl() no frontend
- MessageBubble atualizado

❌ **Problema encontrado NO DEPLOY**:
- **Marketing Module quebrou** (erro 500)
- **Causa**: TypeORM tentando buscar tabelas de marketing (`bulk_messages`, `marketing_campaigns`) no banco errado
- **Tabelas existem** no `nexus_crm` mas TypeORM não está encontrando

---

## 🔧 ERRO TÉCNICO DETALHADO

### Sintoma
```
QueryFailedError: relation "bulk_messages" does not exist
QueryFailedError: relation "marketing_campaigns" does not exist
QueryFailedError: relation "landing_pages" does not exist
```

### Verificação
```sql
-- nexus_crm (CORRETO - tabelas existem aqui)
SELECT tablename FROM pg_tables WHERE tablename LIKE 'bulk_%';
-- bulk_messages ✅
-- bulk_message_contacts ✅
-- bulk_message_recipients ✅

SELECT tablename FROM pg_tables WHERE tablename LIKE 'market%';
-- marketing_campaigns ✅
-- marketing_integrations ✅
-- marketing_audit_log ✅
```

### Causa Raiz
O sistema tem **DUAS conexões de banco**:
1. **Chat Database** (`nexus_master`) - para `chat_messages`, `whatsapp_sessions`
2. **CRM Database** (`nexus_crm`) - para `leads`, `users`, `pipelines`, **MARKETING**

**Problema**: As entities de Marketing (BulkMessage, Campaign, etc) do v122 não estão usando o DataSource correto (`AppDataSource`) que conecta em `nexus_crm`.

---

## 🔄 AÇÃO TOMADA

### Rollback para versões estáveis:
```bash
# Backend
docker service update --image nexus-backend:v119-final nexus_backend

# Frontend
docker service update --image nexus-frontend:v120.1-channels-ui nexus_frontend
```

### Status Atual:
- ✅ Backend v119-final: FUNCIONANDO
- ✅ Frontend v120.1: FUNCIONANDO
- ✅ Marketing: FUNCIONANDO
- ✅ Chat: FUNCIONANDO
- ❌ Signed URLs de mídia: NÃO DISPONÍVEL (código v122 não deployado)

---

## 📋 CÓDIGO V122 (PRONTO MAS NÃO DEPLOYADO)

### Arquivos criados/modificados:

#### Backend
- ✅ `/backend/src/modules/chat/media-proxy.controller.ts` - Controller para signed URLs
- ✅ `/backend/src/modules/chat/chat.routes.ts` - Rotas /api/chat/media/:messageId
- ✅ Correções TypeScript em marketing.controller.ts, n8n-webhook.controller.ts

#### Frontend
- ✅ `/frontend/src/hooks/useMediaUrl.ts` - Hook React para buscar signed URLs
- ✅ `/frontend/src/components/chat/MessageBubble.tsx` - Componente atualizado

### Documentação
- ✅ `TESTE_MIDIA_CHAT.md` - Guia de teste
- ✅ `SESSAO_B_v122_MEDIA_SIGNED_URLS.md` - Documentação completa
- ✅ `PROXIMA_SESSAO_B_IMPORTANTE.md` - Este arquivo

---

## ❌ O QUE PRECISA SER CORRIGIDO ANTES DE DEPLOY V122

### Problema 1: TypeORM e Múltiplos Bancos

**Verificar**:
```typescript
// backend/src/modules/marketing/entities/*.entity.ts
// TODAS as entities de Marketing devem ter:
@Entity('table_name', { database: 'nexus_crm' }) // OU
@Entity('table_name') // e AppDataSource deve apontar para nexus_crm
```

**OU**:

Criar DataSource separado para Marketing:
```typescript
// backend/src/database/marketing-data-source.ts
export const MarketingDataSource = new DataSource({
  type: 'postgres',
  host: process.env.CRM_DB_HOST,
  port: 5432,
  username: process.env.CRM_DB_USER,
  password: process.env.CRM_DB_PASSWORD,
  database: 'nexus_crm',
  entities: [/* Marketing entities */],
});
```

### Problema 2: Erro Mixed Content (HTTPS)

**Logs do navegador mostram**:
```
Mixed Content: The page at 'https://one.nexusatemporal.com.br/chat' was loaded over HTTPS,
but requested an insecure XMLHttpRequest endpoint 'http://nexus.backend:3001/chat/conversations/'.
This request has been blocked.
```

**Solução**:
- Frontend está tentando fazer requests HTTP em página HTTPS
- Verificar se variáveis de ambiente estão corretas
- Garantir que `VITE_API_URL` aponta para HTTPS

---

## ✅ COMO PROCEDER NA PRÓXIMA SESSÃO

### Opção 1: Corrigir e Re-Deploy v122 (RECOMENDADO)

1. **Investigar configuração TypeORM**:
   ```bash
   # Verificar qual DataSource as entities de Marketing estão usando
   grep -r "AppDataSource" backend/src/modules/marketing/
   grep -r "@Entity" backend/src/modules/marketing/entities/
   ```

2. **Corrigir conexão de banco**:
   - Garantir que Marketing usa `AppDataSource` (nexus_crm)
   - OU criar `MarketingDataSource` dedicado

3. **Testar localmente ANTES de deploy**:
   ```bash
   npm run dev
   # Testar: curl http://localhost:3001/api/marketing/campaigns
   ```

4. **Deploy gradual**:
   ```bash
   # Apenas backend primeiro
   docker build -t nexus-backend:v122-fixed
   docker service update --image nexus-backend:v122-fixed nexus_backend

   # Verificar logs
   docker service logs nexus_backend --tail 50

   # Se OK, frontend depois
   docker build -t nexus-frontend:v122-fixed
   docker service update --image nexus-frontend:v122-fixed nexus_frontend
   ```

### Opção 2: Manter v119/v120.1 e Adiar Signed URLs

- Sistema está estável
- Mídias funcionam (mas podem ter 403 no S3)
- Priorizar outras funcionalidades
- Retomar signed URLs depois

---

## 🔍 DIAGNÓSTICO RÁPIDO

### Verificar estado atual:
```bash
docker service ls | grep nexus
# nexus_backend: v119-final
# nexus_frontend: v120.1-channels-ui

curl https://api.nexusatemporal.com.br/api/health
# {"status":"ok"}

curl https://one.nexusatemporal.com.br | grep title
# <title>One Nexus Atemporal</title>
```

### Se v122 for deployado novamente e quebrar:
```bash
# Rollback imediato
docker service update --image nexus-backend:v119-final nexus_backend
docker service update --image nexus-frontend:v120.1-channels-ui nexus_frontend

# Verificar
sleep 10
curl https://api.nexusatemporal.com.br/api/health
```

---

## 📊 TABELAS DE MARKETING (REFERÊNCIA)

### Localização: `nexus_crm` database

```sql
-- Verificar
PGPASSWORD=nexus2024@secure psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "\dt"

-- Tabelas existentes:
bulk_messages
bulk_message_contacts
bulk_message_recipients
marketing_campaigns
marketing_integrations
marketing_audit_log
campaign_metrics
landing_pages (possivelmente)
```

---

## 🎯 PRÓXIMAS PRIORIDADES

### Imediato
- [ ] Entender configuração TypeORM e múltiplos bancos
- [ ] Corrigir entities de Marketing
- [ ] Testar v122 em ambiente de dev
- [ ] Deploy v122 corrigido

### Curto Prazo (Chat/WhatsApp)
- [ ] Testar renderização de mídias (v119 atual)
- [ ] Implementar Avatar via WAHA API
- [ ] Buscar nome real do contato
- [ ] Lightbox para imagens

### Médio Prazo
- [ ] Migração completa TypeORM (chat_messages → messages)
- [ ] Upload de mídia pelo frontend
- [ ] Renovação automática de signed URLs

---

## 💡 LIÇÕES APRENDIDAS

1. **Sempre testar em dev ANTES de prod**
2. **Múltiplos bancos de dados = complexidade**
3. **TypeORM precisa de configuração explícita para múltiplos DBs**
4. **Rollback precisa ser rápido e documentado**
5. **Manter versões estáveis taggeadas no Docker**

---

## 📞 COMANDOS ÚTEIS

### Ver qual banco está sendo usado:
```bash
docker service logs nexus_backend --tail 20 | grep "Database connected"
```

### Testar conexão com banco CRM:
```bash
PGPASSWORD=nexus2024@secure psql -h 46.202.144.210 -U nexus_admin -d nexus_crm -c "SELECT COUNT(*) FROM bulk_messages;"
```

### Ver erro específico de Marketing:
```bash
docker service logs nexus_backend --tail 200 | grep -A10 "marketing/campaigns"
```

---

## ✅ CHECKLIST ANTES DE PRÓXIMO DEPLOY

- [ ] Código compila sem erros TypeScript
- [ ] Entities apontam para banco correto
- [ ] Testado em ambiente dev
- [ ] Backup das versões atuais
- [ ] Plano de rollback pronto
- [ ] Monitoramento de logs durante deploy

---

**IMPORTANTE**: NÃO fazer deploy direto do v122 sem corrigir o problema de TypeORM!

**Última atualização**: 2025-10-22 23:07 - Sessão B
**Versões em produção**: Backend v119-final | Frontend v120.1-channels-ui
