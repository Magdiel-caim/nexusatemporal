# 🎯 ORIENTAÇÃO PARA PRÓXIMA SESSÃO - v125.1

**Data desta Orientação**: 01/11/2025 05:40
**Versão Atual**: v125.1-atemporal-fix
**Próximo Objetivo**: Tornar Chat 100% Funcional

---

## 📊 SITUAÇÃO ATUAL DO SISTEMA

### ✅ Módulos Funcionando 100%:
- Dashboard
- Leads
- Agenda
- Prontuários
- Pacientes (v1.21)
- Financeiro
- Vendas
- Estoque
- BI & Analytics
- Marketing
- Redes Sociais
- API Keys (v1.22)

### ⚠️ Módulo Parcialmente Funcional:
- **Chat**: 40% - UI funciona, mas integração WAHA está incompleta

---

## 🔴 FOCO DA PRÓXIMA SESSÃO: MÓDULO DE CHAT

### Objetivo Principal
**Tornar o Chat 100% funcional** corrigindo a integração com WAHA para:
1. Mostrar conversas existentes
2. Permitir envio de mensagens
3. Importar contatos
4. Corrigir bugs visuais

---

## 📁 DOCUMENTAÇÃO DISPONÍVEL

### 1. Status Detalhado do Chat
**Arquivo**: `/root/nexusatemporalv1/CHAT_STATUS_E_PENDENCIAS_v125.1.md`

**O que contém**:
- ✅ Análise completa de todos os problemas
- ✅ Screenshots dos bugs (em `/root/nexusatemporalv1/prompt/`)
- ✅ Localização exata do código com problemas (arquivo:linha)
- ✅ Soluções propostas com código pronto
- ✅ Checklist de tarefas
- ✅ Comandos para debugging
- ✅ Endpoints para testar

**LEIA ESTE ARQUIVO ANTES DE COMEÇAR!**

### 2. Remoção do Chatwoot
**Arquivo**: `/root/nexusatemporalv1/REMOCAO_CHATWOOT_01112025.md`

**O que contém**:
- Lista de arquivos removidos
- Verificações realizadas
- Estado final do sistema limpo

**Contexto**: Tentativa de integração com Chatwoot (v126-v127.1) foi abortada e sistema restaurado para v125.1

### 3. CHANGELOG Atualizado
**Arquivo**: `/root/nexusatemporalv1/CHANGELOG.md`

**Contém histórico completo**:
- v125.1: Limpeza Chatwoot + Documentação
- v125: Correções do Chat (filtros, nomes)
- v124: Restauração do Chat
- v123: API Pública de Leads
- v122: Sistema de API Keys
- v121: Módulo de Pacientes

---

## 🎯 TAREFAS PRIORIZADAS PARA PRÓXIMA SESSÃO

### 🔴 CRÍTICO - FAZER PRIMEIRO (Ordem de Execução)

#### Tarefa 1: Fazer Mensagens Aparecerem
**Tempo Estimado**: 1-2 horas

**Passos**:
1. Verificar variáveis de ambiente WAHA no backend:
   ```bash
   docker service inspect nexus_backend --format '{{json .Spec.TaskTemplate.ContainerSpec.Env}}' | jq | grep -i waha
   ```

2. Verificar se WAHA está acessível:
   ```bash
   curl http://<WAHA_URL>/api/sessions
   ```

3. Implementar `getConversations()` no backend:
   - **Arquivo**: `backend/src/modules/chat/waha-session.service.ts`
   - **Código**:
   ```typescript
   async getConversations(sessionName: string) {
     const response = await axios.get(
       `${this.wahaUrl}/api/sessions/${sessionName}/chats`
     );
     return response.data;
   }
   ```

4. Modificar `listConversations()` no controller:
   - **Arquivo**: `backend/src/modules/chat/chat.controller.ts`
   - **Código**:
   ```typescript
   async listConversations(req, res) {
     const { sessionName } = req.query;

     // 1. Buscar do WAHA
     const wahaConversations = await this.wahaService.getConversations(sessionName);

     // 2. Salvar/atualizar no banco
     for (const conv of wahaConversations) {
       await this.conversationService.saveOrUpdate(conv);
     }

     // 3. Retornar conversas
     const conversations = await this.conversationService.findAll();
     res.json(conversations);
   }
   ```

