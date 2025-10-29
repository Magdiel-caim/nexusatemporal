# Documentação de APIs - Nexus Atemporal v1

> Documentação completa de todas as APIs REST disponíveis no sistema Nexus Atemporal.
> Base URL: `http://seu-dominio/api`
> Versão do Sistema: v120.6

---

## Índice

1. [Autenticação](#1-autenticação)
2. [Configuração e Dados](#2-configuração-e-dados)
3. [Leads e CRM](#3-leads-e-crm)
4. [Chat e WhatsApp](#4-chat-e-whatsapp)
5. [Agenda](#5-agenda)
6. [Prontuários Médicos](#6-prontuários-médicos)
7. [Financeiro](#7-financeiro)
8. [Gateway de Pagamento](#8-gateway-de-pagamento)
9. [Usuários e Permissões](#9-usuários-e-permissões)
10. [Automação de Marketing](#10-automação-de-marketing)
11. [Estoque](#11-estoque)
12. [Vendas e Comissões](#12-vendas-e-comissões)
13. [Business Intelligence](#13-business-intelligence)
14. [Marketing](#14-marketing)
15. [Meta (Instagram/Messenger)](#15-meta-instagrammessenger)

---

## Convenções

### Autenticação

A maioria dos endpoints requer autenticação via **Bearer Token** no header:

```
Authorization: Bearer {seu_token_jwt}
```

Endpoints públicos (sem autenticação) estão explicitamente marcados como **[PUBLIC]**.

### Formato de Resposta

Todas as respostas seguem o padrão JSON:

```json
{
  "success": true,
  "data": { ... },
  "message": "Mensagem opcional"
}
```

Ou em caso de erro:

```json
{
  "success": false,
  "error": "Mensagem de erro",
  "statusCode": 400
}
```

---

## 1. Autenticação

Base: `/api/auth`

### 1.1 Registro de Usuário

**[PUBLIC]** Criar nova conta de usuário.

```
POST /api/auth/register
```

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha_segura",
  "name": "Nome do Usuário",
  "tenantId": "tenant_id_opcional"
}
```

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário"
    },
    "token": "jwt_token"
  }
}
```

---

### 1.2 Login

**[PUBLIC]** Fazer login no sistema.

```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": "uuid",
      "email": "usuario@exemplo.com",
      "name": "Nome"
    }
  }
}
```

---

### 1.3 Refresh Token

**[PUBLIC]** Renovar token de autenticação.

```
POST /api/auth/refresh-token
```

**Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

---

### 1.4 Verificar Email

**[PUBLIC]** Verificar email após registro.

```
GET /api/auth/verify-email/:token
```

---

### 1.5 Solicitar Reset de Senha

**[PUBLIC]** Solicitar link de reset de senha.

```
POST /api/auth/request-password-reset
```

**Body:**
```json
{
  "email": "usuario@exemplo.com"
}
```

---

### 1.6 Resetar Senha

**[PUBLIC]** Resetar senha com token recebido por email.

```
POST /api/auth/reset-password/:token
```

**Body:**
```json
{
  "password": "nova_senha"
}
```

---

### 1.7 Logout

Fazer logout do sistema.

```
POST /api/auth/logout
```

---

### 1.8 Obter Usuário Atual

Obter informações do usuário autenticado.

```
GET /api/auth/me
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "Nome",
    "tenantId": "tenant_id",
    "role": "admin"
  }
}
```

---

### 1.9 Listar Usuários

Listar todos os usuários do tenant.

```
GET /api/auth/users
```

---

## 2. Configuração e Dados

Base: `/api/data`

### 2.1 Obter Data/Hora do Servidor

Obter data e hora atual do servidor.

```
GET /api/data
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "date": "2025-10-28",
    "time": "14:30:00",
    "timestamp": "2025-10-28T14:30:00.000Z"
  }
}
```

---

### 2.2 Buscar CEP

Buscar informações de endereço por CEP (integração ViaCEP).

```
GET /api/data/cep/:cep
```

**Exemplo:**
```
GET /api/data/cep/01001000
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "cep": "01001-000",
    "logradouro": "Praça da Sé",
    "complemento": "lado ímpar",
    "bairro": "Sé",
    "localidade": "São Paulo",
    "uf": "SP",
    "ibge": "3550308"
  }
}
```

---

## 3. Leads e CRM

Base: `/api/leads`

### 3.1 Pipelines

#### 3.1.1 Criar Pipeline

```
POST /api/leads/pipelines
```

**Body:**
```json
{
  "name": "Vendas Principal",
  "description": "Pipeline de vendas principal",
  "color": "#3B82F6"
}
```

---

#### 3.1.2 Listar Pipelines

```
GET /api/leads/pipelines
```

**Query Params:**
- `search`: string (busca por nome)
- `limit`: number (padrão: 50)
- `offset`: number (padrão: 0)

---

#### 3.1.3 Obter Pipeline

```
GET /api/leads/pipelines/:id
```

---

#### 3.1.4 Atualizar Pipeline

```
PUT /api/leads/pipelines/:id
```

**Body:**
```json
{
  "name": "Novo Nome",
  "description": "Nova descrição",
  "color": "#EF4444"
}
```

---

#### 3.1.5 Excluir Pipeline

```
DELETE /api/leads/pipelines/:id
```

---

### 3.2 Estágios (Stages)

#### 3.2.1 Criar Estágio

```
POST /api/leads/stages
```

**Body:**
```json
{
  "pipelineId": "pipeline_uuid",
  "name": "Contato Inicial",
  "color": "#10B981",
  "order": 1
}
```

---

#### 3.2.2 Atualizar Estágio

```
PUT /api/leads/stages/:id
```

---

#### 3.2.3 Excluir Estágio

```
DELETE /api/leads/stages/:id
```

---

#### 3.2.4 Reordenar Estágios

```
POST /api/leads/stages/reorder
```

**Body:**
```json
{
  "stages": [
    { "id": "stage_1", "order": 1 },
    { "id": "stage_2", "order": 2 }
  ]
}
```

---

### 3.3 Leads

#### 3.3.1 Criar Lead

```
POST /api/leads/leads
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "+5511999999999",
  "stageId": "stage_uuid",
  "value": 5000,
  "customFields": {
    "origem": "Site",
    "interesse": "Produto A"
  }
}
```

---

#### 3.3.2 Listar Leads

```
GET /api/leads/leads
```

**Query Params:**
- `pipelineId`: string
- `stageId`: string
- `search`: string
- `status`: string (active, won, lost)
- `limit`: number
- `offset`: number

---

#### 3.3.3 Obter Estatísticas de Leads

```
GET /api/leads/leads/stats
```

**Query Params:**
- `pipelineId`: string (opcional)

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "active": 120,
    "won": 20,
    "lost": 10,
    "totalValue": 750000,
    "conversionRate": 13.33
  }
}
```

---

#### 3.3.4 Obter Lead

```
GET /api/leads/leads/:id
```

---

#### 3.3.5 Atualizar Lead

```
PUT /api/leads/leads/:id
```

---

#### 3.3.6 Excluir Lead

```
DELETE /api/leads/leads/:id
```

---

#### 3.3.7 Mover Lead para Estágio

```
POST /api/leads/leads/:id/move
```

**Body:**
```json
{
  "stageId": "novo_stage_uuid"
}
```

---

#### 3.3.8 Atualizar Leads em Lote

```
POST /api/leads/leads/bulk-update
```

**Body:**
```json
{
  "leadIds": ["id1", "id2", "id3"],
  "updates": {
    "stageId": "novo_stage_uuid",
    "assignedTo": "usuario_id"
  }
}
```

---

### 3.4 Atividades

#### 3.4.1 Criar Atividade

```
POST /api/leads/leads/:id/activities
```

**Body:**
```json
{
  "type": "call",
  "subject": "Ligação de follow-up",
  "description": "Discutir proposta",
  "dueDate": "2025-10-30T10:00:00Z",
  "status": "pending"
}
```

---

#### 3.4.2 Listar Atividades do Lead

```
GET /api/leads/leads/:id/activities
```

---

#### 3.4.3 Completar Atividade

```
PUT /api/leads/activities/:activityId/complete
```

**Body:**
```json
{
  "notes": "Ligação realizada com sucesso"
}
```

---

### 3.5 Procedimentos

#### 3.5.1 Criar Procedimento

```
POST /api/leads/procedures
```

**Body:**
```json
{
  "name": "Consulta Dermatológica",
  "description": "Consulta completa com dermatologista",
  "duration": 60,
  "price": 250.00,
  "category": "Consultas"
}
```

---

#### 3.5.2 Listar Procedimentos

```
GET /api/leads/procedures
```

---

#### 3.5.3 Obter Procedimento

```
GET /api/leads/procedures/:id
```

---

#### 3.5.4 Atualizar Procedimento

```
PUT /api/leads/procedures/:id
```

---

#### 3.5.5 Excluir Procedimento

```
DELETE /api/leads/procedures/:id
```

---

## 4. Chat e WhatsApp

Base: `/api/chat`

### 4.1 Webhooks (Públicos)

#### 4.1.1 Webhook WhatsApp

**[PUBLIC]** Receber eventos do WhatsApp.

```
POST /api/chat/webhook/whatsapp
```

---

#### 4.1.2 Webhook WAHA - Status

**[PUBLIC]** Receber status das sessões WAHA.

```
POST /api/chat/webhook/waha/status
```

---

#### 4.1.3 Webhook WAHA - Mensagem

**[PUBLIC]** Receber mensagens do WAHA.

```
POST /api/chat/webhook/waha/message
```

---

#### 4.1.4 Webhook N8N - Mensagem (LEGADO)

**[PUBLIC]** Receber mensagens do N8N (legado).

```
POST /api/chat/webhook/n8n/message
```

---

#### 4.1.5 Webhook N8N - Mensagem com Mídia

**[PUBLIC]** Receber mensagens com mídia em base64.

```
POST /api/chat/webhook/n8n/message-media
```

---

### 4.2 Proxy de Mídia (Público)

#### 4.2.1 Obter URL de Mídia

**[PUBLIC]** Obter URL da mídia de uma mensagem.

```
GET /api/chat/media/:messageId
```

---

#### 4.2.2 Stream de Mídia

**[PUBLIC]** Fazer streaming da mídia.

```
GET /api/chat/media/:messageId/stream
```

---

### 4.3 Conversas

#### 4.3.1 Listar Conversas

```
GET /api/chat/conversations
```

**Query Params:**
- `status`: string (open, resolved, archived)
- `assignedTo`: string (userId)
- `channel`: string (whatsapp, instagram, messenger)
- `search`: string
- `limit`: number
- `offset`: number

---

#### 4.3.2 Obter Conversa

```
GET /api/chat/conversations/:id
```

---

#### 4.3.3 Criar Conversa

```
POST /api/chat/conversations
```

**Body:**
```json
{
  "channel": "whatsapp",
  "contactPhone": "+5511999999999",
  "contactName": "João Silva",
  "sessionName": "principal"
}
```

---

#### 4.3.4 Atualizar Conversa

```
PUT /api/chat/conversations/:id
```

**Body:**
```json
{
  "status": "resolved",
  "assignedTo": "usuario_id",
  "priority": "high"
}
```

---

#### 4.3.5 Marcar como Lida

```
POST /api/chat/conversations/:id/mark-read
```

---

#### 4.3.6 Marcar como Não Lida

```
POST /api/chat/conversations/:id/mark-unread
```

---

#### 4.3.7 Atribuir Conversa

```
POST /api/chat/conversations/:id/assign
```

**Body:**
```json
{
  "userId": "usuario_id"
}
```

---

#### 4.3.8 Adicionar Tag

```
POST /api/chat/conversations/:id/tags
```

**Body:**
```json
{
  "tagId": "tag_id"
}
```

---

#### 4.3.9 Remover Tag

```
DELETE /api/chat/conversations/:id/tags
```

**Body:**
```json
{
  "tagId": "tag_id"
}
```

---

#### 4.3.10 Arquivar Conversa

```
POST /api/chat/conversations/:id/archive
```

---

#### 4.3.11 Desarquivar Conversa

```
POST /api/chat/conversations/:id/unarchive
```

---

#### 4.3.12 Resolver Conversa

```
POST /api/chat/conversations/:id/resolve
```

---

#### 4.3.13 Reabrir Conversa

```
POST /api/chat/conversations/:id/reopen
```

---

#### 4.3.14 Definir Prioridade

```
POST /api/chat/conversations/:id/priority
```

**Body:**
```json
{
  "priority": "high"
}
```

---

#### 4.3.15 Definir Atributo Customizado

```
POST /api/chat/conversations/:id/attributes
```

**Body:**
```json
{
  "key": "origem",
  "value": "site"
}
```

---

#### 4.3.16 Remover Atributo Customizado

```
DELETE /api/chat/conversations/:id/attributes
```

**Body:**
```json
{
  "key": "origem"
}
```

---

#### 4.3.17 Histórico de Conversas

```
GET /api/chat/conversations/history/:phoneNumber
```

---

### 4.4 Mensagens

#### 4.4.1 Listar Mensagens

```
GET /api/chat/conversations/:conversationId/messages
```

**Query Params:**
- `limit`: number
- `offset`: number
- `order`: string (asc, desc)

---

#### 4.4.2 Enviar Mensagem

```
POST /api/chat/conversations/:conversationId/messages
```

**Body:**
```json
{
  "content": "Olá! Como posso ajudar?",
  "type": "text"
}
```

Ou para enviar mídia:
```json
{
  "content": "Segue o documento",
  "type": "image",
  "mediaUrl": "https://example.com/imagem.jpg"
}
```

---

#### 4.4.3 Excluir Mensagem

```
DELETE /api/chat/messages/:messageId
```

---

### 4.5 Tags

#### 4.5.1 Listar Tags

```
GET /api/chat/tags
```

---

#### 4.5.2 Criar Tag

```
POST /api/chat/tags
```

**Body:**
```json
{
  "name": "Urgente",
  "color": "#EF4444"
}
```

---

#### 4.5.3 Atualizar Tag

```
PUT /api/chat/tags/:id
```

---

#### 4.5.4 Excluir Tag

```
DELETE /api/chat/tags/:id
```

---

### 4.6 Respostas Rápidas

#### 4.6.1 Listar Respostas Rápidas

```
GET /api/chat/quick-replies
```

---

#### 4.6.2 Criar Resposta Rápida

```
POST /api/chat/quick-replies
```

**Body:**
```json
{
  "shortcut": "/ola",
  "content": "Olá! Seja bem-vindo ao nosso atendimento. Como posso ajudar?",
  "category": "Saudações"
}
```

---

#### 4.6.3 Atualizar Resposta Rápida

```
PUT /api/chat/quick-replies/:id
```

---

#### 4.6.4 Excluir Resposta Rápida

```
DELETE /api/chat/quick-replies/:id
```

---

### 4.7 Estatísticas

#### 4.7.1 Obter Estatísticas

```
GET /api/chat/stats
```

**Query Params:**
- `startDate`: string (ISO 8601)
- `endDate`: string (ISO 8601)

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "totalConversations": 350,
    "openConversations": 45,
    "resolvedConversations": 280,
    "archivedConversations": 25,
    "totalMessages": 2500,
    "averageResponseTime": 120,
    "satisfactionRate": 4.5
  }
}
```

---

### 4.8 Canais

#### 4.8.1 Listar Canais

```
GET /api/chat/channels
```

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "session_1",
      "name": "WhatsApp Principal",
      "type": "whatsapp",
      "status": "online",
      "conversationCount": 45
    }
  ]
}
```

---

### 4.9 Gerenciamento de Sessões WAHA

#### 4.9.1 Criar Sessão

```
POST /api/chat/whatsapp/sessions/create
```

**Body:**
```json
{
  "sessionName": "principal",
  "displayName": "Atendimento Principal"
}
```

---

#### 4.9.2 Registrar Sessão

```
POST /api/chat/whatsapp/sessions/register
```

**Body:**
```json
{
  "sessionName": "principal",
  "wahaUrl": "http://waha:3000"
}
```

---

#### 4.9.3 Iniciar Sessão

```
POST /api/chat/whatsapp/sessions/:sessionName/start
```

---

#### 4.9.4 Reconectar Sessão

```
POST /api/chat/whatsapp/sessions/:sessionName/reconnect
```

---

#### 4.9.5 Obter QR Code

```
GET /api/chat/whatsapp/sessions/:sessionName/qr
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "qr": "data:image/png;base64,..."
  }
}
```

---

#### 4.9.6 Obter Status

```
GET /api/chat/whatsapp/sessions/:sessionName/status
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "status": "WORKING",
    "sessionName": "principal"
  }
}
```

---

#### 4.9.7 Listar Sessões

```
GET /api/chat/whatsapp/sessions
```

---

#### 4.9.8 Parar Sessão

```
POST /api/chat/whatsapp/sessions/:sessionName/stop
```

---

#### 4.9.9 Logout da Sessão

```
POST /api/chat/whatsapp/sessions/:sessionName/logout
```

---

#### 4.9.10 Excluir Sessão

```
DELETE /api/chat/whatsapp/sessions/:sessionName
```

---

### 4.10 QR Code Proxy

```
GET /api/chat/whatsapp/qrcode-proxy
```

**Query Params:**
- `sessionName`: string

---

### 4.11 Download de Mídia

```
GET /api/chat/whatsapp/media/:mediaId
```

---

### 4.12 N8N Chat Routes (Autenticadas)

#### 4.12.1 Obter Mensagens por Sessão

```
GET /api/chat/n8n/messages/:sessionName
```

---

#### 4.12.2 Obter Conversas

```
GET /api/chat/n8n/conversations
```

---

#### 4.12.3 Marcar como Lida

```
POST /api/chat/n8n/messages/:sessionName/mark-read
```

---

#### 4.12.4 Enviar Mensagem

```
POST /api/chat/n8n/send-message
```

**Body:**
```json
{
  "sessionName": "principal",
  "phoneNumber": "+5511999999999",
  "message": "Olá!"
}
```

---

#### 4.12.5 Enviar Mídia

```
POST /api/chat/n8n/send-media
```

**Body:**
```json
{
  "sessionName": "principal",
  "phoneNumber": "+5511999999999",
  "mediaUrl": "https://example.com/file.pdf",
  "caption": "Documento anexo"
}
```

---

#### 4.12.6 Excluir Mensagem

```
DELETE /api/chat/n8n/messages/:messageId
```

---

## 5. Agenda

Base: `/api/appointments`

### 5.1 Agendamentos Internos (Autenticados)

#### 5.1.1 Criar Agendamento

```
POST /api/appointments
```

**Body:**
```json
{
  "leadId": "lead_uuid",
  "professionalId": "professional_uuid",
  "procedureId": "procedure_uuid",
  "date": "2025-10-30",
  "time": "14:00",
  "duration": 60,
  "notes": "Cliente preferiu horário da tarde"
}
```

---

#### 5.1.2 Listar Agendamentos

```
GET /api/appointments
```

**Query Params:**
- `startDate`: string (ISO 8601)
- `endDate`: string (ISO 8601)
- `professionalId`: string
- `leadId`: string
- `status`: string (scheduled, confirmed, in_progress, completed, cancelled)
- `limit`: number
- `offset`: number

---

#### 5.1.3 Obter Agendamentos de Hoje

```
GET /api/appointments/today
```

---

#### 5.1.4 Verificar Disponibilidade

```
POST /api/appointments/check-availability
```

**Body:**
```json
{
  "professionalId": "professional_uuid",
  "date": "2025-10-30",
  "time": "14:00",
  "duration": 60
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "available": true
  }
}
```

---

#### 5.1.5 Obter Horários Ocupados

```
GET /api/appointments/occupied-slots
```

**Query Params:**
- `professionalId`: string (obrigatório)
- `date`: string (formato: YYYY-MM-DD)

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    { "start": "09:00", "end": "10:00" },
    { "start": "14:00", "end": "15:30" }
  ]
}
```

---

#### 5.1.6 Obter Horários Disponíveis

```
GET /api/appointments/available-slots
```

**Query Params:**
- `professionalId`: string (obrigatório)
- `date`: string (formato: YYYY-MM-DD)
- `duration`: number (em minutos)

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    "08:00",
    "10:00",
    "11:00",
    "15:30",
    "16:30"
  ]
}
```

---

#### 5.1.7 Obter Agendamento

```
GET /api/appointments/:id
```

---

#### 5.1.8 Obter Agendamentos por Lead

```
GET /api/appointments/lead/:leadId
```

---

#### 5.1.9 Obter Agendamentos por Profissional

```
GET /api/appointments/professional/:professionalId
```

---

#### 5.1.10 Atualizar Agendamento

```
PUT /api/appointments/:id
```

**Body:**
```json
{
  "date": "2025-10-31",
  "time": "15:00",
  "notes": "Reagendado a pedido do cliente"
}
```

---

#### 5.1.11 Confirmar Pagamento

```
POST /api/appointments/:id/confirm-payment
```

**Body:**
```json
{
  "paymentMethod": "credit_card",
  "amount": 250.00,
  "transactionId": "txn_123456"
}
```

---

#### 5.1.12 Enviar Anamnese

```
POST /api/appointments/:id/send-anamnesis
```

---

#### 5.1.13 Confirmar Agendamento

```
POST /api/appointments/:id/confirm
```

---

#### 5.1.14 Check-in

```
POST /api/appointments/:id/check-in
```

---

#### 5.1.15 Iniciar Atendimento

```
POST /api/appointments/:id/start
```

---

#### 5.1.16 Finalizar Atendimento

```
POST /api/appointments/:id/finalize
```

**Body:**
```json
{
  "notes": "Atendimento realizado conforme planejado",
  "medicalRecordId": "medical_record_uuid"
}
```

---

#### 5.1.17 Cancelar Agendamento

```
DELETE /api/appointments/:id
```

**Body:**
```json
{
  "reason": "Cliente solicitou cancelamento"
}
```

---

### 5.2 API Pública de Agendamentos

Base: `/api/public/appointments`

**[PUBLIC]** Estas rotas são públicas e não requerem autenticação para consultas.

#### 5.2.1 Obter Horários Disponíveis

```
GET /api/public/appointments/available-slots
```

**Query Params:**
- `professionalId`: string
- `date`: string (YYYY-MM-DD)
- `duration`: number

---

#### 5.2.2 Obter Horários Ocupados

```
GET /api/public/appointments/occupied-slots
```

**Query Params:**
- `professionalId`: string
- `date`: string (YYYY-MM-DD)

---

#### 5.2.3 Verificar Disponibilidade

```
POST /api/public/appointments/check-availability
```

**Body:**
```json
{
  "professionalId": "professional_uuid",
  "date": "2025-10-30",
  "time": "14:00",
  "duration": 60
}
```

---

#### 5.2.4 Obter Locais de Atendimento

```
GET /api/public/appointments/locations
```

---

#### 5.2.5 Criar Agendamento Público

**[REQUER API KEY]** Esta rota requer API key no header.

```
POST /api/public/appointments
```

**Headers:**
```
X-API-Key: sua_api_key
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "+5511999999999",
  "professionalId": "professional_uuid",
  "procedureId": "procedure_uuid",
  "date": "2025-10-30",
  "time": "14:00"
}
```

---

## 6. Prontuários Médicos

Base: `/api/medical-records`

### 6.1 Prontuários

#### 6.1.1 Criar Prontuário

```
POST /api/medical-records
```

**Body:**
```json
{
  "leadId": "lead_uuid",
  "professionalId": "professional_uuid",
  "chiefComplaint": "Dor de cabeça recorrente",
  "history": "Paciente relata dores há 2 semanas"
}
```

---

#### 6.1.2 Listar Prontuários

```
GET /api/medical-records
```

**Query Params:**
- `leadId`: string
- `professionalId`: string
- `startDate`: string
- `endDate`: string
- `limit`: number
- `offset`: number

---

#### 6.1.3 Obter Prontuário

```
GET /api/medical-records/:id
```

---

#### 6.1.4 Obter Prontuário Completo

```
GET /api/medical-records/:id/complete
```

Retorna prontuário com todas as anamneses e histórico de procedimentos.

---

#### 6.1.5 Obter Prontuário por Lead

```
GET /api/medical-records/lead/:leadId
```

---

#### 6.1.6 Atualizar Prontuário

```
PUT /api/medical-records/:id
```

---

#### 6.1.7 Excluir Prontuário

```
DELETE /api/medical-records/:id
```

---

### 6.2 Anamnese

#### 6.2.1 Criar Anamnese

```
POST /api/medical-records/anamnesis
```

**Body:**
```json
{
  "medicalRecordId": "medical_record_uuid",
  "questions": [
    {
      "question": "Tem alergias a medicamentos?",
      "answer": "Sim, penicilina"
    },
    {
      "question": "Histórico de doenças na família?",
      "answer": "Diabetes - mãe"
    }
  ],
  "notes": "Paciente demonstrou ansiedade durante consulta"
}
```

---

#### 6.2.2 Listar Anamneses do Prontuário

```
GET /api/medical-records/:medicalRecordId/anamnesis
```

---

#### 6.2.3 Obter Anamnese

```
GET /api/medical-records/anamnesis/:id
```

---

### 6.3 Histórico de Procedimentos

#### 6.3.1 Criar Histórico de Procedimento

```
POST /api/medical-records/procedure-history
```

**Body:**
```json
{
  "medicalRecordId": "medical_record_uuid",
  "procedureId": "procedure_uuid",
  "date": "2025-10-28",
  "notes": "Procedimento realizado sem intercorrências",
  "outcome": "Sucesso",
  "followUpDate": "2025-11-28"
}
```

---

#### 6.3.2 Listar Histórico do Prontuário

```
GET /api/medical-records/:medicalRecordId/procedure-history
```

---

#### 6.3.3 Obter Histórico de Procedimento

```
GET /api/medical-records/procedure-history/:id
```

---

## 7. Financeiro

Base: `/api/financial`

### 7.1 Transações

#### 7.1.1 Criar Transação

```
POST /api/financial/transactions
```

**Body:**
```json
{
  "type": "income",
  "category": "Consultas",
  "description": "Consulta - João Silva",
  "amount": 250.00,
  "dueDate": "2025-10-30",
  "paymentMethod": "credit_card",
  "leadId": "lead_uuid",
  "appointmentId": "appointment_uuid"
}
```

**Tipos:**
- `income`: Receita
- `expense`: Despesa

**Status:**
- `pending`: Pendente
- `paid`: Pago
- `overdue`: Vencido
- `cancelled`: Cancelado

---

#### 7.1.2 Listar Transações

```
GET /api/financial/transactions
```

**Query Params:**
- `type`: string (income, expense)
- `status`: string (pending, paid, overdue, cancelled)
- `category`: string
- `startDate`: string
- `endDate`: string
- `leadId`: string
- `limit`: number
- `offset`: number

---

#### 7.1.3 Obter Estatísticas

```
GET /api/financial/transactions/stats
```

**Query Params:**
- `startDate`: string
- `endDate`: string

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "totalIncome": 125000.00,
    "totalExpense": 45000.00,
    "balance": 80000.00,
    "pendingReceivables": 15000.00,
    "pendingPayables": 8000.00,
    "transactionCount": 450
  }
}
```

---

#### 7.1.4 Contas a Receber

```
GET /api/financial/transactions/accounts-receivable
```

---

#### 7.1.5 Contas a Pagar

```
GET /api/financial/transactions/accounts-payable
```

---

#### 7.1.6 Transações Vencidas

```
GET /api/financial/transactions/overdue
```

---

#### 7.1.7 Fluxo de Caixa

```
GET /api/financial/transactions/cash-flow
```

**Query Params:**
- `startDate`: string
- `endDate`: string
- `groupBy`: string (day, week, month)

---

#### 7.1.8 Obter Transação

```
GET /api/financial/transactions/:id
```

---

#### 7.1.9 Atualizar Transação

```
PUT /api/financial/transactions/:id
```

---

#### 7.1.10 Excluir Transação

```
DELETE /api/financial/transactions/:id
```

---

#### 7.1.11 Confirmar Transação

```
PATCH /api/financial/transactions/:id/confirm
```

**Body:**
```json
{
  "paymentDate": "2025-10-28",
  "paymentMethod": "pix",
  "notes": "Pagamento confirmado via PIX"
}
```

---

#### 7.1.12 Cancelar Transação

```
PATCH /api/financial/transactions/:id/cancel
```

**Body:**
```json
{
  "reason": "Cliente solicitou cancelamento"
}
```

---

#### 7.1.13 Estornar Transação

```
PATCH /api/financial/transactions/:id/reverse
```

---

#### 7.1.14 Criar Transações Parceladas

```
POST /api/financial/transactions/installments
```

**Body:**
```json
{
  "type": "income",
  "category": "Tratamentos",
  "description": "Tratamento completo - 12x",
  "totalAmount": 6000.00,
  "installments": 12,
  "firstDueDate": "2025-11-01",
  "leadId": "lead_uuid"
}
```

---

### 7.2 Fornecedores

#### 7.2.1 Criar Fornecedor

```
POST /api/financial/suppliers
```

**Body:**
```json
{
  "name": "Fornecedor ABC Ltda",
  "cnpj": "12.345.678/0001-99",
  "email": "contato@fornecedor.com",
  "phone": "+5511999999999",
  "address": {
    "street": "Rua Exemplo",
    "number": "100",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01000-000"
  },
  "paymentTerms": "30 dias",
  "category": "Produtos Médicos"
}
```

---

#### 7.2.2 Listar Fornecedores

```
GET /api/financial/suppliers
```

**Query Params:**
- `search`: string
- `category`: string
- `isActive`: boolean
- `limit`: number
- `offset`: number

---

#### 7.2.3 Obter Estatísticas de Fornecedores

```
GET /api/financial/suppliers/stats
```

---

#### 7.2.4 Obter Fornecedor

```
GET /api/financial/suppliers/:id
```

---

#### 7.2.5 Atualizar Fornecedor

```
PUT /api/financial/suppliers/:id
```

---

#### 7.2.6 Excluir Fornecedor

```
DELETE /api/financial/suppliers/:id
```

---

#### 7.2.7 Ativar Fornecedor

```
PATCH /api/financial/suppliers/:id/activate
```

---

#### 7.2.8 Desativar Fornecedor

```
PATCH /api/financial/suppliers/:id/deactivate
```

---

### 7.3 Notas Fiscais

#### 7.3.1 Criar Nota Fiscal

```
POST /api/financial/invoices
```

**Body:**
```json
{
  "number": "NF-2025-001",
  "type": "sale",
  "leadId": "lead_uuid",
  "issueDate": "2025-10-28",
  "dueDate": "2025-11-28",
  "items": [
    {
      "description": "Consulta Dermatológica",
      "quantity": 1,
      "unitPrice": 250.00,
      "total": 250.00
    }
  ],
  "subtotal": 250.00,
  "taxAmount": 0,
  "totalAmount": 250.00,
  "notes": "Pagamento em até 30 dias"
}
```

---

#### 7.3.2 Listar Notas Fiscais

```
GET /api/financial/invoices
```

**Query Params:**
- `type`: string (sale, purchase)
- `status`: string (draft, sent, paid, cancelled)
- `startDate`: string
- `endDate`: string
- `leadId`: string
- `supplierId`: string
- `limit`: number
- `offset`: number

---

#### 7.3.3 Obter Estatísticas de Notas Fiscais

```
GET /api/financial/invoices/stats
```

---

#### 7.3.4 Obter Nota por Número

```
GET /api/financial/invoices/number/:number
```

---

#### 7.3.5 Obter Nota Fiscal

```
GET /api/financial/invoices/:id
```

---

#### 7.3.6 Atualizar Nota Fiscal

```
PUT /api/financial/invoices/:id
```

---

#### 7.3.7 Cancelar Nota Fiscal

```
PATCH /api/financial/invoices/:id/cancel
```

---

#### 7.3.8 Marcar como Enviada

```
PATCH /api/financial/invoices/:id/send
```

---

#### 7.3.9 Anexar PDF

```
PATCH /api/financial/invoices/:id/attach-pdf
```

**Body:**
```json
{
  "pdfUrl": "https://storage.example.com/invoices/nf-001.pdf"
}
```

---

### 7.4 Ordens de Compra

#### 7.4.1 Criar Ordem de Compra

```
POST /api/financial/purchase-orders
```

**Body:**
```json
{
  "supplierId": "supplier_uuid",
  "orderNumber": "OC-2025-001",
  "orderDate": "2025-10-28",
  "deliveryDate": "2025-11-15",
  "items": [
    {
      "productId": "product_uuid",
      "description": "Produto XYZ",
      "quantity": 10,
      "unitPrice": 50.00,
      "total": 500.00
    }
  ],
  "subtotal": 500.00,
  "taxAmount": 0,
  "shippingCost": 50.00,
  "totalAmount": 550.00,
  "notes": "Entrega urgente"
}
```

---

#### 7.4.2 Listar Ordens de Compra

```
GET /api/financial/purchase-orders
```

**Query Params:**
- `status`: string (draft, pending, approved, sent, in_transit, received, cancelled)
- `supplierId`: string
- `startDate`: string
- `endDate`: string
- `limit`: number
- `offset`: number

---

#### 7.4.3 Obter Estatísticas de Ordens

```
GET /api/financial/purchase-orders/stats
```

---

#### 7.4.4 Obter Ordem de Compra

```
GET /api/financial/purchase-orders/:id
```

---

#### 7.4.5 Atualizar Ordem de Compra

```
PUT /api/financial/purchase-orders/:id
```

---

#### 7.4.6 Aprovar Ordem

```
PATCH /api/financial/purchase-orders/:id/approve
```

---

#### 7.4.7 Marcar como Enviada

```
PATCH /api/financial/purchase-orders/:id/send
```

---

#### 7.4.8 Marcar como Em Trânsito

```
PATCH /api/financial/purchase-orders/:id/in-transit
```

---

#### 7.4.9 Receber Ordem

```
PATCH /api/financial/purchase-orders/:id/receive
```

**Body:**
```json
{
  "receivedDate": "2025-11-14",
  "receivedBy": "user_id",
  "notes": "Mercadoria recebida em perfeitas condições"
}
```

---

#### 7.4.10 Cancelar Ordem

```
PATCH /api/financial/purchase-orders/:id/cancel
```

---

#### 7.4.11 Adicionar Anexo

```
POST /api/financial/purchase-orders/:id/attachments
```

**Body:**
```json
{
  "name": "Cotação Fornecedor",
  "url": "https://storage.example.com/attachments/cotacao.pdf",
  "type": "application/pdf"
}
```

---

### 7.5 Fluxo de Caixa

#### 7.5.1 Abrir Caixa

```
POST /api/financial/cash-flow
```

**Body:**
```json
{
  "openingBalance": 1000.00,
  "openedBy": "user_id",
  "date": "2025-10-28"
}
```

---

#### 7.5.2 Listar Fluxos de Caixa

```
GET /api/financial/cash-flow
```

**Query Params:**
- `status`: string (open, closed)
- `startDate`: string
- `endDate`: string
- `limit`: number
- `offset`: number

---

#### 7.5.3 Obter Resumo do Fluxo de Caixa

```
GET /api/financial/cash-flow/summary
```

**Query Params:**
- `startDate`: string
- `endDate`: string

---

#### 7.5.4 Obter Fluxo por Data

```
GET /api/financial/cash-flow/date/:date
```

---

#### 7.5.5 Obter Fluxo de Caixa

```
GET /api/financial/cash-flow/:id
```

---

#### 7.5.6 Fechar Caixa

```
PATCH /api/financial/cash-flow/:id/close
```

**Body:**
```json
{
  "closingBalance": 1500.00,
  "closedBy": "user_id",
  "notes": "Fechamento diário"
}
```

---

#### 7.5.7 Atualizar com Transações

```
PATCH /api/financial/cash-flow/:id/update
```

Atualiza o fluxo de caixa com todas as transações do dia.

---

#### 7.5.8 Registrar Sangria

```
POST /api/financial/cash-flow/:id/withdrawal
```

**Body:**
```json
{
  "amount": 200.00,
  "reason": "Pagamento fornecedor em dinheiro",
  "performedBy": "user_id"
}
```

---

#### 7.5.9 Registrar Suprimento

```
POST /api/financial/cash-flow/:id/deposit
```

**Body:**
```json
{
  "amount": 500.00,
  "reason": "Reforço de caixa",
  "performedBy": "user_id"
}
```

---

## 8. Gateway de Pagamento

Base: `/api/payment-gateway`

### 8.1 Webhooks (Públicos)

#### 8.1.1 Webhook Asaas

**[PUBLIC]** Receber eventos do Asaas.

```
POST /api/payment-gateway/webhooks/asaas
```

---

#### 8.1.2 Webhook PagBank

**[PUBLIC]** Receber eventos do PagBank.

```
POST /api/payment-gateway/webhooks/pagbank
```

---

### 8.2 Configuração

#### 8.2.1 Salvar Configuração

```
POST /api/payment-gateway/config
```

**Body:**
```json
{
  "gateway": "asaas",
  "environment": "production",
  "apiKey": "sua_api_key",
  "webhookUrl": "https://seu-dominio.com/api/payment-gateway/webhooks/asaas",
  "settings": {
    "pixEnabled": true,
    "creditCardEnabled": true,
    "boletoEnabled": true
  }
}
```

**Gateways suportados:**
- `asaas`
- `pagbank`

---

#### 8.2.2 Listar Configurações

```
GET /api/payment-gateway/config
```

---

#### 8.2.3 Obter Configuração

```
GET /api/payment-gateway/config/:gateway/:environment
```

---

#### 8.2.4 Excluir Configuração

```
DELETE /api/payment-gateway/config/:gateway/:environment
```

---

#### 8.2.5 Testar Conexão

```
POST /api/payment-gateway/test/:gateway
```

**Body:**
```json
{
  "environment": "sandbox",
  "apiKey": "test_api_key"
}
```

---

### 8.3 Clientes

#### 8.3.1 Sincronizar Cliente

```
POST /api/payment-gateway/customers
```

**Body:**
```json
{
  "gateway": "asaas",
  "leadId": "lead_uuid",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "+5511999999999",
  "cpfCnpj": "123.456.789-00",
  "address": {
    "street": "Rua Exemplo",
    "number": "100",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01000-000"
  }
}
```

---

#### 8.3.2 Obter Cliente por Lead

```
GET /api/payment-gateway/customers/lead/:leadId
```

**Query Params:**
- `gateway`: string (asaas, pagbank)

---

### 8.4 Cobranças

#### 8.4.1 Criar Cobrança

```
POST /api/payment-gateway/charges
```

**Body:**
```json
{
  "gateway": "asaas",
  "customerId": "gateway_customer_id",
  "leadId": "lead_uuid",
  "value": 250.00,
  "dueDate": "2025-11-30",
  "description": "Consulta Dermatológica",
  "paymentMethods": ["pix", "credit_card", "boleto"],
  "billingType": "UNDEFINED",
  "installmentCount": 1,
  "externalReference": "appointment_uuid"
}
```

**Tipos de Cobrança (billingType):**
- `BOLETO`: Boleto bancário
- `CREDIT_CARD`: Cartão de crédito
- `PIX`: PIX
- `UNDEFINED`: Permite escolher no checkout

---

#### 8.4.2 Listar Cobranças

```
GET /api/payment-gateway/charges/:gateway
```

**Query Params:**
- `status`: string (pending, confirmed, received, overdue, cancelled)
- `startDate`: string
- `endDate`: string
- `leadId`: string
- `limit`: number
- `offset`: number

---

#### 8.4.3 Obter Cobrança

```
GET /api/payment-gateway/charges/:gateway/:chargeId
```

---

#### 8.4.4 Obter QR Code PIX

```
GET /api/payment-gateway/charges/:gateway/:chargeId/pix
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "qrCode": "00020126580014br.gov.bcb.pix...",
    "qrCodeImage": "data:image/png;base64,...",
    "expirationDate": "2025-10-28T23:59:59Z"
  }
}
```

---

#### 8.4.5 Estornar Cobrança

```
POST /api/payment-gateway/charges/:gateway/:chargeId/refund
```

**Body:**
```json
{
  "value": 250.00,
  "description": "Cliente solicitou cancelamento"
}
```

---

### 8.5 Gerenciamento de Webhooks

#### 8.5.1 Obter Logs de Webhooks

```
GET /api/payment-gateway/webhooks/logs
```

**Query Params:**
- `gateway`: string
- `status`: string (success, failed)
- `startDate`: string
- `endDate`: string
- `limit`: number
- `offset`: number

---

#### 8.5.2 Reprocessar Webhook

```
POST /api/payment-gateway/webhooks/:id/retry
```

---

## 9. Usuários e Permissões

Base: `/api/users`

### 9.1 Permissões

#### 9.1.1 Obter Minhas Permissões

Qualquer usuário autenticado pode ver suas próprias permissões.

```
GET /api/users/permissions/me
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "permissions": [
      "leads.view_all",
      "leads.create",
      "leads.update",
      "appointments.view_all",
      "financial.view"
    ]
  }
}
```

---

### 9.2 Logs de Auditoria

#### 9.2.1 Listar Logs de Auditoria

**Permissão:** `users.view_logs`

```
GET /api/users/audit-logs
```

**Query Params:**
- `userId`: string
- `action`: string (create, update, delete)
- `resource`: string
- `startDate`: string
- `endDate`: string
- `limit`: number
- `offset`: number

---

### 9.3 Gerenciamento de Usuários

#### 9.3.1 Listar Usuários

**Permissão:** `users.view_all`

```
GET /api/users
```

**Query Params:**
- `role`: string (admin, manager, user)
- `status`: string (active, inactive)
- `search`: string
- `limit`: number
- `offset`: number

---

#### 9.3.2 Obter Usuário

**Permissão:** `users.view_all`

```
GET /api/users/:id
```

---

#### 9.3.3 Criar Usuário

**Permissão:** `users.create` ou `users.create_basic`

```
POST /api/users
```

**Body:**
```json
{
  "email": "novo@exemplo.com",
  "name": "Novo Usuário",
  "role": "user",
  "permissions": [
    "leads.view_all",
    "leads.create",
    "appointments.view_own"
  ],
  "sendWelcomeEmail": true
}
```

**Roles:**
- `admin`: Administrador do sistema
- `manager`: Gerente
- `user`: Usuário comum

---

#### 9.3.4 Atualizar Usuário

**Permissão:** `users.update` ou `users.update_basic`

```
PUT /api/users/:id
```

**Body:**
```json
{
  "name": "Nome Atualizado",
  "role": "manager",
  "permissions": [
    "leads.view_all",
    "leads.create",
    "leads.update",
    "leads.delete"
  ],
  "status": "active"
}
```

---

#### 9.3.5 Reenviar Email de Boas-Vindas

**Permissão:** `users.update` ou `users.update_basic`

```
POST /api/users/:id/resend-welcome-email
```

---

#### 9.3.6 Excluir Usuário

**Permissão:** `users.delete`

```
DELETE /api/users/:id
```

Realiza soft delete (desativa o usuário).

---

## 10. Automação de Marketing

Base: `/api/marketing/automation`

### 10.1 Triggers

#### 10.1.1 Listar Triggers

```
GET /api/marketing/automation/triggers
```

**Query Params:**
- `eventType`: string
- `isActive`: boolean
- `limit`: number
- `offset`: number

---

#### 10.1.2 Obter Estatísticas de Triggers

```
GET /api/marketing/automation/triggers/stats
```

---

#### 10.1.3 Obter Tipos de Eventos

```
GET /api/marketing/automation/triggers/events
```

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "lead.created",
      "description": "Quando um novo lead é criado",
      "category": "Leads"
    },
    {
      "name": "appointment.scheduled",
      "description": "Quando um agendamento é criado",
      "category": "Agenda"
    }
  ]
}
```

---

#### 10.1.4 Obter Trigger

```
GET /api/marketing/automation/triggers/:id
```

---

#### 10.1.5 Criar Trigger

```
POST /api/marketing/automation/triggers
```

**Body:**
```json
{
  "name": "Boas-vindas a novos leads",
  "eventType": "lead.created",
  "conditions": {
    "source": "website",
    "status": "new"
  },
  "actions": [
    {
      "type": "send_email",
      "config": {
        "template": "welcome_email",
        "subject": "Bem-vindo!"
      }
    }
  ],
  "isActive": true
}
```

---

#### 10.1.6 Atualizar Trigger

```
PUT /api/marketing/automation/triggers/:id
```

---

#### 10.1.7 Excluir Trigger

```
DELETE /api/marketing/automation/triggers/:id
```

---

#### 10.1.8 Ativar/Desativar Trigger

```
PATCH /api/marketing/automation/triggers/:id/toggle
```

---

### 10.2 Workflows

#### 10.2.1 Listar Workflows

```
GET /api/marketing/automation/workflows
```

**Query Params:**
- `status`: string (draft, active, paused, completed)
- `category`: string
- `limit`: number
- `offset`: number

---

#### 10.2.2 Obter Estatísticas de Workflows

```
GET /api/marketing/automation/workflows/stats
```

---

#### 10.2.3 Obter Workflow

```
GET /api/marketing/automation/workflows/:id
```

---

#### 10.2.4 Criar Workflow

```
POST /api/marketing/automation/workflows
```

**Body:**
```json
{
  "name": "Nutrição de Leads",
  "description": "Sequência de emails para nutrir leads",
  "category": "email_sequence",
  "steps": [
    {
      "order": 1,
      "type": "delay",
      "config": {
        "duration": 2,
        "unit": "days"
      }
    },
    {
      "order": 2,
      "type": "send_email",
      "config": {
        "template": "educational_content_1",
        "subject": "Dica #1: Como cuidar da pele"
      }
    }
  ],
  "triggerEvent": "lead.created",
  "isActive": true
}
```

---

#### 10.2.5 Atualizar Workflow

```
PUT /api/marketing/automation/workflows/:id
```

---

#### 10.2.6 Excluir Workflow

```
DELETE /api/marketing/automation/workflows/:id
```

---

#### 10.2.7 Executar Workflow

```
POST /api/marketing/automation/workflows/:id/execute
```

**Body:**
```json
{
  "leadId": "lead_uuid",
  "context": {
    "source": "manual_trigger"
  }
}
```

---

#### 10.2.8 Obter Logs de Execução

```
GET /api/marketing/automation/workflows/:id/logs
```

**Query Params:**
- `status`: string (success, failed, in_progress)
- `startDate`: string
- `endDate`: string
- `limit`: number

---

### 10.3 Templates

#### 10.3.1 Listar Templates

```
GET /api/marketing/automation/templates
```

**Query Params:**
- `category`: string
- `isPublic`: boolean

---

#### 10.3.2 Obter Template

```
GET /api/marketing/automation/templates/:id
```

---

### 10.4 Eventos

#### 10.4.1 Listar Eventos

```
GET /api/marketing/automation/events
```

**Query Params:**
- `processed`: boolean
- `limit`: number (padrão: 100)

---

#### 10.4.2 Obter Estatísticas de Eventos

```
GET /api/marketing/automation/events/stats
```

---

#### 10.4.3 Listar Eventos (v2)

```
GET /api/marketing/automation/events/v2
```

**Query Params:**
- `eventName`: string
- `entityType`: string
- `processed`: boolean
- `startDate`: string
- `endDate`: string
- `limit`: number
- `offset`: number

---

#### 10.4.4 Obter Estatísticas (v2)

```
GET /api/marketing/automation/events/v2/stats
```

---

#### 10.4.5 Obter Tipos de Eventos (v2)

```
GET /api/marketing/automation/events/v2/types
```

---

#### 10.4.6 Limpar Eventos Antigos

```
DELETE /api/marketing/automation/events/v2/cleanup
```

**Query Params:**
- `olderThanDays`: number (padrão: 90)

---

#### 10.4.7 Obter Evento

```
GET /api/marketing/automation/events/v2/:id
```

---

### 10.5 Integrações

#### 10.5.1 Listar Integrações

```
GET /api/marketing/automation/integrations
```

**Query Params:**
- `type`: string (webhook, email, sms, crm)
- `isActive`: boolean

---

#### 10.5.2 Obter Integração

```
GET /api/marketing/automation/integrations/:id
```

---

#### 10.5.3 Criar Integração

```
POST /api/marketing/automation/integrations
```

**Body:**
```json
{
  "name": "Webhook Externo",
  "type": "webhook",
  "config": {
    "url": "https://api.externa.com/webhook",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer token"
    }
  },
  "isActive": true
}
```

---

#### 10.5.4 Atualizar Integração

```
PUT /api/marketing/automation/integrations/:id
```

---

#### 10.5.5 Excluir Integração

```
DELETE /api/marketing/automation/integrations/:id
```

---

#### 10.5.6 Testar Integração

```
POST /api/marketing/automation/integrations/:id/test
```

**Body:**
```json
{
  "testData": {
    "lead": {
      "name": "Teste",
      "email": "teste@exemplo.com"
    }
  }
}
```

---

## 11. Estoque

Base: `/api/stock`

### 11.1 Health Check

**[PUBLIC]** Verificar status do módulo de estoque.

```
GET /api/stock/health
```

---

### 11.2 Produtos

#### 11.2.1 Listar Produtos

```
GET /api/stock/products
```

**Query Params:**
- `search`: string
- `category`: string (medical, cosmetic, equipment, office, other)
- `isActive`: boolean
- `lowStock`: boolean
- `limit`: number (padrão: 50)
- `offset`: number

---

#### 11.2.2 Criar Produto

```
POST /api/stock/products
```

**Body:**
```json
{
  "name": "Botox 100U",
  "sku": "BOT-100",
  "barcode": "7891234567890",
  "category": "medical",
  "unit": "unidade",
  "description": "Toxina botulínica tipo A - 100 unidades",
  "purchasePrice": 450.00,
  "salePrice": 850.00,
  "currentStock": 10,
  "minStock": 5,
  "maxStock": 30,
  "location": "Refrigerador A - Prateleira 2",
  "expirationDate": "2026-12-31",
  "supplier": "Fornecedor XYZ",
  "isActive": true
}
```

**Categorias:**
- `medical`: Produtos médicos
- `cosmetic`: Cosméticos
- `equipment`: Equipamentos
- `office`: Material de escritório
- `other`: Outros

**Unidades:**
- `unidade`, `caixa`, `frasco`, `ml`, `mg`, `g`, `kg`, `l`, `m`, `pacote`

---

#### 11.2.3 Obter Produto

```
GET /api/stock/products/:id
```

---

#### 11.2.4 Atualizar Produto

```
PUT /api/stock/products/:id
```

---

#### 11.2.5 Excluir Produto

```
DELETE /api/stock/products/:id
```

---

#### 11.2.6 Buscar por SKU

```
GET /api/stock/products/sku/:sku
```

---

#### 11.2.7 Buscar por Código de Barras

```
GET /api/stock/products/barcode/:barcode
```

---

### 11.3 Dashboard de Estoque

#### 11.3.1 Produtos com Estoque Baixo

```
GET /api/stock/dashboard/low-stock
```

---

#### 11.3.2 Produtos sem Estoque

```
GET /api/stock/dashboard/out-of-stock
```

---

#### 11.3.3 Produtos Próximos ao Vencimento

```
GET /api/stock/dashboard/expiring
```

**Query Params:**
- `days`: number (padrão: 30)

---

#### 11.3.4 Valor Total do Estoque

```
GET /api/stock/dashboard/stock-value
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "totalValue": 125000.00,
    "productCount": 350,
    "categories": {
      "medical": 85000.00,
      "cosmetic": 30000.00,
      "equipment": 10000.00
    }
  }
}
```

---

### 11.4 Movimentações de Estoque

#### 11.4.1 Listar Movimentações

```
GET /api/stock/movements
```

**Query Params:**
- `productId`: string
- `type`: string (ENTRADA, SAIDA, AJUSTE, DEVOLUCAO, TRANSFERENCIA)
- `reason`: string (compra, venda, ajuste_inventario, procedimento, devolucao, perda, transferencia, outro)
- `startDate`: string
- `endDate`: string
- `limit`: number
- `offset`: number

---

#### 11.4.2 Criar Movimentação

```
POST /api/stock/movements
```

**Body:**
```json
{
  "productId": "product_uuid",
  "type": "ENTRADA",
  "reason": "compra",
  "quantity": 5,
  "referenceId": "purchase_order_uuid",
  "notes": "Compra mensal de insumos",
  "cost": 450.00
}
```

**Tipos:**
- `ENTRADA`: Entrada de produtos
- `SAIDA`: Saída de produtos
- `AJUSTE`: Ajuste de inventário
- `DEVOLUCAO`: Devolução
- `TRANSFERENCIA`: Transferência entre locais

**Motivos:**
- `compra`: Compra de fornecedor
- `venda`: Venda para cliente
- `ajuste_inventario`: Ajuste de inventário
- `procedimento`: Uso em procedimento
- `devolucao`: Devolução
- `perda`: Perda/Extravio
- `transferencia`: Transferência
- `outro`: Outro motivo

---

#### 11.4.3 Obter Movimentação

```
GET /api/stock/movements/:id
```

---

#### 11.4.4 Obter Movimentações por Produto

```
GET /api/stock/movements/product/:productId
```

**Query Params:**
- `limit`: number (padrão: 50)

---

#### 11.4.5 Resumo de Movimentações

```
GET /api/stock/movements/summary
```

**Query Params:**
- `startDate`: string (obrigatório)
- `endDate`: string (obrigatório)

---

#### 11.4.6 Produtos Mais Utilizados

```
GET /api/stock/movements/most-used
```

**Query Params:**
- `limit`: number (padrão: 10)

---

### 11.5 Alertas de Estoque

#### 11.5.1 Listar Alertas

```
GET /api/stock/alerts
```

**Query Params:**
- `type`: string (low_stock, out_of_stock, expiring_soon)
- `status`: string (active, resolved, ignored)
- `productId`: string
- `limit`: number
- `offset`: number

---

#### 11.5.2 Resolver Alerta

```
POST /api/stock/alerts/:id/resolve
```

**Body:**
```json
{
  "resolution": "Compra realizada - pedido #1234"
}
```

---

#### 11.5.3 Ignorar Alerta

```
POST /api/stock/alerts/:id/ignore
```

---

#### 11.5.4 Contar Alertas Ativos

```
GET /api/stock/alerts/count
```

---

### 11.6 Relatórios

#### 11.6.1 Movimentações Mensais

```
GET /api/stock/reports/movements-monthly
```

**Query Params:**
- `months`: number (padrão: 6)

---

#### 11.6.2 Produtos Mais Usados

```
GET /api/stock/reports/most-used-products
```

**Query Params:**
- `limit`: number (padrão: 10)

---

#### 11.6.3 Valor do Estoque por Categoria

```
GET /api/stock/reports/stock-value-by-category
```

---

### 11.7 Produtos em Procedimentos

#### 11.7.1 Adicionar Produto a Procedimento

```
POST /api/stock/procedure-products
```

**Body:**
```json
{
  "procedureId": "procedure_uuid",
  "productId": "product_uuid",
  "quantityUsed": 1,
  "isOptional": false,
  "notes": "Aplicação padrão"
}
```

---

#### 11.7.2 Listar Produtos de Procedimento

```
GET /api/stock/procedure-products/:procedureId
```

---

#### 11.7.3 Remover Produto de Procedimento

```
DELETE /api/stock/procedure-products/:id
```

---

#### 11.7.4 Validar Estoque para Procedimento

```
GET /api/stock/procedures/:procedureId/validate-stock
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "products": [
      {
        "productId": "product_uuid",
        "name": "Botox 100U",
        "required": 1,
        "available": 10,
        "sufficient": true
      }
    ]
  }
}
```

---

#### 11.7.5 Consumir Estoque ao Finalizar Procedimento

```
POST /api/stock/procedures/:procedureId/consume-stock
```

**Body:**
```json
{
  "medicalRecordId": "medical_record_uuid"
}
```

---

#### 11.7.6 Atualizar Quantidade

```
PUT /api/stock/procedure-products/:id/quantity
```

**Body:**
```json
{
  "quantityUsed": 2
}
```

---

### 11.8 Contagem de Inventário

#### 11.8.1 Listar Contagens

```
GET /api/stock/inventory-counts
```

**Query Params:**
- `status`: string (draft, in_progress, completed, cancelled)
- `startDate`: string
- `endDate`: string
- `location`: string
- `limit`: number
- `offset`: number

---

#### 11.8.2 Criar Contagem

```
POST /api/stock/inventory-counts
```

**Body:**
```json
{
  "description": "Inventário Mensal - Outubro 2025",
  "location": "Estoque Principal",
  "countDate": "2025-10-31"
}
```

---

#### 11.8.3 Obter Contagem

```
GET /api/stock/inventory-counts/:id
```

---

#### 11.8.4 Adicionar Item à Contagem

```
POST /api/stock/inventory-counts/:id/items
```

**Body:**
```json
{
  "productId": "product_uuid",
  "countedStock": 8,
  "notes": "Encontradas 2 unidades a menos que o sistema"
}
```

---

#### 11.8.5 Atualizar Item

```
PUT /api/stock/inventory-count-items/:id
```

**Body:**
```json
{
  "countedStock": 9,
  "notes": "Encontrada 1 unidade adicional"
}
```

---

#### 11.8.6 Excluir Item

```
DELETE /api/stock/inventory-count-items/:id
```

---

#### 11.8.7 Ajustar Item

```
POST /api/stock/inventory-count-items/:id/adjust
```

Ajusta o estoque do sistema para corresponder à contagem física.

---

#### 11.8.8 Ajustar Todos os Itens

```
POST /api/stock/inventory-counts/:id/adjust-all
```

Ajusta todos os itens da contagem em lote.

---

#### 11.8.9 Concluir Contagem

```
POST /api/stock/inventory-counts/:id/complete
```

---

#### 11.8.10 Cancelar Contagem

```
POST /api/stock/inventory-counts/:id/cancel
```

---

#### 11.8.11 Relatório de Divergências

```
GET /api/stock/inventory-counts/:id/discrepancies
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "totalItems": 50,
    "itemsWithDiscrepancy": 5,
    "totalValueDifference": -450.00,
    "discrepancies": [
      {
        "productId": "product_uuid",
        "productName": "Botox 100U",
        "systemStock": 10,
        "countedStock": 8,
        "difference": -2,
        "valueDifference": -900.00
      }
    ]
  }
}
```

---

### 11.9 Logs de Auditoria

#### 11.9.1 Listar Logs

```
GET /api/stock/audit-logs
```

**Query Params:**
- `entityType`: string (product, movement, alert)
- `entityId`: string
- `action`: string (create, update, delete)
- `userId`: string
- `startDate`: string
- `endDate`: string
- `limit`: number
- `offset`: number

---

#### 11.9.2 Histórico de Entidade

```
GET /api/stock/audit-logs/entity/:entityType/:entityId
```

---

#### 11.9.3 Atividade de Usuário

```
GET /api/stock/audit-logs/user/:userId
```

**Query Params:**
- `days`: number (padrão: 30)

---

#### 11.9.4 Resumo de Auditoria

```
GET /api/stock/audit-logs/summary
```

**Query Params:**
- `days`: number (padrão: 30)

---

## 12. Vendas e Comissões

Base: `/api/vendas`

### 12.1 Vendedores

#### 12.1.1 Criar Vendedor

```
POST /api/vendas/vendedores
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "+5511999999999",
  "commissionRate": 10.0,
  "status": "active",
  "startDate": "2025-10-01"
}
```

---

#### 12.1.2 Listar Vendedores

```
GET /api/vendas/vendedores
```

**Query Params:**
- `status`: string (active, inactive)
- `search`: string
- `limit`: number
- `offset`: number

---

#### 12.1.3 Obter Vendedor

```
GET /api/vendas/vendedores/:id
```

---

#### 12.1.4 Obter Vendas do Vendedor

```
GET /api/vendas/vendedores/:id/vendas
```

**Query Params:**
- `startDate`: string
- `endDate`: string
- `status`: string

---

#### 12.1.5 Atualizar Vendedor

```
PUT /api/vendas/vendedores/:id
```

---

#### 12.1.6 Excluir Vendedor

```
DELETE /api/vendas/vendedores/:id
```

---

### 12.2 Comissões

#### 12.2.1 Listar Comissões

```
GET /api/vendas/comissoes
```

**Query Params:**
- `vendedorId`: string
- `status`: string (pending, paid, cancelled)
- `startDate`: string
- `endDate`: string
- `limit`: number
- `offset`: number

---

#### 12.2.2 Obter Estatísticas de Comissões

```
GET /api/vendas/comissoes/stats
```

**Query Params:**
- `vendedorId`: string
- `startDate`: string
- `endDate`: string

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "totalPending": 5000.00,
    "totalPaid": 45000.00,
    "totalCancelled": 1000.00,
    "commissionCount": 150
  }
}
```

