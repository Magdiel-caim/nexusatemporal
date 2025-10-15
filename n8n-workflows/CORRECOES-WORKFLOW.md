# Correções do Workflow - Problemas e Soluções

## 🐛 Problemas Identificados no Workflow Importado

Você importou o workflow `waha-media-processor.json` mas ele tinha **2 problemas** que impediam o funcionamento correto.

---

## ❌ Problema 1: Método HTTP Incorreto

### O que estava errado:

O workflow estava enviando dados para o backend usando `bodyParameters` individual:

```json
{
  "sendBody": true,
  "bodyParameters": {
    "parameters": [
      { "name": "sessionName", "value": "={{ $json.sessionName }}" },
      { "name": "phoneNumber", "value": "={{ $json.phoneNumber }}" },
      { "name": "contactName", "value": "={{ $json.contactName }}" },
      ...
    ]
  }
}
```

### Por que isso é um problema:

O backend espera receber um **JSON simples** direto no body:

```typescript
// Backend: /api/chat/webhook/n8n/message
const payload: N8NMessagePayload = req.body;
```

Quando você usa `bodyParameters`, o N8N envia como **form-data** ou **query string**, não como JSON.

### ✅ Solução:

Usar `jsonParameters: true` e `bodyParametersJson`:

```json
{
  "sendBody": true,
  "contentType": "json",
  "jsonParameters": true,
  "bodyParametersJson": "={{ $json }}"
}
```

Isso envia o objeto completo como JSON, que é o que o backend espera.

---

## ❌ Problema 2: Credencial Desnecessária

### O que estava errado:

O workflow estava configurado para usar autenticação:

```json
{
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "credentials": {
    "httpHeaderAuth": {
      "id": "nexus-api-auth",
      "name": "Nexus API Auth"
    }
  }
}
```

### Por que isso é um problema:

1. **Credencial não existe**: Você precisaria criar manualmente "Nexus API Auth" no N8N
2. **Endpoint não precisa**: O backend `/api/chat/webhook/n8n/message` **não tem autenticação**

```typescript
// Backend: não tem verificação de auth
async receiveMessage(req: Request, res: Response) {
  const payload: N8NMessagePayload = req.body; // ← Sem auth!
  // ...
}
```

### ✅ Solução:

Remover toda a seção de autenticação:

```json
{
  "method": "POST",
  "url": "https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "application/json"
      }
    ]
  },
  "sendBody": true,
  "contentType": "json",
  "jsonParameters": true,
  "bodyParametersJson": "={{ $json }}"
}
```

---

## 📊 Comparação: Antes vs Depois

### Nó "Enviar para Backend" - ANTES (❌ Errado)

```json
{
  "parameters": {
    "url": "https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message",
    "authentication": "genericCredentialType",       ← ❌ Desnecessário
    "genericAuthType": "httpHeaderAuth",             ← ❌ Desnecessário
    "sendBody": true,
    "bodyParameters": {                              ← ❌ Errado (não é JSON)
      "parameters": [
        { "name": "sessionName", "value": "={{ $json.sessionName }}" },
        { "name": "phoneNumber", "value": "={{ $json.phoneNumber }}" },
        ...
      ]
    },
    "credentials": {                                 ← ❌ Não existe
      "httpHeaderAuth": {
        "id": "nexus-api-auth",
        "name": "Nexus API Auth"
      }
    }
  }
}
```

### Nó "Enviar para Backend" - DEPOIS (✅ Correto)

```json
{
  "parameters": {
    "method": "POST",
    "url": "https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "contentType": "json",                          ← ✅ JSON
    "jsonParameters": true,                         ← ✅ JSON params
    "bodyParametersJson": "={{ $json }}",           ← ✅ Envia objeto inteiro
    "options": {
      "response": {
        "response": {
          "neverError": true                        ← ✅ Não falha em erro HTTP
        }
      }
    }
  }
}
```

---

## 🚀 Como Usar o Workflow Corrigido

### Passo 1: Importar Workflow Corrigido

```bash
# Arquivo corrigido:
/root/nexusatemporal/n8n-workflows/n8n_workflow_2_receber_mensagens_COM_S3_CORRIGIDO.json
```

1. N8N → **Import from File**
2. Selecione: `n8n_workflow_2_receber_mensagens_COM_S3_CORRIGIDO.json`
3. Clique em **Import**

### Passo 2: Configurar Credencial S3 (Apenas Esta!)

1. N8N → **Credentials** → **Add Credential**
2. Tipo: **AWS**
3. Preencher:

```
Name: IDrive S3 - Nexus
Access Key ID: ZaIdY59FGaL8BdtRjZtL
Secret Access Key: wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj
Region: us-east-1
Custom Endpoints: ☑️ Yes
  └─ S3 Endpoint: https://c1k7.va.idrivee2-46.com
Force Path Style: ☑️ Yes
```