5. Testar endpoint:
   ```bash
   curl https://api.nexusatemporal.com.br/api/chat/conversations
   ```

6. Verificar logs:
   ```bash
   docker service logs nexus_backend --tail 50 | grep -i "conversation"
   ```

**Critério de Sucesso**: Conversas aparecem na interface

#### Tarefa 2: Fazer Envio de Mensagens Funcionar
**Tempo Estimado**: 45 minutos

**Passos**:
1. Verificar endpoint atual:
   ```bash
   curl -X POST https://api.nexusatemporal.com.br/api/chat/send \
     -H "Content-Type: application/json" \
     -d '{"sessionName":"atemporal","chatId":"123","text":"teste"}'
   ```

2. Implementar integração WAHA:
   - **Arquivo**: `backend/src/modules/chat/chat.controller.ts`
   - **Código**:
   ```typescript
   async sendMessage(req, res) {
     const { sessionName, chatId, text } = req.body;

     // Enviar via WAHA
     const response = await axios.post(
       `${this.wahaUrl}/api/sendText`,
       {
         session: sessionName,
         chatId: chatId,
         text: text
       }
     );

     // Salvar mensagem no banco
     const message = await this.messageService.save({
       conversationId: chatId,
       content: text,
       fromMe: true,
       timestamp: new Date()
     });

     res.json(message);
   }
   ```

3. Testar envio no frontend

**Critério de Sucesso**: Mensagem é enviada e aparece no WhatsApp

#### Tarefa 3: Corrigir Nome "Atemporal" no Modal
**Tempo Estimado**: 15 minutos

**Passos**:
1. Abrir arquivo:
   - **Arquivo**: `frontend/src/components/chat/WhatsAppConnectionPanel.tsx`

2. Localizar input "Nome da Conexão" (aproximadamente linha 400-500)

3. Adicionar state e effect:
   ```typescript
   const [sessionName, setSessionName] = useState('');

   useEffect(() => {
     if (selectedActiveSession) {
       setSessionName(selectedActiveSession.friendlyName || selectedActiveSession.name || '');
     }
   }, [selectedActiveSession]);
   ```

4. Atualizar input:
   ```typescript
   <input
     type="text"
     value={sessionName}
     onChange={(e) => setSessionName(e.target.value)}
     placeholder="Ex: whatsapp_comercial"
   />
   ```

**Critério de Sucesso**: Campo pré-preenche com "Atemporal" ao selecionar sessão ativa

### 🟡 IMPORTANTE - FAZER DEPOIS

#### Tarefa 4: Implementar Importação de Contatos
**Tempo Estimado**: 1 hora

**Passos**:
1. Criar endpoint `GET /api/chat/contacts`
2. Buscar contatos do WAHA: `GET /api/sessions/{session}/contacts`
3. Salvar no banco TypeORM
4. Associar com conversas

#### Tarefa 5: Sincronização Automática
**Tempo Estimado**: 2 horas

**Passos**:
1. Criar job que roda a cada 5 minutos
2. Buscar novas mensagens do WAHA
3. Atualizar banco local
4. Emitir eventos via WebSocket para atualizar UI

---

## 🐛 PROBLEMAS CONHECIDOS (Com Screenshots)

### Problema 1: Conversas Não Aparecem
**Screenshot**: `/root/nexusatemporalv1/prompt/Captura de tela 2025-11-01 023009.png`

**Descrição Visual**:
- Tela mostra "Nenhuma conversa encontrada"
- Canais aparecem com "0 conversas"
- Área central: "Selecione uma conversa"

**Causa**: Backend não busca conversas do WAHA

### Problema 2: Nome não Pré-preenche
**Screenshot**: `/root/nexusatemporalv1/prompt/Captura de tela 2025-11-01 023036.png`

**Descrição Visual**:
- Modal "Conectar WhatsApp" aberto
- Lista "Conexões Ativas" mostra "Atemporal" ✅
- Campo "Nome da Conexão" mostra placeholder "Ex: whatsapp_comercial" ❌
- **Deveria mostrar**: "Atemporal" pré-preenchido

