# INSTRUÇÕES - Importar Workflow v3 FINAL CORRIGIDO

## ✅ PROBLEMA IDENTIFICADO E CORRIGIDO

O webhook do N8N recebe os dados em uma estrutura diferente:

```json
{
  "headers": {...},
  "body": {
    "event": "message",
    "session": "atemporal_main",
    "payload": {...}
  }
}
```

**Correções aplicadas:**

1. **Nó "Filtrar Mensagens":**
   - ❌ Antes: `{{ $json.event }}`
   - ✅ Agora: `{{ $json.body.event }}`

2. **Nó "Processar Mensagem":**
   - ❌ Antes: `const payload = $input.item.json.payload;`
   - ✅ Agora: `const payload = $input.item.json.body.payload;`
   - ❌ Antes: `const session = $input.item.json.session;`
   - ✅ Agora: `const session = $input.item.json.body.session;`

---

## 📋 PASSO A PASSO PARA IMPORTAR

### 1️⃣ DELETAR WORKFLOWS ANTIGOS

No N8N:
- Delete o workflow **"waha-media-processor"**
- Delete o workflow **"WAHA - Receber Mensagens (COM S3) v2"** (se existir)

### 2️⃣ IMPORTAR NOVO WORKFLOW

1. No N8N, clique em **Menu** (3 linhas) → **Import from File**
2. Selecione o arquivo: `/root/nexusatemporal/n8n-workflows/n8n_workflow_2_receber_mensagens_COM_S3_v3_FINAL.json`
3. Clique em **Import**

### 3️⃣ CONFIGURAR CREDENCIAL S3

Abra o workflow importado e configure o nó **"Upload para S3 IDrive"**:

1. Clique no nó **"Upload para S3 IDrive"**
2. Em **Credential**, selecione a credencial S3 existente ou crie uma nova:

**Configuração da Credencial:**
```
Name: IDrive S3 - Nexus (ou S3 account)
Access Key ID: ZaIdY59FGaL8BdtRjZtL
Secret Access Key: wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj
Region: us-east-1
S3 Endpoint: https://c1k7.va.idrivee2-46.com
Force Path Style: ✅ ATIVADO (toggle VERDE à direita)
Ignore SSL Issues: ✅ ATIVADO (toggle VERDE à direita)
```

### 4️⃣ ATIVAR WORKFLOW

1. No canto superior direito, **ATIVE o workflow** (toggle verde)
2. Clique em **Save** para salvar
3. Verifique que aparece **"Active"** no nome do workflow

### 5️⃣ TESTAR

Execute o script de teste:

```bash
curl -X POST "https://workflow.nexusatemporal.com/webhook/waha-receive-message" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message",
    "session": "atemporal_main",
    "payload": {
      "id": "teste_'$(date +%s)'",
      "timestamp": '$(date +%s)',
      "from": "554198549563@c.us",
      "body": "Teste workflow v3 final",
      "fromMe": false,
      "type": "text",
      "_data": {
        "notifyName": "Teste"
      }
    }
  }'
```

Aguarde 5 segundos e verifique no banco de dados:

```bash
docker ps -q -f name=nexus_postgres | head -1 | xargs -I {} docker exec {} psql -U nexus_admin -d nexus_master -c "SELECT content, TO_CHAR(created_at, 'HH24:MI:SS') FROM chat_messages ORDER BY created_at DESC LIMIT 3;"
```

---

## ✅ VERIFICAÇÕES

Após importar e ativar:

1. **Execuções aparecem no N8N** com todos os nós verdes
2. **Mensagens chegam ao banco de dados** na tabela `chat_messages`
3. **Logs do backend** mostram requisições para `/api/chat/webhook/n8n/message`

---

## 🔍 DIFERENÇAS ENTRE VERSÕES

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `waha-media-processor.json` | ❌ DELETAR | Workflow bugado com bodyParameters |
| `n8n_workflow_2_receber_mensagens_COM_S3.json` | ❌ OBSOLETO | Versão sem correção do body |
| `n8n_workflow_2_receber_mensagens_COM_S3_CORRIGIDO.json` | ❌ OBSOLETO | Versão sem correção do body |
| `n8n_workflow_2_receber_mensagens_COM_S3_v3_FINAL.json` | ✅ USAR ESTE | Versão corrigida que acessa $json.body |

---

## 📊 ARQUITETURA DO FLUXO

```
WAHA → N8N Webhook → Filtrar Mensagens → Processar Mensagem → Tem Mídia?
                                                                    ├─→ SIM → Baixar Mídia → Upload S3 → Substituir URL → Backend
                                                                    └─→ NÃO → Backend (direto)
```

**Endpoints:**
- Webhook N8N: `https://workflow.nexusatemporal.com/webhook/waha-receive-message`
- Backend: `https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message`
- S3: `https://c1k7.va.idrivee2-46.com/backupsistemaonenexus/`

---

## 🆘 TROUBLESHOOTING

**Mensagens não chegam ao banco:**
1. Verifique se workflow está **ATIVO** (toggle verde)
2. Vá em **Executions** e veja se todas executam com sucesso
3. Clique em uma execução e verifique se todos os nós estão verdes
4. Verifique logs do backend: `docker service logs nexus_backend --tail 50`

**Erro no upload S3:**
1. Verifique se **Force Path Style** está ATIVADO
2. Verifique se **Ignore SSL Issues** está ATIVADO
3. Verifique credenciais Access Key e Secret Key

**Filtro bloqueando mensagens:**
1. Verifique se o filtro usa `{{ $json.body.event }}` (NÃO `{{ $json.event }}`)
2. Clique na execução e veja o OUTPUT do "Webhook WAHA" para confirmar estrutura
