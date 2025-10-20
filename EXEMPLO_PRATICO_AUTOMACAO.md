# 🎯 EXEMPLO PRÁTICO: Novo Lead → OpenAI + Notificação

**Tempo estimado:** 15 minutos
**Nível:** Iniciante
**Ferramentas:** OpenAI + n8n

---

## 📋 O QUE VAMOS CRIAR?

Quando um **novo lead for criado** no Nexus CRM:
1. ✅ Sistema dispara evento `lead.created`
2. ✅ Trigger chama workflow do n8n
3. ✅ n8n envia dados para OpenAI
4. ✅ OpenAI analisa o lead e sugere próxima ação
5. ✅ n8n registra o log e retorna resultado

**Resultado:** Cada lead novo recebe análise automática da IA! 🤖

---

## PARTE 1: CONFIGURAR OPENAI NO NEXUS

### Passo 1: Adicionar Integração OpenAI

1. Acesse: https://one.nexusatemporal.com.br/automation
2. Aba **"Integrações"**
3. Clique **"Nova Integração"**
4. Preencha:

```yaml
Tipo: OpenAI
Nome: OpenAI Análise de Leads
API Key: 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
Organization: (deixe vazio)
Model: gpt-3.5-turbo
Ativo: Sim
```

5. Clique **"Salvar"**
6. Clique **"Testar Conexão"**
7. ✅ Deve aparecer: "OpenAI connection successful"

---

## PARTE 2: CRIAR WORKFLOW NO N8N

### Passo 1: Acessar n8n

1. URL: https://automacao.nexusatemporal.com.br
2. Login: **admin**
3. Senha: **NexusN8n2025!Secure**

### Passo 2: Criar Novo Workflow

1. Clique **"New Workflow"** (canto superior direito)
2. Nome do workflow: **"Análise de Lead com IA"**

### Passo 3: Adicionar Webhook (Trigger)

1. Clique no **"+"** para adicionar nó
2. Busque: **"Webhook"**
3. Clique em **"Webhook"**
4. Configure:
   - **HTTP Method:** POST
   - **Path:** `analise-lead` (você escolhe)
   - **Authentication:** None
5. Clique em **"Execute Node"** para gerar URL
6. **COPIE A URL** que aparecer (algo como):
   ```
   https://automahook.nexusatemporal.com.br/webhook-test/analise-lead
   ```
7. Clique **"Listen for Test Event"** e deixe esperando

### Passo 4: Adicionar Nó OpenAI

1. Clique no **"+"** após o Webhook
2. Busque: **"OpenAI"**
3. Selecione: **"OpenAI"**
4. Configure:

**Credential to connect with:**
- Clique em "Create New Credential"
- API Key: `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`
- Save

**Resource:** Message
**Operation:** Text
**Model:** gpt-3.5-turbo
**Prompt:** (copie e cole isso)

```
Você é um assistente de vendas especialista em análise de leads.

Analise o seguinte lead e forneça:
1. Perfil do lead (quente/morno/frio)
2. Pontos de interesse
3. Próxima ação recomendada

Dados do Lead:
- Nome: {{ $json.body.name }}
- Telefone: {{ $json.body.phone }}
- Email: {{ $json.body.email }}
- Origem: {{ $json.body.source }}
- Observações: {{ $json.body.notes }}

Formato de resposta:
PERFIL: [quente/morno/frio]
INTERESSE: [descrever]
AÇÃO: [próximo passo]
```

### Passo 5: Adicionar Nó de Log

1. Clique no **"+"** após OpenAI
2. Busque: **"HTTP Request"**
3. Configure:
   - **Method:** POST
   - **URL:** `https://api.nexusatemporal.com.br/api/automation/logs` (apenas exemplo, vamos só printar)
4. OU simplesmente adicione um nó **"No Operation"** só para finalizar

### Passo 6: Ativar Workflow

1. No canto superior direito, **ATIVE** o workflow (toggle ON)
2. Clique **"Save"** (Ctrl+S)
3. **COPIE A URL DO WEBHOOK** (vamos precisar)

**URL do webhook será algo como:**
```
https://automahook.nexusatemporal.com.br/webhook/analise-lead
```

---

## PARTE 3: CRIAR TRIGGER NO NEXUS

### Passo 1: Criar Trigger

1. Volte ao Nexus: https://one.nexusatemporal.com.br/automation
2. Aba **"Triggers"**
3. Clique **"Novo Trigger"**

### Passo 2: Configurar Trigger

Preencha o formulário:

```yaml
Nome: Análise Automática de Lead com IA
Descrição: Envia lead novo para análise da OpenAI via n8n
Evento: lead.created
Ativo: Sim
```

**Condições:** (deixe vazio por enquanto - vai rodar para TODOS os leads)

**Ações:**
```json
[
  {
    "type": "webhook",
    "url": "https://automahook.nexusatemporal.com.br/webhook/analise-lead",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "payload": {
      "name": "{{lead.name}}",
      "phone": "{{lead.phone}}",
      "email": "{{lead.email}}",
      "source": "{{lead.source}}",
      "notes": "{{lead.notes}}"
    }
  }
]
```

3. Clique **"Salvar"**

---

## PARTE 4: TESTAR O FLUXO COMPLETO! 🚀

### Teste Manual (Recomendado primeiro)

**1. Testar Webhook no n8n:**

No terminal ou Postman, execute:

