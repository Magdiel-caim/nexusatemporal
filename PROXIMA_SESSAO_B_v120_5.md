# 📋 PRÓXIMA SESSÃO B - Importante

**Data desta sessão**: 2025-10-23 02:45 UTC
**Status atual**: v120.5-fix-chat-urls (Frontend) + v120.4-ai-integrations (Backend)
**Próxima sessão deve**: Investigar erro persistente de URLs no chat

---

## 🚨 SITUAÇÃO ATUAL

### Problema Reportado:
O usuário informou que **o erro persiste** mesmo após a correção v120.5. URLs de mídias no chat ainda aparecem malformados.

### O Que Foi Feito Nesta Sessão:

1. ✅ **Identificado**: Frontend v120.4 rodava em DEV MODE (`npm run dev`)
2. ✅ **Corrigido**: Rebuild com `Dockerfile.prod` → v120.5-fix-chat-urls
3. ✅ **Deploy**: Nginx production rodando corretamente
4. ✅ **Verificado**: Sistema acessível (HTTP 200)
5. ❌ **Problema persiste** segundo usuário

### Logs Atuais (02:44 UTC):
```
nexus_frontend: HTTP 200 - Serving /chat ✅
nexus_frontend: Nginx 1.29.2 rodando ✅
nexus_frontend: Assets carregando corretamente ✅
```

**MAS**: Usuário relata que erro ainda ocorre (logs não mostram erro no servidor)

---

## 🔍 INVESTIGAÇÃO NECESSÁRIA NA PRÓXIMA SESSÃO

### 1. Verificar Cache do Navegador

**PROVÁVEL CAUSA**: O navegador do usuário pode estar com cache da versão anterior (v120.4 dev mode).

**Ações**:
```bash
# 1. Pedir ao usuário para fazer HARD REFRESH:
# - Chrome/Firefox: Ctrl + Shift + R (Windows) ou Cmd + Shift + R (Mac)
# - Ou abrir DevTools > Network > Disable cache

# 2. Verificar versão dos assets carregados:
curl -s https://one.nexusatemporal.com.br/chat | grep "index-"
# Deve mostrar: /assets/index-0UigDgzX.js (v120.5)
# Se mostrar index diferente, há problema de cache
```

### 2. Verificar Console do Navegador

**Pedir ao usuário screenshot do console com**:
- Aba "Console" - Erros JavaScript
- Aba "Network" - Requisições falhando
- Aba "Network" - Headers da requisição `/chat`

**Procurar por**:
- `useMediaUrl` errors
- `MessageBubble` errors
- Requisições para `/api/chat/media/:messageId` (devem retornar 200)

### 3. Testar Endpoint de Mídia Manualmente

```bash
# Pegar um messageId com mídia
PGPASSWORD=6uyJZdc0xsCe7ymief3x2Izi9QubcTYP docker exec <POSTGRES_CONTAINER> \
  psql -U nexus_admin -d nexus_master \
  -c "SELECT id, LEFT(media_url, 50) FROM chat_messages WHERE media_url IS NOT NULL LIMIT 1;"

# Testar endpoint
curl "https://api.nexusatemporal.com.br/api/chat/media/<MESSAGE_ID>"

# Deve retornar:
# {"success":true,"url":"data:image/...","type":"base64"}  OU
# {"success":true,"url":"https://...X-Amz-Signature...","type":"signed"}
```

### 4. Verificar Código Fonte no Navegador

**Via DevTools > Sources**:
- Procurar por `useMediaUrl.ts` ou `useMediaUrl` no código compilado
- Verificar se a lógica de detecção `data:` está presente
- Verificar se `MessageBubble` está usando o hook

### 5. Verificar Variáveis de Ambiente

```bash
# No container do frontend (se dev mode tivesse voltado)
docker exec <FRONTEND_CONTAINER> env | grep VITE_

# OU verificar build:
docker run --rm nexus-frontend:v120.5-fix-chat-urls env | grep VITE_
```

**Valores esperados**:
```
VITE_API_URL=https://api.nexusatemporal.com.br/api
```

---

## 🐛 POSSÍVEIS CAUSAS DO ERRO PERSISTENTE

### Causa 1: Cache do Navegador (MAIS PROVÁVEL)
- **Sintoma**: Usuário vê versão antiga
- **Solução**: Hard refresh (Ctrl+Shift+R)
- **Como confirmar**: Verificar versão dos assets no Network tab

