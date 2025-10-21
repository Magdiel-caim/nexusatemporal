# Debug do Workflow N8N - Passo a Passo

## 🚨 Problema Detectado

O workflow N8N está **recebendo** webhooks mas **NÃO está salvando** no banco de dados.

**Teste feito**: Enviamos webhook → N8N respondeu "Workflow was started" → Mensagem NÃO apareceu no banco ❌

---

## 🔍 Checklist de Verificação

### 1️⃣ Verificar se Workflow está ATIVO

1. Abra: https://workflow.nexusatemporal.com
2. Menu lateral: **Workflows**
3. Procure: **"WAHA - Receber Mensagens (COM S3) v2"**
4. Verifique:
   - [ ] Status deve estar **VERDE** (Active)
   - [ ] Se estiver cinza, clique para ativar

---

### 2️⃣ Verificar Execuções no N8N

1. N8N → **Executions** (menu lateral esquerdo)
2. Filtre por: **"WAHA - Receber Mensagens (COM S3) v2"**
3. Veja as últimas execuções:
   - 🟢 **Verde** = Sucesso
   - 🔴 **Vermelho** = Erro (CLIQUE PARA VER DETALHES!)

---

### 3️⃣ Verificar Nós com Erro

Se houver execuções **VERMELHAS** (erro):

1. Clique na execução com erro
2. Procure nós em **vermelho** (falhou)
3. Clique no nó vermelho
4. Veja o **erro** na aba "Error"

**Erros Comuns**:

#### Erro no nó "Upload para S3 IDrive"
```
❌ "Credential 'IDrive S3 - Nexus' not found"
```
**Solução**:
1. N8N → Credentials → Add → AWS
2. Nome: **IDrive S3 - Nexus** (EXATAMENTE assim)
3. Preencha as credenciais (ver abaixo)

#### Erro no nó "Enviar para Backend"
```
❌ "ECONNREFUSED" ou "404 Not Found"
```
**Solução**:
1. Verifique se URL está: `https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message`
2. Teste backend:
   ```bash
   curl -X POST https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

---

### 4️⃣ Verificar Credencial S3

1. N8N → **Credentials** (menu lateral)
2. Procure: **"IDrive S3 - Nexus"**
3. Se NÃO existir, crie:

```
Name: IDrive S3 - Nexus

Access Key ID: ZaIdY59FGaL8BdtRjZtL

Secret Access Key: wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj

Region: us-east-1

Custom Endpoints: ☑️ Yes (ATIVAR!)
  └─ S3 Endpoint: https://c1k7.va.idrivee2-46.com

Force Path Style: ☑️ Yes (ATIVAR!)
```

4. Clique em **Test** (deve dar sucesso)
5. Clique em **Save**

---

### 5️⃣ Vincular Credencial ao Workflow

1. Abra o workflow: **"WAHA - Receber Mensagens (COM S3) v2"**
2. Clique no nó: **"Upload para S3 IDrive"**
3. Na seção **Credentials**:
   - Clique no dropdown
   - Selecione: **IDrive S3 - Nexus**
4. Clique em **Save** (canto superior direito)

---

### 6️⃣ Testar Novamente

Depois de corrigir, teste enviando webhook manualmente:

```bash
curl -X POST "https://workflow.nexusatemporal.com/webhook/waha-receive-message" \
  -H "Content-Type: application/json" \
  -d '{
  "event": "message",
  "session": "atemporal_main",
  "payload": {
    "id": "test-debug-'$(date +%s)'",
    "from": "554198549563@c.us",
    "fromMe": false,
    "body": "Teste após correção",
    "type": "text",
    "timestamp": '$(date +%s)',
    "_data": {
      "Info": {
        "PushName": "Debug Teste"
      }
    }
  }
}'
```

**Aguarde 3 segundos**, depois verifique no banco:

```bash
docker ps -q -f name=nexus_postgres | head -1 | xargs -I {} docker exec {} psql -U nexus_admin -d nexus_master -c "SELECT id, content, contact_name, created_at FROM chat_messages WHERE contact_name = 'Debug Teste' ORDER BY created_at DESC LIMIT 1;"
```

Se aparecer a mensagem **"Teste após correção"**, está FUNCIONANDO! ✅

---

## 🎯 Diagnóstico Rápido

| Sintoma | Provável Causa | Solução |
|---------|---------------|---------|
| Workflow não aparece em Executions | Workflow não está ativo | Ativar workflow |
| Execução VERMELHA no nó S3 | Credencial não configurada | Criar credencial S3 |
| Execução VERMELHA no nó Backend | URL errada ou backend offline | Verificar URL e backend |
| Execução VERDE mas sem mensagem no banco | Endpoint do backend errado | Verificar URL |
| "Credential not found" | Nome da credencial diferente | Nome EXATO: "IDrive S3 - Nexus" |

---

## 📋 Resumo das Verificações

Execute em ordem:

```bash
# 1. Verificar se backend está online
curl -s https://api.nexusatemporal.com.br/api/chat/webhook/n8n/message \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": true}' | jq '.success'
# Deve retornar: false (mas não erro de conexão)

# 2. Verificar S3
AWS_ACCESS_KEY_ID="ZaIdY59FGaL8BdtRjZtL" \
AWS_SECRET_ACCESS_KEY="wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj" \
aws s3 ls s3://backupsistemaonenexus/ \
  --endpoint-url https://c1k7.va.idrivee2-46.com \
  --no-verify-ssl
# Deve listar arquivos (ou vazio se bucket novo)

# 3. Testar workflow completo
curl -X POST "https://workflow.nexusatemporal.com/webhook/waha-receive-message" \
  -H "Content-Type: application/json" \
  -d '{"event": "message", "session": "atemporal_main", "payload": {"id": "test", "from": "554198549563@c.us", "fromMe": false, "body": "Teste", "type": "text", "timestamp": 1697234567, "_data": {"Info": {"PushName": "Teste"}}}}'
# Deve retornar: {"message":"Workflow was started"}

# 4. Aguardar e verificar banco (após 3 segundos)
sleep 3
docker ps -q -f name=nexus_postgres | head -1 | xargs -I {} docker exec {} psql -U nexus_admin -d nexus_master -c "SELECT content FROM chat_messages WHERE content = 'Teste' ORDER BY created_at DESC LIMIT 1;"
# Deve retornar a mensagem "Teste"
```

---

## 🆘 Se Nada Funcionar

Execute e me envie a saída:

```bash
# Ver últimas execuções do workflow (via API do N8N se possível)
# OU tire um print da tela "Executions" no N8N mostrando:
# - Status da última execução (verde/vermelho)
# - Qual nó falhou (se houver)
# - Mensagem de erro
```

---

## ✅ Sucesso Esperado

Quando tudo estiver funcionando:

1. ✅ Workflow aparece como **VERDE** em Workflows
2. ✅ Execuções aparecem **VERDES** em Executions
3. ✅ Mensagens aparecem no banco de dados
4. ✅ Imagens futuras terão URL do S3 (não base64)

---

**Próximo passo**: Siga os passos acima e me diga qual erro aparece no N8N!