4. **Test** → **Save**

### Passo 3: Vincular Credencial ao Workflow

1. Abra o workflow importado
2. Clique no nó: **"Upload para S3 IDrive"**
3. Em **Credentials**, selecione: **IDrive S3 - Nexus**
4. **Save**

### Passo 4: Ativar Workflow

1. Toggle **"Active"** → ON (verde)
2. Pronto!

---

## 🧪 Como Testar

### Teste 1: Enviar Mensagem de Texto

1. Envie uma mensagem de texto via WhatsApp
2. N8N → Executions → Deve aparecer execução **verde** ✅
3. Frontend → Mensagem deve aparecer

### Teste 2: Enviar Imagem

1. Envie uma imagem via WhatsApp
2. N8N → Executions → Clique na última execução
3. Veja os nós:
   - ✅ "Tem Mídia?" → TRUE
   - ✅ "Baixar Mídia do WhatsApp" → Sucesso
   - ✅ "Upload para S3 IDrive" → Sucesso (veja a Key retornada)
   - ✅ "Substituir URL" → Veja URL do S3 no output
   - ✅ "Enviar para Backend (COM URL S3)" → Status 200

4. Frontend → Imagem deve aparecer! 🎉

---

## 🔍 Como Ver os Logs de Execução

1. N8N → **Executions** (menu lateral)
2. Clique na última execução
3. Clique em cada nó para ver o output
4. Procure por:
   - **Input**: O que entrou no nó
   - **Output**: O que saiu do nó
   - **Errors**: Se houver erro

### Exemplo de Output Bem-Sucedido

**Nó "Substituir URL do WhatsApp por S3"**:
```json
{
  "sessionName": "atemporal_main",
  "phoneNumber": "554198549563",
  "contactName": "João",
  "messageType": "image",
  "content": "",
  "mediaUrl": "https://c1k7.va.idrivee2-46.com/backupsistemaonenexus/whatsapp/atemporal_main/20251014-180000-ABC123.jpg",
  "direction": "incoming",
  "timestamp": 1697234567000
}
```

**Nó "Enviar para Backend (COM URL S3)"**:
```json
{
  "success": true,
  "message": "Message received and saved",
  "data": {
    "id": "uuid-aqui",
    "sessionName": "atemporal_main",
    "phoneNumber": "554198549563"
  }
}
```

---

## 📝 Resumo das Mudanças

| Aspecto | Workflow Antigo (❌) | Workflow Corrigido (✅) |
|---------|---------------------|------------------------|
| **Método HTTP** | bodyParameters (form-data) | JSON direto |
| **Autenticação** | httpHeaderAuth (não existe) | Nenhuma (não precisa) |
| **Credenciais necessárias** | 2 (AWS + Nexus API Auth) | 1 (AWS apenas) |
| **Funcionamento** | ❌ Não funciona | ✅ Funciona |

---

## 🆘 Troubleshooting

### ❌ Erro: "Credential 'nexus-api-auth' not found"

**Causa**: Você está usando o workflow ANTIGO (waha-media-processor.json)

**Solução**: Use o workflow CORRIGIDO:
```
n8n_workflow_2_receber_mensagens_COM_S3_CORRIGIDO.json
```

---

### ❌ Erro: "Cannot read properties of undefined"

**Causa**: Backend não conseguiu parsear o JSON

**Solução**: Verifique se está usando `jsonParameters: true` e `bodyParametersJson`

---

### ❌ Erro: "Credential 'IDrive S3 - Nexus' not found"

**Causa**: Credencial S3 não foi configurada

**Solução**:
1. N8N → Credentials → Add Credential → AWS
2. Nome EXATAMENTE: **IDrive S3 - Nexus**
3. Preencher credenciais (ver Passo 2 acima)

---

## ✅ Checklist Final

Antes de testar, confirme:

- [ ] Workflow CORRIGIDO importado (nome: "WAHA - Receber Mensagens (COM S3) v2")
- [ ] Credencial "IDrive S3 - Nexus" criada e testada
- [ ] Credencial vinculada ao nó "Upload para S3 IDrive"
- [ ] Workflow ativado (toggle verde)
- [ ] Nenhuma credencial "Nexus API Auth" necessária

---

## 🎯 Próximo Passo

1. **Delete** o workflow antigo: "WAHA Media Processor - WhatsApp to S3"
2. **Use** o workflow corrigido: "WAHA - Receber Mensagens (COM S3) v2"
3. **Teste** enviando uma imagem via WhatsApp
4. **Verifique** execuções no N8N

---

**Criado**: 2025-10-14
**Versão**: 2.0 (Corrigido)
