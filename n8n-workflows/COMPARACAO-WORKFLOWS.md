# Comparação: Workflow Atual vs Workflow COM S3

## 📊 Resumo das Diferenças

| Aspecto | Workflow Atual | Workflow COM S3 |
|---------|---------------|-----------------|
| **Arquivo** | `n8n_workflow_2_receber_mensagens.json` | `n8n_workflow_2_receber_mensagens_COM_S3.json` |
| **Nós** | 4 nós | 9 nós |
| **Processamento de Mídia** | ❌ Não processa | ✅ Processa e salva no S3 |
| **URLs de Mídia** | ⚠️ Temporárias (expiram) | ✅ Permanentes (S3) |
| **Performance** | Rápido (não processa mídia) | Um pouco mais lento (+2-3s por mídia) |
| **Confiabilidade** | ⚠️ Mídias antigas não carregam | ✅ Mídias sempre disponíveis |

---

## 🔄 Fluxo Atual (4 nós)

```
┌─────────────────┐
│ Webhook WAHA    │ ← Recebe do WhatsApp
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Filtrar         │ ← Só event === "message"
│ Mensagens       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Processar       │ ← Extrai dados
│ Mensagem        │   mediaUrl: URL temporária ⚠️
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enviar para     │ ← Envia com URL temporária
│ Backend         │   ⚠️ URL expira em 24h
└─────────────────┘
```

**Problema:** `mediaUrl` vem do WhatsApp e **expira**. Imagens antigas não carregam.

---

## ✅ Fluxo COM S3 (9 nós)

```
┌─────────────────┐
│ Webhook WAHA    │ ← Recebe do WhatsApp
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Filtrar         │
│ Mensagens       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Processar       │
│ Mensagem        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tem Mídia?      │ ← NOVO: Verifica se tem mídia
└────┬───────┬────┘
     │       │
    SIM     NÃO
     │       │
     │       └─────────────────────┐
     │                             │
     ▼                             ▼
┌─────────────────┐      ┌──────────────────┐
│ Baixar Mídia    │      │ Enviar Backend   │
│ do WhatsApp     │      │ (Sem Mídia)      │
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Upload para     │ ← NOVO: Salva no S3
│ S3 IDrive       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Substituir URL  │ ← NOVO: URL do WhatsApp → URL do S3
│ WhatsApp por S3 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enviar Backend  │ ← Envia com URL S3 (permanente)
│ (Com URL S3)    │   ✅ URL nunca expira
└─────────────────┘
```

---

## 🆕 Novos Nós Adicionados

### 1. **"Tem Mídia?"** (IF Node)
- **Posição:** Após "Processar Mensagem"
- **Função:** Detecta se a mensagem tem mídia
- **Condições:**
  - `mediaUrl` não está vazio
  - `messageType` não é text/location/contact
- **Saídas:**
  - TRUE → Vai para "Baixar Mídia"
  - FALSE → Vai direto para "Enviar Backend (Sem Mídia)"

### 2. **"Baixar Mídia do WhatsApp"** (HTTP Request)
- **Posição:** Branch TRUE do IF
- **Função:** Baixa a mídia da URL temporária do WhatsApp
- **Configuração:**
  - URL: `{{ $json.mediaUrl }}`
  - Response Format: **file** (importante!)
  - Output Property: `mediaFile`

### 3. **"Upload para S3 IDrive"** (AWS Node)
- **Posição:** Após "Baixar Mídia"
- **Função:** Faz upload para S3/IDrive
- **Configuração:**
  - Operation: `upload`
  - Bucket: `backupsistemaonenexus`
  - File Name: `whatsapp/{session}/{timestamp}-{id}.{ext}`
  - Binary Property: `mediaFile`
  - Content-Type: Dinâmico baseado no tipo
  - Metadata: session, type, messageId, phoneNumber
- **Credencial:** `IDrive S3 - Nexus`

### 4. **"Substituir URL do WhatsApp por S3"** (Code Node)
- **Posição:** Após "Upload S3"
- **Função:** Substitui `mediaUrl` pela URL do S3
- **Código:**
```javascript
const s3Endpoint = 'https://c1k7.va.idrivee2-46.com';
const bucket = 'backupsistemaonenexus';
const fileName = s3Response.Key;
const s3Url = `${s3Endpoint}/${bucket}/${fileName}`;

return {
  ...originalData,
  mediaUrl: s3Url,  // URL permanente
  originalMediaUrl: originalData.mediaUrl  // Backup
};
```

### 5. **"Enviar para Backend (COM URL S3)"** (HTTP Request)
- **Posição:** Após "Substituir URL"
- **Função:** Envia para backend com URL S3
- **Diferença:** Agora `mediaUrl` é permanente!

### 6. **"Enviar para Backend (SEM MÍDIA)"** (HTTP Request)
- **Posição:** Branch FALSE do IF
- **Função:** Envia mensagens de texto direto
- **Otimização:** Não processa desnecessariamente

