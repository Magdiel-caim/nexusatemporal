# INSTRUÇÕES - Workflow v4 COM WAHA API

## ❌ PROBLEMA IDENTIFICADO (v3)

O WAHA **NÃO envia** a URL da mídia no webhook porque:
- O webhook é enviado ANTES do WAHA baixar a mídia do WhatsApp
- `payload.hasMedia` vem como `false` mesmo para imagens
- `payload.type` vem vazio
- `payload._data.mediaUrl` não existe

**Resultado:** O workflow v3 não detectava mídias e não processava nada.

---

## ✅ SOLUÇÃO (v4)

O workflow v4 **busca a mídia diretamente do WAHA** usando a API:

### Fluxo Novo:

```
1. Webhook recebe mensagem do WAHA
2. Detecta se tem mídia (hasMedia OU tipo diferente de text)
3. **CHAMA API DO WAHA**: GET /api/{session}/messages/{messageId}
4. Extrai a URL da mídia do response
5. Baixa a mídia
6. Upload no S3
7. Envia ao backend com URL do S3
```

---

## 🔧 MUDANÇAS PRINCIPAIS

### 1. Detecção de Mídia Melhorada
**Antes (v3):**
```javascript
const hasMedia = payload._data?.mediaUrl && payload._data.mediaUrl.trim() !== '';
```

**Agora (v4):**
```javascript
const hasMedia = payload.hasMedia === true ||
  (payload.type && payload.type !== 'text' && payload.type !== 'location' && payload.type !== 'contact');
```

### 2. Novo Nó: "Buscar Mídia do WAHA"
- **Tipo:** HTTP Request
- **URL:** `https://apiwts.nexusatemporal.com.br/api/{{ $json.sessionName }}/messages/{{ $json.wahaMessageId }}`
- **Header:** `X-Api-Key: bd0c416348b2f04d198ff8971b608a87`
- **Response:** JSON com dados completos da mensagem

### 3. Novo Nó: "Extrair URL da Mídia"
- **Tipo:** Code (JavaScript)
- **Função:** Extrai `media.url` ou `mediaUrl` do response do WAHA

---

## 📋 PASSO A PASSO PARA INSTALAR

### 1️⃣ DELETAR WORKFLOW ANTIGO

No N8N:
1. Desative o workflow **"WAHA - Receber Mensagens (COM S3) v3 FINAL"**
2. Delete ele

### 2️⃣ IMPORTAR WORKFLOW v4

1. No N8N, clique em **Menu** (3 linhas) → **Import from File**
2. Selecione o arquivo: `/root/nexusatemporal/n8n-workflows/n8n_workflow_2_receber_mensagens_COM_S3_v4_WAHA_API.json`
3. Clique em **Import**

### 3️⃣ CONFIGURAR CREDENCIAL S3

Abra o nó **"Upload para S3 IDrive"** e configure:

```
Credential: IDrive S3 - Nexus (ou S3 account)
Access Key ID: ZaIdY59FGaL8BdtRjZtL
Secret Access Key: wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj
Region: us-east-1
S3 Endpoint: https://c1k7.va.idrivee2-46.com
Force Path Style: ✅ ATIVADO (toggle VERDE à direita)
Ignore SSL Issues: ✅ ATIVADO (toggle VERDE à direita)
```

### 4️⃣ CONFIGURAR NÓS "Enviar para Backend"

**AMBOS os nós** ("COM URL S3" e "SEM MÍDIA") precisam:

1. Clique no nó
2. Na seção **"Send Body"**:
   - **Body Content Type:** JSON
   - **Specify Body:** Using JSON
   - **JSON:** `={{ $json }}`

### 5️⃣ ATIVAR WORKFLOW

1. No canto superior direito, **ATIVE o workflow** (toggle verde)
2. Clique em **Save** para salvar
3. Verifique que aparece **"Active"** no nome do workflow

---

## 🧪 TESTAR

### Teste 1: Mensagem de Texto
Envie uma mensagem de texto normal:
- ✅ Deve ser **IGNORADA** pelo N8N (processada só pelo webhook direto)
- ✅ Log no backend: "Mensagem de texto ignorada pelo N8N"

