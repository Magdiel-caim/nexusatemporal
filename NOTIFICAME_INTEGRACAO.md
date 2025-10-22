# Integração Notifica.me - Documentação Completa

## Status: ✅ IMPLEMENTADO

**Data**: 2025-10-21
**Versão**: v104-notificame-integration
**API Key**: `0fb8e168-9331-11f0-88f5-0e386dc8b623`

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [API Endpoints](#api-endpoints)
4. [Exemplos de Uso](#exemplos-de-uso)
5. [Integração com Automação](#integração-com-automação)
6. [Webhooks](#webhooks)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Notifica.me foi completamente integrado ao Nexus CRM permitindo:

- ✅ Envio de mensagens de texto via WhatsApp/Instagram
- ✅ Envio de mídia (imagens, vídeos, áudios, documentos)
- ✅ Templates HSM (mensagens aprovadas pelo WhatsApp)
- ✅ Mensagens com botões interativos
- ✅ Mensagens com listas de opções
- ✅ Gerenciamento de instâncias (QR Code, conexão, desconexão)
- ✅ Recebimento de webhooks
- ✅ Histórico de mensagens
- ✅ Integração com sistema de automação

---

## 🔧 Configuração Inicial

### 1. Adicionar Integração no Sistema

Acessar: `https://one.nexusatemporal.com.br/configuracoes/integracoes`

1. Clicar em **"Nova Integração"**
2. Selecionar tipo: **Notifica.me**
3. Preencher campos:
   - **Nome**: "WhatsApp Principal" (ou nome personalizado)
   - **API Key**: `0fb8e168-9331-11f0-88f5-0e386dc8b623`
   - **API URL**: `https://app.notificame.com.br/api` (padrão)
4. Clicar em **"Testar Conexão"**
5. Se sucesso, clicar em **"Salvar"**

### 2. Estrutura no Banco de Dados

```sql
-- A integração é salva na tabela 'integrations'
SELECT * FROM integrations WHERE integration_type = 'notificame';

-- Estrutura de credenciais
{
  "notificame_api_key": "0fb8e168-9331-11f0-88f5-0e386dc8b623",
  "notificame_api_url": "https://app.notificame.com.br/api"
}
```

---

## 📡 API Endpoints

### Base URL
```
https://one.nexusatemporal.com.br/api/notificame
```

### Autenticação
Todas as rotas (exceto webhook) requerem autenticação via Bearer Token.

```bash
Authorization: Bearer <seu_token_jwt>
```

---

### 1. Testar Conexão

**Endpoint**: `POST /api/notificame/test-connection`

**Descrição**: Testa conectividade com API do Notifica.me

**Request**:
```bash
curl -X POST https://one.nexusatemporal.com.br/api/notificame/test-connection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (Sucesso):
```json
{
  "success": true,
  "message": "Conexão com Notifica.me estabelecida com sucesso",
  "data": {
    "account": "...",
    "instances": 2
  }
}
```

---

### 2. Enviar Mensagem de Texto

**Endpoint**: `POST /api/notificame/send-message`

**Descrição**: Envia mensagem de texto para WhatsApp/Instagram

**Request Body**:
```json
{
  "phone": "5511999999999",
  "message": "Olá! Sua consulta está agendada para amanhã às 14h.",
  "instanceId": "opcional-id-da-instancia"
}
```

**Exemplo cURL**:
```bash
curl -X POST https://one.nexusatemporal.com.br/api/notificame/send-message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "message": "Olá! Sua consulta está agendada."
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "msg-12345",
    "status": "sent",
    "timestamp": 1234567890
  }
}
```

---

### 3. Enviar Mídia

**Endpoint**: `POST /api/notificame/send-media`

**Descrição**: Envia imagem, vídeo, áudio ou documento

**Request Body**:
```json
{
  "phone": "5511999999999",
  "mediaUrl": "https://exemplo.com/imagem.jpg",
  "mediaType": "image",
  "caption": "Confira o resultado do seu exame!",
  "filename": "exame.jpg",
  "instanceId": "opcional"
}
```

**Tipos de Mídia**:
- `image` - Imagens (JPG, PNG, GIF)
- `video` - Vídeos (MP4, AVI)
- `audio` - Áudios (MP3, OGG)
- `document` - Documentos (PDF, DOCX, XLSX)

**Exemplo**:
```bash
curl -X POST https://one.nexusatemporal.com.br/api/notificame/send-media \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "mediaUrl": "https://exemplo.com/documento.pdf",
    "mediaType": "document",
    "caption": "Contrato para assinatura",
    "filename": "contrato.pdf"
  }'
```

---

### 4. Enviar Template HSM

**Endpoint**: `POST /api/notificame/send-template`

**Descrição**: Envia template pré-aprovado pelo WhatsApp

**Request Body**:
```json
{
  "phone": "5511999999999",
  "templateName": "agendamento_confirmacao",
  "templateParams": {
    "nome": "João Silva",
    "data": "15/10/2025",
    "hora": "14:00"
  },
  "instanceId": "opcional"
}
```

**Exemplo**:
```bash
curl -X POST https://one.nexusatemporal.com.br/api/notificame/send-template \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "templateName": "lembrete_consulta",
    "templateParams": {
      "nome": "Maria",
      "procedimento": "Harmonização Facial"
    }
  }'
