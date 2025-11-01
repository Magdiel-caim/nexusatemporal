# NEXUS API - DOCUMENTAÇÃO COMPLETA
**Versão:** v1.22  
**Data:** 30/10/2025  
**Sistema:** One Nexus - API de Integração Externa

---

## 📋 ÍNDICE

1. [Autenticação](#autenticação)
2. [Endpoints de Leads](#endpoints-de-leads)
3. [Busca por ID Único (Telefone)](#busca-por-telefone)
4. [Exemplos N8N](#exemplos-n8n)
5. [Rate Limits e Segurança](#rate-limits)
6. [Erros Comuns](#erros-comuns)

---

## 🔐 AUTENTICAÇÃO

### Como obter uma API Key

1. Acesse **Configurações → API Keys** no painel
2. Clique em **"Gerar Nova Chave"**
3. Escolha o escopo:
   - `read`: Somente leitura
   - `write`: Criar e atualizar
   - `full`: Acesso completo
4. **IMPORTANTE**: Copie a chave gerada (`nxs_xxxxxxxxxxxxx`). Ela só será exibida uma vez!

### Formas de Autenticação

A API aceita a chave em 3 formatos:

#### 1. Authorization Header (Recomendado)
```bash
Authorization: Bearer nxs_xxxxxxxxxxxxx
```

#### 2. X-API-Key Header
```bash
X-API-Key: nxs_xxxxxxxxxxxxx
```

#### 3. Query Parameter (menos seguro)
```bash
?api_key=nxs_xxxxxxxxxxxxx
```

---

## 📞 ENDPOINTS DE LEADS

Base URL: `https://one.nexusatemporal.com.br/api/public/leads`

### 1. Listar Leads

**GET** `/api/public/leads`

**Query Parameters:**
- `phone` - Busca por telefone (ID ÚNICO) - Ex: `5511999999999`
- `email` - Busca por email
- `search` - Busca geral (nome, email, telefone, empresa)
- `stageId` - Filtrar por estágio (UUID)
- `status` - new | contacted | qualified | proposal | won | lost
- `priority` - low | medium | high
- `source` - website | referral | cold_call | social_media | other
- `dateFrom` - Data inicial (ISO)
- `dateTo` - Data final (ISO)

**Exemplo - Buscar todos os leads:**
```bash
curl -X GET "https://one.nexusatemporal.com.br/api/public/leads" \
  -H "Authorization: Bearer nxs_xxxxxxxxxxxxx"
```

**Resposta:**
```json
[
  {
    "id": "uuid-do-lead",
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "5511999999999",
    "phone2": null,
    "whatsapp": "5511999999999",
    "company": "Empresa ABC",
    "status": "new",
    "priority": "high",
    "source": "website",
    "estimatedValue": 5000,
    "createdAt": "2025-10-30T10:00:00.000Z",
    "stage": {
      "id": "uuid-estagio",
      "name": "Primeiro Contato"
    }
  }
]
```

---

### 2. Buscar Lead por Telefone (ID ÚNICO)

**GET** `/api/public/leads?phone={telefone}`

**IMPORTANTE**: O telefone funciona como ID único. Remova formatação antes de enviar.

**Exemplos de formatos aceitos:**
- `5511999999999` ✅ (Recomendado)
- `+55 11 99999-9999` ✅ (Sistema limpa automaticamente)
- `(11) 99999-9999` ✅ (Sistema limpa automaticamente)
- `11999999999` ✅

**Exemplo - Buscar por telefone:**
```bash
curl -X GET "https://one.nexusatemporal.com.br/api/public/leads?phone=5511999999999" \
  -H "Authorization: Bearer nxs_xxxxxxxxxxxxx"
```

**Exemplo - Buscar por email:**
```bash
curl -X GET "https://one.nexusatemporal.com.br/api/public/leads?email=joao@email.com" \
  -H "Authorization: Bearer nxs_xxxxxxxxxxxxx"
```

**Resposta** (Array com 0 ou mais leads):
```json
[
  {
    "id": "uuid-do-lead",
    "name": "João Silva",
    "phone": "5511999999999",
    "email": "joao@email.com"
  }
]
```

---

### 3. Buscar Lead por ID

**GET** `/api/public/leads/:id`

**Exemplo:**
```bash
curl -X GET "https://one.nexusatemporal.com.br/api/public/leads/uuid-do-lead" \
  -H "Authorization: Bearer nxs_xxxxxxxxxxxxx"
```

**Resposta:**
```json
{
  "id": "uuid-do-lead",
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "5511999999999",
  "activities": [
    {
      "id": "uuid-atividade",
      "type": "LEAD_CREATED",
      "title": "Lead created",
      "createdAt": "2025-10-30T10:00:00.000Z"
    }
  ]
}
```

---

### 4. Criar Lead

**POST** `/api/public/leads`

**Body (JSON):**
```json
{
  "name": "Maria Santos",
  "email": "maria@email.com",
  "phone": "5511988888888",
  "whatsapp": "5511988888888",
  "company": "Empresa XYZ",
  "stageId": "uuid-do-estagio",
  "source": "website",
  "priority": "high",
  "notes": "Lead gerado via landing page",
  "estimatedValue": 10000
}
```

**Campos obrigatórios:**
- `name` - Nome do lead
- `stageId` - UUID do estágio inicial

**Campos opcionais:**
- `email`, `phone`, `phone2`, `whatsapp`
- `company`, `position`
- `neighborhood`, `city`, `state`
- `channel`, `clientStatus`, `attendanceLocation`
- `source`, `priority`, `status`
- `estimatedValue`, `expectedCloseDate`
- `notes`, `tags[]`

**Exemplo:**
```bash
curl -X POST "https://one.nexusatemporal.com.br/api/public/leads" \
  -H "Authorization: Bearer nxs_xxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "phone": "5511988888888",
    "email": "maria@email.com",
    "stageId": "uuid-do-estagio",
    "source": "website",
    "priority": "high"
  }'
```

**Resposta (201 Created):**
```json
{
  "id": "uuid-novo-lead",
  "name": "Maria Santos",
  "phone": "5511988888888",
  "createdAt": "2025-10-30T15:30:00.000Z"
}
```

---

### 5. Atualizar Lead

**PUT** `/api/public/leads/:id`

**Exemplo:**
```bash
curl -X PUT "https://one.nexusatemporal.com.br/api/public/leads/uuid-do-lead" \
  -H "Authorization: Bearer nxs_xxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "contacted",
    "priority": "medium",
    "notes": "Cliente retornou contato"
  }'
```

---

### 6. Deletar Lead (Soft Delete)

**DELETE** `/api/public/leads/:id`

**Exemplo:**
```bash
curl -X DELETE "https://one.nexusatemporal.com.br/api/public/leads/uuid-do-lead" \
  -H "Authorization: Bearer nxs_xxxxxxxxxxxxx"
```

**Resposta:**
```json
{
  "success": true
}
```

---

### 7. Mover Lead para Outro Estágio

**POST** `/api/public/leads/:id/move`

**Body:**
```json
{
  "stageId": "uuid-novo-estagio"
}
```

**Exemplo:**
```bash
curl -X POST "https://one.nexusatemporal.com.br/api/public/leads/uuid-do-lead/move" \
  -H "Authorization: Bearer nxs_xxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "stageId": "uuid-novo-estagio"
  }'
```

---

### 8. Estatísticas de Leads

**GET** `/api/public/leads/stats`

**Exemplo:**
```bash
curl -X GET "https://one.nexusatemporal.com.br/api/public/leads/stats" \
  -H "Authorization: Bearer nxs_xxxxxxxxxxxxx"
```

**Resposta:**
```json
{
  "totalLeads": 150,
  "totalValue": 500000,
  "byStatus": {
    "new": 50,
    "contacted": 40,
    "qualified": 30,
    "won": 20,
    "lost": 10
  },
  "byPriority": {
    "high": 30,
    "medium": 70,
    "low": 50
  },
  "bySource": {
    "website": 80,
    "referral": 40,
    "cold_call": 30
  },
  "byStage": {
    "Primeiro Contato": 60,
    "Proposta": 40,
    "Negociação": 30,
    "Ganho": 20
  }
}
```

---

## 🔄 EXEMPLOS N8N

### Workflow 1: Criar Lead a partir de Form

**1. Webhook Node** (recebe form)
```json
{
  "nome": "{{$json.nome}}",
  "telefone": "{{$json.telefone}}",
  "email": "{{$json.email}}"
}
```

**2. HTTP Request Node**
- **Method**: POST
- **URL**: `https://one.nexusatemporal.com.br/api/public/leads`
- **Authentication**: Generic Credential Type
  - **Header Name**: `Authorization`
  - **Header Value**: `Bearer nxs_xxxxxxxxxxxxx`
- **Body**:
```json
{
  "name": "{{$json.nome}}",
  "phone": "{{$json.telefone}}",
  "email": "{{$json.email}}",
  "stageId": "uuid-estagio-inicial",
  "source": "website",
  "priority": "medium"
}
```

---

### Workflow 2: Verificar se Lead Existe por Telefone

**1. HTTP Request Node**
- **Method**: GET
- **URL**: `https://one.nexusatemporal.com.br/api/public/leads?phone={{$json.telefone}}`
- **Authentication**: Generic Credential Type
  - **Header Name**: `Authorization`
  - **Header Value**: `Bearer nxs_xxxxxxxxxxxxx`

**2. IF Node** (verificar se array vazio)
- **Condition**: `{{$json.length}} > 0`
- **True**: Lead existe → Atualizar
- **False**: Lead não existe → Criar novo

**3a. Se TRUE - Update Node** (HTTP Request)
- **Method**: PUT
- **URL**: `https://one.nexusatemporal.com.br/api/public/leads/{{$json[0].id}}`
- **Body**: `{ "notes": "Atualizado via N8N" }`

**3b. Se FALSE - Create Node** (HTTP Request)
- **Method**: POST
- **URL**: `https://one.nexusatemporal.com.br/api/public/leads`
- **Body**: Dados do novo lead

---

### Workflow 3: Sincronizar Leads com Google Sheets

**1. Schedule Trigger** (executar a cada 1 hora)

**2. HTTP Request Node** (buscar todos os leads)
- **Method**: GET
- **URL**: `https://one.nexusatemporal.com.br/api/public/leads`
- **Authentication**: Bearer Token = `nxs_xxxxxxxxxxxxx`

**3. Split In Batches** (processar 100 por vez)

**4. Google Sheets Node**
- **Operation**: Append or Update
- **Spreadsheet ID**: Seu ID do Google Sheets
- **Mapping**:
  - Column A: `{{$json.name}}`
  - Column B: `{{$json.phone}}`
  - Column C: `{{$json.email}}`
  - Column D: `{{$json.status}}`
  - Column E: `{{$json.createdAt}}`

---

### Workflow 4: WhatsApp → Lead Automático

**1. WhatsApp Trigger** (receber mensagem)

**2. HTTP Request** (verificar se já existe)
- **URL**: `https://one.nexusatemporal.com.br/api/public/leads?phone={{$json.from}}`

**3. IF** (já existe?)
- **FALSE**: Criar novo lead
- **TRUE**: Apenas registrar atividade

**4. HTTP Request** (criar lead)
- **Method**: POST
- **URL**: `https://one.nexusatemporal.com.br/api/public/leads`
- **Body**:
```json
{
  "name": "Lead WhatsApp {{$json.from}}",
  "phone": "{{$json.from}}",
  "whatsapp": "{{$json.from}}",
  "stageId": "uuid-estagio-whatsapp",
  "source": "social_media",
  "notes": "Primeira mensagem: {{$json.body}}"
}
```

---

## ⚡ RATE LIMITS

- **Default**: 1000 requisições/hora por API Key
- **Header de resposta**: `X-RateLimit-Remaining`
- **Quando exceder**: HTTP 429 (Too Many Requests)

**Dica**: Para integrações de alto volume, solicite aumento do limite.

---

## ❌ ERROS COMUNS

### 1. 401 Unauthorized
```json
{
  "error": "Invalid or missing API key"
}
```
**Solução**: Verifique se a API Key está correta e no header correto.

---

### 2. 403 Forbidden
```json
{
  "error": "Insufficient permissions. Required scope: write"
}
```
**Solução**: Sua API Key não tem o escopo necessário. Gere uma nova com escopo `write` ou `full`.

---

### 3. 404 Not Found
```json
{
  "error": "Lead not found"
}
```
**Solução**: O UUID do lead não existe ou pertence a outro tenant.

---

### 4. 400 Bad Request
```json
{
  "error": "Validation error: name is required"
}
```
**Solução**: Verifique os campos obrigatórios no body da requisição.

---

### 5. 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded. Try again in 3600 seconds."
}
```
**Solução**: Aguarde 1 hora ou reduza a frequência das requisições.

---

### 6. 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```
**Solução**: Erro do servidor. Contate o suporte técnico.

---

## 🎯 CASOS DE USO

### 1. Captura de Leads de Landing Page
```bash
# Ao enviar formulário, fazer POST para criar lead
curl -X POST "https://one.nexusatemporal.com.br/api/public/leads" \
  -H "Authorization: Bearer nxs_xxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "{{form.nome}}",
    "email": "{{form.email}}",
    "phone": "{{form.telefone}}",
    "stageId": "uuid-landing-page",
    "source": "website"
  }'
```

### 2. Verificar Duplicidade por Telefone
```bash
# Antes de criar, verificar se já existe
curl -X GET "https://one.nexusatemporal.com.br/api/public/leads?phone=5511999999999" \
  -H "Authorization: Bearer nxs_xxxxxxxxxxxxx"

# Se array vazio [], pode criar
# Se retornar lead, atualizar o existente
```

### 3. Integração com CRM Externo
```bash
# Sincronizar leads a cada 15 minutos
# 1. Buscar novos leads (últimas 15 min)
curl -X GET "https://one.nexusatemporal.com.br/api/public/leads?dateFrom=2025-10-30T14:00:00.000Z" \
  -H "Authorization: Bearer nxs_xxxxxxxxxxxxx"

# 2. Enviar para CRM externo
# 3. Atualizar status no Nexus
```

---

## 📝 VALIDAÇÕES

### Telefone (ID Único)
- Sistema remove automaticamente: `( ) - + espaços`
- Busca em `phone`, `phone2` e `whatsapp`
- Exemplo: `(11) 99999-9999` vira `11999999999`

### Email
- Validação de formato básico
- Case-insensitive
- Busca com LIKE parcial

### CPF/CNPJ
- Não é validado pela API (validar no frontend)

### Campos obrigatórios
- `name` - Nome do lead
- `stageId` - UUID do estágio (obter via GET /api/data)

---

## 🔗 ENDPOINTS RELACIONADOS

### Buscar Estágios Disponíveis
```bash
GET /api/data
Authorization: Bearer {sua_api_key}
```

Retorna todos os estágios (funnels) disponíveis para criar leads.

---

## 📞 SUPORTE

- **Documentação completa**: `/root/nexusatemporalv1/API_DOCUMENTATION.md`
- **Issues técnicos**: Abrir ticket no sistema
- **Dúvidas de integração**: Suporte técnico

---

**Última atualização:** 30/10/2025  
**Versão da API:** v1.22  
**Changelog:** 
- ✅ Adicionado busca por telefone (ID único)
- ✅ Adicionado busca por email
- ✅ Melhorada documentação N8N
- ✅ Adicionados exemplos práticos