```bash
curl -X POST https://automahook.nexusatemporal.com.br/webhook/analise-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "phone": "+5511999999999",
    "email": "joao@email.com",
    "source": "whatsapp",
    "notes": "Interessado em consulta de terapia holística"
  }'
```

**Resultado esperado:**
- No n8n: Você verá a execução aparecer
- OpenAI: Processará o lead
- Retorno: JSON com análise da IA

**Exemplo de resposta da IA:**
```
PERFIL: Quente
INTERESSE: Terapia holística, demonstra interesse imediato
AÇÃO: Ligar em até 2 horas, oferecer agendamento para consulta inicial
```

### Teste Real (Com Lead no CRM)

**2. Criar Lead no Sistema:**

1. Acesse: https://one.nexusatemporal.com.br/leads
2. Clique **"Novo Lead"**
3. Preencha:
   - Nome: João Silva
   - Telefone: 11999999999
   - Email: joao@email.com
   - Origem: WhatsApp
   - Observações: Interessado em consulta de terapia
4. Clique **"Salvar"**

**3. Verificar Execução:**

**No Dashboard de Automações:**
- Acesse: https://one.nexusatemporal.com.br/automation
- Aba **"Dashboard"**
- Deve mostrar: 1 evento processado, 1 trigger executado

**No n8n:**
- Acesse: https://automacao.nexusatemporal.com.br
- Clique no workflow "Análise de Lead com IA"
- Aba **"Executions"** (histórico)
- Você verá a execução com os dados do lead
- Clique para ver detalhes e resposta da OpenAI

---

## 🔍 ENTENDENDO O FLUXO

```
┌─────────────────┐
│   NEXUS CRM     │
│ (Criar Lead)    │
└────────┬────────┘
         │
         │ 1. Evento "lead.created" é disparado
         │
         ▼
┌─────────────────┐
│     TRIGGER     │
│ "Análise Lead"  │
└────────┬────────┘
         │
         │ 2. Chama webhook do n8n com dados do lead
         │
         ▼
┌─────────────────┐
│   N8N WEBHOOK   │
│  (Recebe dados) │
└────────┬────────┘
         │
         │ 3. Passa dados para próximo nó
         │
         ▼
┌─────────────────┐
│     OPENAI      │
│  (Analisa IA)   │
└────────┬────────┘
         │
         │ 4. Retorna análise em texto
         │
         ▼
┌─────────────────┐
│   RESULTADO     │
│ (Log/Resposta)  │
└─────────────────┘
```

---

## 💡 PRÓXIMOS PASSOS

### Evoluir o Exemplo:

**1. Adicionar Notificação:**
- Adicionar nó "Email" no n8n
- Enviar resultado da análise para o vendedor

**2. Salvar Análise no Lead:**
- Adicionar nó "HTTP Request" no n8n
- Fazer PUT na API do Nexus para atualizar observações do lead

**3. Decisão Inteligente:**
- Adicionar nó "IF" no n8n
- Se perfil = "quente" → enviar email urgente
- Se perfil = "frio" → adicionar em lista de nutrição

**4. Adicionar Mais Eventos:**
- Criar trigger para `appointment.scheduled`
- Criar trigger para `payment.received`

---

## 🐛 TROUBLESHOOTING

### Problema: Webhook não dispara

**Checklist:**
1. Workflow está ATIVO no n8n?
2. URL do webhook está correta no trigger?
3. Trigger está ATIVO?
4. Evento está sendo disparado? (verificar logs)

**Comando para ver logs:**
```bash
docker logs nexus_backend --tail 50 -f | grep "lead.created"
```

### Problema: OpenAI dá erro

**Possíveis causas:**
1. API Key inválida ou expirada
2. Sem créditos na conta OpenAI
3. Rate limit excedido (muitas chamadas)

**Solução:**
- Verificar saldo: https://platform.openai.com/usage
- Adicionar créditos: https://platform.openai.com/account/billing

### Problema: n8n não mostra execução

**Checklist:**
1. Workflow está salvo e ativo?
2. Webhook está em modo "Production" (não test)?
3. Verificar aba "Executions" no workflow

---

## 📊 MÉTRICAS DE SUCESSO

Você saberá que está funcionando quando:

✅ **Dashboard Nexus mostra:**
- Eventos: +1 a cada lead novo
- Triggers executados: +1
- Taxa de sucesso: 100%

✅ **n8n mostra:**
- Executions: Lista crescendo
- Status: Success (verde)
- Output do OpenAI preenchido

✅ **Logs do backend:**
```bash
[info]: Event emitted: lead.created
[info]: Trigger executed: análise-lead
[info]: Webhook called: https://automahook.../webhook/analise-lead
```

---

## 🎓 O QUE VOCÊ APRENDEU

1. ✅ Como conectar OpenAI no sistema
2. ✅ Como criar workflow no n8n
3. ✅ Como configurar webhook trigger
4. ✅ Como criar trigger no Nexus
5. ✅ Como integrar tudo (Nexus → n8n → OpenAI)
6. ✅ Como testar e debugar

---

## 🚀 AGORA É SUA VEZ!

Você está pronto para:
- ✅ Criar triggers para outros eventos
- ✅ Adicionar mais ações no n8n
- ✅ Integrar com mais serviços
- ✅ Quando instalar WAHA, adicionar WhatsApp no fluxo

---

**Dúvidas? Problemas?**
- Verifique os logs
- Teste cada parte isoladamente
- Me chame e mande o erro exato

**BOA AUTOMAÇÃO!** 🎉