```

---

### 5. Enviar Mensagem com Botões

**Endpoint**: `POST /api/notificame/send-buttons`

**Descrição**: Envia mensagem com botões interativos (máx 3 botões)

**Request Body**:
```json
{
  "phone": "5511999999999",
  "message": "Confirme sua presença na consulta de amanhã:",
  "buttons": [
    {
      "id": "confirmar",
      "text": "✅ Confirmar"
    },
    {
      "id": "cancelar",
      "text": "❌ Cancelar"
    }
  ],
  "footerText": "Empire Excellence Clinic",
  "instanceId": "opcional"
}
```

**Limites**:
- Mínimo: 1 botão
- Máximo: 3 botões
- Texto do botão: até 20 caracteres

---

### 6. Enviar Lista de Opções

**Endpoint**: `POST /api/notificame/send-list`

**Descrição**: Envia mensagem com lista suspensa de opções

**Request Body**:
```json
{
  "phone": "5511999999999",
  "message": "Escolha o procedimento de seu interesse:",
  "buttonText": "Ver Opções",
  "sections": [
    {
      "title": "Procedimentos Faciais",
      "rows": [
        {
          "id": "botox",
          "title": "Botox",
          "description": "Aplicação de toxina botulínica"
        },
        {
          "id": "preenchimento",
          "title": "Preenchimento Labial",
          "description": "Preenchimento com ácido hialurônico"
        }
      ]
    },
    {
      "title": "Procedimentos Corporais",
      "rows": [
        {
          "id": "lipo",
          "title": "Lipo LAD",
          "description": "Lipoaspiração de alta definição"
        }
      ]
    }
  ],
  "instanceId": "opcional"
}
```

---

### 7. Listar Instâncias

**Endpoint**: `GET /api/notificame/instances`

**Descrição**: Lista todas as instâncias WhatsApp/Instagram conectadas

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "instance-1",
      "name": "WhatsApp Principal",
      "status": "connected",
      "platform": "whatsapp",
      "phone": "5511999999999"
    },
    {
      "id": "instance-2",
      "name": "Instagram Comercial",
      "status": "disconnected",
      "platform": "instagram"
    }
  ]
}
```

---

### 8. Obter QR Code

**Endpoint**: `GET /api/notificame/instances/:instanceId/qrcode`

**Descrição**: Gera QR Code para conectar instância

**Exemplo**:
```bash
curl -X GET https://one.nexusatemporal.com.br/api/notificame/instances/instance-1/qrcode \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

**Uso**:
```html
<img src="{{ qrCode }}" alt="QR Code WhatsApp" />
```

---

### 9. Desconectar Instância

**Endpoint**: `POST /api/notificame/instances/:instanceId/disconnect`

**Descrição**: Desconecta instância do WhatsApp/Instagram

**Exemplo**:
```bash
curl -X POST https://one.nexusatemporal.com.br/api/notificame/instances/instance-1/disconnect \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 10. Histórico de Mensagens

**Endpoint**: `GET /api/notificame/messages/history?phone=5511999999999&limit=50`

**Descrição**: Obtém histórico de conversas com um contato

