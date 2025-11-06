# 🧪 TESTE: Webhook Direto WAHA → Backend

**Data**: 03/11/2025 22:45
**Status**: ✅ Webhook reconfigurado com sucesso

---

## 📊 MUDANÇA REALIZADA

### Antes (via N8N):
```
WhatsApp → WAHA → N8N → Backend → Frontend
                   ❌ (quebrava aqui)
```

### Agora (Direto):
```
WhatsApp → WAHA → Backend → Frontend
           ✅        ✅        ✅
```

---

## ✅ WEBHOOK CONFIGURADO

```json
{
  "session": "session_01k8ypeykyzcxjxp9p59821v56",
  "status": "WORKING",
  "webhook": {
    "url": "https://api.nexusatemporal.com.br/api/chat/webhook/waha/message",
    "events": ["message", "message.any"]
  }
}
```

**Backup salvo em**: `/root/nexusatemporalv1/backup-waha-webhook-config.json`

---

## 🧪 TESTES A FAZER

### Teste 1: Mensagem de Texto ✅

**Ação**: Enviar mensagem de texto "teste webhook direto" para **+55 41 9243-1011**

**Resultado esperado**:
1. ✅ Webhook WAHA chama backend direto
2. ✅ Backend processa e salva no banco
3. ✅ WebSocket emite para frontend
4. ✅ Mensagem aparece no sistema em tempo real

**Comando para verificar logs**:
```bash
docker service logs nexus_backend --tail 50 --follow | grep -E "WAHA|webhook|Mensagem"
```

**Evidências esperadas nos logs**:
```
🔔 Webhook WAHA recebido: { event: 'message', session: 'session_01k8ypeykyzcxjxp9p59821v56' }
📝 Mensagem processada: { sessionName: '...', phoneNumber: '...', messageType: 'text' }
✅ Mensagem salva com TypeORM: { id: '...', conversationId: '...' }
🔊 Mensagem emitida via WebSocket com attachments: 0
```

---

### Teste 2: Mensagem com Imagem 📸

**Ação**: Enviar uma **imagem** (JPG, PNG) para **+55 41 9243-1011**

**Resultado esperado**:
1. ✅ WAHA envia payload com base64 em `_data.mediaUrl`
2. ✅ Backend detecta base64: `if (mediaUrl && mediaUrl.startsWith('data:'))`
3. ✅ Backend faz upload no S3
4. ✅ Backend salva mensagem com attachment
5. ✅ WebSocket emite com URL S3
6. ✅ Frontend exibe imagem do S3

**Comando para verificar logs**:
```bash
docker service logs nexus_backend --tail 100 --follow | grep -E "Base64|S3|attachment|mídia"
```

**Evidências esperadas nos logs**:
```
📷 Base64 detectado - fazendo upload no S3...
☁️ Fazendo upload no S3: whatsapp/session_01k8ypeykyzcxjxp9p59821v56/2025-11-03...jpg
✅ Upload S3 concluído: https://o0m5.va.idrivee2-26.com/backupsistemaonenexus/whatsapp/...
📷 Mensagem com mídia - criando attachment
✅ Mensagem salva com TypeORM: { id: '...', hasAttachments: true }
🔊 Mensagem emitida via WebSocket com attachments: 1
```

---

### Teste 3: Vídeo (Opcional)

**Ação**: Enviar vídeo curto (MP4) para **+55 41 9243-1011**

**Resultado esperado**: Mesmo fluxo da imagem, mas com `type: 'video'`

---

### Teste 4: Áudio/PTT (Opcional)

**Ação**: Enviar mensagem de áudio/voz para **+55 41 9243-1011**

**Resultado esperado**: Mesmo fluxo, mas com `type: 'audio'` ou `'ptt'`

---

## 🔍 VERIFICAÇÃO FINAL

### No Backend:

```bash
# Ver últimas 20 mensagens processadas
docker service logs nexus_backend --tail 20 | grep "Mensagem"

# Ver uploads S3
docker service logs nexus_backend --tail 20 | grep "S3"

# Ver WebSocket emissões
docker service logs nexus_backend --tail 20 | grep "WebSocket"
```

### No Frontend:

