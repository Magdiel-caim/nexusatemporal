# 🔑 Sistema de API Keys - One Nexus Atemporal v1.22

**Data de Implementação**: 30/10/2025
**Versão**: v1.22
**Status**: ✅ **100% FUNCIONAL**

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Endpoints da API](#endpoints-da-api)
4. [Como Usar](#como-usar)
5. [Segurança](#segurança)
6. [Integração com N8N](#integração-com-n8n)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

Sistema completo de gerenciamento de API Keys para permitir integrações externas seguras com o One Nexus Atemporal, especialmente com ferramentas como N8N, Zapier, Make.com e outras plataformas de automação.

### Funcionalidades Principais

- ✅ **Geração de API Keys** com hash SHA-256
- ✅ **Controle de Escopos** (read, write, full)
- ✅ **Rate Limiting** configurável por chave
- ✅ **Restrição por IP** e origem
- ✅ **Rastreamento de Uso** (contadores, último uso)
- ✅ **Expiração Automática** de chaves
- ✅ **Multi-tenant** com isolamento completo
- ✅ **Interface Web** completa para gerenciamento
- ✅ **Revogação Instantânea** de chaves comprometidas

---

## 🏗️ ARQUITETURA

### Backend

**Estrutura de Arquivos:**
```
backend/src/modules/integrations/
├── entities/
│   └── api-key.entity.ts          # Entidade TypeORM
├── services/
│   └── api-key.service.ts         # Lógica de negócio
├── controllers/
│   └── api-key.controller.ts      # Controladores REST
└── routes/
    └── api-key.routes.ts          # Definição de rotas

backend/src/middleware/
└── api-key-auth.middleware.ts     # Middleware de autenticação

backend/src/database/migrations/
└── 1730217600000-CreateApiKeysTable.ts  # Migration
```

**Tecnologias:**
- TypeORM para ORM
- PostgreSQL 16 para armazenamento
- Crypto (Node.js) para hash SHA-256
- Express.js para rotas

### Frontend

**Estrutura de Arquivos:**
```
frontend/src/components/settings/
└── ApiKeysManagement.tsx          # Interface completa de gerenciamento

frontend/src/pages/
└── ConfiguracoesPage.tsx          # Página de configurações (integrada)
```

**Tecnologias:**
- React 18 + TypeScript
- TailwindCSS para estilização
- Lucide Icons
- React Hot Toast para notificações

### Banco de Dados

**Tabela: `api_keys`**

| Campo             | Tipo      | Descrição                                    |
|-------------------|-----------|----------------------------------------------|
| id                | UUID      | Identificador único                          |
| name              | VARCHAR   | Nome descritivo da chave                     |
| key               | VARCHAR   | Hash SHA-256 da chave (único)                |
| description       | TEXT      | Descrição opcional                           |
| status            | ENUM      | active, inactive, revoked                    |
| scopes            | TEXT      | Escopos separados por vírgula                |
| allowed_ips       | TEXT      | IPs permitidos (opcional)                    |
| allowed_origins   | TEXT      | Origens permitidas (opcional)                |
| rate_limit        | INT       | Requisições por hora (padrão: 1000)         |
| expires_at        | TIMESTAMP | Data de expiração (opcional)                 |
| last_used_at      | TIMESTAMP | Último uso da chave                          |
| usage_count       | INT       | Contador de uso                              |
| tenant_id         | UUID      | ID do tenant (multi-tenant)                  |
| created_by_id     | UUID      | ID do usuário criador                        |
| created_at        | TIMESTAMP | Data de criação                              |
| updated_at        | TIMESTAMP | Última atualização                           |
| deleted_at        | TIMESTAMP | Soft delete (NULL = ativo)                   |

**Índices:**
- `idx_api_keys_key` - Busca rápida por chave
- `idx_api_keys_tenant` - Filtragem por tenant
- `idx_api_keys_status_tenant` - Busca combinada status + tenant

---

## 🔌 ENDPOINTS DA API

### Base URL
```
https://api.nexusatemporal.com.br/api/integrations/api-keys
```

### 1. Listar API Keys

**GET** `/api/integrations/api-keys`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "N8N Production",
    "description": "Chave para automações N8N",
    "status": "active",
    "scopes": ["read", "write"],
    "allowedIps": ["192.168.1.100"],
    "allowedOrigins": ["https://n8n.example.com"],
    "rateLimit": 1000,
    "expiresAt": "2025-12-31T23:59:59Z",
    "lastUsedAt": "2025-10-30T10:30:00Z",
    "usageCount": 1234,
    "createdBy": {
      "id": "uuid",
      "name": "Admin",
      "email": "admin@example.com"
    },
    "createdAt": "2025-10-01T00:00:00Z",
    "updatedAt": "2025-10-30T00:00:00Z"
  }
]
```

### 2. Criar API Key

**POST** `/api/integrations/api-keys`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "N8N Production",
  "description": "Chave para automações N8N",
  "scopes": ["read", "write"],
  "allowedIps": ["192.168.1.100", "10.0.0.1"],
  "allowedOrigins": ["https://n8n.example.com"],
  "rateLimit": 1000,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Resposta (201 Created):**
```json
{
  "apiKey": {
    "id": "uuid",
    "name": "N8N Production",
    "status": "active",
    "scopes": ["read", "write"],
    "rateLimit": 1000,
    "createdAt": "2025-10-30T00:00:00Z"
  },
  "key": "nxs_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "message": "API Key criada com sucesso! Copie e guarde a chave, ela não será exibida novamente."
}
```

**⚠️ IMPORTANTE:** A chave `key` só é retornada NESTA resposta. Guarde-a em local seguro!

### 3. Buscar API Key por ID

**GET** `/api/integrations/api-keys/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Resposta (200 OK):** Mesmo formato da listagem

### 4. Atualizar API Key

**PUT** `/api/integrations/api-keys/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "N8N Production (Updated)",
  "description": "Nova descrição",
  "scopes": ["full"],
  "rateLimit": 2000
}
```

**Resposta (200 OK):** API Key atualizada

### 5. Revogar API Key

**POST** `/api/integrations/api-keys/:id/revoke`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Resposta (200 OK):**
```json
{
  "message": "API Key revogada com sucesso"
}
```

### 6. Ativar API Key

**POST** `/api/integrations/api-keys/:id/activate`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Resposta (200 OK):**
```json
{
  "message": "API Key ativada com sucesso"
}
```

### 7. Deletar API Key

**DELETE** `/api/integrations/api-keys/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Resposta (200 OK):**
```json
{
  "message": "API Key deletada com sucesso"
}
```

### 8. Estatísticas de Uso

**GET** `/api/integrations/api-keys/stats`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Resposta (200 OK):**
```json
{
  "total": 5,
  "active": 3,
  "revoked": 2,
  "totalUsage": 12345
}
```

---

## 📱 COMO USAR

### 1. Via Interface Web

1. Acesse: `https://one.nexusatemporal.com.br/configuracoes`
2. No menu lateral, clique em **"API Keys"**
3. Clique em **"Nova API Key"**
4. Preencha o formulário:
   - **Nome**: Nome descritivo (ex: "N8N Workflow")
   - **Descrição**: Para que será usada
   - **Escopos**:
     - `read` - Apenas leitura
     - `write` - Criar e modificar dados
     - `full` - Acesso total (read + write)
   - **Rate Limit**: Requisições por hora (padrão: 1000)
   - **IPs Permitidos**: (Opcional) Lista separada por vírgula
   - **Origens Permitidas**: (Opcional) URLs permitidas
5. Clique em **"Criar API Key"**
6. **⚠️ COPIE A CHAVE EXIBIDA!** Ela não será mostrada novamente
7. Guarde a chave em um gerenciador de senhas ou variável de ambiente

### 2. Usando a API Key em Requisições

**Método 1: Header Authorization (Recomendado)**
```bash
curl -X GET https://api.nexusatemporal.com.br/api/leads \
  -H "Authorization: Bearer nxs_a1b2c3d4e5f6..." \
  -H "Content-Type: application/json"
```

**Método 2: Header X-API-Key**
```bash
curl -X GET https://api.nexusatemporal.com.br/api/leads \
  -H "X-API-Key: nxs_a1b2c3d4e5f6..." \
  -H "Content-Type: application/json"
```

**Método 3: Query Parameter**
```bash
curl -X GET "https://api.nexusatemporal.com.br/api/leads?api_key=nxs_a1b2c3d4e5f6..."
```

---

## 🔒 SEGURANÇA

### Armazenamento Seguro

1. **Hash SHA-256**: A chave original NUNCA é armazenada no banco
2. **Exibição Única**: A chave plain-text é mostrada apenas na criação
3. **Comparação Segura**: Validação usa hash para comparação

### Validações Implementadas

#### 1. Verificação de Status
```typescript
// Chave deve estar ativa
if (apiKey.status !== 'active') {
  return 401; // Unauthorized
}
```

#### 2. Verificação de Expiração
```typescript
// Checa se a chave expirou
if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
  return 401; // Unauthorized
}
```

#### 3. Restrição por IP
```typescript
// Se IPs permitidos estão configurados
if (apiKey.allowedIps && apiKey.allowedIps.length > 0) {
  const clientIp = getClientIp(req);
  if (!apiKey.allowedIps.includes(clientIp)) {
    return 403; // Forbidden - IP não autorizado
  }
}
```

#### 4. Restrição por Origem
```typescript
// Se origens permitidas estão configuradas
if (apiKey.allowedOrigins && apiKey.allowedOrigins.length > 0) {
  const origin = req.headers.origin || req.headers.referer;
  if (!apiKey.allowedOrigins.some(allowed => origin.includes(allowed))) {
    return 403; // Forbidden - Origem não autorizada
  }
}
```

#### 5. Rate Limiting
```typescript
// Verifica se excedeu o limite de requisições/hora
if (await apiKeyService.checkRateLimit(apiKey) === false) {
  return 429; // Too Many Requests
}
```

#### 6. Verificação de Escopo
```typescript
// Middleware para verificar escopos necessários
requireApiKeyScope(['write']); // Requer escopo 'write' ou 'full'
```

### Boas Práticas

1. **Nunca exponha chaves em repositórios Git**
2. **Use variáveis de ambiente** para armazenar chaves
3. **Revogue chaves comprometidas imediatamente**
4. **Use rate limiting apropriado** para sua necessidade
5. **Configure IPs permitidos** quando possível
6. **Defina data de expiração** para chaves temporárias
7. **Use escopos mínimos necessários** (princípio do menor privilégio)
8. **Monitore o uso** através do campo `usageCount`

---

## 🔗 INTEGRAÇÃO COM N8N

### Configuração no N8N

#### 1. Criar Credencial HTTP Header Auth

1. No N8N, vá em **Credentials** → **New Credential**
2. Selecione **"Header Auth"**
3. Configure:
   - **Name**: "Nexus API Key"
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer nxs_SUA_CHAVE_AQUI`
4. Salve a credencial

#### 2. Usar em Workflow

1. Adicione um node **"HTTP Request"**
2. Configure:
   - **Method**: GET/POST/PUT/DELETE
   - **URL**: `https://api.nexusatemporal.com.br/api/leads`
   - **Authentication**: Header Auth
   - **Credential**: Selecione "Nexus API Key"
   - **Headers**: Adicione `Content-Type: application/json`
3. Execute o workflow

### Exemplo de Workflow N8N

**Workflow: "Criar Lead no Nexus quando novo contato no Google Sheets"**

```json
{
  "nodes": [
    {
      "name": "Google Sheets Trigger",
      "type": "n8n-nodes-base.googleSheetsTrigger",
      "parameters": {
        "event": "row.added"
      }
    },
    {
      "name": "Create Lead in Nexus",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.nexusatemporal.com.br/api/leads",
        "method": "POST",
        "authentication": "headerAuth",
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "body": {
          "name": "={{ $json.name }}",
          "email": "={{ $json.email }}",
          "phone": "={{ $json.phone }}",
          "source": "Google Sheets"
        }
      },
      "credentials": {
        "headerAuth": {
          "id": "1",
          "name": "Nexus API Key"
        }
      }
    }
  ]
}
```

### Endpoints Úteis para N8N

| Endpoint               | Método | Escopo | Descrição                    |
|------------------------|--------|--------|------------------------------|
| `/api/leads`           | GET    | read   | Listar leads                 |
| `/api/leads`           | POST   | write  | Criar lead                   |
| `/api/leads/:id`       | PUT    | write  | Atualizar lead               |
| `/api/pacientes`       | GET    | read   | Listar pacientes             |
| `/api/pacientes`       | POST   | write  | Criar paciente               |
| `/api/appointments`    | GET    | read   | Listar agendamentos          |
| `/api/appointments`    | POST   | write  | Criar agendamento            |
| `/api/financial`       | GET    | read   | Consultar finanças           |

---

## 🛠️ TROUBLESHOOTING

### Erro: "API Key inválida ou expirada"

**Causa:** Chave incorreta, revogada ou expirada

**Solução:**
1. Verifique se copiou a chave completa (inicia com `nxs_`)
2. Verifique o status da chave na interface
3. Verifique a data de expiração
4. Se revogada, crie uma nova chave

### Erro: "IP não autorizado"

**Causa:** Seu IP não está na lista de IPs permitidos

**Solução:**
1. Obtenha seu IP público: `curl ifconfig.me`
2. Edite a API Key e adicione o IP na lista
3. Ou remova a restrição de IPs se não for necessária

### Erro: "Rate limit excedido"

**Causa:** Excedeu o número de requisições por hora

**Solução:**
1. Aguarde até a próxima hora
2. Edite a API Key e aumente o rate limit
3. Otimize seu workflow para fazer menos requisições

### Erro: "Escopo insuficiente"

**Causa:** A chave não tem permissão para a operação

**Solução:**
1. Verifique os escopos da chave na interface
2. Edite a chave e adicione o escopo necessário:
   - `read` para consultas
   - `write` para criar/editar
   - `full` para acesso total

### Erro: "null value in column created_by_id"

**Causa:** Token JWT não contém `userId`

**Solução:** Este erro foi corrigido na v1.22. Atualize para a versão mais recente.

---

## 📊 MONITORAMENTO

### Métricas Disponíveis

1. **Usage Count**: Contador total de requisições
2. **Last Used At**: Data/hora do último uso
3. **Rate Limit**: Requisições por hora configuradas
4. **Status**: Estado atual da chave

### Logs

Todas as requisições usando API Keys são registradas nos logs do backend:

```bash
# Ver logs do backend
docker logs nexus_backend.1.xxxxx --tail 100 --follow

# Filtrar por API Key
docker logs nexus_backend.1.xxxxx 2>&1 | grep "API Key"
```

---

## 🎯 CASOS DE USO

### 1. Automação de Marketing com N8N
- Criar leads automaticamente de formulários externos
- Sincronizar contatos com MailChimp/SendGrid
- Disparar campanhas baseadas em eventos

### 2. Integração com CRM Externo
- Sincronizar dados bidirecionalmente
- Importar/exportar leads
- Atualizar status de vendas

### 3. Webhooks de Sistemas Terceiros
- Receber notificações de pagamento (Stripe, PagSeguro)
- Processar eventos de email (SendGrid, Mailgun)
- Integrar com telefonia (Twilio)

### 4. Dashboards Customizados
- Power BI conectando via API
- Tableau lendo dados em tempo real
- Grafana para monitoramento

### 5. Mobile Apps
- Apps iOS/Android acessando dados
- PWAs com autenticação via API Key
- Integrações white-label

---

## 📝 CHANGELOG

### v1.22 - 30/10/2025

**Adicionado:**
- ✅ Sistema completo de API Keys
- ✅ Interface web de gerenciamento
- ✅ Middleware de autenticação por API Key
- ✅ Controle de escopos (read, write, full)
- ✅ Rate limiting configurável
- ✅ Restrição por IP e origem
- ✅ Rastreamento de uso
- ✅ Suporte a expiração de chaves
- ✅ Documentação completa

**Corrigido:**
- ✅ Tipo UUID para tenant_id e created_by_id
- ✅ Desestruturação correta do token JWT (userId)
- ✅ Queries com IS NULL para soft delete

---

## 📞 SUPORTE

**Documentação Online:**
- Sistema: https://one.nexusatemporal.com.br/configuracoes
- API Docs: https://api.nexusatemporal.com.br/api/health

**Contato:**
- Email: contato@nexusatemporal.com.br
- GitHub: https://github.com/Magdiel-caim/nexusatemporal

---

## ⚖️ LICENÇA

Propriedade da Nexus Atemporal © 2025. Todos os direitos reservados.

---

**🎉 Sistema de API Keys implementado com sucesso!**

Versão: v1.22
Data: 30/10/2025
Status: ✅ Produção
