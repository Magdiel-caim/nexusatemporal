# Guia de Implementação - Workflow S3 para Mídias WhatsApp

## 🎯 Objetivo
Resolver o problema de imagens/vídeos/áudios que não carregam no chat, substituindo URLs temporárias do WhatsApp por URLs permanentes do S3.

## ❌ Problema Atual (Confirmado)
![Imagens Quebradas](../prompt/Captura%20de%20tela%202025-10-14%20174335.png)
- Imagens aparecem como **[Imagem]** com ícone quebrado
- URLs do WhatsApp expiram em ~24 horas
- Mensagens antigas nunca carregam

## ✅ Solução
Workflow N8N que baixa mídias do WhatsApp e salva permanentemente no S3/IDrive.

---

## 📋 Passo a Passo de Implementação

### PASSO 1: Configurar Credenciais no N8N

#### 1.1 Criar Credencial AWS (IDrive S3)

1. Acesse N8N: **https://workflow.nexusatemporal.com**
2. Menu lateral: **Credentials** → **Add Credential**
3. Busque e selecione: **AWS**
4. Preencha com os dados abaixo:

```
📝 Credential Name: IDrive S3 - Nexus

🔑 Access Key ID: ZaIdY59FGaL8BdtRjZtL

🔒 Secret Access Key: wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj

🌎 Region: us-east-1

⚙️ Custom Endpoints: ☑️ Yes (ATIVAR)
   └─ S3 Endpoint: https://c1k7.va.idrivee2-46.com

📦 Force Path Style: ☑️ Yes (ATIVAR)
```

5. Clique em **Test** para verificar conexão
6. Clique em **Save**

✅ **Validação**: Deve aparecer mensagem "Connection tested successfully"

---

### PASSO 2: Importar Workflow Novo

#### 2.1 Desativar Workflow Atual (Temporariamente)

1. N8N → **Workflows**
2. Localize: **"WAHA - Receber Mensagens"**
3. Clique no **toggle "Active"** para desativar (cinza)

⚠️ **IMPORTANTE**: Enquanto desativado, novas mensagens do WhatsApp NÃO serão processadas. Faça isso em horário de baixo movimento.

#### 2.2 Importar Workflow COM S3

1. N8N → **Workflows** → **Import from File**
2. Selecione o arquivo:
   ```
   /root/nexusatemporal/n8n-workflows/n8n_workflow_2_receber_mensagens_COM_S3.json
   ```
3. Clique em **Import**
4. O workflow será importado com nome: **"WAHA - Receber Mensagens (COM S3)"**

#### 2.3 Configurar Credencial no Workflow

1. Abra o workflow importado
2. Clique no nó: **"Upload para S3 IDrive"**
3. Na seção **Credentials**, selecione: **IDrive S3 - Nexus**
4. Clique em **Save** (canto superior direito)

---

### PASSO 3: Ativar Novo Workflow

1. No workflow **"WAHA - Receber Mensagens (COM S3)"**
2. Clique no toggle **"Active"** (canto superior direito)
3. Deve ficar **verde** quando ativo

✅ **Validação**:
- Status: **Active**
- Webhook URL: `https://workflow.nexusatemporal.com/webhook/waha-receive-message`

---

### PASSO 4: Testar Funcionamento

#### 4.1 Enviar Mensagem de Teste

1. Abra WhatsApp no celular
2. Envie uma **IMAGEM** para o número conectado ao sistema
3. Aguarde 2-3 segundos

#### 4.2 Verificar Execução no N8N

1. N8N → **Executions** (menu lateral)
2. Filtre por: **"WAHA - Receber Mensagens (COM S3)"**
3. Veja a última execução:
   - ✅ Verde = Sucesso
   - ❌ Vermelho = Erro

#### 4.3 Verificar no Sistema

1. Abra o chat no frontend: **https://painel.nexusatemporal.com.br**
2. Localize a conversa onde enviou a imagem
3. **A imagem deve aparecer carregada!** 🎉

---

### PASSO 5: Verificar S3 (Opcional)

Para confirmar que a mídia foi salva no S3:

```bash
AWS_ACCESS_KEY_ID="ZaIdY59FGaL8BdtRjZtL" \
AWS_SECRET_ACCESS_KEY="wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj" \
aws s3 ls s3://backupsistemaonenexus/whatsapp/ \
  --endpoint-url https://c1k7.va.idrivee2-46.com \
  --no-verify-ssl \
  --recursive \
  --human-readable
```

Deve listar arquivos como:
```
2025-10-14 17:43:22   1.2 MiB whatsapp/atemporal_main/20251014-174322-ABC123.jpg
```

---

### PASSO 6: Deletar Workflow Antigo