### Causa 2: Hook `useMediaUrl` Não Está Sendo Usado
- **Sintoma**: Componente não chama o hook
- **Solução**: Verificar `MessageBubble.tsx` linha 32-35
- **Como confirmar**: Console.log no componente

### Causa 3: Endpoint `/chat/media/:messageId` Retorna Erro
- **Sintoma**: Hook chama API mas recebe 404/500
- **Solução**: Verificar logs do backend
- **Como confirmar**: Network tab mostra erro

### Causa 4: CORS ou Mixed Content
- **Sintoma**: Browser bloqueia requisições
- **Solução**: Verificar console do navegador
- **Como confirmar**: Erro de CORS/Mixed Content no console

### Causa 5: URLs Vêm Errados do Backend
- **Sintoma**: Backend retorna URL malformado
- **Solução**: Verificar query SQL em `n8n-webhook.controller.ts:345`
- **Como confirmar**: Testar endpoint diretamente

---

## 📁 ARQUIVOS RELEVANTES

### Frontend (v120.5):

#### `/frontend/src/hooks/useMediaUrl.ts`
**Linhas importantes**:
```typescript
// Linha 37-40: Detecta data URI
if (originalUrl.startsWith('data:')) {
  setUrl(originalUrl);
  setType('base64');
  return;
}

// Linha 46-74: Busca signed URL para S3
if (originalUrl.includes('idrivee2-26.com') || originalUrl.includes('s3')) {
  const { data } = await api.get(`/chat/media/${messageId}`);
  setUrl(data.url);
}
```

#### `/frontend/src/components/chat/MessageBubble.tsx`
**Linhas importantes**:
```typescript
// Linha 32-35: Usa o hook
const { url: signedMediaUrl, loading: loadingMedia, error: mediaError } = useMediaUrl(
  message.id,
  message.mediaUrl
);

// Linha 96: Renderiza imagem
<img src={signedMediaUrl} alt="Imagem" />
```

### Backend (v120.4):

#### `/backend/src/modules/chat/n8n-webhook.controller.ts`
**Linhas importantes**:
```typescript
// Linha 345: Query que retorna mediaUrl
media_url as "mediaUrl",

// Resultado esperado:
// {"mediaUrl": "data:image/png;base64,..."} ✅
// {"mediaUrl": "https://backupsistemaonenexus.o0m5..."} ✅
```

#### `/backend/src/modules/chat/media-proxy.controller.ts`
**Endpoint** (se existe na v120.4 - VERIFICAR!):
```typescript
GET /api/chat/media/:messageId
// Retorna: {"success":true,"url":"...","type":"base64|signed"}
```

⚠️ **IMPORTANTE**: Verificar se `media-proxy.controller.ts` está no backend v120.4!
Se não estiver, o endpoint não existe e o erro faz sentido.

---

## 🔬 SCRIPT DE DIAGNÓSTICO COMPLETO

Copiar e rodar na próxima sessão:

```bash
#!/bin/bash
echo "=== DIAGNÓSTICO CHAT MÍDIA v120.5 ==="
echo ""

echo "1. Verificando versão do frontend:"
docker service inspect nexus_frontend --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}'
echo ""

echo "2. Verificando se é nginx ou dev:"
docker image inspect $(docker service inspect nexus_frontend --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}') --format='{{.Config.Cmd}}'
echo ""

echo "3. Verificando assets servidos:"
curl -s https://one.nexusatemporal.com.br/chat | grep -o 'index-[^.]*\.js'
echo ""

echo "4. Pegando messageId com mídia:"
MSG_ID=$(PGPASSWORD=6uyJZdc0xsCe7ymief3x2Izi9QubcTYP docker exec f30b5d9f37ea psql -U nexus_admin -d nexus_master -t -c "SELECT id FROM chat_messages WHERE media_url IS NOT NULL LIMIT 1;" | tr -d ' ')
echo "MessageID: $MSG_ID"
echo ""

echo "5. Testando endpoint de mídia:"
curl -s "https://api.nexusatemporal.com.br/api/chat/media/$MSG_ID" | jq '.'
echo ""

echo "6. Verificando se media-proxy.controller existe no backend:"
docker exec $(docker ps -q -f name=nexus_backend) ls -la /app/dist/modules/chat/ | grep media
echo ""

echo "7. Verificando logs recentes do frontend:"
docker service logs nexus_frontend --tail 10 --since 5m | grep -i "error\|chat"
echo ""

echo "8. Verificando logs recentes do backend:"
docker service logs nexus_backend --tail 10 --since 5m | grep -i "media\|chat"
echo ""

echo "=== FIM DO DIAGNÓSTICO ==="
```