---

#### 12.2.3 Relatório de Comissões

```
GET /api/vendas/comissoes/relatorio
```

**Query Params:**
- `vendedorId`: string
- `startDate`: string
- `endDate`: string
- `groupBy`: string (day, week, month)

---

#### 12.2.4 Obter Comissão

```
GET /api/vendas/comissoes/:id
```

---

#### 12.2.5 Pagar Comissão

```
POST /api/vendas/comissoes/:id/pagar
```

**Body:**
```json
{
  "paymentDate": "2025-10-28",
  "paymentMethod": "bank_transfer",
  "notes": "Pagamento ref. vendas Outubro/2025"
}
```

---

### 12.3 Vendas

#### 12.3.1 Criar Venda

```
POST /api/vendas
```

**Body:**
```json
{
  "vendedorId": "vendedor_uuid",
  "leadId": "lead_uuid",
  "procedureId": "procedure_uuid",
  "value": 5000.00,
  "commissionRate": 10.0,
  "saleDate": "2025-10-28",
  "paymentMethod": "credit_card",
  "installments": 3,
  "notes": "Cliente fechou pacote completo"
}
```

---

#### 12.3.2 Listar Vendas

```
GET /api/vendas
```

**Query Params:**
- `vendedorId`: string
- `leadId`: string
- `status`: string (pending, confirmed, cancelled)
- `startDate`: string
- `endDate`: string
- `limit`: number
- `offset`: number