1. Acessar: `https://one.nexusatemporal.com.br`
2. Abrir módulo de Chat
3. Localizar conversa com +55 41 9243-1011
4. Verificar:
   - ✅ Mensagem de texto aparece
   - ✅ Imagem aparece (não em base64, mas como `<img src="https://o0m5.va.idrivee2-26.com/...">`)
   - ✅ Tempo real (sem refresh)

### No Banco de Dados (Opcional):

```bash
# Conectar no postgres e verificar última mensagem
docker exec -it $(docker ps -q -f name=nexus_postgres) psql -U postgres -d nexusatemporal -c "
  SELECT m.id, m.type, m.content, m.direction,
         a.file_url, a.mime_type, a.file_size,
         m.created_at
  FROM messages m
  LEFT JOIN attachments a ON a.message_id = m.id
  ORDER BY m.created_at DESC
  LIMIT 5;
"
```

---

## 📋 CHECKLIST DE SUCESSO

- [ ] Webhook WAHA configurado para backend direto
- [ ] Mensagem de texto funciona
- [ ] Imagem é processada (base64 → S3)
- [ ] Upload S3 acontece sem erros
- [ ] Mensagem salva no banco com attachment
- [ ] WebSocket emite corretamente
- [ ] Frontend exibe imagem do S3
- [ ] Sem erros nos logs

---

## 🆘 TROUBLESHOOTING

### Se mensagem de texto NÃO aparecer:

1. **Verificar webhook**:
   ```bash
   curl -X GET "https://apiwts.nexusatemporal.com.br/api/sessions/session_01k8ypeykyzcxjxp9p59821v56" \
     -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" | jq .config.webhooks
   ```

2. **Verificar logs WAHA**:
   ```bash
   docker service logs waha_waha --tail 50 | grep webhook
   ```

3. **Verificar se backend está acessível**:
   ```bash
   curl -X POST "https://api.nexusatemporal.com.br/api/chat/webhook/waha/message" \
     -H "Content-Type: application/json" \
     -d '{"test": true}' -v
   ```

### Se imagem NÃO aparecer:

1. **Verificar se base64 vem no payload WAHA**:
   - Checar logs: deve aparecer `📷 Base64 detectado`

2. **Verificar S3**:
   - Deve aparecer `☁️ Fazendo upload no S3`
   - Deve aparecer `✅ Upload S3 concluído`

3. **Verificar attachment no banco**:
   ```bash
   docker exec -it $(docker ps -q -f name=nexus_postgres) psql -U postgres -d nexusatemporal -c "
     SELECT COUNT(*) FROM attachments WHERE created_at > NOW() - INTERVAL '1 hour';
   "
   ```

### Se frontend NÃO exibir:

1. **Verificar WebSocket**:
   - Abrir DevTools → Network → WS
   - Deve receber evento `chat:new-message` com `attachments: [...]`

2. **Verificar console do navegador**:
   - F12 → Console
   - Procurar erros relacionados a imagem

---

## 🔄 COMO REVERTER (Se precisar)

Se algo der errado, restaurar webhook N8N:

```bash
curl -X PUT "https://apiwts.nexusatemporal.com.br/api/sessions/session_01k8ypeykyzcxjxp9p59821v56" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "session_01k8ypeykyzcxjxp9p59821v56",
    "config": {
      "webhooks": [
        {
          "url": "https://webhook.nexusatemporal.com/webhook/waha-receive-message",
          "events": ["message", "message.any"]
        }
      ]
    }
  }'
```

Ou restaurar do backup:

```bash
curl -X PUT "https://apiwts.nexusatemporal.com.br/api/sessions/session_01k8ypeykyzcxjxp9p59821v56" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -H "Content-Type: application/json" \
  -d @/root/nexusatemporalv1/backup-waha-webhook-config.json
```

---

## ✅ PRÓXIMOS PASSOS

Após validar que tudo funciona:

1. ✅ Criar tag git `v126.5-direct-webhook`
2. ✅ Atualizar CHANGELOG.md
3. ✅ Documentar mudança
4. ✅ Arquivar documentação N8N (não mais necessária)
5. ✅ Remover workflow N8N (opcional, se não usar para outras coisas)

---

**Boa sorte nos testes! 🚀**
