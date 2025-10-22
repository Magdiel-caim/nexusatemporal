# Orientação Sessão A - v114 - Correções NotificaMe

## 🚨 STATUS ATUAL

**Data**: 2025-10-21
**Versão Atual**: v113-notificame-ux
**Status**: ⚠️ COM ERROS - PRECISA CORREÇÃO

---

## ✅ O QUE FOI FEITO NA v113

### Melhorias de UX Implementadas

1. **Mensagem de Configuração Alterada**
   - Antes: "Integração via Revendedor - A chave de API já está configurada"
   - Depois: "Conecte suas Redes Sociais - Conecte aqui suas contas Meta"
   - Arquivo: `frontend/src/components/integrations/NotificaMeConfig.tsx:210-214`

2. **Cards Transformados em Botões**
   - Cards agora são clicáveis
   - Botões "Conectar Instagram" e "Conectar Messenger"
   - Abrem painel NotificaMe: `https://app.notificame.com.br/dashboard`
   - Arquivo: `frontend/src/pages/IntegracoesSociaisPage.tsx:115-177`

3. **Interface Melhorada**
   - Banner central quando não há contas conectadas
   - Cards coloridos (Instagram rosa, Messenger azul)
   - Dark mode completo
   - Arquivo: `frontend/src/components/integrations/NotificaMeConfig.tsx:252-313`

### Deploy Realizado
```bash
Build: nexus-frontend:v113-notificame-ux
Status: ✅ CONVERGED
Rodando: http://one.nexusatemporal.com.br
```

---

## 🐛 ERROS IDENTIFICADOS

### Erro Reportado pelo Usuário
> "fiz um teste mas contém erros"

**Ações Necessárias:**
1. Identificar qual erro ocorreu
2. Verificar logs do frontend
3. Testar fluxo completo de conexão
4. Corrigir problemas encontrados

### Possíveis Causas (a investigar)
- [ ] Integração NotificaMe não configurada no backend
- [ ] API Key incorreta ou não configurada
- [ ] Endpoint do backend retornando erro
- [ ] Problema ao abrir link externo
- [ ] Erro de CORS
- [ ] Problema no componente React

---

## 🔍 DEBUGGING - PRÓXIMA SESSÃO

### Passo 1: Verificar Logs
```bash
# Logs do frontend
docker service logs nexus_frontend --tail 100

# Logs do backend
docker service logs nexus_backend --tail 100 | grep -i notifica

# Verificar erros no navegador
# Acessar: https://one.nexusatemporal.com.br/integracoes-sociais
# Abrir DevTools > Console
```

### Passo 2: Testar Endpoints Backend
```bash
# 1. Fazer login e obter token
TOKEN="SEU_TOKEN_AQUI"

# 2. Testar conexão NotificaMe
curl -X POST https://one.nexusatemporal.com.br/api/notificame/test-connection \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# 3. Listar integrações
curl -X GET https://one.nexusatemporal.com.br/api/automation/integrations \
  -H "Authorization: Bearer $TOKEN"

# 4. Verificar se integração NotificaMe existe
curl -X GET https://one.nexusatemporal.com.br/api/automation/integrations?type=notificame \
  -H "Authorization: Bearer $TOKEN"
```

### Passo 3: Verificar Banco de Dados
```bash
# Conectar ao PostgreSQL
PGPASSWORD=nexus2024@secure psql -h 46.202.144.210 -U nexus_admin -d nexus_crm

# Verificar integrações
SELECT id, name, integration_type, is_active, created_at
FROM integrations
WHERE integration_type = 'notificame';

# Verificar credenciais
SELECT id, name, credentials, config
FROM integrations
WHERE integration_type = 'notificame';
```

### Passo 4: Verificar API Key
```bash
# Verificar se API Key está configurada no backend
grep -r "NOTIFICAME_API_KEY" /root/nexusatemporal/backend/.env
grep -r "0fb8e168-9331-11f0-88f5-0e386dc8b623" /root/nexusatemporal/backend/

# Se não estiver, adicionar ao .env
echo "NOTIFICAME_API_KEY=0fb8e168-9331-11f0-88f5-0e386dc8b623" >> /root/nexusatemporal/backend/.env
```

---

## 🛠️ CORREÇÕES A FAZER

### Cenário 1: API Key Não Configurada

**Solução:**
```typescript
// backend/src/services/NotificaMeService.ts
// Verificar se está pegando a API Key do .env

// backend/src/modules/notificame/notificame.controller.ts
async testConnection(req: Request, res: Response) {
  const apiKey = process.env.NOTIFICAME_API_KEY || '0fb8e168-9331-11f0-88f5-0e386dc8b623';
  const service = new NotificaMeService({ apiKey });
  // ...
}
```

### Cenário 2: Integração Não Criada no Banco

**Solução:**
```sql
-- Criar integração manualmente
INSERT INTO integrations (
  tenant_id,
  name,
  integration_type,
  credentials,
  config,
  is_active,
  created_at
) VALUES (
  1, -- Ajustar tenant_id
  'NotificaMe - Instagram & Messenger',
  'notificame',
  '{"notificame_api_key": "0fb8e168-9331-11f0-88f5-0e386dc8b623"}',
  '{"auto_configure": true, "reseller_mode": true}',
  true,
  NOW()
);
```