**Causa**: Input não busca `friendlyName` da sessão selecionada

---

## 🔧 COMANDOS ÚTEIS PARA DEBUG

### Verificar Serviços
```bash
# Status dos serviços
docker service ls

# Logs do backend
docker service logs nexus_backend --tail 100 -f

# Logs filtrados
docker service logs nexus_backend -f | grep -i "chat\|conversation\|message"
```

### Testar APIs
```bash
# Listar sessões (deve funcionar)
curl https://api.nexusatemporal.com.br/api/chat/sessions

# Listar canais (deve funcionar)
curl https://api.nexusatemporal.com.br/api/chat/channels

# Listar conversas (retorna vazio - PROBLEMA)
curl https://api.nexusatemporal.com.br/api/chat/conversations

# Testar envio (provavelmente falha - PROBLEMA)
curl -X POST https://api.nexusatemporal.com.br/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"sessionName":"atemporal","chatId":"5511999999999@c.us","text":"teste"}'
```

### Verificar WAHA
```bash
# Verificar se WAHA está respondendo
curl http://<WAHA_URL>/api/sessions

# Buscar conversas do WAHA diretamente
curl http://<WAHA_URL>/api/sessions/<SESSION_NAME>/chats
```

---

## 📂 ARQUIVOS PRINCIPAIS A MODIFICAR

### Backend (Ordem de Prioridade)

1. **`backend/src/modules/chat/waha-session.service.ts`**
   - Adicionar `getConversations()`
   - Adicionar `sendMessage()`

2. **`backend/src/modules/chat/chat.controller.ts`**
   - Modificar `listConversations()`
   - Modificar `sendMessage()`

3. **`backend/src/modules/chat/chat.service.ts`** (se existir)
   - Criar métodos de salvamento no banco

### Frontend

4. **`frontend/src/components/chat/WhatsAppConnectionPanel.tsx`**
   - Linha ~400-500: Adicionar pré-preenchimento do nome

---

## 🚀 WORKFLOW SUGERIDO PARA PRÓXIMA SESSÃO

### Passo a Passo Recomendado:

1. **Preparação** (5 minutos)
   - Ler `/root/nexusatemporalv1/CHAT_STATUS_E_PENDENCIAS_v125.1.md`
   - Verificar se backend e frontend estão rodando
   - Verificar logs iniciais

2. **Tarefa Crítica 1** (1-2 horas)
   - Implementar busca de conversas do WAHA
   - Testar e validar

3. **Tarefa Crítica 2** (45 minutos)
   - Implementar envio de mensagens
   - Testar e validar

4. **Tarefa Crítica 3** (15 minutos)
   - Corrigir bug visual do nome
   - Testar e validar

5. **Build e Deploy** (20 minutos)
   - Compilar backend e frontend
   - Criar imagens Docker v126
   - Deploy
   - Testes finais

6. **Documentação** (15 minutos)
   - Atualizar CHANGELOG
   - Criar resumo da sessão

**Tempo Total Estimado**: 3-4 horas

---

## ⚠️ AVISOS IMPORTANTES

### NÃO FAZER:
- ❌ NÃO mexer em módulos que estão funcionando
- ❌ NÃO tentar integrar Chatwoot novamente
- ❌ NÃO fazer alterações sem backup/commit antes

### FAZER:
- ✅ Fazer commits frequentes
- ✅ Testar cada mudança isoladamente
- ✅ Verificar logs após cada deploy
- ✅ Documentar problemas encontrados

### Se Encontrar Problemas:
1. Verificar logs primeiro
2. Testar endpoints manualmente
3. Verificar variáveis de ambiente
4. Consultar documentação do WAHA: https://waha.devlike.pro/

---

## 🎯 CRITÉRIOS DE SUCESSO PARA PRÓXIMA SESSÃO

Considerar sessão bem-sucedida se:

- [ ] Conversas aparecem na lista (vindas do WAHA)
- [ ] Mensagens antigas aparecem ao selecionar conversa
- [ ] Consegue enviar mensagens e elas aparecem no WhatsApp
- [ ] Nome "Atemporal" pré-preenche no modal
- [ ] Sistema continua estável (outros módulos funcionando)