---

#### 12.3.3 Obter Estatísticas de Vendas

```
GET /api/vendas/stats
```

**Query Params:**
- `vendedorId`: string
- `startDate`: string
- `endDate`: string

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "totalSales": 250000.00,
    "salesCount": 75,
    "averageTicket": 3333.33,
    "conversionRate": 25.5,
    "topSeller": {
      "id": "vendedor_uuid",
      "name": "João Silva",
      "totalSales": 100000.00
    }
  }
}
```

---

#### 12.3.4 Ranking de Vendedores

```
GET /api/vendas/ranking
```

**Query Params:**
- `startDate`: string
- `endDate`: string
- `limit`: number (padrão: 10)

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "position": 1,
      "vendedorId": "vendedor_1",
      "name": "João Silva",
      "totalSales": 100000.00,
      "salesCount": 30,
      "commissionEarned": 10000.00
    },
    {
      "position": 2,
      "vendedorId": "vendedor_2",
      "name": "Maria Santos",
      "totalSales": 85000.00,
      "salesCount": 25,
      "commissionEarned": 8500.00
    }
  ]
}
```

---

#### 12.3.5 Obter Venda

```
GET /api/vendas/:id
```

---

#### 12.3.6 Confirmar Venda

```
POST /api/vendas/:id/confirmar
```