### Cenário 3: Endpoint Retornando 404

**Solução:**
```typescript
// Verificar se rotas estão registradas
// backend/src/routes/index.ts
import notificameRoutes from '../modules/notificame/notificame.routes';

router.use('/notificame', notificameRoutes);
```

### Cenário 4: Erro no Frontend

**Solução:**
```typescript
// Adicionar try-catch e logs
const handleConfigure = async () => {
  try {
    console.log('Iniciando configuração NotificaMe...');
    setTesting(true);

    const result = await integrationService.create({...});
    console.log('Resultado:', result);

    toast.success('Integração ativada com sucesso!');
  } catch (error: any) {
    console.error('Erro detalhado:', error);
    console.error('Response:', error.response?.data);
    toast.error('Erro ao ativar integração', {
      description: error.response?.data?.message || error.message,
    });
  } finally {
    setTesting(false);
  }
};
```

---

## 📝 CHECKLIST PRÓXIMA SESSÃO

### Investigação
- [ ] Ler logs do frontend
- [ ] Ler logs do backend
- [ ] Reproduzir erro no navegador
- [ ] Verificar console do navegador
- [ ] Testar endpoints via curl
- [ ] Verificar banco de dados

### Correção
- [ ] Identificar causa raiz
- [ ] Implementar correção
- [ ] Testar localmente
- [ ] Build e deploy
- [ ] Testar em produção
- [ ] Confirmar funcionamento completo

### Validação
- [ ] Ativar integração funciona
- [ ] Botão "Conectar Instagram" abre painel
- [ ] Botão "Conectar Messenger" abre painel
- [ ] Não há erros no console
- [ ] Backend responde corretamente
- [ ] Dark mode funciona

### Documentação
- [ ] Atualizar CHANGELOG com correções
- [ ] Criar release v114
- [ ] Documentar solução do erro
- [ ] Atualizar NOTIFICAME_UX_IMPROVEMENTS_v113.md

---

## 🎯 OBJETIVO FINAL

**Integração NotificaMe 100% Funcional:**
1. Usuário acessa "Redes Sociais"
2. Clica "Ativar Integração" → ✅ Funciona sem erro
3. Vê cards de Instagram e Messenger
4. Clica "Conectar Instagram" → ✅ Abre painel NotificaMe
5. Conecta conta no painel
6. Volta ao sistema → ✅ Vê conta conectada

---

## 📚 ARQUIVOS IMPORTANTES

### Frontend
```
frontend/src/components/integrations/NotificaMeConfig.tsx
frontend/src/pages/IntegracoesSociaisPage.tsx
frontend/src/services/notificaMeService.ts
```

### Backend
```
backend/src/services/NotificaMeService.ts
backend/src/modules/notificame/notificame.controller.ts
backend/src/modules/notificame/notificame.routes.ts
backend/src/routes/index.ts
```

### Documentação
```
NOTIFICAME_INTEGRACAO.md
INTEGRACAO_NOTIFICAME_COMPLETA.md
NOTIFICAME_UX_IMPROVEMENTS_v113.md
TRIGGERS_NOTIFICAME_AUTOMATICOS.md
```

---

## 🚀 COMANDOS ÚTEIS

### Rebuild e Redeploy
```bash
# Frontend
cd /root/nexusatemporal/frontend
npm run build
cd ..
docker build -t nexus-frontend:v114-notificame-fixed -f frontend/Dockerfile frontend/
docker service update --image nexus-frontend:v114-notificame-fixed nexus_frontend

# Backend (se necessário)
cd /root/nexusatemporal
docker build -t nexus-backend:v114-notificame-fixed -f backend/Dockerfile backend/
docker service update --image nexus-backend:v114-notificame-fixed nexus_backend
```

### Verificar Status
```bash
docker service ps nexus_frontend --no-trunc
docker service ps nexus_backend --no-trunc
docker service logs nexus_frontend --tail 50
docker service logs nexus_backend --tail 50
```

### Rollback (se necessário)
```bash
# Voltar para v111 (última versão estável)
docker service update --image nexus-frontend:v111-chat-complete nexus_frontend
```

---

## 💾 BACKUP REALIZADO

```
Data: 2025-10-21
Arquivo: /root/backups/nexus_20251021_sessao_a/
Inclui:
  - Frontend completo
  - Backend completo
  - Banco de dados
  - Documentação
  - .env files
```

---

## 📊 ESTADO DO SISTEMA

### Versões em Produção
```
Frontend: v113-notificame-ux (⚠️ com erros)
Backend: v91-fixed (✅ estável)
Database: PostgreSQL 16
```

### Módulos Funcionando
- ✅ Chat (v111)
- ✅ Leads
- ✅ Vendas
- ✅ Financeiro
- ✅ Estoque
- ✅ Agenda
- ✅ BI
- ⚠️ NotificaMe (precisa correção)

---

## 🎯 PRIORIDADE MÁXIMA

**Corrigir erro do NotificaMe antes de qualquer outra tarefa!**

Usuário reportou erro. Não podemos deixar funcionalidade quebrada em produção.

---

**Preparado para**: Sessão A (próxima)
**Última atualização**: 2025-10-21
**Status**: ⚠️ AGUARDANDO CORREÇÃO
