# 🧪 TESTE DE MÍDIA NO CHAT - Sessão B

**Data**: 2025-10-22
**Versão**: Backend v119-final | Frontend v120.1-channels-ui
**Objetivo**: Verificar se as mídias estão sendo renderizadas corretamente no chat

---

## ✅ STATUS ATUAL DA ANÁLISE

### Backend ✅ FUNCIONANDO
- ✅ Tabela `chat_messages` tem **60 mensagens com mídia**:
  - 37 imagens
  - 10 vídeos
  - 5 PTT (áudio gravado)
  - 4 áudios
  - 4 documentos
- ✅ URLs válidas do IDrive S3
- ✅ Tipos corretos (`image`, `video`, `audio`, `ptt`, `document`)
- ✅ Endpoint `/chat/n8n/messages/:sessionName` retorna `media_url`

### Frontend ✅ CÓDIGO PRONTO
- ✅ `MessageBubble.tsx` suporta todos os tipos de mídia (linhas 62-127)
- ✅ `ChatPage.tsx` mapeia `mediaUrl` corretamente (linha 324)
- ✅ Interface `Message` tem campo `mediaUrl?: string`
- ✅ Logs de debug prontos (linha 309-316 do ChatPage)

---

## 🔍 TESTE PASSO A PASSO

### 1. Abrir o Chat no Navegador

1. Acesse: https://one.nexusatemporal.com.br
2. Faça login (se necessário)
3. Navegue até a página de Chat
4. Abra o **DevTools** (F12 ou Ctrl+Shift+I)
5. Vá para a aba **Console**

### 2. Selecionar Conversa com Mídia

Conversas que TEM mídia (segundo o banco):
- Qualquer conversa com mensagens enviadas/recebidas
- Procure por conversas com [Imagem], [Vídeo], etc. no preview

### 3. Verificar Logs do Console

Ao abrir uma conversa, você DEVE ver logs como:

```
🚀 INICIANDO loadMessages para: whatsapp-session_xxx-55xxx
✅ É conversa WhatsApp - buscando mensagens...
🔍 Buscando mensagens: {sessionName: "session_xxx", phoneNumber: "55xxx"}
📨 Total de mensagens recebidas: X
🔍 Processando mensagem: {
  id: "xxx",
  type: "image",
  hasMediaUrl: true,
  mediaUrl: "https://o0m5.va.idrivee2-26.com/...",
  isBase64: false
}
```

**IMPORTANTE**: Se `hasMediaUrl: true`, a URL está chegando!

### 4. Verificar Renderização

Verifique se você vê:
- ✅ **Imagens**: Devem aparecer inline com preview (clicáveis para abrir em nova aba)
- ✅ **Vídeos**: Player de vídeo com controles
- ✅ **Áudios**: Player de áudio
- ✅ **Documentos**: Link para download

### 5. Verificar Erros de Carregamento

Se as mídias NÃO aparecerem:

1. **Abra a aba Network** do DevTools
2. Filtre por "Img" ou "Media"
3. Veja se há erros 403, 404, ou CORS
4. Anote os erros para análise

---

## 🐛 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### Problema 1: Logs mostram `hasMediaUrl: false`
**Causa**: Backend não está retornando `media_url`
**Solução**: Verificar endpoint `/chat/n8n/messages/:sessionName`

### Problema 2: `mediaUrl` é base64 muito grande
**Causa**: Mensagem tem base64 inline (> 50KB)
**Sintoma**: Página trava ou imagem não carrega
**Solução**: Implementar conversão base64 → S3

### Problema 3: Erro CORS ao carregar imagens
**Causa**: IDrive S3 não permite CORS
**Sintoma**: `Access-Control-Allow-Origin` error no console
**Solução**: Configurar CORS no bucket S3 ou usar proxy

### Problema 4: Imagens aparecem como link quebrado
**Causa**: URL expirou ou está incorreta
**Sintoma**: 404 ou 403 no Network tab
**Solução**: Verificar configuração de ACL no S3