Bônus (se houver tempo):
- [ ] Contatos importados
- [ ] Sincronização automática implementada

---

## 📞 REFERÊNCIAS RÁPIDAS

### URLs Importantes:
- **Sistema**: https://one.nexusatemporal.com.br
- **API**: https://api.nexusatemporal.com.br
- **Chatwoot** (se necessário consultar): https://chat.nexusatemporal.com

### Documentação:
- WAHA API: https://waha.devlike.pro/
- TypeORM: https://typeorm.io/
- Express: https://expressjs.com/

### Versão Atual:
- Backend: `nexus-backend:v125.1-atemporal-fix`
- Frontend: `nexus-frontend:v125.1-atemporal-fix`

### Próxima Versão (após correções):
- Backend: `nexus-backend:v126-chat-complete`
- Frontend: `nexus-frontend:v126-chat-complete`

---

## 🗂️ ESTRUTURA DE PASTAS RELEVANTE

```
/root/nexusatemporalv1/
├── backend/
│   └── src/
│       └── modules/
│           └── chat/
│               ├── chat.controller.ts        ← MODIFICAR
│               ├── chat.service.ts           ← VERIFICAR/CRIAR
│               ├── waha-session.service.ts   ← MODIFICAR
│               ├── chat.routes.ts
│               └── entities/
│                   ├── Conversation.entity.ts
│                   └── Message.entity.ts
├── frontend/
│   └── src/
│       ├── pages/
│       │   └── ChatPage.tsx
│       ├── components/
│       │   └── chat/
│       │       └── WhatsAppConnectionPanel.tsx ← MODIFICAR
│       └── services/
│           └── chatService.ts
├── prompt/
│   ├── Captura de tela 2025-11-01 023009.png ← Screenshot Problema 1
│   └── Captura de tela 2025-11-01 023036.png ← Screenshot Problema 2
├── CHAT_STATUS_E_PENDENCIAS_v125.1.md        ← LEIA PRIMEIRO
├── REMOCAO_CHATWOOT_01112025.md
├── ORIENTACAO_PROXIMA_SESSAO_v125.1.md       ← ESTE ARQUIVO
└── CHANGELOG.md                               ← ATUALIZAR AO FINAL
```

---

## ✅ CHECKLIST PRÉ-SESSÃO

Antes de começar a codificar, verificar:

- [ ] Li `/root/nexusatemporalv1/CHAT_STATUS_E_PENDENCIAS_v125.1.md`
- [ ] Vi os screenshots em `/root/nexusatemporalv1/prompt/`
- [ ] Entendi os 3 problemas críticos
- [ ] Verifiquei que backend está rodando (`docker service ps nexus_backend`)
- [ ] Verifiquei que frontend está rodando (`docker service ps nexus_frontend`)
- [ ] Tenho acesso às credenciais WAHA (se necessário)
- [ ] Fiz backup/snapshot do estado atual (se possível)

---

## 🎓 CONTEXTO ADICIONAL

### O que foi feito nas últimas sessões:

**v125.1** (Sessão atual - 01/11/2025):
- Removido Chatwoot completamente
- Criada documentação detalhada
- Sistema limpo e estável

**v125** (01/11/2025):
- Corrigidos filtros (apenas "atemporal")
- Corrigida extração de nomes de contatos

**v124** (31/10/2025):
- Restaurado módulo de Chat com TypeORM
- Refeito estrutura de tabelas

**v123** (30/10/2025):
- API pública de Leads para N8N

**v122** (29/10/2025):
- Sistema de API Keys implementado

### Por que o Chat não está 100%:
O Chat foi restaurado (v124) mas a **integração com WAHA ficou incompleta**. A UI existe e funciona, mas falta implementar:
1. Buscar conversas do WAHA
2. Enviar mensagens via WAHA
3. Sincronização bidirecional

É um problema de **integração**, não de código quebrado.

---

**Boa sorte na próxima sessão!** 🚀

Se precisar de ajuda adicional, consulte:
- `CHAT_STATUS_E_PENDENCIAS_v125.1.md` (detalhes técnicos)
- `CHANGELOG.md` (histórico completo)
- Screenshots em `/root/nexusatemporalv1/prompt/`

**Última atualização**: 01/11/2025 05:40