### Teste 2: Imagem/Vídeo/Áudio
Envie uma imagem:
1. ✅ N8N detecta que tem mídia
2. ✅ Chama API do WAHA para buscar mídia
3. ✅ Baixa a mídia
4. ✅ Upload no S3
5. ✅ Envia ao backend com URL do S3
6. ✅ Aparece no sistema com imagem carregando

**Para verificar:**
```bash
# Ver últimas mensagens com mídia
docker exec nexus_postgres psql -U nexus_admin -d nexus_master -c "
SELECT id, message_type, content, media_url, created_at
FROM chat_messages
WHERE message_type != 'text'
ORDER BY created_at DESC
LIMIT 5;"
```

---

## 🔍 TROUBLESHOOTING

### Mídia não aparece

**1. Verifique execuções no N8N:**
- Vá em **Executions**
- Clique na última execução
- Veja se todos os nós estão **VERDES**
- Se algum estiver **VERMELHO**, clique para ver o erro

**2. Erros comuns:**

**Erro: "WAHA não retornou URL de mídia"**
- Causa: WAHA ainda não baixou a mídia
- Solução: Aguarde 5-10 segundos e reenvie

**Erro: "401 Unauthorized" no nó "Buscar Mídia do WAHA"**
- Causa: API Key incorreta
- Solução: Verifique header `X-Api-Key: bd0c416348b2f04d198ff8971b608a87`

**Erro: "Force Path Style" no upload S3**
- Causa: Force Path Style desativado
- Solução: Vá na credencial S3 e ative o toggle

**3. Verificar logs do backend:**
```bash
docker service logs nexus_backend --tail 50 --since 5m | grep -E "(Mensagem recebida|hasMedia|Mídia)"
```

---

## 📊 ARQUITETURA COMPLETA

```
┌─────────────┐
│  WhatsApp   │
└──────┬──────┘
       │
       v
┌──────────────┐
│     WAHA     │ (envia 2 webhooks em paralelo)
└──┬───────┬───┘
   │       │
   │       └──────────────────────┐
   │                              │
   v                              v
┌──────────────┐         ┌─────────────────┐
│   Backend    │         │      N8N        │
│   (Direto)   │         │   Workflow      │
└──────────────┘         └────────┬────────┘
                                  │
                         ┌────────┴────────┐
                         │                 │
                         v                 v
                  ┌──────────┐      ┌──────────┐
                  │   Tem    │      │   Sem    │
                  │  Mídia?  │      │  Mídia?  │
                  └─────┬────┘      └────┬─────┘
                        │                │
                        v                v
                  ┌──────────┐      ┌──────────┐
                  │  Buscar  │      │  Enviar  │
                  │   WAHA   │      │ Backend  │
                  │   API    │      │ (IGNORA) │
                  └─────┬────┘      └──────────┘
                        │
                        v
                  ┌──────────┐
                  │ Extrair  │
                  │   URL    │
                  └─────┬────┘
                        │
                        v
                  ┌──────────┐
                  │ Baixar   │
                  │  Mídia   │
                  └─────┬────┘
                        │
                        v
                  ┌──────────┐
                  │ Upload   │
                  │    S3    │
                  └─────┬────┘
                        │
                        v
                  ┌──────────┐
                  │ Enviar   │
                  │ Backend  │
                  │ (COM S3) │
                  └──────────┘
```

---

## ✅ RESULTADO ESPERADO

### Mensagens de Texto:
- ✅ 1 registro no banco (via webhook direto)
- ✅ Chegam instantaneamente

### Mensagens com Mídia:
- ✅ 1 registro no banco (via N8N com S3)
- ✅ `media_url` aponta para S3 (permanente)
- ✅ Mídia não expira

---

## 📝 NOTAS IMPORTANTES

1. **Webhook direto continua funcionando** - Todas as mensagens chegam rápido via backend
2. **N8N processa apenas mídias** - Zero duplicação de textos
3. **Mídias têm URL permanente** - Armazenadas no S3/IDrive
4. **Fallback seguro** - Se N8N cair, mensagens ainda chegam (mas com URL temporária)

---

## 🆘 SUPORTE

Se continuar com problemas:

1. **Envie uma mensagem de teste**
2. **Tire screenshot da execução no N8N** mostrando qual nó falhou
3. **Copie o erro** que aparece no nó
4. **Verifique logs do backend**

Me avise com essas informações para ajudar!
