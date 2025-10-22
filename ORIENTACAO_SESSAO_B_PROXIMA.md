# 🎯 Orientações para Próxima Sessão B

**Data**: 2025-10-22
**Sessão Anterior**: Sessão A - OAuth NotificaMe + n8n
**Status Sistema**: ⚠️ FORA DO AR (erros da Sessão C)
**Branch Atual**: `feature/automation-backend`
**Último Commit**: `b698264`

---

## ⚠️ SITUAÇÃO ATUAL

### Sistema Fora do Ar
- **Causa**: Erros cometidos pela Sessão C
- **Status**: Sistema inoperante
- **Prioridade**: CRÍTICA - Restaurar sistema primeiro

### O Que a Sessão A Fez
- ✅ Implementou fluxo OAuth NotificaMe (v116-v118)
- ✅ Criou workflow n8n completo para OAuth Instagram/Messenger
- ✅ Documentação completa (3 guias, 8000+ linhas)
- ✅ Frontend com popup OAuth (não funcionou pois API NotificaMe não tem endpoints)
- ✅ Solução alternativa com n8n + HTTP Request nodes

### O Que NÃO Foi Feito
- ❌ Testar endpoints OAuth da API NotificaMe (incompleto)
- ❌ Montar workflow real no n8n (falta usuário fazer)
- ❌ Deploy da solução OAuth (sistema fora)
- ❌ Integração final Nexus CRM + n8n

---

## 🚨 PRIORIDADE #1: RESTAURAR SISTEMA

### Passo 1: Investigar Erros da Sessão C

```bash
# Verificar logs do backend
docker service logs nexus_backend --tail 100 --since 30m

# Verificar logs do frontend
docker service logs nexus_frontend --tail 50 --since 30m

# Verificar status dos serviços
docker service ls

# Ver tasks falhadas
docker service ps nexus_backend --no-trunc
docker service ps nexus_frontend --no-trunc
```

### Passo 2: Identificar Problema

**Possíveis causas**:
1. Migration SQL com erro
2. Import circular no código
3. Entity com problema no TypeORM
4. Rota duplicada
5. Variável de ambiente faltando

**Arquivos que Sessão C mexeu** (verificar):
```bash
# Ver últimos commits da Sessão C
git log --oneline --author="Sessão C" -10

# Ver arquivos modificados
git diff HEAD~5 --name-only

# Verificar migrations recentes
ls -lah backend/src/database/migrations/
```

### Passo 3: Reverter Se Necessário

**Opção A**: Reverter para último commit estável
```bash
# Ver histórico
git log --oneline -20

# Reverter para commit da Sessão B v115
git checkout e8e9fdc  # ou commit estável anterior

# Rebuild e redeploy
docker build -t nexus-backend:v115-stable -f backend/Dockerfile backend/
docker service update --image nexus-backend:v115-stable nexus_backend
```

**Opção B**: Corrigir erros da Sessão C
```bash
# Verificar arquivos com problema
# Corrigir erro específico
# Rebuild e redeploy
```

### Passo 4: Validar Sistema Funcionando

```bash
# Testar backend
curl https://api.nexusatemporal.com.br/health

# Testar frontend
curl https://one.nexusatemporal.com.br

# Testar login
# Acessar https://one.nexusatemporal.com.br/login
```

---

## 🔄 PRIORIDADE #2: CONTINUAR TRABALHO OAUTH NOTIFICAME

**APÓS** sistema estar funcionando, continuar OAuth NotificaMe.

### Estado do Trabalho OAuth

#### ✅ O Que Está Pronto

1. **Documentação Completa**:
   - `NOTIFICAME_N8N_OAUTH_GUIA_COMPLETO.md` (2800+ linhas)
   - `n8n-workflows/GUIA_VISUAL_MONTAR_WORKFLOW.md` (3500+ linhas)
   - `n8n-workflows/notificame-oauth-instagram.json` (workflow JSON)

2. **Backend Preparado**:
   - Controller com métodos OAuth (não testados)
   - Rotas OAuth configuradas
   - Service com métodos OAuth

3. **Frontend Preparado**:
   - Componente NotificaMeConfig atualizado
   - Service com métodos OAuth
   - Página de callback criada

#### ❌ O Que Falta Fazer

1. **Testar Endpoints NotificaMe API**:
```bash
# Testar se API NotificaMe tem OAuth
curl -X GET "https://app.notificame.com.br/api/oauth/authorize" \
  -H "apikey: 0fb8e168-9331-11f0-88f5-0e386dc8b623"

# Se retornar 404, testar alternativas:
curl -X GET "https://app.notificame.com.br/api/connect/instagram" \
  -H "apikey: 0fb8e168-9331-11f0-88f5-0e386dc8b623"

curl -X GET "https://app.notificame.com.br/api/channels/instagram/authorize" \
  -H "apikey: 0fb8e168-9331-11f0-88f5-0e386dc8b623"
```

2. **Montar Workflow n8n**:
   - Seguir guia: `n8n-workflows/GUIA_VISUAL_MONTAR_WORKFLOW.md`
   - Criar 9 nodes conforme documentado
   - Ativar workflow
   - Copiar URLs dos webhooks

