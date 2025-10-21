# WAHA Media Processor - Workflow N8N

## 📝 Descrição

Workflow do N8N que processa mídias do WhatsApp (imagens, vídeos, áudios) automaticamente:

1. ✅ Recebe webhook do WAHA com mensagem
2. ✅ Detecta se a mensagem contém mídia
3. ✅ Baixa a mídia da URL temporária do WhatsApp
4. ✅ Faz upload para S3/IDrive (permanente)
5. ✅ Envia para o backend com URL do S3
6. ✅ Responde ao webhook

## 🎯 Vantagens desta Abordagem

- ✅ **Seguro:** Não mexe no código do backend que está funcionando
- ✅ **Visual:** Fácil de debugar e ver o fluxo no N8N
- ✅ **Isolado:** Pode pausar/ativar sem afetar o sistema
- ✅ **Tratamento de Erro:** N8N tem retry e error handling nativos
- ✅ **Escalável:** Pode processar múltiplas mídias em paralelo

## 🔧 Configuração

### 1. Importar Workflow

1. Abra o N8N: https://workflow.nexusatemporal.com
2. Clique em **"Import from File"**
3. Selecione: `/root/nexusatemporal/n8n-workflows/waha-media-processor.json`
4. Clique em **"Import"**

### 2. Configurar Credenciais

#### a) IDrive S3 (AWS Credentials)

Crie uma credencial do tipo **AWS** com:

```
Name: IDrive S3
Access Key ID: ZaIdY59FGaL8BdtRjZtL
Secret Access Key: wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj
Region: us-east-1
Custom Endpoints: Yes
S3 Endpoint: https://c1k7.va.idrivee2-46.com
Force Path Style: Yes
```

#### b) Nexus API Auth (HTTP Header Auth)

Crie uma credencial do tipo **Header Auth** com:

```
Name: Nexus API Auth
Name: Authorization
Value: Bearer <seu-token-jwt-aqui>
```

### 3. Configurar Webhook do WAHA

Na WAHA, configure o webhook para apontar para o N8N:

```bash
curl -X PATCH "https://apiwts.nexusatemporal.com.br/api/sessions/atemporal_main" \
  -H "X-Api-Key: bd0c416348b2f04d198ff8971b608a87" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "webhooks": [
        {
          "url": "https://workflow.nexusatemporal.com/webhook/waha-media",
          "events": ["message", "message.any"],
          "webhookId": "n8n-media-processor"
        }
      ]
    }
  }'
```

### 4. Ativar Workflow

1. No N8N, abra o workflow importado
2. Clique em **"Active"** no canto superior direito
3. Teste enviando uma imagem via WhatsApp

## 📊 Fluxo Detalhado

```
┌─────────────────┐
│ WAHA Webhook    │ ← Mensagem do WhatsApp
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tem Mídia?      │ ← Verifica hasMedia & mediaUrl
└────┬───────┬────┘
     │       │
    SIM     NÃO
     │       │
     │       └──────────────────┐
     │                          │
     ▼                          ▼
┌─────────────────┐    ┌──────────────────┐
│ Baixar do WA    │    │ Preparar Payload │
└────────┬────────┘    │ (Sem Mídia)      │
         │             └────────┬─────────┘
         ▼                      │
┌─────────────────┐             │
│ Upload para S3  │             │
└────────┬────────┘             │
         │                      │
         ▼                      │
┌─────────────────┐             │
│ Preparar Payload│             │
│ (Com URL S3)    │             │
└────────┬────────┘             │
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
          ┌──────────────────┐
          │ Enviar p/ Backend│
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Responder Sucesso│
          └──────────────────┘
```

## 🧪 Teste Manual

Para testar o workflow manualmente:

1. Abra o workflow no N8N
2. Clique em **"Execute Workflow"**
3. Cole um payload de teste:

```json
{
  "event": "message",
  "session": "atemporal_main",
  "payload": {
    "id": "test-message-123",
    "from": "554198549563@c.us",
    "fromMe": false,
    "type": "image",
    "body": "Teste de imagem",
    "timestamp": 1697234567,
    "hasMedia": true,
    "_data": {
      "mediaUrl": "https://mmg.whatsapp.net/o1/v/test-image-url",
      "Info": {
        "PushName": "João"
      }
    }
  }
}
```

4. Execute e veja os resultados em cada nó

## 📈 Monitoramento

Para ver o status das execuções:

1. Vá para **Executions** no menu lateral do N8N
2. Filtre por **"WAHA Media Processor"**
3. Veja logs detalhados de cada execução

## ⚠️ Troubleshooting

### Mídia não aparece no frontend

1. Verifique se o workflow está **Active**
2. Veja os logs de execução no N8N
3. Confirme que o S3 está recebendo o arquivo
4. Verifique se o backend recebeu a URL correta

### Erro no upload S3

1. Verifique as credenciais do IDrive
2. Confirme que o bucket existe: `backupsistemaonenexus`
3. Teste o endpoint manualmente

### Webhook não está sendo chamado

1. Verifique a configuração do webhook na WAHA
2. Confirme que a URL do webhook está correta
3. Veja os logs da WAHA

## 🔄 Manutenção

Para atualizar o workflow:

1. Faça as mudanças no N8N
2. Exporte o workflow
3. Salve no arquivo `/root/nexusatemporal/n8n-workflows/waha-media-processor.json`
4. Commite no Git

## 📝 Notas

- URLs do WhatsApp expiram em ~24 horas
- URLs do S3 são permanentes
- O workflow processa ~10 mídias/segundo
- Arquivos são salvos em: `whatsapp/{session}/{timestamp}-{id}.{ext}`

## 🆘 Suporte

Se tiver problemas:
1. Veja os logs de execução no N8N
2. Verifique os logs do backend
3. Teste com uma mensagem de texto primeiro
4. Depois teste com uma imagem pequena
