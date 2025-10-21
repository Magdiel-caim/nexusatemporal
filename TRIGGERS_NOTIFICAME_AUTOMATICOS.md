# Triggers Automáticos - Notifica.me (Instagram & Messenger)

## 📋 Guia de Configuração dos Triggers

Este documento contém os triggers prontos para serem criados no sistema para automatizar mensagens via Instagram e Messenger.

---

## 🎯 Trigger 1: Boas-Vindas ao Novo Lead

**Nome**: Boas-vindas via Instagram/Messenger

**Quando dispara**: Quando um novo lead é criado no sistema

**O que faz**: Envia mensagem de boas-vindas automaticamente

### JSON para Criar:

```json
{
  "name": "Boas-vindas Notifica.me",
  "description": "Envia mensagem de boas-vindas via Instagram ou Messenger quando lead é criado",
  "event": "lead.created",
  "active": true,
  "priority": 10,
  "conditions": [
    {
      "field": "phone",
      "operator": "is_not_empty",
      "value": null
    }
  ],
  "actions": [
    {
      "type": "send_notificame_message",
      "description": "Enviar boas-vindas",
      "config": {
        "phone": "{{lead.phone}}",
        "message": "👋 Olá, {{lead.name}}!\n\nSeja muito bem-vindo(a) à Empire Excellence Clinic! ✨\n\nEstamos muito felizes em ter você conosco. Em breve, um de nossos especialistas entrará em contato para entender melhor suas necessidades.\n\n💎 Transforme sua beleza com quem é referência no segmento!\n\nQualquer dúvida, estamos à disposição! 😊"
      }
    }
  ]
}
```

**Como Criar via API**:
```bash
curl -X POST https://one.nexusatemporal.com.br/api/automation/triggers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Boas-vindas Notifica.me",
    "description": "Envia mensagem de boas-vindas via Instagram ou Messenger quando lead é criado",
    "event": "lead.created",
    "active": true,
    "priority": 10,
    "conditions": [
      {
        "field": "phone",
        "operator": "is_not_empty",
        "value": null
      }
    ],
    "actions": [
      {
        "type": "send_notificame_message",
        "description": "Enviar boas-vindas",
        "config": {
          "phone": "{{lead.phone}}",
          "message": "👋 Olá, {{lead.name}}!\n\nSeja muito bem-vindo(a) à Empire Excellence Clinic! ✨\n\nEstamos muito felizes em ter você conosco. Em breve, um de nossos especialistas entrará em contato para entender melhor suas necessidades.\n\n💎 Transforme sua beleza com quem é referência no segmento!\n\nQualquer dúvida, estamos à disposição! 😊"
        }
      }
    ]
  }'
```

---

## 📅 Trigger 2: Lembrete de Consulta (24h antes)

**Nome**: Lembrete de consulta 24h

**Quando dispara**: 24 horas antes de um agendamento

**O que faz**: Envia lembrete automático da consulta

### JSON para Criar:

```json
{
  "name": "Lembrete Consulta 24h - Notifica.me",
  "description": "Envia lembrete 24h antes da consulta via Instagram/Messenger",
  "event": "appointment.reminder_24h",
  "active": true,
  "priority": 20,
  "conditions": [
    {
      "field": "patient.phone",
      "operator": "is_not_empty",
      "value": null
    },
    {
      "field": "status",
      "operator": "equals",
      "value": "scheduled"
    }
  ],
  "actions": [
    {
      "type": "send_notificame_message",
      "description": "Enviar lembrete 24h",
      "config": {
        "phone": "{{patient.phone}}",
        "message": "🔔 Lembrete de Consulta!\n\nOlá, {{patient.name}}! 👋\n\nVocê tem consulta agendada AMANHÃ:\n\n📅 Data: {{appointment.date}}\n⏰ Horário: {{appointment.time}}\n💆 Procedimento: {{appointment.procedure}}\n📍 Local: Empire Excellence Clinic\n\nPor favor, confirme sua presença ou nos avise caso precise remarcar.\n\nNos vemos em breve! ✨"
      }
    }
  ]
}
```