⚠️ **SOMENTE APÓS CONFIRMAR QUE O NOVO FUNCIONA!**

1. N8N → **Workflows**
2. Localize: **"WAHA - Receber Mensagens"** (o antigo, sem "COM S3")
3. Clique nos **3 pontinhos** → **Delete**
4. Confirme exclusão

---

## 🔍 Troubleshooting

### ❌ Erro: "Credential not found"

**Causa**: Credencial AWS não foi configurada corretamente

**Solução**:
1. Volte ao PASSO 1.1
2. Verifique se o nome é EXATAMENTE: `IDrive S3 - Nexus`
3. Teste a conexão antes de salvar

---

### ❌ Erro: "Access Denied" no S3

**Causa**: Credenciais AWS incorretas

**Solução**:
1. Verifique Access Key e Secret Access Key
2. Confirme endpoint: `https://c1k7.va.idrivee2-46.com`
3. Confirme "Force Path Style" está ATIVO

---

### ❌ Mídia não aparece no frontend

**Diagnóstico**:
1. N8N → Executions → Veja última execução
2. Clique em cada nó para ver o output
3. Identifique onde falhou:

**Nó "Tem Mídia?"** → FALSE
- Mensagem não tem mídia (OK, é texto)

**Nó "Baixar Mídia do WhatsApp"** → Erro
- URL do WhatsApp já expirou
- Solução: Envie nova mensagem

**Nó "Upload para S3 IDrive"** → Erro
- Problema com credenciais (veja acima)
- Problema com bucket ou endpoint

**Nó "Substituir URL do WhatsApp por S3"** → Erro
- Verificar código JavaScript do nó
- Verificar se `s3Response.Key` existe

**Nó "Enviar para Backend (COM URL S3)"** → Erro
- Backend pode estar fora do ar
- Verificar logs: `docker service logs nexus_backend --tail 50`

---

### ❌ Imagens antigas ainda não carregam

**Explicação**:
- URLs antigas já expiraram
- Workflow só processa mensagens NOVAS
- Mensagens antigas permanecerão quebradas

**Solução para usuários**:
- Peça para reenviar imagens antigas importantes
- OU: Implemente script de migração (avançado, não coberto aqui)

---

## 📊 Monitoramento Contínuo

### Verificar Execuções Diárias

```bash
# Acessar N8N via API (se disponível)
# OU via interface web:
# N8N → Executions → Filtrar por data/status
```

### Métricas Esperadas

- **Taxa de Sucesso**: >95% das execuções devem ser bem-sucedidas
- **Tempo Médio**: 2-3 segundos por mensagem com mídia
- **Armazenamento S3**: Crescimento gradual (~10-50 MB/dia dependendo do uso)

---

## 🎯 Checklist Final

Antes de considerar implementação completa:

- [ ] Credencial AWS configurada e testada no N8N
- [ ] Workflow novo importado com sucesso
- [ ] Credencial AWS vinculada ao nó "Upload para S3 IDrive"
- [ ] Workflow antigo desativado
- [ ] Workflow novo ativado
- [ ] Teste com imagem real enviada via WhatsApp
- [ ] Imagem apareceu corretamente no frontend
- [ ] Verificado arquivo no S3 (opcional)
- [ ] Workflow antigo deletado (após confirmar)
- [ ] Monitoramento configurado

---

## 📞 Próximos Passos

Após implementação bem-sucedida:

1. **Teste com outros tipos de mídia**:
   - Vídeo (MP4)
   - Áudio (OGG/PTT)
   - Documento (PDF)
   - Sticker (WEBP)

2. **Configure alertas** (opcional):
   - N8N pode enviar notificação em caso de erro
   - Integrar com Slack/Discord/Email

3. **Documente para equipe**:
   - Informar que mídias agora ficam no S3
   - URLs permanentes vs temporárias

---

## 🚨 Rollback (Caso Necessário)

Se algo der muito errado e você precisar voltar ao workflow antigo:

1. **Desative** workflow COM S3
2. **Ative** workflow antigo (sem S3)
3. **Reporte** problema para análise

⚠️ **NOTA**: Workflow antigo ainda tem o problema de URLs expiradas, mas pelo menos não quebra o sistema.

---

## ✅ Sucesso!

Quando tudo estiver funcionando:

- ✅ Novas imagens carregam instantaneamente
- ✅ Imagens antigas (enviadas APÓS implementação) nunca expiram
- ✅ Performance do banco de dados melhorou (URLs pequenas vs base64)
- ✅ Sistema 100% estável (sem tocar no código do backend)

**Parabéns! 🎉** Você resolveu o problema de mídias do WhatsApp de forma segura e escalável!