**Body:**
```json
{
  "confirmationDate": "2025-10-28",
  "notes": "Pagamento confirmado"
}
```

---

#### 12.3.7 Cancelar Venda

```
POST /api/vendas/:id/cancelar
```

**Body:**
```json
{
  "reason": "Cliente desistiu",
  "cancelledBy": "user_id"
}
```

---

## 13. Business Intelligence

Base: `/api/bi`

### 13.1 Dashboards

#### 13.1.1 Dashboard Executivo

```
GET /api/bi/dashboards/executive
```

**Query Params:**
- `startDate`: string
- `endDate`: string

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 250000.00,
      "growth": 15.5,
      "trend": "up"
    },
    "leads": {
      "total": 350,
      "newLeads": 45,
      "conversionRate": 25.0
    },
    "appointments": {
      "total": 120,
      "completed": 95,
      "cancelled": 10,
      "completionRate": 79.16
    },
    "topProcedures": [
      {
        "name": "Botox",
        "count": 45,
        "revenue": 85000.00
      }
    ]
  }
}
```

---

#### 13.1.2 Dashboard de Vendas

```
GET /api/bi/dashboards/sales
```

**Query Params:**
- `startDate`: string
- `endDate`: string

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "totalSales": 250000.00,
    "salesCount": 75,
    "averageTicket": 3333.33,
    "topSellers": [
      {
        "name": "João Silva",
        "sales": 100000.00,
        "count": 30
      }
    ],
    "salesByProcedure": [
      {
        "procedure": "Botox",
        "sales": 85000.00,
        "count": 45
      }
    ],
    "salesByMonth": [
      {
        "month": "2025-10",
        "sales": 250000.00,
        "count": 75
      }
    ]
  }
}
```