3. **Configurar Variáveis de Ambiente**:
```bash
# Adicionar no backend
N8N_BASE_URL=https://seu-n8n.com
N8N_WEBHOOK_OAUTH_START=/webhook/notificame-oauth-start
N8N_WEBHOOK_OAUTH_CALLBACK=/webhook/notificame-oauth-callback
```

4. **Testar Fluxo Completo**:
```bash
# Testar webhook n8n
curl -X POST https://seu-n8n.com/webhook/notificame-oauth-start \
  -H "Content-Type: application/json" \
  -d '{"platform": "instagram", "tenantId": 1, "userId": 1}'

# Deve retornar authUrl do Instagram
# Abrir URL no navegador e testar OAuth
```

5. **Deploy Final**:
```bash
# Build v119 (após testes)
docker build -t nexus-backend:v119-oauth-final -f backend/Dockerfile backend/
docker build -t nexus-frontend:v119-oauth-final -f frontend/Dockerfile frontend/

# Deploy
docker service update --image nexus-backend:v119-oauth-final nexus_backend
docker service update --image nexus-frontend:v119-oauth-final nexus_frontend
```

---

## 📁 ARQUIVOS IMPORTANTES CRIADOS (Sessão A)

### Documentação
```
NOTIFICAME_N8N_OAUTH_GUIA_COMPLETO.md
├─ Instalação node n8n
├─ Configuração credenciais
├─ Código completo backend
├─ Código completo frontend
└─ Testes e troubleshooting

n8n-workflows/GUIA_VISUAL_MONTAR_WORKFLOW.md
├─ 9 nodes explicados passo a passo
├─ Código JavaScript/JSON/HTML
├─ Configuração autenticação
├─ Diagramas visuais
└─ FAQ completo

n8n-workflows/notificame-oauth-instagram.json
└─ Workflow JSON pronto para importar
```

### Código Backend
```
backend/src/modules/notificame/
├─ notificame.controller.ts
│  ├─ startOAuth() [NOVO - NÃO TESTADO]
│  └─ completeOAuth() [NOVO - NÃO TESTADO]
├─ notificame.routes.ts
│  ├─ POST /oauth/start [NOVO]
│  └─ POST /oauth/complete [NOVO]
└─ NotificaMeService.ts
   ├─ createInstance() [NÃO FUNCIONA - API não tem]
   ├─ getAuthorizationUrl() [NÃO FUNCIONA - API não tem]
   └─ processOAuthCallback() [NÃO FUNCIONA - API não tem]
```

### Código Frontend
```
frontend/src/
├─ services/notificaMeService.ts
│  └─ startOAuth() [NOVO - NÃO TESTADO]
├─ components/integrations/NotificaMeConfig.tsx
│  └─ handleConnectPlatform() [ATUALIZADO - usa n8n]
└─ pages/NotificaMeCallbackPage.tsx [CRIADO]
```

---

## 🎯 DECISÕES TÉCNICAS IMPORTANTES

### Por Que Usar n8n?

**Problema**: API NotificaMe não tem endpoints OAuth públicos
- ❌ `/api/instances` → 404
- ❌ `/api/instances/create` → 404
- ❌ `/api/oauth/authorize` → 404 (a confirmar)

**Solução**: Usar n8n como proxy/middleware
1. Nexus CRM chama webhook n8n
2. n8n chama API NotificaMe (revendedor tem acesso especial?)
3. n8n gerencia fluxo OAuth
4. n8n notifica Nexus quando completa

### Node NotificaMe Hub

**Não usa o node** NotificaMe Hub para OAuth porque:
- ❌ Não tem action "Conectar Instagram"
- ❌ Não tem action "Autorizar conta"
- ✅ Só tem actions para enviar mensagens
- ✅ "Custom API Call" redireciona para HTTP Request

**Usa HTTP Request** nativo do n8n:
- ✅ Autenticação Header Auth (apikey)
- ✅ Controle total sobre endpoints
- ✅ Pode testar endpoints alternativos

### Modelo de Revenda

**Cliente NÃO tem conta NotificaMe**:
- Cliente é usuário final do Nexus CRM
- Você (revendedor) tem conta NotificaMe
- Cliente conecta SUA conta Instagram
- NotificaMe (via sua revenda) gerencia conexão

**Fluxo**:
```
Cliente → Nexus CRM → n8n → NotificaMe API (sua conta) → Instagram OAuth
```

---

## 📊 COMMITS DA SESSÃO A

```
85e15a6 - feat(notificame): Implementa fluxo OAuth Instagram/Messenger - v116
16bb202 - fix(notificame): Ajusta fluxo para usar painel NotificaMe - v117
4aaa8be - docs(notificame): Adiciona workflow n8n e guia completo - v118
b698264 - docs(n8n): Adiciona guia visual completo workflow - v118
```

---

## ⚠️ ALERTAS IMPORTANTES

### 1. Sistema Fora - Não Deploy Nada!
**NÃO** faça deploy de OAuth enquanto sistema estiver fora.
Primeiro restaure o sistema, depois continue OAuth.