Salvar como `/root/diagnostico_chat_midia.sh` e rodar:
```bash
chmod +x /root/diagnostico_chat_midia.sh
/root/diagnostico_chat_midia.sh > /root/diagnostico_resultado.txt
cat /root/diagnostico_resultado.txt
```

---

## 🎯 PLANO DE AÇÃO PARA PRÓXIMA SESSÃO

### Passo 1: Reproduzir o Erro (5 min)
1. Pedir ao usuário para:
   - Abrir https://one.nexusatemporal.com.br/chat
   - Fazer Ctrl+Shift+R (hard refresh)
   - Abrir DevTools (F12)
   - Tirar screenshot do console
   - Tirar screenshot da aba Network

### Passo 2: Rodar Diagnóstico (5 min)
```bash
bash /root/diagnostico_chat_midia.sh > /root/diagnostico_resultado.txt
cat /root/diagnostico_resultado.txt
```

### Passo 3: Analisar Resultados (10 min)

**Se endpoint `/chat/media/:messageId` NÃO existe** (404):
- Backend v120.4 não tem o `media-proxy.controller.ts`
- Solução: Deploy do backend v122 (que tem o controller)
- Ou: Remover hook `useMediaUrl` do frontend (revert para v120.4)

**Se endpoint existe mas retorna erro** (500):
- Verificar logs do backend
- Verificar query SQL
- Verificar conexão com banco `nexus_master`

**Se endpoint funciona mas frontend não usa**:
- Cache do navegador (pedir hard refresh)
- Ou código compilado está desatualizado (rebuild necessário)

### Passo 4: Aplicar Correção (15 min)

Dependendo do diagnóstico, escolher uma das soluções:

#### Solução A: Deploy Backend v122 (se endpoint não existe)
```bash
cd /root/nexusatemporal/backend
npm run build
docker build -t nexus-backend:v120.6-media-proxy -f backend/Dockerfile backend/
docker service update --image nexus-backend:v120.6-media-proxy nexus_backend
```

#### Solução B: Revert Frontend (se backend não suporta)
```bash
docker service update --image nexus-frontend:v120.4-ai-integrations nexus_frontend
# Aceitar que mídias não funcionam até backend ser atualizado
```

#### Solução C: Apenas Cache (se tudo está correto)
```bash
# Pedir usuário fazer hard refresh
# Ou limpar cache do Traefik/CDN se houver
```

---

## 📊 ESTADO DO SISTEMA

### Versões Deployadas:
```
Backend:  v120.4-ai-integrations
Frontend: v120.5-fix-chat-urls
Database: PostgreSQL 16 (nexus_master + nexus_crm)
Redis:    7-alpine
RabbitMQ: 3-management-alpine
n8n:      latest
```

### Funcionalidades Operacionais:
- ✅ Login/Autenticação
- ✅ Dashboard
- ✅ Leads/CRM
- ✅ Pipeline
- ✅ Financeiro
- ✅ Estoque
- ✅ Marketing (módulo completo v120)
- ✅ Chat/WhatsApp (listagem de conversas)
- ⚠️ **Chat/WhatsApp (renderização de mídias) - PROBLEMA REPORTADO**
- ✅ Integrações (NotificaMe, OpenAI)

### Serviços Docker:
```bash
$ docker service ls | grep nexus
nexus_backend     1/1   v120.4-ai-integrations ✅
nexus_frontend    1/1   v120.5-fix-chat-urls   ✅
nexus_postgres    1/1   postgres:16-alpine     ✅
nexus_redis       1/1   redis:7-alpine         ✅
nexus_rabbitmq    1/1   rabbitmq:3-mgmt        ✅
```

### Banco de Dados:
- `nexus_crm`:
  - Leads, Users, Pipelines
  - Marketing (bulk_messages, campaigns, etc)
  - Financeiro, Estoque

- `nexus_master`:
  - **chat_messages** (154 mensagens, 60 com mídia)
  - whatsapp_sessions

### Mídias no Banco:
```sql
SELECT message_type, COUNT(*)
FROM chat_messages
WHERE media_url IS NOT NULL
GROUP BY message_type;

-- Resultado:
-- image:    37
-- video:    10
-- ptt:      5
-- audio:    4
-- document: 4
-- TOTAL:    60 mensagens com mídia
```

**Tipos de URL**:
- `data:image/png;base64,...` (4 mensagens) - Base64 inline
- `https://backupsistemaonenexus.o0m5.va.idrivee2-26.com/...` (56 mensagens) - S3