**Query Parameters**:
- `phone` (obrigatório): Número do contato
- `limit` (opcional): Quantidade de mensagens (padrão: 50)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "msg-123",
      "from": "5511999999999",
      "to": "5511888888888",
      "timestamp": 1234567890,
      "type": "text",
      "text": "Olá, gostaria de agendar uma consulta"
    },
    {
      "id": "msg-124",
      "from": "5511888888888",
      "to": "5511999999999",
      "timestamp": 1234567900,
      "type": "text",
      "text": "Olá! Temos horários disponíveis para esta semana."
    }
  ]
}
```

---

### 11. Marcar Mensagem como Lida

**Endpoint**: `POST /api/notificame/messages/:messageId/mark-read`

**Request Body**:
```json
{
  "instanceId": "opcional"
}
```

---

## 🤖 Integração com Automação

### Usar Notifica.me em Triggers

O Notifica.me está integrado ao sistema de automação. Você pode criar triggers que enviam mensagens automaticamente.

#### Exemplo 1: Enviar mensagem quando lead é criado

```json
{
  "name": "Boas-vindas WhatsApp",
  "event": "lead.created",
  "conditions": [
    {
      "field": "phone",
      "operator": "is_not_empty"
    }
  ],
  "actions": [
    {
      "type": "send_notificame_message",
      "config": {
        "phone": "{{lead.phone}}",
        "message": "Olá {{lead.name}}! 👋\n\nSeja bem-vindo(a) à Empire Excellence Clinic.\n\nEm breve entraremos em contato."
      }
    }
  ]
}
```

#### Exemplo 2: Lembrete de consulta

```json
{
  "name": "Lembrete 24h antes",
  "event": "appointment.reminder",
  "conditions": [
    {
      "field": "hours_before",
      "operator": "equals",
      "value": 24
    }
  ],
  "actions": [
    {
      "type": "send_notificame_template",
      "config": {
        "phone": "{{patient.phone}}",
        "templateName": "lembrete_consulta",
        "templateParams": {
          "nome": "{{patient.name}}",
          "data": "{{appointment.date}}",
          "hora": "{{appointment.time}}",
          "procedimento": "{{appointment.procedure}}"
        }
      }
    }
  ]
}
```

#### Exemplo 3: Enviar documento após procedimento

```json
{
  "name": "Pós-procedimento - Enviar Orientações",
  "event": "medical_record.completed",
  "actions": [
    {
      "type": "send_notificame_media",
      "config": {
        "phone": "{{patient.phone}}",
        "mediaUrl": "https://clinica.com.br/docs/pos-procedimento.pdf",
        "mediaType": "document",
        "caption": "Orientações pós-{{procedure.name}}",
        "filename": "orientacoes.pdf"
      }
    }
  ]
}
```

---

## 🔔 Webhooks

### Configurar Webhook no Notifica.me

1. Acessar painel do Notifica.me: `https://app.notificame.com.br`
2. Ir em **Configurações > Webhooks**
3. Adicionar URL do webhook:
   ```
   https://one.nexusatemporal.com.br/api/notificame/webhook
   ```
4. Selecionar eventos:
   - ✅ Mensagem recebida
   - ✅ Mensagem enviada
   - ✅ Status de entrega
   - ✅ Mensagem lida

### Eventos Recebidos

O webhook processa automaticamente:

- **Mensagens recebidas**: Salvas no sistema de chat
- **Status de entrega**: Atualiza status no banco
- **Mensagem lida**: Marca como visualizada
- **Erros de envio**: Registra no log

### Estrutura do Webhook

```json
{
  "event": "message.received",
  "timestamp": 1234567890,
  "instanceId": "instance-1",
  "message": {
    "id": "msg-12345",
    "from": "5511999999999",
    "to": "5511888888888",
    "type": "text",
    "text": "Olá, gostaria de informações",
    "timestamp": 1234567890
  }
}
```

---

## 🔍 Exemplos de Uso - Frontend

### React/TypeScript

```typescript
import api from './services/api';

// Enviar mensagem simples
async function sendWhatsAppMessage(phone: string, message: string) {
  try {
    const response = await api.post('/notificame/send-message', {
      phone,
      message
    });

    if (response.data.success) {
      console.log('Mensagem enviada:', response.data.data);
      return response.data.data;
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
}

// Enviar imagem
async function sendImage(phone: string, imageUrl: string, caption: string) {
  const response = await api.post('/notificame/send-media', {
    phone,
    mediaUrl: imageUrl,
    mediaType: 'image',
    caption
  });

  return response.data;
}

// Enviar mensagem com botões
async function sendConfirmation(phone: string, appointmentDate: string) {
  const response = await api.post('/notificame/send-buttons', {
    phone,
    message: `Confirme sua presença na consulta do dia ${appointmentDate}:`,
    buttons: [
      { id: 'confirmar', text: '✅ Confirmar' },
      { id: 'remarcar', text: '📅 Remarcar' },
      { id: 'cancelar', text: '❌ Cancelar' }
    ],
    footerText: 'Empire Excellence Clinic'
  });

  return response.data;
}

// Listar instâncias conectadas
async function getInstances() {
  const response = await api.get('/notificame/instances');
  return response.data.data;
}

// Obter QR Code
async function getQRCode(instanceId: string) {
  const response = await api.get(`/notificame/instances/${instanceId}/qrcode`);
  return response.data.data.qrCode;
}
```