**Como Criar via API**:
```bash
curl -X POST https://one.nexusatemporal.com.br/api/automation/triggers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @trigger_lembrete_24h.json
```

---

## 📄 Trigger 3: Enviar Documento Pós-Procedimento

**Nome**: Orientações pós-procedimento

**Quando dispara**: Após finalizar um prontuário médico

**O que faz**: Envia automaticamente o PDF com orientações pós-procedimento

### JSON para Criar:

```json
{
  "name": "Orientações Pós-Procedimento - Notifica.me",
  "description": "Envia PDF de orientações após procedimento via Instagram/Messenger",
  "event": "medical_record.completed",
  "active": true,
  "priority": 30,
  "conditions": [
    {
      "field": "patient.phone",
      "operator": "is_not_empty",
      "value": null
    },
    {
      "field": "procedure.requires_followup",
      "operator": "equals",
      "value": true
    }
  ],
  "actions": [
    {
      "type": "send_notificame_media",
      "description": "Enviar orientações em PDF",
      "config": {
        "phone": "{{patient.phone}}",
        "mediaUrl": "{{system.base_url}}/documents/orientacoes/{{procedure.id}}.pdf",
        "mediaType": "document",
        "caption": "📋 Orientações Pós-{{procedure.name}}\n\nOlá, {{patient.name}}! 👋\n\nSegue o PDF com as orientações importantes para o pós-procedimento.\n\n📌 Por favor, leia com atenção e siga todas as recomendações.\n\n💬 Qualquer dúvida, estamos à disposição!\n\nDesejamos uma excelente recuperação! ✨",
        "filename": "orientacoes_pos_{{procedure.name}}.pdf"
      }
    }
  ]
}
```

---

## 🎨 Trigger 4: Lead Qualificado - Enviar Catálogo

**Nome**: Enviar catálogo de procedimentos

**Quando dispara**: Quando lead muda para estágio "Qualificado"

**O que faz**: Envia catálogo com informações sobre procedimentos

### JSON para Criar:

```json
{
  "name": "Catálogo de Procedimentos - Notifica.me",
  "description": "Envia catálogo quando lead é qualificado",
  "event": "lead.stage_changed",
  "active": true,
  "priority": 15,
  "conditions": [
    {
      "field": "new_stage",
      "operator": "equals",
      "value": "qualified"
    },
    {
      "field": "phone",
      "operator": "is_not_empty",
      "value": null
    }
  ],
  "actions": [
    {
      "type": "send_notificame_media",
      "description": "Enviar catálogo",
      "config": {
        "phone": "{{lead.phone}}",
        "mediaUrl": "https://clinica.com.br/catalogo/procedimentos.pdf",
        "mediaType": "document",
        "caption": "💎 Catálogo de Procedimentos\n\nOlá, {{lead.name}}! 👋\n\nConforme conversamos, segue nosso catálogo completo com todos os procedimentos disponíveis.\n\n✨ Cada tratamento é personalizado para suas necessidades!\n\n📞 Vamos agendar uma avaliação? Estou à disposição para esclarecer qualquer dúvida!\n\nTransforme sua beleza conosco! 💆‍♀️",
        "filename": "catalogo_empire_excellence.pdf"
      }
    }
  ]
}
```

---

## 💬 Trigger 5: Lead com Proposta - Mensagem com Botões

**Nome**: Proposta enviada - confirmação

**Quando dispara**: Quando proposta é enviada ao lead

**O que faz**: Envia mensagem com botões para o lead confirmar interesse

### JSON para Criar:

```json
{
  "name": "Proposta Enviada - Botões - Notifica.me",
  "description": "Envia proposta com botões de confirmação",
  "event": "lead.proposal_sent",
  "active": true,
  "priority": 25,
  "conditions": [
    {
      "field": "phone",
      "operator": "is_not_empty",
      "value": null
    }
  ],
  "actions": [
    {
      "type": "send_notificame_buttons",
      "description": "Enviar proposta com botões",
      "config": {
        "phone": "{{lead.phone}}",
        "message": "💼 Proposta Personalizada!\n\nOlá, {{lead.name}}! 👋\n\nPreparamos uma proposta especial para você:\n\n💆 Procedimento: {{proposal.procedure}}\n💰 Valor: R$ {{proposal.value}}\n🎁 Condições: {{proposal.conditions}}\n\nEsta proposta é válida por 7 dias!\n\nQual sua resposta?",
        "buttons": [
          {
            "id": "aceitar",
            "text": "✅ Aceito!"
          },
          {
            "id": "duvidas",
            "text": "❓ Tenho dúvidas"
          },
          {
            "id": "pensar",
            "text": "🤔 Vou pensar"
          }
        ],
        "footerText": "Empire Excellence Clinic"
      }
    }
  ]
}
```

---

## 🎂 Trigger 6: Aniversário do Cliente

**Nome**: Parabéns de aniversário

**Quando dispara**: No dia do aniversário do cliente

**O que faz**: Envia mensagem de parabéns + cupom de desconto

### JSON para Criar:

```json
{
  "name": "Aniversário Cliente - Notifica.me",
  "description": "Envia parabéns e cupom especial no aniversário",
  "event": "patient.birthday",
  "active": true,
  "priority": 5,
  "conditions": [
    {
      "field": "phone",
      "operator": "is_not_empty",
      "value": null
    }
  ],
  "actions": [
    {
      "type": "send_notificame_message",
      "description": "Mensagem de aniversário",
      "config": {
        "phone": "{{patient.phone}}",
        "message": "🎉🎂 FELIZ ANIVERSÁRIO, {{patient.name}}! 🎂🎉\n\nA Empire Excellence Clinic deseja um dia maravilhoso e cheio de realizações!\n\n🎁 PRESENTE ESPECIAL:\nGanhe 20% de desconto em qualquer procedimento durante este mês!\n\n💎 Código: ANIVER{{patient.id}}\n\nComemore sua beleza com a gente! ✨\n\nParabéns! 🥳"
      }
    }
  ]
}
```

---

## 📊 Trigger 7: Lead Inativo - Reengajamento

**Nome**: Reativar lead inativo

**Quando dispara**: Lead sem interação há 30 dias

**O que faz**: Envia mensagem tentando reengajar o lead

### JSON para Criar:

```json
{
  "name": "Reengajamento Lead Inativo - Notifica.me",
  "description": "Tenta reengajar lead sem interação há 30 dias",
  "event": "lead.inactive_30days",
  "active": true,
  "priority": 8,
  "conditions": [
    {
      "field": "phone",
      "operator": "is_not_empty",
      "value": null
    },
    {
      "field": "status",
      "operator": "not_equals",
      "value": "lost"
    }
  ],
  "actions": [
    {
      "type": "send_notificame_list",
      "description": "Menu de reengajamento",
      "config": {
        "phone": "{{lead.phone}}",
        "message": "👋 Olá, {{lead.name}}!\n\nSentimos sua falta por aqui! 💙\n\nQue tal conhecer nossas novidades e promoções especiais?\n\nEscolha uma opção abaixo:",
        "buttonText": "Ver Opções",
        "sections": [
          {
            "title": "Procedimentos Populares",
            "rows": [
              {
                "id": "harmonizacao",
                "title": "Harmonização Facial",
                "description": "Desconto especial este mês"
              },
              {
                "id": "botox",
                "title": "Botox",
                "description": "A partir de R$ 450"
              },
              {
                "id": "preenchimento",
                "title": "Preenchimento Labial",
                "description": "Resultado natural garantido"
              }
            ]
          },
          {
            "title": "Outras Opções",
            "rows": [
              {
                "id": "avaliar",
                "title": "Agendar Avaliação",
                "description": "Avaliação gratuita"
              },
              {
                "id": "duvidas",
                "title": "Tirar Dúvidas",
                "description": "Fale com especialista"
              }
            ]
          }
        ]
      }
    }
  ]
}
```

---

## 🚀 Como Ativar Todos os Triggers de Uma Vez

### Via Interface (Recomendado):