### Problema 5: Mídias não renderizam mas logs OK
**Causa**: Tipo de mensagem não está batendo
**Sintoma**: `message.type` diferente de `image|video|audio|ptt|document`
**Solução**: Verificar mapeamento no ChatPage linha 322

---

## 📋 CHECKLIST DE TESTE

```
□ Console mostra "Processando mensagem"
□ hasMediaUrl: true
□ mediaUrl começa com "https://"
□ Tipo está correto (image, video, audio, etc.)
□ Imagem aparece na conversa
□ Vídeo tem player funcional
□ Áudio toca corretamente
□ Documentos têm link de download
□ Não há erros CORS no console
□ Não há erros 404/403 no Network
```

---

## 🧪 TESTE DE ENVIO DE NOVA MÍDIA

### Para testar o fluxo completo (WhatsApp → Backend → Frontend):

1. **Envie uma imagem via WhatsApp** para o número conectado
2. **Verifique logs do backend**:
   ```bash
   docker service logs nexus_backend --follow | grep "📷\|attachment"
   ```
3. **Verifique se attachment foi criado** (se usar tabela nova):
   ```sql
   SELECT COUNT(*) FROM attachments;
   SELECT * FROM attachments ORDER BY created_at DESC LIMIT 5;
   ```
4. **Verifique se mensagem foi salva** (tabela antiga):
   ```sql
   SELECT message_type, LEFT(media_url, 50) FROM chat_messages ORDER BY created_at DESC LIMIT 5;
   ```
5. **Verifique se apareceu no frontend** (WebSocket):
   - Deve aparecer automaticamente na conversa
   - Console deve mostrar "📱 Nova mensagem WhatsApp recebida via WebSocket"

---

## 📊 EXEMPLO DE MENSAGEM COM MÍDIA NO BANCO

```sql
-- Mensagem de teste (imagem no S3)
SELECT
  id,
  message_type,
  direction,
  media_url
FROM chat_messages
WHERE id = '24fadcf7-bdac-445a-ba8f-23db71d46d44';
```

**Resultado esperado**:
```
id: 24fadcf7-bdac-445a-ba8f-23db71d46d44
message_type: image
direction: incoming
media_url: https://o0m5.va.idrivee2-26.com/backupsistemaonenexus/whatsapp/atemporal_main/2025-10-21T14-15-05-052Z-false_status@broadcast_AC789091CB332289F7AA5D8C8A91BC27_554196982295@c.us.jpg
```

---

## 🛠️ COMANDOS ÚTEIS

### Ver mensagens com mídia no banco:
```bash
PGPASSWORD=6uyJZdc0xsCe7ymief3x2Izi9QubcTYP docker exec f30b5d9f37ea \
  psql -U nexus_admin -d nexus_master \
  -c "SELECT message_type, COUNT(*) FROM chat_messages WHERE media_url IS NOT NULL GROUP BY message_type;"
```

### Ver URLs de mídia recentes:
```bash
PGPASSWORD=6uyJZdc0xsCe7ymief3x2Izi9QubcTYP docker exec f30b5d9f37ea \
  psql -U nexus_admin -d nexus_master \
  -c "SELECT id, message_type, CASE WHEN media_url LIKE 'data:%' THEN 'base64' WHEN media_url LIKE 'http%' THEN 'http' ELSE 'other' END as url_type FROM chat_messages WHERE media_url IS NOT NULL ORDER BY created_at DESC LIMIT 10;"
```

### Testar URL de mídia diretamente:
```bash
curl -I "https://o0m5.va.idrivee2-26.com/backupsistemaonenexus/whatsapp/atemporal_main/2025-10-21T14-15-05-052Z-false_status@broadcast_AC789091CB332289F7AA5D8C8A91BC27_554196982295@c.us.jpg"
```

---

## 📝 RESULTADO DO TESTE

### ✅ O que funcionou:


### ❌ O que NÃO funcionou:


### 🔧 Próximos passos:


---

**Última atualização**: 2025-10-22 - Sessão B