---

### 13.2 KPIs

#### 13.2.1 Obter Todos os KPIs

```
GET /api/bi/kpis
```

**Query Params:**
- `startDate`: string
- `endDate`: string
- `category`: string (revenue, leads, appointments, sales, stock)

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "Receita Total",
      "value": 250000.00,
      "previousValue": 217000.00,
      "growth": 15.2,
      "unit": "BRL",
      "category": "revenue"
    },
    {
      "name": "Taxa de Conversão",
      "value": 25.0,
      "previousValue": 22.5,
      "growth": 11.11,
      "unit": "%",
      "category": "leads"
    }
  ]
}
```

---

### 13.3 Resumo de Dados

#### 13.3.1 Obter Resumo

```
GET /api/bi/data/summary
```

**Query Params:**
- `startDate`: string
- `endDate`: string

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "revenue": 250000.00,
    "expenses": 85000.00,
    "profit": 165000.00,
    "profitMargin": 66.0,
    "leadCount": 350,
    "appointmentCount": 120,
    "salesCount": 75,
    "stockValue": 125000.00
  }
}
```

---

## 14. Marketing

Base: `/api/marketing`

### 14.1 Webhooks (Público)

#### 14.1.1 Webhook WAHA

**[PUBLIC]** Receber eventos do WAHA para módulo de marketing.