### 2. Endpoints NotificaMe Desconhecidos
**NÃO SABEMOS** se API NotificaMe tem endpoints OAuth.
Precisa testar primeiro antes de montar workflow.

### 3. n8n Pode Não Funcionar
Se API NotificaMe não tiver OAuth, **terá que**:
- Contatar suporte NotificaMe
- Pedir documentação de API para revendedores
- Verificar se tem painel de revendedor diferente

### 4. Código Backend/Frontend Não Testado
Todo código OAuth (v116-v118) foi escrito mas **NÃO TESTADO**.
Pode ter bugs. Testar bem antes de usar em produção.

### 5. Versões Deployadas Atualmente

**Backend**: Pode estar em versão com erro (Sessão C)
**Frontend**: Pode estar em versão com erro (Sessão C)

Verificar qual versão está rodando:
```bash
docker service ps nexus_backend --no-trunc | head -5
docker service ps nexus_frontend --no-trunc | head -5
```

---

## 🔧 COMANDOS ÚTEIS

### Restaurar Sistema
```bash
# Ver serviços
docker service ls

# Ver tasks falhadas
docker service ps nexus_backend --no-trunc
docker service ps nexus_frontend --no-trunc

# Logs
docker service logs nexus_backend --tail 100
docker service logs nexus_frontend --tail 50

# Rollback se necessário
docker service rollback nexus_backend
docker service rollback nexus_frontend

# Ou reverter para commit específico
git checkout <commit-hash>
# Rebuild e redeploy
```

### Verificar Branch e Commits
```bash
# Branch atual
git branch

# Últimos commits
git log --oneline -20

# Ver mudanças não commitadas
git status

# Ver diff
git diff
```

### Testar NotificaMe API
```bash
# API Key
API_KEY="0fb8e168-9331-11f0-88f5-0e386dc8b623"

# Testar endpoints
curl -X GET "https://app.notificame.com.br/api/me" \
  -H "apikey: $API_KEY"

curl -X GET "https://app.notificame.com.br/api/oauth/authorize" \
  -H "apikey: $API_KEY"

curl -X GET "https://app.notificame.com.br/api/instances" \
  -H "apikey: $API_KEY"
```

---

## 📋 CHECKLIST SESSÃO B

### Fase 1: Restaurar Sistema (URGENTE!)
- [ ] Verificar logs de erro
- [ ] Identificar causa do problema
- [ ] Reverter ou corrigir erro
- [ ] Rebuild e redeploy
- [ ] Testar sistema funcionando
- [ ] Validar login e módulos principais

### Fase 2: Continuar OAuth (Após sistema OK)
- [ ] Ler documentação completa (3 guias)
- [ ] Testar endpoints API NotificaMe
- [ ] Montar workflow n8n (9 nodes)
- [ ] Testar workflow com cURL
- [ ] Configurar env vars no backend
- [ ] Testar fluxo completo
- [ ] Deploy se funcionar

### Fase 3: Limpar Branch (Opcional)
- [ ] Decidir se mantém código OAuth (v116-v118)
- [ ] Se API não tiver OAuth, remover código
- [ ] Se API tiver OAuth, testar e validar
- [ ] Merge para main se tudo OK

---

## 💡 DICAS

1. **Priorize restaurar sistema** antes de continuar OAuth
2. **Teste endpoints API** NotificaMe antes de perder tempo
3. **Contate suporte NotificaMe** se API não tiver OAuth
4. **Use documentação criada** - está completa e detalhada
5. **Não tenha pressa** - OAuth é complexo, teste bem

---

## 📞 CONTATOS ÚTEIS

**NotificaMe Suporte**:
- Site: https://app.notificame.com.br
- Email: suporte@notificame.com.br (verificar)

**n8n Community**:
- GitHub: https://github.com/oriondesign2015/n8n-nodes-notificame-hub
- Issues: Reportar problemas lá

---

## 📝 NOTAS FINAIS

### O Que Funcionou
- ✅ Documentação completa e detalhada
- ✅ Workflow n8n bem estruturado
- ✅ Código backend/frontend organizado

### O Que Não Funcionou
- ❌ API NotificaMe não tem endpoints OAuth públicos
- ❌ Community node não tem actions para conectar contas
- ❌ Não conseguimos testar (sistema fora)

### Recomendação
**ANTES** de continuar OAuth:
1. Restaure o sistema
2. Teste se API NotificaMe tem OAuth
3. Se não tiver, contate suporte NotificaMe
4. Só continue se confirmar que é possível

**NÃO** gaste tempo implementando se API não suportar!

---

**Criado por**: Claude Code - Sessão A
**Para**: Sessão B (próxima)
**Data**: 2025-10-22 14:30 UTC
**Status**: ⚠️ SISTEMA FORA - RESTAURAR PRIMEIRO!
**Branch**: feature/automation-backend
**Commit**: b698264

---

> "Primeiro restaure o sistema, depois continue o OAuth. Prioridades claras!"
> — Sessão A, 2025-10-22
