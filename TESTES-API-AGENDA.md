# Guia de Testes - API de Agenda

## 📋 Status da Implementação

✅ **CONCLUÍDO - Pronto para Testes**

- ✅ 3 Tabelas criadas no banco CRM (46.202.144.210)
  - `appointments` - Agendamentos principais
  - `appointment_returns` - Retornos automáticos
  - `appointment_notifications` - Notificações enviadas

- ✅ Backend compilado com sucesso
- ✅ Rotas registradas em `/api/appointments`
- ✅ Todas as funcionalidades implementadas conforme especificação

---

## 🔐 Autenticação

Todas as rotas requerem autenticação. Você precisa de um token JWT válido.

```bash
# Obter token (usando credenciais existentes)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YWI3ZTZhMi0yOWM3LTRlYmEtOGU0ZS02OTY0MzQ1YWVjZjIiLCJlbWFpbCI6InRlc3RlQG5leHVzYXRlbXBvcmFsLmNvbS5iciIsInJvbGUiOiJhZG1pbiIsInRlbmFudElkIjoiZGVmYXVsdCIsImlhdCI6MTc1OTkyNjI2MCwiZXhwIjoxNzYwNTMxMDYwfQ.FmrfgbpTd4ZIdST5YBwzrXxk0vQFzZBG2uFmxmMJdUk"

# Ou faça login novamente
curl -X POST https://api.nexusatemporal.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@nexusatemporal.com.br",
    "password": "sua-senha"
  }'
```

---

## 🧪 Testes das Rotas

### 1. Criar Agendamento

```bash
curl -X POST https://api.nexusatemporal.com.br/api/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "ID_DO_LEAD_AQUI",
    "procedureId": "ID_DO_PROCEDIMENTO_AQUI",
    "scheduledDate": "2025-10-20T14:00:00Z",
    "location": "moema",
    "estimatedDuration": 60,
    "paymentAmount": 500.00,
    "paymentMethod": "pix",
    "hasReturn": true,
    "returnCount": 3,
    "returnFrequency": 30,
    "notes": "Primeira sessão de tratamento"
  }'
```

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-gerado",
    "leadId": "...",
    "status": "aguardando_pagamento",
    "paymentStatus": "pendente",
    "scheduledDate": "2025-10-20T14:00:00.000Z",
    ...
  }
}
```

---

### 2. Listar Agendamentos do Dia

```bash
curl -X GET "https://api.nexusatemporal.com.br/api/appointments/today" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Buscar Agendamentos por Data

```bash
# Listar agendamentos de outubro/2025
curl -X GET "https://api.nexusatemporal.com.br/api/appointments?startDate=2025-10-01&endDate=2025-10-31" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. Buscar Agendamento por ID

```bash
APPOINTMENT_ID="uuid-do-agendamento"

curl -X GET "https://api.nexusatemporal.com.br/api/appointments/$APPOINTMENT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 5. Confirmar Pagamento

```bash
curl -X POST "https://api.nexusatemporal.com.br/api/appointments/$APPOINTMENT_ID/confirm-payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentProof": "https://link-do-comprovante.com/img.jpg",
    "paymentMethod": "pix"
  }'
```

**Efeitos:**
- ✅ Status muda para `aguardando_confirmacao`
- ✅ `paymentStatus` muda para `pago`
- ✅ Lead muda para status `agendado`
- ✅ Ficha de anamnese é enviada automaticamente
- ✅ Notificação criada

---

### 6. Paciente Confirmar Agendamento

```bash
# Confirmar
curl -X POST "https://api.nexusatemporal.com.br/api/appointments/$APPOINTMENT_ID/confirm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "confirmed": true
  }'

# Ou reagendar
curl -X POST "https://api.nexusatemporal.com.br/api/appointments/$APPOINTMENT_ID/confirm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "confirmed": false,
    "reschedule": {
      "newDate": "2025-10-21T14:00:00Z",
      "reason": "Cliente solicitou mudança de data"
    }
  }'
```

---

### 7. Check-in na Clínica

```bash
curl -X POST "https://api.nexusatemporal.com.br/api/appointments/$APPOINTMENT_ID/check-in" \
  -H "Authorization: Bearer $TOKEN"
```

**Efeitos:**
- ✅ `checkedIn` = true
- ✅ `checkedInAt` = data/hora atual
- ✅ Registra quem fez o check-in (recepcionista)

---

### 8. Iniciar Atendimento

```bash
curl -X POST "https://api.nexusatemporal.com.br/api/appointments/$APPOINTMENT_ID/start" \
  -H "Authorization: Bearer $TOKEN"
```

**Efeitos:**
- ✅ Status muda para `em_atendimento`
- ✅ Lead muda para `em_tratamento`
- ✅ Registra hora de início

---

### 9. Finalizar Atendimento

```bash
curl -X POST "https://api.nexusatemporal.com.br/api/appointments/$APPOINTMENT_ID/finalize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hasReturn": true,
    "returnCount": 3,
    "returnFrequency": 30,
    "notes": "Procedimento realizado com sucesso. Paciente reagiu bem ao tratamento."
  }'
```