```
POST /api/marketing/waha/webhook
```

---

### 14.2 Campanhas

#### 14.2.1 Criar Campanha

```
POST /api/marketing/campaigns
```

**Body:**
```json
{
  "name": "Promoção Black Friday 2025",
  "description": "Campanha de descontos especiais",
  "type": "promotional",
  "status": "draft",
  "startDate": "2025-11-20",
  "endDate": "2025-11-30",
  "budget": 5000.00,
  "channels": ["whatsapp", "email", "social"],
  "targetAudience": {
    "ageRange": [25, 55],
    "interests": ["skincare", "aesthetics"]
  }
}
```

**Tipos:**
- `promotional`: Promocional
- `educational`: Educacional
- `seasonal`: Sazonal
- `awareness`: Conscientização

**Status:**
- `draft`: Rascunho
- `scheduled`: Agendada
- `active`: Ativa
- `paused`: Pausada
- `completed`: Concluída
- `cancelled`: Cancelada

---

#### 14.2.2 Listar Campanhas

```
GET /api/marketing/campaigns
```

**Query Params:**
- `type`: string
- `status`: string
- `startDate`: string
- `endDate`: string
- `limit`: number
- `offset`: number

---

#### 14.2.3 Obter Estatísticas de Campanhas

```
GET /api/marketing/campaigns/stats
```