---

## 🐛 Troubleshooting

### Erro: "Integração Notifica.me não configurada"

**Causa**: API Key não foi configurada no sistema

**Solução**:
1. Acessar `/configuracoes/integracoes`
2. Criar integração Notifica.me
3. Inserir API Key: `0fb8e168-9331-11f0-88f5-0e386dc8b623`
4. Salvar

---

### Erro: "Missing PHONE or MESSAGE"

**Causa**: Request sem campos obrigatórios

**Solução**:
Verificar se o body da request contém:
```json
{
  "phone": "5511999999999",  // ✅ Obrigatório
  "message": "Texto aqui"     // ✅ Obrigatório
}
```

---

### Erro: "Instance not connected"

**Causa**: Instância WhatsApp não está conectada

**Solução**:
1. Obter QR Code: `GET /api/notificame/instances/:id/qrcode`
2. Escanear QR Code no WhatsApp
3. Aguardar status = "connected"

---

### Erro: 401 Unauthorized

**Causa**: Token JWT inválido ou expirado

**Solução**:
1. Fazer login novamente: `POST /api/auth/login`
2. Obter novo token
3. Usar no header: `Authorization: Bearer NOVO_TOKEN`

---

### Mensagens não estão sendo entregues

**Checklist**:
- [ ] Integração está ativa (`is_active = true`)
- [ ] Instância está conectada (`status = "connected"`)
- [ ] Número está no formato correto (`5511999999999`)
- [ ] API Key está correta
- [ ] Telefone não está bloqueado pelo WhatsApp

**Debug**:
```bash
# Ver logs do backend
docker service logs nexus_backend --tail 100 | grep NotificaMe

# Testar conexão
curl -X POST https://one.nexusatemporal.com.br/api/notificame/test-connection \
  -H "Authorization: Bearer TOKEN"
```

---

## 📊 Monitoramento

### Verificar Uso da API

```sql
-- Contar mensagens enviadas hoje
SELECT COUNT(*) FROM chat_messages
WHERE type = 'outgoing'
AND channel = 'whatsapp'
AND created_at >= CURRENT_DATE;

-- Ver últimas mensagens
SELECT * FROM chat_messages
WHERE channel = 'whatsapp'
ORDER BY created_at DESC
LIMIT 20;

-- Status das integrações
SELECT
  name,
  status,
  last_tested_at,
  test_status,
  test_message
FROM integrations
WHERE integration_type = 'notificame';
```

---

## 🚀 Próximos Passos

### Funcionalidades Futuras:

1. **Chat em Tempo Real**
   - WebSocket para receber mensagens instantaneamente
   - Notificações no navegador

2. **Templates Personalizados**
   - Interface para criar templates
   - Editor visual de mensagens

3. **Analytics**
   - Taxa de entrega
   - Taxa de leitura
   - Tempo médio de resposta

4. **Automação Avançada**
   - Chatbot com IA
   - Respostas automáticas
   - Fluxos de conversa

5. **Multi-atendimento**
   - Múltiplos atendentes
   - Distribuição automática
   - Transferência de conversas

---

## 📋 Checklist de Implementação

- [x] Service NotificaMeService criado
- [x] Controller criado
- [x] Rotas registradas
- [x] Integração com sistema de automação
- [x] Teste de conexão implementado
- [x] Webhooks configurados
- [x] Documentação completa
- [ ] Build e deploy em produção
- [ ] Testes de integração
- [ ] Interface no frontend

---

## 📝 Arquivos Criados/Modificados

### Novos Arquivos:
- `/backend/src/services/NotificaMeService.ts`
- `/backend/src/modules/notificame/notificame.controller.ts`
- `/backend/src/modules/notificame/notificame.routes.ts`
- `/root/nexusatemporal/NOTIFICAME_INTEGRACAO.md`

### Modificados:
- `/backend/src/routes/index.ts` - Adicionado rota `/notificame`
- `/backend/src/modules/automation/integration.service.ts` - Adicionado `testNotificaMe()`

---

**Preparado por**: Claude (Sessão A)
**Data**: 2025-10-21
**Versão Backend**: v104-notificame-integration
**Status**: ✅ PRONTO PARA DEPLOY
