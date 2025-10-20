# 📚 GUIA COMPLETO - SISTEMA DE AUTOMAÇÕES

**Versão:** 1.0
**Data:** 2025-10-20
**Status:** Produção

---

## 🎯 O QUE É O SISTEMA DE AUTOMAÇÕES?

O sistema de automações permite que você:
1. **Conecte serviços externos** (WhatsApp, OpenAI, n8n)
2. **Crie regras automáticas** (triggers) que disparam quando algo acontece
3. **Execute ações** (enviar mensagem, chamar IA, rodar workflow)

**Exemplo prático:**
- Quando um **novo lead** é criado → Enviar **WhatsApp automático** de boas-vindas
- Quando um **pagamento** é confirmado → Enviar **nota fiscal por email**

---

## 📱 PARTE 1: CONFIGURANDO WHATSAPP (WAHA)

### O que é WAHA?

**WAHA** (WhatsApp HTTP API) é um servidor que transforma o WhatsApp em uma API.

### Passo 1: Instalar WAHA no seu servidor

Você precisa ter o WAHA rodando em algum lugar. Existem 3 opções:

#### Opção A: Docker no seu próprio servidor (RECOMENDADO)

```bash
# No seu servidor (pode ser o mesmo do Nexus)
docker run -d \
  --name waha \
  -p 3000:3000 \
  -e WHATSAPP_DEFAULT_SESSION=default \
  devlikeapro/waha:latest
```

Depois disso, o WAHA estará disponível em: `http://IP_DO_SEU_SERVIDOR:3000`

#### Opção B: Usar serviço cloud pago

Alguns provedores oferecem WAHA como serviço:
- https://waha.devlike.pro (pago)
- https://whapi.cloud (alternativa paga)

#### Opção C: Docker com domínio (IDEAL)

Se você quiser ter um domínio tipo `waha.seudominio.com.br`:

```bash
# 1. Adicionar no seu docker-compose.yml
services:
  waha:
    image: devlikeapro/waha:latest
    ports:
      - "3000:3000"
    environment:
      WHATSAPP_DEFAULT_SESSION: default
    restart: unless-stopped

# 2. Configurar proxy reverso (Nginx/Traefik)
# 3. Apontar DNS: waha.seudominio.com.br → seu servidor
```

### Passo 2: Obter a API Key

1. Acesse o painel do WAHA: `http://seu-servidor:3000`
2. Faça login (usuário padrão: admin / senha: admin)
3. Vá em **Settings** → **API Keys**
4. Copie a **API Key** (algo como: `waha_Abc123XyZ...`)

### Passo 3: Conectar no Sistema Nexus

Agora você tem as 3 informações necessárias:

```
API URL:      http://seu-servidor:3000
API Key:      waha_Abc123XyZ... (a que você copiou)
Session Name: default (ou outro nome que você escolher)
```

**No sistema Nexus:**
1. Acesse: https://one.nexusatemporal.com.br/automation
2. Aba "Integrações"
3. Clique "Nova Integração"
4. Selecione tipo: **WAHA (WhatsApp)**
5. Preencha:
   - Nome: `WhatsApp Produção`
   - API URL: `http://seu-servidor:3000`
   - API Key: `waha_Abc123XyZ...`
   - Session: `default`
6. Clique "Salvar"
7. Clique "Testar Conexão"

✅ Se tudo estiver certo, verá: "WAHA connection successful"

---

## 🤖 PARTE 2: CONFIGURANDO OPENAI

### O que você precisa:

1. **Conta OpenAI**: https://platform.openai.com
2. **API Key**: https://platform.openai.com/api-keys

### Passo a passo:

1. Acesse: https://platform.openai.com/api-keys
2. Clique "Create new secret key"
3. Copie a chave (começa com `sk-proj-...`)
4. **IMPORTANTE:** Adicione créditos na conta OpenAI (mínimo $5)

**No sistema Nexus:**
1. Aba "Integrações"
2. "Nova Integração"
3. Tipo: **OpenAI**
4. Preencha:
   - Nome: `OpenAI GPT-4`
   - API Key: `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`
   - Organization: (deixe vazio se não tiver)
   - Model: `gpt-4` (ou `gpt-3.5-turbo` para mais barato)
5. Salvar e Testar

---

## 🔄 PARTE 3: CONFIGURANDO N8N

### O que é n8n?

**n8n** é uma ferramenta de automação visual (tipo Zapier/Make).

Você **JÁ TEM** o n8n instalado! 🎉

### Acessar o n8n:

**URL:** https://automacao.nexusatemporal.com.br
**Login:** admin
**Senha:** NexusN8n2025!Secure

### Como funciona a integração:

O n8n não precisa de "integração" no Nexus. Ele funciona assim:

1. Você cria um **workflow no n8n**
2. O workflow tem um **webhook** (URL especial)
3. Você configura um **trigger no Nexus** que chama esse webhook

**Exemplo prático:**

```
NEXUS TRIGGER:
- Quando: lead.created (novo lead)
- Ação: chamar webhook do n8n

N8N WORKFLOW:
- Recebe dados do lead
- Processa (formata mensagem, consulta IA, etc)
- Envia WhatsApp via WAHA
```

### Criar workflow no n8n (exemplo):