**Query Params:**
- `campaignId`: string (opcional)

---

#### 14.2.4 Obter Campanha

```
GET /api/marketing/campaigns/:id
```

---

#### 14.2.5 Atualizar Campanha

```
PUT /api/marketing/campaigns/:id
```

---

#### 14.2.6 Excluir Campanha

```
DELETE /api/marketing/campaigns/:id
```

---

### 14.3 Posts Sociais

#### 14.3.1 Criar Post

```
POST /api/marketing/social-posts
```

**Body:**
```json
{
  "campaignId": "campaign_uuid",
  "content": "Confira nossa promoção especial de Black Friday! 🎉",
  "platforms": ["instagram", "facebook"],
  "mediaUrls": [
    "https://storage.example.com/images/post1.jpg"
  ],
  "scheduledAt": "2025-11-20T10:00:00Z",
  "hashtags": ["blackfriday", "beleza", "promocao"]
}
```

---

#### 14.3.2 Listar Posts

```
GET /api/marketing/social-posts
```

**Query Params:**
- `campaignId`: string
- `platform`: string
- `status`: string (draft, scheduled, published, failed)
- `limit`: number
- `offset`: number

---

#### 14.3.3 Obter Post

```
GET /api/marketing/social-posts/:id
```

---

#### 14.3.4 Atualizar Post

```
PUT /api/marketing/social-posts/:id
```

---

#### 14.3.5 Excluir Post

```
DELETE /api/marketing/social-posts/:id
```

---

#### 14.3.6 Agendar Post

```
POST /api/marketing/social-posts/:id/schedule
```

**Body:**
```json
{
  "scheduledAt": "2025-11-20T10:00:00Z"
}
```

---

### 14.4 Mensagens em Massa

#### 14.4.1 Criar Envio em Massa

```
POST /api/marketing/bulk-messages
```

**Body:**
```json
{
  "campaignId": "campaign_uuid",
  "name": "Convite Black Friday",
  "message": "Olá {{name}}! Não perca nossa promoção especial de Black Friday com até 40% de desconto!",
  "mediaUrl": "https://storage.example.com/images/promo.jpg",
  "recipients": [
    {
      "leadId": "lead_uuid_1",
      "phone": "+5511999999999",
      "name": "João Silva"
    },
    {
      "leadId": "lead_uuid_2",
      "phone": "+5511988888888",
      "name": "Maria Santos"
    }
  ],
  "sessionName": "principal",
  "scheduledAt": "2025-11-20T09:00:00Z"
}
```

---

#### 14.4.2 Listar Envios em Massa

```
GET /api/marketing/bulk-messages
```

**Query Params:**
- `campaignId`: string
- `status`: string (pending, processing, completed, failed)
- `startDate`: string
- `endDate`: string
- `limit`: number
- `offset`: number

---

#### 14.4.3 Obter Envio em Massa

```
GET /api/marketing/bulk-messages/:id
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "bulk_uuid",
    "name": "Convite Black Friday",
    "status": "completed",
    "totalRecipients": 500,
    "sent": 485,
    "failed": 15,
    "delivered": 470,
    "read": 320,
    "replied": 45,
    "completedAt": "2025-11-20T12:30:00Z"
  }
}
```

---

### 14.5 Landing Pages

#### 14.5.1 Criar Landing Page

```
POST /api/marketing/landing-pages
```

**Body:**
```json
{
  "campaignId": "campaign_uuid",
  "title": "Promoção Black Friday",
  "slug": "promo-black-friday-2025",
  "content": {
    "headline": "Até 40% OFF em todos os tratamentos!",
    "subheadline": "Somente de 20 a 30 de Novembro",
    "ctaText": "Agendar Agora",
    "ctaUrl": "https://wa.me/5511999999999",
    "sections": [
      {
        "type": "hero",
        "content": "..."
      }
    ]
  },
  "seoTitle": "Promoção Black Friday - Clínica Estética",
  "seoDescription": "Aproveite descontos de até 40% em tratamentos estéticos",
  "status": "draft"
}
```

---

#### 14.5.2 Listar Landing Pages

```
GET /api/marketing/landing-pages
```

**Query Params:**
- `campaignId`: string
- `status`: string (draft, published, archived)
- `limit`: number
- `offset`: number

---

#### 14.5.3 Obter Landing Page

```
GET /api/marketing/landing-pages/:id
```

---

#### 14.5.4 Atualizar Landing Page

```
PUT /api/marketing/landing-pages/:id
```

---

#### 14.5.5 Publicar Landing Page

```
POST /api/marketing/landing-pages/:id/publish
```

---

#### 14.5.6 Obter Analytics da Landing Page

```
GET /api/marketing/landing-pages/:id/analytics
```

**Query Params:**
- `startDate`: string
- `endDate`: string

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "views": 1250,
    "uniqueVisitors": 980,
    "conversions": 125,
    "conversionRate": 12.76,
    "averageTimeOnPage": 95,
    "bounceRate": 35.5,
    "topSources": [
      {
        "source": "instagram",
        "visits": 450
      }
    ]
  }
}
```

---

### 14.6 Assistente de IA

#### 14.6.1 Analisar com IA

```
POST /api/marketing/ai/analyze
```

**Body:**
```json
{
  "type": "campaign_performance",
  "data": {
    "campaignId": "campaign_uuid"
  }
}
```

---

#### 14.6.2 Listar Análises de IA

```
GET /api/marketing/ai/analyses
```

**Query Params:**
- `type`: string
- `startDate`: string
- `endDate`: string
- `limit`: number

---

#### 14.6.3 Otimizar Copy

```
POST /api/marketing/ai/optimize-copy
```

**Body:**
```json
{
  "text": "Venha conhecer nossa clínica",
  "goal": "increase_engagement",
  "tone": "friendly",
  "length": "short"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "original": "Venha conhecer nossa clínica",
    "optimized": "🌟 Descubra a transformação que você merece! Agende sua avaliação gratuita hoje mesmo!",
    "improvements": [
      "Adicionado emoji para chamar atenção",
      "Call-to-action mais direto",
      "Benefício claro para o cliente"
    ]
  }
}
```

---

#### 14.6.4 Gerar Imagem com IA

```
POST /api/marketing/ai/generate-image
```

**Body:**
```json
{
  "prompt": "Mulher sorrindo após tratamento estético, ambiente profissional, iluminação natural",
  "style": "photorealistic",
  "size": "1024x1024"
}
```

---

### 14.7 Integrações

#### 14.7.1 Criar/Atualizar Integração

```
POST /api/marketing/integrations
```

**Body:**
```json
{
  "platform": "instagram",
  "credentials": {
    "accessToken": "token...",
    "pageId": "page_id"
  },
  "isActive": true
}
```

---

#### 14.7.2 Listar Integrações

```
GET /api/marketing/integrations
```

---

#### 14.7.3 Obter Provedores de IA

```
GET /api/marketing/integrations/ai-providers
```

---

#### 14.7.4 Obter Integração por Plataforma

```
GET /api/marketing/integrations/:platform
```

---

#### 14.7.5 Testar Integração

```
POST /api/marketing/integrations/:id/test
```

---

#### 14.7.6 Excluir Integração

```
DELETE /api/marketing/integrations/:id
```

---

### 14.8 Sessões WAHA

#### 14.8.1 Criar Sessão WAHA

```
POST /api/marketing/waha/sessions
```

**Body:**
```json
{
  "name": "marketing-principal",
  "displayName": "Marketing Principal"
}
```

---

#### 14.8.2 Listar Sessões

```
GET /api/marketing/waha/sessions
```

---

#### 14.8.3 Obter Sessão

```
GET /api/marketing/waha/sessions/:id
```

---

#### 14.8.4 Iniciar Sessão

```
POST /api/marketing/waha/sessions/:id/start
```

---

#### 14.8.5 Parar Sessão

```
POST /api/marketing/waha/sessions/:id/stop
```

---

#### 14.8.6 Obter QR Code

```
GET /api/marketing/waha/sessions/:id/qr
```

---

#### 14.8.7 Excluir Sessão

```
DELETE /api/marketing/waha/sessions/:id
```

---

#### 14.8.8 Enviar Mensagem

```
POST /api/marketing/waha/sessions/:id/send
```

**Body:**
```json
{
  "phone": "+5511999999999",
  "message": "Olá! Temos uma promoção especial para você!"
}
```

---

### 14.9 Upload de Imagem

#### 14.9.1 Upload de Imagem

```
POST /api/marketing/upload-image
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image`: File (máximo 5MB, apenas imagens)

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://seu-dominio.com/uploads/marketing/1234567890-image.jpg",
    "filename": "1234567890-image.jpg"
  }
}
```