---

## ⚙️ Configuração Necessária

### Credencial AWS (IDrive S3)

Você precisará criar esta credencial no N8N:

1. **Nome:** `IDrive S3 - Nexus`
2. **Tipo:** AWS
3. **Configuração:**
```
Access Key ID: ZaIdY59FGaL8BdtRjZtL
Secret Access Key: wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj
Region: us-east-1
Custom Endpoints: ✅ Yes
  S3 Endpoint: https://c1k7.va.idrivee2-46.com
Force Path Style: ✅ Yes
```

---

## 🚀 Como Migrar

### Opção 1: Substituir (Recomendado)

1. **Desative** o workflow atual:
   ```
   N8N → WAHA - Receber Mensagens → Toggle "Active" OFF
   ```

2. **Importe** o novo workflow:
   ```
   N8N → Import from File → n8n_workflow_2_receber_mensagens_COM_S3.json
   ```

3. **Configure** a credencial AWS (IDrive S3)

4. **Ative** o novo workflow:
   ```
   Toggle "Active" ON
   ```

5. **Teste** enviando uma imagem via WhatsApp

### Opção 2: Rodar em Paralelo (Para Testes)

1. **Mantenha** o workflow atual ATIVO

2. **Importe** o novo workflow (virá INATIVO por padrão)

3. **Configure** credencial AWS

4. **Mude o webhook path** no novo workflow:
   ```
   Webhook WAHA → path: "waha-receive-message-s3"
   ```

5. **Ative** o novo workflow

6. **Configure WAHA** para enviar para ambos:
```bash
curl -X PATCH "https://apiwts.nexusatemporal.com.br/api/sessions/atemporal_main" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "webhooks": [
        {
          "url": "https://workflow.nexusatemporal.com/webhook/waha-receive-message",
          "events": ["message"]
        },
        {
          "url": "https://workflow.nexusatemporal.com/webhook/waha-receive-message-s3",
          "events": ["message"]
        }
      ]
    }
  }'
```

7. **Teste** e compare resultados

8. **Desative** o workflow antigo quando confirmar que o novo funciona

---

## 📈 Impacto no Sistema

### Performance
- **Mensagens de texto:** Sem mudança (mesmo fluxo)
- **Mensagens com mídia:** +2-3 segundos (download + upload S3)
  - Mas vale a pena! URLs nunca expiram ✅

### Armazenamento S3
- **Tamanho médio:**
  - Imagem: ~500KB - 2MB
  - Vídeo: ~5-50MB
  - Áudio: ~100KB - 1MB
- **Custo IDrive:** ~$5/TB/mês (muito barato)

### Backend
- **Sem mudanças:** Backend não precisa ser alterado
- **Banco de dados:** URLs pequenas (~100 caracteres) vs base64 gigante (MB)

---

## ✅ Vantagens do Novo Workflow

1. ✅ **Mídias sempre disponíveis** - URLs nunca expiram
2. ✅ **Performance do banco** - URLs pequenas vs base64 gigante
3. ✅ **Zero risco** - Não mexe no backend que está funcionando
4. ✅ **Debugável** - Vê todo o fluxo visualmente no N8N
5. ✅ **Escalável** - Processa múltiplas mídias em paralelo
6. ✅ **Pausável** - Pode desativar e voltar ao antigo a qualquer momento

---

## 🔍 Monitoramento

Para ver execuções:

1. N8N → **Executions** (menu lateral)
2. Filtrar por: **"WAHA - Receber Mensagens (COM S3)"**
3. Ver logs detalhados de cada nó

### Logs Importantes

- **"Baixar Mídia":** Verifica se conseguiu baixar
- **"Upload S3":** Confirma upload bem-sucedido
- **"Substituir URL":** Vê a URL final do S3

---

## 🆘 Troubleshooting

### Mídia não aparece no frontend

1. ✅ Workflow está ativo?
2. ✅ Credencial AWS configurada corretamente?
3. ✅ Veja execução no N8N - onde falhou?
4. ✅ Teste acessar a URL do S3 manualmente

### Erro no upload S3

1. Verifique credenciais
2. Confirme bucket: `backupsistemaonenexus`
3. Teste endpoint: `https://c1k7.va.idrivee2-46.com`

### Mensagem duplicada

- Se ambos workflows estão ativos, mensagens serão processadas 2x
- Desative o workflow antigo

---

## 📝 Próximos Passos

1. ✅ Importar novo workflow
2. ✅ Configurar credencial AWS
3. ✅ Ativar workflow
4. ✅ Testar com uma imagem
5. ✅ Desativar workflow antigo
6. ✅ Monitorar por 24h
7. ✅ Confirmar que tudo funciona

**Pronto!** Suas imagens agora ficam permanentes no S3! 🎉