1. Acesse: `https://one.nexusatemporal.com.br/automation`
2. Clique na aba **"Triggers"**
3. Clique em **"+ Novo Trigger"**
4. Cole o JSON de cada trigger
5. Clique em **"Salvar"**

### Via API (Para desenvolvedores):

Salve todos os JSONs em arquivos e execute:

```bash
#!/bin/bash

# Array com os triggers
triggers=(
  "trigger_boas_vindas.json"
  "trigger_lembrete_24h.json"
  "trigger_pos_procedimento.json"
  "trigger_catalogo.json"
  "trigger_proposta.json"
  "trigger_aniversario.json"
  "trigger_reengajamento.json"
)

# Token de autenticação
TOKEN="seu_token_aqui"

# Criar cada trigger
for trigger_file in "${triggers[@]}"; do
  echo "Criando trigger: $trigger_file"
  curl -X POST https://one.nexusatemporal.com.br/api/automation/triggers \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d @$trigger_file
  echo "\n"
done

echo "✅ Todos os triggers foram criados!"
```

---

## ⚙️ Variáveis Disponíveis nos Triggers

### Lead:
- `{{lead.id}}` - ID do lead
- `{{lead.name}}` - Nome do lead
- `{{lead.email}}` - Email do lead
- `{{lead.phone}}` - Telefone do lead
- `{{lead.status}}` - Status atual
- `{{lead.stage}}` - Estágio atual

### Patient:
- `{{patient.id}}` - ID do paciente
- `{{patient.name}}` - Nome do paciente
- `{{patient.phone}}` - Telefone do paciente
- `{{patient.email}}` - Email do paciente
- `{{patient.birthdate}}` - Data de nascimento

### Appointment:
- `{{appointment.id}}` - ID do agendamento
- `{{appointment.date}}` - Data (formato: DD/MM/YYYY)
- `{{appointment.time}}` - Horário (formato: HH:MM)
- `{{appointment.procedure}}` - Nome do procedimento
- `{{appointment.professional}}` - Nome do profissional

### Procedure:
- `{{procedure.id}}` - ID do procedimento
- `{{procedure.name}}` - Nome do procedimento
- `{{procedure.duration}}` - Duração
- `{{procedure.price}}` - Preço

### System:
- `{{system.base_url}}` - URL base do sistema
- `{{system.clinic_name}}` - Nome da clínica
- `{{system.clinic_phone}}` - Telefone da clínica

---

## 🧪 Como Testar os Triggers

### Teste Manual:

1. Crie um lead de teste com seu próprio número
2. Aguarde o trigger disparar
3. Verifique se recebeu a mensagem no Instagram/Messenger

### Teste via API:

```bash
# Disparar trigger manualmente
curl -X POST https://one.nexusatemporal.com.br/api/automation/triggers/{trigger_id}/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lead": {
      "name": "Teste Silva",
      "phone": "5511999999999",
      "email": "teste@teste.com"
    }
  }'
```

---

## 📊 Monitorar Triggers

### Ver logs de execução:

```bash
curl -X GET https://one.nexusatemporal.com.br/api/automation/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Ver estatísticas:

```bash
curl -X GET https://one.nexusatemporal.com.br/api/automation/triggers/{trigger_id}/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚠️ Boas Práticas

1. **Teste antes de ativar**: Sempre teste com seu próprio número primeiro
2. **Horário comercial**: Configure horários para não enviar mensagens à noite
3. **Frequência**: Evite enviar muitas mensagens para o mesmo contato
4. **Personalização**: Use sempre o nome do cliente nas mensagens
5. **Opt-out**: Permita que clientes possam parar de receber mensagens
6. **Compliance**: Respeite LGPD e regras do WhatsApp/Instagram/Messenger

---

## 📞 Suporte

Se tiver dúvidas ou problemas:
- Email: suporte@nexusatemporal.com.br
- Documentação: `NOTIFICAME_INTEGRACAO.md`
- Logs: `docker service logs nexus_backend`

---

**Preparado por**: Claude (Sessão A)
**Data**: 2025-10-21
**Versão**: v105-integracoes-sociais