---

### 14.10 Assistente de IA - Geração de Copy

#### 14.10.1 Gerar Copy

```
POST /api/marketing/ai-assistant/generate-copy
```

**Body:**
```json
{
  "prompt": "Crie um texto para promover tratamento de botox",
  "tone": "professional",
  "length": "medium"
}
```

---

### 14.11 Configurações de IA

#### 14.11.1 Listar Configurações

```
GET /api/marketing/ai/configs
```

---

#### 14.11.2 Criar/Atualizar Configuração

```
POST /api/marketing/ai/configs
```

**Body:**
```json
{
  "provider": "openai",
  "apiKey": "sk-...",
  "model": "gpt-4",
  "isActive": true
}
```

**Provedores suportados:**
- `openai`
- `anthropic`
- `google`

---

#### 14.11.3 Excluir Configuração

```
DELETE /api/marketing/ai/configs/:provider
```

---

#### 14.11.4 Testar Conexão

```
POST /api/marketing/ai/configs/test
```

**Body:**
```json
{
  "provider": "openai",
  "apiKey": "sk-..."
}
```

---

### 14.12 Assistente de IA - Novos Recursos

#### 14.12.1 Gerar Copy v2

```
POST /api/marketing/ai-assistant/generate-copy-v2
```

**Body:**
```json
{
  "prompt": "Crie copy para Instagram sobre tratamento facial",
  "tone": "casual",
  "length": "short",
  "includeEmojis": true,
  "includeHashtags": true
}
```

---

#### 14.12.2 Analisar Sentimento

```
POST /api/marketing/ai-assistant/analyze-sentiment
```

**Body:**
```json
{
  "text": "Adorei o atendimento! Super recomendo!"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "sentiment": "positive",
    "score": 0.95,
    "confidence": 0.98
  }
}
```

---

#### 14.12.3 Gerar Resumo

```
POST /api/marketing/ai-assistant/generate-summary
```

**Body:**
```json
{
  "text": "Texto longo para resumir...",
  "maxLength": 100
}
```

---

#### 14.12.4 Traduzir Texto

```
POST /api/marketing/ai-assistant/translate
```

**Body:**
```json
{
  "text": "Olá, como posso ajudar?",
  "targetLanguage": "en"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "originalText": "Olá, como posso ajudar?",
    "translatedText": "Hello, how can I help?",
    "sourceLanguage": "pt",
    "targetLanguage": "en"
  }
}
```

---

### 14.13 Uso e Monitoramento de IA

#### 14.13.1 Obter Estatísticas de Uso

```
GET /api/marketing/ai/usage-stats
```

**Query Params:**
- `startDate`: string
- `endDate`: string
- `provider`: string

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "totalRequests": 1250,
    "totalTokens": 500000,
    "totalCost": 75.50,
    "byProvider": {
      "openai": {
        "requests": 1000,
        "tokens": 400000,
        "cost": 60.00
      }
    },
    "byFeature": {
      "generate_copy": 600,
      "analyze_sentiment": 350,
      "translate": 300
    }
  }
}
```

---

#### 14.13.2 Obter Limites de Taxa

```
GET /api/marketing/ai/rate-limits
```

---

#### 14.13.3 Atualizar Limites de Taxa

```
PUT /api/marketing/ai/rate-limits
```

**Body:**
```json
{
  "provider": "openai",
  "requestsPerMinute": 60,
  "requestsPerDay": 10000,
  "tokensPerDay": 1000000
}
```

---

## 15. Meta (Instagram/Messenger)

Base: `/api/meta`

### 15.1 OAuth

#### 15.1.1 Iniciar OAuth

Iniciar fluxo OAuth do Meta.

```
GET /api/meta/oauth/start
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://www.facebook.com/v18.0/dialog/oauth?client_id=..."
  }
}
```

---

#### 15.1.2 Callback OAuth

**[PUBLIC]** Callback do OAuth (chamado pelo Meta).

```
GET /api/meta/oauth/callback
```

**Query Params:**
- `code`: string (authorization code)
- `state`: string (state token)

---

#### 15.1.3 Listar Contas Conectadas

```
GET /api/meta/accounts
```

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "account_id",
      "instagramUsername": "@minhaempresa",
      "instagramId": "instagram_page_id",
      "facebookPageId": "facebook_page_id",
      "facebookPageName": "Minha Empresa",
      "isActive": true,
      "connectedAt": "2025-10-01T10:00:00Z"
    }
  ]
}
```

---

#### 15.1.4 Desconectar Conta

```
DELETE /api/meta/accounts/:id
```

---

### 15.2 Webhooks (Públicos)

#### 15.2.1 Verificação de Webhook

**[PUBLIC]** Meta chama este endpoint para verificar o webhook.

```
GET /api/meta/webhook
```

**Query Params:**
- `hub.mode`: string
- `hub.verify_token`: string
- `hub.challenge`: string

---

#### 15.2.2 Receber Eventos

**[PUBLIC]** Meta envia mensagens e eventos para este endpoint.

```
POST /api/meta/webhook
```

**Body:** (formato do Meta)
```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "page_id",
      "time": 1234567890,
      "messaging": [
        {
          "sender": {
            "id": "user_id"
          },
          "recipient": {
            "id": "page_id"
          },
          "timestamp": 1234567890,
          "message": {
            "mid": "message_id",
            "text": "Olá!"
          }
        }
      ]
    }
  ]
}
```

---

### 15.3 Mensagens

#### 15.3.1 Enviar Mensagem

```
POST /api/meta/send-message
```

**Body (texto):**
```json
{
  "accountId": 1,
  "recipientId": "instagram_user_id",
  "message": "Olá! Como posso ajudar?",
  "type": "text"
}
```

**Body (imagem):**
```json
{
  "accountId": 1,
  "recipientId": "instagram_user_id",
  "message": "Confira nossa promoção!",
  "type": "image",
  "imageUrl": "https://exemplo.com/imagem.jpg"
}
```

**Body (botões):**
```json
{
  "accountId": 1,
  "recipientId": "instagram_user_id",
  "message": "Como posso ajudar?",
  "type": "button",
  "buttons": [
    {
      "type": "postback",
      "title": "Ver Promoções",
      "payload": "VIEW_PROMOTIONS"
    },
    {
      "type": "postback",
      "title": "Falar com Atendente",
      "payload": "TALK_TO_AGENT"
    }
  ]
}
```

---

#### 15.3.2 Obter Conversas

```
GET /api/meta/conversations/:accountId
```

**Query Params:**
- `limit`: number (padrão: 20)

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "contactId": "instagram_user_id",
      "contactName": "João Silva",
      "lastMessage": "Obrigado pelo atendimento!",
      "lastMessageAt": "2025-10-28T14:30:00Z",
      "unreadCount": 0
    }
  ]
}
```

---

#### 15.3.3 Obter Mensagens

```
GET /api/meta/messages/:accountId/:contactId
```

**Query Params:**
- `limit`: number (padrão: 50)

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "message_id",
      "direction": "incoming",
      "text": "Olá, gostaria de informações",
      "timestamp": "2025-10-28T14:25:00Z",
      "sender": {
        "id": "instagram_user_id",
        "name": "João Silva"
      }
    },
    {
      "id": "message_id_2",
      "direction": "outgoing",
      "text": "Olá João! Como posso ajudar?",
      "timestamp": "2025-10-28T14:26:00Z",
      "sender": {
        "id": "page_id",
        "name": "Minha Empresa"
      }
    }
  ]
}
```

---

## Health Check Geral

Verificar status da API.

```
GET /api/health
```

**[PUBLIC]** Não requer autenticação.

**Resposta (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T14:30:00.000Z",
  "uptime": 86400
}
```

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 204 | No Content - Requisição bem-sucedida sem conteúdo de resposta |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Autenticação necessária |
| 403 | Forbidden - Sem permissão para acessar recurso |
| 404 | Not Found - Recurso não encontrado |
| 429 | Too Many Requests - Limite de requisições excedido |
| 500 | Internal Server Error - Erro no servidor |
| 503 | Service Unavailable - Serviço temporariamente indisponível |

---

## Rate Limiting

A API implementa rate limiting para prevenir abuso:

- **Endpoints de autenticação:** 5 requisições por minuto
- **Endpoints gerais:** 60 requisições por minuto (autenticados)
- **Webhooks públicos:** Sem limite (mas validados por signature)

Headers de rate limit nas respostas:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1635456789
```

---

## Webhook Security

Webhooks de terceiros (Asaas, PagBank, Meta, WAHA) são validados por:

1. **Signature Verification:** Validação de assinatura HMAC
2. **IP Whitelist:** IPs conhecidos dos provedores
3. **Timestamp Check:** Requisições com mais de 5 minutos são rejeitadas

---

## Versionamento

A API atualmente está na versão **v1** (implícita em todas as rotas).

Futuras versões serão acessadas via:
```
/api/v2/...
```

---

## Suporte

Para dúvidas ou problemas com a API:

- **Email:** suporte@nexusatemporal.com
- **Documentação:** https://docs.nexusatemporal.com
- **Status da API:** https://status.nexusatemporal.com

---

## Changelog

### v120.6 (2025-10-28)
- Documentação completa de todas as APIs
- Sistema estável em produção
- Suporte a múltiplos módulos integrados

---

**Última Atualização:** 28 de Outubro de 2025
**Versão do Documento:** 1.0.0