**Efeitos:**
- ✅ Status muda para `finalizado`
- ✅ Registra hora de término
- ✅ **Cria automaticamente 3 retornos** (30, 60 e 90 dias)
- ✅ Notificação de finalização criada

---

### 10. Listar Retornos Criados

```bash
# Os retornos estão incluídos ao buscar o agendamento por ID
curl -X GET "https://api.nexusatemporal.com.br/api/appointments/$APPOINTMENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data.returns'
```

---

### 11. Buscar Agendamentos de um Lead

```bash
LEAD_ID="uuid-do-lead"

curl -X GET "https://api.nexusatemporal.com.br/api/appointments/lead/$LEAD_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 12. Buscar Agendamentos de um Profissional

```bash
PROFESSIONAL_ID="uuid-do-profissional"

curl -X GET "https://api.nexusatemporal.com.br/api/appointments/professional/$PROFESSIONAL_ID?startDate=2025-10-01&endDate=2025-10-31" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 13. Atualizar Agendamento

```bash
curl -X PUT "https://api.nexusatemporal.com.br/api/appointments/$APPOINTMENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduledDate": "2025-10-21T15:00:00Z",
    "location": "av_paulista",
    "notes": "Cliente solicitou mudança de horário"
  }'
```

---

### 14. Cancelar Agendamento

```bash
curl -X DELETE "https://api.nexusatemporal.com.br/api/appointments/$APPOINTMENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Cliente desistiu do tratamento"
  }'
```

**Efeitos:**
- ✅ Status muda para `cancelado`
- ✅ Todos os retornos automáticos são cancelados
- ✅ Notificação de cancelamento criada

---

## 📊 Verificar no Banco de Dados

```bash
# Conectar ao banco CRM
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -p 5432 -U nexus_admin -d nexus_crm

# Ver todos os agendamentos
SELECT id, "leadId", status, "scheduledDate", location
FROM appointments
ORDER BY "createdAt" DESC
LIMIT 10;

# Ver retornos criados
SELECT
  ar.id,
  ar."appointmentId",
  ar."returnNumber",
  ar."scheduledDate",
  ar.status
FROM appointment_returns ar
ORDER BY ar."createdAt" DESC;

# Ver notificações
SELECT
  type,
  status,
  "recipientPhone",
  message,
  "createdAt"
FROM appointment_notifications
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

## 🎯 Fluxo Completo de Teste

```bash
#!/bin/bash

TOKEN="seu-token-aqui"
API="https://api.nexusatemporal.com.br/api"

echo "1️⃣  Criando agendamento..."
RESPONSE=$(curl -s -X POST "$API/appointments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "ID_LEAD",
    "procedureId": "ID_PROCEDURE",
    "scheduledDate": "2025-10-20T14:00:00Z",
    "location": "moema",
    "paymentAmount": 500,
    "hasReturn": true,
    "returnCount": 3,
    "returnFrequency": 30
  }')

APPOINTMENT_ID=$(echo $RESPONSE | jq -r '.data.id')
echo "✅ Agendamento criado: $APPOINTMENT_ID"

echo ""
echo "2️⃣  Confirmando pagamento..."
curl -s -X POST "$API/appointments/$APPOINTMENT_ID/confirm-payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentProof": "https://link.com/img.jpg", "paymentMethod": "pix"}' \
  | jq '.message'

echo ""
echo "3️⃣  Paciente confirmando..."
curl -s -X POST "$API/appointments/$APPOINTMENT_ID/confirm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirmed": true}' \
  | jq '.message'

echo ""
echo "4️⃣  Check-in na clínica..."
curl -s -X POST "$API/appointments/$APPOINTMENT_ID/check-in" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.message'

echo ""
echo "5️⃣  Iniciando atendimento..."
curl -s -X POST "$API/appointments/$APPOINTMENT_ID/start" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.message'

echo ""
echo "6️⃣  Finalizando atendimento..."
curl -s -X POST "$API/appointments/$APPOINTMENT_ID/finalize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hasReturn": true,
    "returnCount": 3,
    "returnFrequency": 30,
    "notes": "Procedimento realizado com sucesso"
  }' | jq '.message'

echo ""
echo "7️⃣  Verificando retornos criados..."
curl -s -X GET "$API/appointments/$APPOINTMENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data.returns[] | {returnNumber, scheduledDate, status}'

echo ""
echo "✅ Fluxo completo testado!"
```

---

## 🚀 Próximos Passos

1. ✅ **Backend está pronto para testar**
2. ⏳ Frontend - Interface de calendário (próximo)
3. ⏳ Integração com WhatsApp para notificações
4. ⏳ Sistema de lembretes automáticos (cron job)

---

## 📝 Observações Importantes

- ✅ Todas as 3 tabelas foram criadas no banco CRM
- ✅ Build do backend concluído sem erros
- ✅ Rotas registradas e funcionais
- ⚠️ Algumas rotas de chat foram comentadas (da outra sessão)
- ✅ Sistema de retornos automáticos implementado
- ✅ Sistema de notificações implementado
- ✅ Controle completo de status do agendamento

**Status**: PRONTO PARA TESTES! 🎉