---

## 🔐 INFORMAÇÕES SENSÍVEIS (NÃO COMMITAR)

### Banco de Dados:
```
Host: 46.202.144.210
User: nexus_admin
Pass: nexus2024@secure
DB1:  nexus_crm
DB2:  nexus_master
```

### IDrive S3:
```
Endpoint:  https://o0m5.va.idrivee2-26.com
Bucket:    backupsistemaonenexus
Access:    qFzk5gw00zfSRvj5BQwm
Secret:    bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8
Region:    us-east-1
```

### Containers:
```
Postgres: f30b5d9f37ea (container ID pode mudar)
Backend:  (via docker ps -f name=nexus_backend)
Frontend: (via docker ps -f name=nexus_frontend)
```

---

## 📚 DOCUMENTOS RELACIONADOS

1. **PROXIMA_SESSAO_B_IMPORTANTE.md** - Tentativa v122 que falhou (TypeORM/Marketing)
2. **SESSAO_B_v122_MEDIA_SIGNED_URLS.md** - Implementação v122 (não deployado)
3. **CORRECAO_v120_5_CHAT_URLS.md** - Esta sessão (v120.5)
4. **TESTE_MIDIA_CHAT.md** - Guia de testes
5. **CHANGELOG.md** - Histórico completo

---

## ⚠️ LEMBRETE IMPORTANTE

### NÃO tentar deploy v122 completo sem antes:
1. ✅ Resolver problema de TypeORM multi-database (Marketing)
2. ✅ Testar localmente
3. ✅ Ter plano de rollback pronto

### Se optar por v122 apenas para chat:
- Pode fazer deploy SOMENTE do `media-proxy.controller.ts`
- Adicionar ao backend v120.4 atual
- Build como v120.6-media-proxy
- Evitar quebrar Marketing que está funcionando

---

## 🎯 OBJETIVO DA PRÓXIMA SESSÃO

**PRIORIDADE MÁXIMA**: Fazer mídias do chat funcionarem

**Abordagens possíveis** (escolher com base no diagnóstico):

1. **Abordagem Conservadora**:
   - Aceitar que mídias não funcionam na v120.x
   - Focar em resolver TypeORM do Marketing primeiro
   - Depois fazer deploy completo v122

2. **Abordagem Incremental**:
   - Adicionar APENAS `media-proxy.controller.ts` ao v120.4
   - Build v120.6-media-proxy
   - Deploy apenas backend
   - Frontend v120.5 já está pronto

3. **Abordagem Agressiva**:
   - Corrigir TypeORM do Marketing
   - Deploy v122 completo (backend + já tem frontend)
   - Resolver todos os problemas de uma vez

**Recomendação**: Opção 2 (Incremental) - Menor risco, resolve chat sem quebrar Marketing

---

## 📞 COMANDOS RÁPIDOS

### Ver versões:
```bash
docker service ls | grep nexus
```

### Ver logs em tempo real:
```bash
docker service logs -f nexus_frontend | grep -v "worker process"
docker service logs -f nexus_backend | grep -i "error\|media"
```

### Testar endpoints:
```bash
curl https://api.nexusatemporal.com.br/api/health
curl https://one.nexusatemporal.com.br
```

### Entrar no banco:
```bash
PGPASSWORD=6uyJZdc0xsCe7ymief3x2Izi9QubcTYP \
  docker exec -it f30b5d9f37ea \
  psql -U nexus_admin -d nexus_master
```

### Rollback rápido (se necessário):
```bash
# Frontend
docker service update --image nexus-frontend:v120.1-channels-ui nexus_frontend

# Backend
docker service update --image nexus-backend:v119-final nexus_backend
```

---

**Última atualização**: 2025-10-23 02:45 UTC - Sessão B
**Responsável próxima sessão**: Sessão B (Chat/WhatsApp)
**Tempo estimado**: 30-45 minutos (diagnóstico + correção)
**Dificuldade**: Média (depende do diagnóstico)

---

## ✅ CHECKLIST INICIAL PRÓXIMA SESSÃO

- [ ] Ler este documento completo
- [ ] Pedir usuário abrir DevTools e mostrar erro
- [ ] Rodar script de diagnóstico
- [ ] Identificar causa raiz
- [ ] Escolher abordagem (1, 2 ou 3)
- [ ] Aplicar correção
- [ ] Testar com usuário
- [ ] Atualizar documentação
- [ ] Fazer backup

**BOA SORTE! 🚀**