1. Acesse: https://automacao.nexusatemporal.com.br
2. Login: admin / NexusN8n2025!Secure
3. Clique "New Workflow"
4. Nome: "Novo Lead → WhatsApp"
5. Adicione nós:
   - **Webhook** (trigger)
   - **HTTP Request** (para buscar dados do lead)
   - **WAHA** (para enviar WhatsApp)
6. Ative o workflow
7. Copie a URL do webhook

**URL do webhook será algo como:**
```
https://automahook.nexusatemporal.com.br/webhook/abc-123-xyz
```

---

## ⚡ PARTE 4: CRIANDO SEU PRIMEIRO TRIGGER

### Cenário: Enviar WhatsApp quando criar um lead

**Passo 1: Criar workflow no n8n**

1. Acesse n8n: https://automacao.nexusatemporal.com.br
2. New Workflow
3. Adicionar nós:
   - **Webhook** → Copie a URL
   - **Set** → Formatar dados
   - **HTTP Request** → Chamar WAHA para enviar mensagem
4. Ativar workflow

**Passo 2: Criar trigger no Nexus**

1. Acesse: https://one.nexusatemporal.com.br/automation
2. Aba "Triggers"
3. "Novo Trigger"
4. Preencha:

```yaml
Nome: "Novo Lead → WhatsApp Boas-vindas"
Descrição: "Envia mensagem automática quando um lead é criado"
Evento: lead.created
Ativo: Sim

Condições: (opcional)
- Campo: source
- Operador: equals
- Valor: whatsapp

Ações:
- Tipo: webhook
- URL: https://automahook.nexusatemporal.com.br/webhook/seu-id
- Método: POST
- Headers: { "Content-Type": "application/json" }
```

5. Salvar

**Passo 3: Testar**

1. Vá no sistema Nexus
2. Crie um novo lead
3. Verifique:
   - Dashboard de Automações → deve mostrar execução
   - n8n → deve mostrar execução do workflow
   - WhatsApp → deve ter enviado mensagem

---

## 🔍 PARTE 5: DEBUGANDO PROBLEMAS

### Problema: "Erro ao testar integração"

**Checklist:**

1. **WAHA:**
   - O servidor WAHA está rodando? `curl http://seu-servidor:3000/health`
   - A API Key está correta?
   - A porta 3000 está aberta no firewall?

2. **OpenAI:**
   - A API Key está ativa?
   - Tem créditos na conta?
   - Teste direto: https://platform.openai.com/playground

3. **n8n:**
   - O workflow está ativo?
   - O webhook está correto?
   - Teste enviando POST manual: `curl -X POST https://automahook.nexusatemporal.com.br/webhook/seu-id`

### Logs úteis:

```bash
# Backend Nexus
docker logs nexus_backend --tail 100 -f

# n8n
docker logs nexus-automation_n8n_1 --tail 100 -f

# WAHA (se no docker)
docker logs waha --tail 100 -f
```

---

## 📊 PARTE 6: MONITORAMENTO

### Dashboard de Automações

Acesse: https://one.nexusatemporal.com.br/automation

**Aba Dashboard:**
- Integrações ativas
- Triggers ativos
- Eventos processados (últimas 24h)

**Aba Triggers:**
- Lista de todos os triggers
- Contador de execuções
- Última execução

---

## 🎓 EXEMPLOS PRÁTICOS

### Exemplo 1: Novo Lead → WhatsApp

**Workflow n8n:**
```
[Webhook] → [Set Variables] → [HTTP WAHA]
```

**Trigger Nexus:**
```javascript
{
  "event": "lead.created",
  "actions": [{
    "type": "webhook",
    "url": "https://automahook.../webhook/abc",
    "payload": {
      "phone": "{{lead.phone}}",
      "message": "Olá {{lead.name}}, bem-vindo!"
    }
  }]
}
```

### Exemplo 2: Pagamento Confirmado → Email NF

**Workflow n8n:**
```
[Webhook] → [Gerar NF] → [Send Email]
```

**Trigger Nexus:**
```javascript
{
  "event": "payment.received",
  "actions": [{
    "type": "webhook",
    "url": "https://automahook.../webhook/xyz"
  }]
}
```

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Instalar e configurar WAHA
2. ✅ Configurar OpenAI (já tem a key)
3. ✅ Criar primeiro workflow no n8n
4. ✅ Criar primeiro trigger no Nexus
5. ✅ Testar com lead real
6. 📈 Expandir para mais automações

---

## 📞 SUPORTE

Se algo não funcionar:
1. Verifique os logs (comando acima)
2. Teste cada integração individualmente
3. Me chame e passe o erro exato

---

**Resumo visual do fluxo:**

```
┌─────────────┐
│ NEXUS CRM   │
│ (Lead novo) │
└──────┬──────┘
       │
       │ 1. Dispara evento "lead.created"
       │
       ▼
┌──────────────┐
│   TRIGGER    │
│ "Novo Lead"  │
└──────┬───────┘
       │
       │ 2. Executa ação: chamar webhook
       │
       ▼
┌──────────────┐
│     N8N      │
│  (Workflow)  │
└──────┬───────┘
       │
       │ 3. Processa dados, formata mensagem
       │
       ▼
┌──────────────┐
│     WAHA     │
│  (WhatsApp)  │
└──────┬───────┘
       │
       │ 4. Envia WhatsApp pro cliente
       │
       ▼
   📱 Cliente
```

---

**Quer que eu crie um exemplo funcionando pra você?** Me diga qual automação você quer primeiro! 🚀
