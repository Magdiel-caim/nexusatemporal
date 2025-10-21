# 📋 Próximos Passos - Sistema de Automações

**Atualizado**: 17/10/2025 - 18:50

---

## ✅ CONCLUÍDO (40% do Total)

### Infraestrutura Base ✅
- [x] 13 tabelas criadas no PostgreSQL
- [x] n8n deployado (https://automacao.nexusatemporal.com.br) ✅ ACESSÍVEL
- [x] DNS configurado e propagado
- [x] Waha integrado (serviço existente)
- [x] SSL/TLS Let's Encrypt funcionando

### Sistema de Eventos ✅
- [x] RabbitMQService.ts - Conexão, pub/sub, queues
- [x] EventEmitterService.ts - 25+ eventos, audit trail
- [x] TriggerProcessorService.ts - Processamento em tempo real

### Credenciais ✅
- [x] Token Waha salvo
- [x] OpenAI API Key salva
- [x] n8n credentials salvas
- [x] Arquivo seguro (chmod 600)

---

## 🔄 EM ANDAMENTO (APIs REST)

### Módulo de Automação (60% restante)

#### 1. Entities ✅
- [x] trigger.entity.ts
- [x] workflow.entity.ts

#### 2. Services ⏳
```typescript
/backend/src/modules/automation/
├── trigger.service.ts        // CRUD de triggers
├── workflow.service.ts       // CRUD de workflows
├── integration.service.ts    // Gerenciar integrações
└── event.service.ts          // Listar/processar eventos
```

**Funcionalidades necessárias**:
- **TriggerService**:
  - findAll(tenantId, filters)
  - findById(id)
  - create(dto, userId, tenantId)
  - update(id, dto)
  - delete(id)
  - toggleActive(id)
  - getStats(tenantId)

- **WorkflowService**:
  - findAll(tenantId, filters)
  - findById(id)
  - create(dto, userId, tenantId)
  - update(id, dto)
  - delete(id)
  - execute(workflowId, inputData)
  - getExecutionLogs(workflowId)

#### 3. Controllers ⏳
```typescript
/backend/src/modules/automation/
├── trigger.controller.ts
├── workflow.controller.ts
├── integration.controller.ts
└── event.controller.ts
```

#### 4. Routes ⏳
```typescript
/backend/src/modules/automation/automation.routes.ts

// Triggers
GET    /api/automation/triggers
GET    /api/automation/triggers/:id
POST   /api/automation/triggers
PUT    /api/automation/triggers/:id
DELETE /api/automation/triggers/:id
PATCH  /api/automation/triggers/:id/toggle

// Workflows
GET    /api/automation/workflows
GET    /api/automation/workflows/:id
POST   /api/automation/workflows
PUT    /api/automation/workflows/:id
DELETE /api/automation/workflows/:id
POST   /api/automation/workflows/:id/execute

// Templates
GET    /api/automation/templates
GET    /api/automation/templates/:id

// Events
GET    /api/automation/events
GET    /api/automation/events/stats

// Integrations
GET    /api/automation/integrations
POST   /api/automation/integrations
GET    /api/automation/integrations/:type/status
POST   /api/automation/integrations/:type/test
```

---

## ⏳ SERVIÇOS DE INTEGRAÇÃO

### 1. WahaService.ts ⏳
**Localização**: `/backend/src/services/WahaService.ts`

**Token disponível**: `dckr_pat_AwZ9EnyGOTseBUaEPb4Yj384leA`

**Funcionalidades**:
```typescript
class WahaService {
  // Session management
  async createSession(sessionName: string): Promise<Session>
  async getSession(sessionName: string): Promise<Session>
  async deleteSession(sessionName: string): Promise<void>
  async getQRCode(sessionName: string): Promise<string>

  // Messaging
  async sendTextMessage(sessionName: string, to: string, text: string)
  async sendMediaMessage(sessionName: string, to: string, mediaUrl: string)
  async sendTemplateMessage(sessionName: string, to: string, template: any)

  // Webhooks
  async handleIncomingMessage(webhookData: any)
  async handleMessageStatus(webhookData: any)
}
```

### 2. OpenAIService.ts ⏳
**Localização**: `/backend/src/services/OpenAIService.ts`

**API Key disponível**: Salva em AUTOMATION_CREDENTIALS.md

**Funcionalidades**:
```typescript
class OpenAIService {
  // Lead Analysis
  async analyzeLead(leadData: any): Promise<LeadAnalysis>
  async qualifyLead(leadData: any): Promise<LeadQualification>
  async predictLeadConversion(leadData: any): Promise<number>

  // Appointment Predictions
  async predictNoShow(appointmentData: any): Promise<NoShowPrediction>
  async suggestRescheduling(appointmentData: any): Promise<ReschedulingSuggestion>

  // Communication
  async analyzeSentiment(text: string): Promise<SentimentAnalysis>
  async generateResponse(context: string, userMessage: string): Promise<string>
  async summarizeConversation(messages: any[]): Promise<string>

  // Client Insights
  async analyzeClientBehavior(clientData: any): Promise<BehaviorAnalysis>
  async suggestRetentionActions(clientData: any): Promise<RetentionActions>
}
```

### 3. N8nService.ts ⏳
**Localização**: `/backend/src/services/N8nService.ts`

**Credentials**: admin / NexusN8n2025!Secure

**Base URL**: https://automacao.nexusatemporal.com.br

**Funcionalidades**:
```typescript
class N8nService {
  // Workflow Management
  async getWorkflows(): Promise<Workflow[]>
  async getWorkflow(id: string): Promise<Workflow>
  async createWorkflow(workflow: any): Promise<Workflow>
  async updateWorkflow(id: string, workflow: any): Promise<Workflow>
  async deleteWorkflow(id: string): Promise<void>

  // Execution
  async executeWorkflow(id: string, data: any): Promise<ExecutionResult>
  async getExecution(executionId: string): Promise<Execution>
  async getExecutions(workflowId: string): Promise<Execution[]>

  // Webhooks
  async registerWebhook(workflowId: string, webhookUrl: string): Promise<void>
  async handleWebhookCallback(webhookData: any): Promise<void>
}
```

---

## 🎨 FRONTEND

### Dashboard de Automações ⏳
**Localização**: `/frontend/src/pages/AutomationPage.tsx`

**Componentes necessários**:
```
/frontend/src/components/automation/
├── TriggerList.tsx           // Lista de triggers
├── TriggerForm.tsx           // Criar/editar trigger
├── TriggerBuilder.tsx        // Builder visual
├── WorkflowList.tsx          // Lista de workflows
├── WorkflowCard.tsx          // Card de workflow
├── WorkflowExecutionLog.tsx  // Logs de execução
├── IntegrationPanel.tsx      // Painel de integrações
├── EventTimeline.tsx         // Timeline de eventos
└── TemplateLibrary.tsx       // Biblioteca de templates
```

**Páginas**:
```
/automation              → Dashboard principal
/automation/triggers     → Gestão de triggers
/automation/workflows    → Gestão de workflows
/automation/templates    → Biblioteca de templates
/automation/integrations → Configuração de integrações
/automation/events       → Timeline de eventos
/automation/logs         → Logs e métricas
```

---

## 🔧 CONFIGURAÇÕES FINAIS

### 1. Variáveis de Ambiente ⏳
**Arquivo**: `/backend/.env`

```env
# Waha
WAHA_BASE_URL=https://apiwts.nexusatemporal.com.br
WAHA_TOKEN=dckr_pat_AwZ9EnyGOTseBUaEPb4Yj384leA

# OpenAI
OPENAI_API_KEY=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
OPENAI_MODEL=gpt-4
OPENAI_FALLBACK_MODEL=gpt-3.5-turbo

# n8n
N8N_BASE_URL=https://automacao.nexusatemporal.com.br
N8N_API_KEY=<será gerado no n8n>
N8N_USERNAME=admin
N8N_PASSWORD=NexusN8n2025!Secure

# RabbitMQ (já existe)
RABBITMQ_HOST=rabbitmq.nexusatemporal.com.br
RABBITMQ_PORT=5672
RABBITMQ_USER=nexus_mq
RABBITMQ_PASSWORD=ZSGbN3hQJnl3Rnq6TE1wsFVQCi47EJgR
```

### 2. Inicialização do Sistema ⏳
**Arquivo**: `/backend/src/server.ts`

```typescript
// Adicionar no startup:
import { getEventEmitterService } from '@/services/EventEmitterService';
import { getTriggerProcessorService } from '@/services/TriggerProcessorService';

// Após conectar ao banco:
const eventEmitter = getEventEmitterService(dbPool);
await eventEmitter.initialize();

const triggerProcessor = getTriggerProcessorService(dbPool);
await triggerProcessor.start();

console.log('✅ Automation system initialized');
```

---

## 📊 PRIORIDADE DE IMPLEMENTAÇÃO

### Alta Prioridade (Próxima Sessão)
1. ✅ Finalizar módulo automation (services, controllers, routes)
2. ✅ Implementar WahaService
3. ✅ Implementar OpenAIService
4. ✅ Adicionar variáveis de ambiente

### Média Prioridade
5. ⏳ Implementar N8nService
6. ⏳ Frontend básico (lista de triggers e workflows)
7. ⏳ Testes de integração end-to-end

### Baixa Prioridade
8. ⏳ Builder visual de triggers
9. ⏳ Dashboard avançado com métricas
10. ⏳ Typebot (aguardando orientações)

---

## 🧪 TESTES NECESSÁRIOS

### Testes Unitários ⏳
- [ ] RabbitMQService
- [ ] EventEmitterService
- [ ] TriggerProcessorService
- [ ] WahaService
- [ ] OpenAIService

### Testes de Integração ⏳
- [ ] Criar trigger via API
- [ ] Emitir evento e verificar processamento
- [ ] Executar workflow n8n
- [ ] Enviar mensagem WhatsApp
- [ ] Analisar lead com OpenAI

### Testes End-to-End ⏳
- [ ] Fluxo completo: Lead criado → Evento → Trigger → WhatsApp
- [ ] Fluxo: Agendamento → Lembrete 24h → WhatsApp
- [ ] Fluxo: Pagamento vencido → OpenAI análise → Ação

---

## 📝 DOCUMENTAÇÃO

### Para Criar ⏳
- [ ] API Documentation (Swagger/OpenAPI)
- [ ] Guia de configuração de triggers
- [ ] Guia de criação de workflows
- [ ] Troubleshooting guide
- [ ] Video tutorial básico

---

## 🎯 META FINAL

**Sistema 100% funcional com**:
- ✅ Infraestrutura completa
- ✅ Sistema de eventos robusto
- ⏳ APIs REST completas
- ⏳ 3 integrações funcionando (Waha, OpenAI, n8n)
- ⏳ Frontend intuitivo
- ⏳ 6 templates de workflows prontos para uso
- ⏳ Documentação completa

---

**Progresso Atual**: 40% ✅
**Estimativa para conclusão**: 2-3 sessões adicionais

**Última atualização**: 17/10/2025 - 18:50
