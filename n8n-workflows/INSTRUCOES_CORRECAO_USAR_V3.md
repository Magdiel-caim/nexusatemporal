# CORREÇÃO URGENTE - Usar Workflow v3 (NÃO v4)

## 🚨 PROBLEMA IDENTIFICADO

Você está usando o **workflow v4** que tenta chamar a API do WAHA para buscar mídias.
Mas essa API não existe (retorna 404), por isso está falhando.

## ✅ SOLUÇÃO

Após configurarmos as variáveis de ambiente no WAHA:
- `WHATSAPP_DOWNLOAD_MEDIA=TRUE`
- `WHATSAPP_DOWNLOAD_MEDIA_STORE=TRUE`

O WAHA agora **baixa a mídia ANTES de enviar o webhook**.
Isso significa que a URL da mídia já vem no payload do webhook diretamente.

Você deve usar o **workflow v3**, não o v4.

---

## 📋 PASSOS PARA CORRIGIR

### 1️⃣ DESATIVAR E DELETAR WORKFLOW v4

No N8N:
1. Abra o workflow **"WAHA - Receber Mensagens (COM S3) v4 WAHA API"**
2. Clique no toggle no canto superior direito para **DESATIVAR** (deve ficar vermelho/cinza)
3. Clique no menu (3 pontos) → **Delete**
4. Confirme a exclusão

### 2️⃣ IMPORTAR WORKFLOW v3

1. No N8N, clique em **Menu** (3 linhas no canto superior esquerdo) → **Import from File**
2. Selecione o arquivo:
   ```
   /root/nexusatemporal/n8n-workflows/n8n_workflow_2_receber_mensagens_COM_S3_v3_FINAL.json
   ```
3. Clique em **Import**

### 3️⃣ CONFIGURAR CREDENCIAL S3 (se necessário)

Abra o nó **"Upload para S3 IDrive"** e verifique se a credencial está configurada:

```
Credential: IDrive S3 - Nexus (ou S3 account)
Access Key ID: ZaIdY59FGaL8BdtRjZtL
Secret Access Key: wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj
Region: us-east-1
S3 Endpoint: https://c1k7.va.idrivee2-46.com
Force Path Style: ✅ ATIVADO (toggle VERDE à direita)
Ignore SSL Issues: ✅ ATIVADO (toggle VERDE à direita)
```

**IMPORTANTE:** O toggle **Force Path Style** deve estar à DIREITA (verde/azul).

### 4️⃣ VERIFICAR CONFIGURAÇÃO DOS NÓS "Enviar para Backend"

**AMBOS os nós** (COM URL S3 e SEM MÍDIA) devem ter:

1. **Send Body**: ✅ Ativado
2. **Body Content Type**: JSON
3. **Specify Body**: Using JSON Parameters
4. **JSON Parameters**: ✅ Ativado
5. **Body Parameters (JSON)**: `={{ $json }}`

### 5️⃣ ATIVAR WORKFLOW v3

1. No canto superior direito, **ATIVE o workflow** (toggle deve ficar verde)
2. Clique em **Save** para salvar
3. Verifique que aparece **"Active"** em verde no nome do workflow

---

## 🧪 TESTAR

### Teste com Imagem

1. Envie uma **NOVA imagem** pelo WhatsApp para o número **+55 41 9243-1011**
   - ⚠️ Deve ser uma imagem nova, não a mesma que você enviou antes

2. Aguarde 5-10 segundos

3. Verifique no N8N:
   - Vá em **Executions** (menu lateral esquerdo)
   - Veja a última execução
   - **TODOS os nós devem estar VERDES**
   - Se algum estiver vermelho, clique para ver o erro

4. Verifique no sistema:
   - Abra o chat no frontend
   - A imagem deve aparecer carregando do S3

---

## 🔍 DIFERENÇA ENTRE v3 e v4

### Workflow v3 (CORRETO para usar agora):
```
Webhook WAHA → Processar Mensagem → Tem Mídia?
                                     ↓ SIM
                                    Baixar Mídia (direto do payload)
                                     ↓
                                    Upload S3
                                     ↓
                                    Enviar Backend
```
- Espera que `payload._data.mediaUrl` já venha no webhook
- Funciona com `WHATSAPP_DOWNLOAD_MEDIA=TRUE`

### Workflow v4 (FALHA - não usar):
```
Webhook WAHA → Processar Mensagem → Tem Mídia?
                                     ↓ SIM
                                    Buscar Mídia do WAHA (API call)
                                     ↓ ❌ ERRO 404
                                    FALHA
```
- Tenta chamar API do WAHA que não existe
- Não funciona

---

## 📊 VERIFICAR SE DEU CERTO

### No N8N (Executions):
```
✅ Webhook WAHA (verde)
✅ Filtrar Mensagens (verde)
✅ Processar Mensagem (verde)
✅ Tem Mídia? (verde - saída TRUE)
✅ Baixar Mídia do WhatsApp (verde)
✅ Upload para S3 IDrive (verde)
✅ Substituir URL do WhatsApp por S3 (verde)
✅ Enviar para Backend (COM URL S3) (verde)
```

### No Banco de Dados:
```bash
docker exec nexus_postgres psql -U nexus_admin -d nexus_master -c "
SELECT id, message_type, media_url, created_at
FROM chat_messages
WHERE message_type = 'image'
ORDER BY created_at DESC
LIMIT 3;"
```

Deve mostrar:
- `message_type`: `image` (não `text`)
- `media_url`: `https://c1k7.va.idrivee2-46.com/backupsistemaonenexus/whatsapp/...`

### No Frontend:
- Abra o chat
- A imagem deve aparecer (carregando do S3)

---

## 🆘 SE AINDA DER ERRO

Se v3 ainda falhar com **"mediaUrl não encontrada"**, significa que WAHA não está enviando a URL da mídia no webhook mesmo com as variáveis de ambiente.

Nesse caso, vamos para **Opção 2**: Criar workflow de polling que busca mensagens periodicamente e processa mídias.

Mas primeiro, teste com v3 e me avise o que aconteceu!

---

## ✅ RESUMO RÁPIDO

1. ❌ **DELETE** workflow v4
2. ✅ **IMPORT** workflow v3
3. ✅ **CONFIGURE** S3 credentials (Force Path Style = ON)
4. ✅ **ACTIVATE** workflow v3
5. ✅ **TEST** com uma nova imagem
6. ✅ **REPORT** resultado (screenshot da execução no N8N)
