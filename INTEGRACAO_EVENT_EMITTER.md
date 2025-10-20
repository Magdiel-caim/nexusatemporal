# 🎯 GUIA DE INTEGRAÇÃO - EventEmitter nos Módulos

## 📋 RESUMO

Este documento descreve como integrar o EventEmitterService nos módulos principais do sistema para habilitar automações.

**Status:** Pronto para implementação
**Tempo estimado:** 2-4 horas
**Dificuldade:** Média

---

## 🏗️ ARQUITETURA

```
Módulo (Leads/Appointments/Payments)
    ↓ emite evento
EventEmitterService
    ↓ salva em DB + publica no RabbitMQ
TriggerProcessor
    ↓ verifica triggers ativos
WorkflowExecutor
    ↓ executa workflows (n8n, custom, etc)
```

---

## 📦 MÓDULOS A INTEGRAR

### ✅ 1. LEADS
**Arquivo:** `backend/src/modules/leads/lead.service.ts`
**Métodos a modificar:**
- `createLead()` - Emitir `lead.created`
- `updateLead()` - Emitir `lead.updated`, `lead.stage_changed`, `lead.status_changed`, `lead.assigned`
- `deleteLead()` - Emitir `lead.deleted` (se existir)

**Eventos:**
```typescript
// Lead criado
await eventEmitter.emitLeadCreated(tenantId, leadId, leadData);

// Lead mudou de estágio
await eventEmitter.emit({
  eventType: 'lead.stage_changed',
  tenantId,
  entityType: 'lead',
  entityId: leadId,
  data: { oldStage, newStage, lead }
});

// Lead mudou de status
await eventEmitter.emitLeadStatusChanged(
  tenantId, leadId, oldStatus, newStatus, leadData
);

// Lead atribuído a alguém
await eventEmitter.emit({
  eventType: 'lead.assigned',
  tenantId,
  entityType: 'lead',
  entityId: leadId,
  data: { oldAssigned, newAssigned, lead }
});
```

---

### ✅ 2. APPOINTMENTS (Agendamentos)
**Arquivo:** `backend/src/modules/agenda/appointment.service.ts` (ou similar)
**Métodos a modificar:**
- `createAppointment()` - Emitir `appointment.scheduled`
- `updateAppointment()` - Emitir `appointment.updated`
- `confirmAppointment()` - Emitir `appointment.confirmed`
- `cancelAppointment()` - Emitir `appointment.cancelled`
- `completeAppointment()` - Emitir `appointment.completed`
- `noShowAppointment()` - Emitir `appointment.no_show`

**Eventos:**
```typescript
// Agendamento criado
await eventEmitter.emitAppointmentScheduled(
  tenantId, appointmentId, appointmentData
);

// Agendamento confirmado
await eventEmitter.emit({
  eventType: 'appointment.confirmed',
  tenantId,
  entityType: 'appointment',
  entityId: appointmentId,
  data: appointmentData
});

// Agendamento cancelado
await eventEmitter.emit({
  eventType: 'appointment.cancelled',
  tenantId,
  entityType: 'appointment',
  entityId: appointmentId,
  data: { reason, ...appointmentData }
});

// Agendamento concluído
await eventEmitter.emitAppointmentCompleted(
  tenantId, appointmentId, appointmentData
);

// Cliente não compareceu
await eventEmitter.emit({
  eventType: 'appointment.no_show',
  tenantId,
  entityType: 'appointment',
  entityId: appointmentId,
  data: appointmentData
});
```

---

### ✅ 3. PAYMENTS (Pagamentos)
**Arquivo:** `backend/src/modules/payment-gateway/*.ts` ou `backend/src/modules/financeiro/*.ts`
**Métodos a modificar:**
- `createPayment()` - Emitir `payment.pending`
- `confirmPayment()` - Emitir `payment.received`
- `failPayment()` - Emitir `payment.failed`
- `checkOverdue()` - Emitir `payment.overdue`

**Eventos:**
```typescript
// Pagamento criado (pendente)
await eventEmitter.emit({
  eventType: 'payment.pending',
  tenantId,
  entityType: 'payment',
  entityId: paymentId,
  data: paymentData
});

// Pagamento confirmado/recebido
await eventEmitter.emit({
  eventType: 'payment.received',
  tenantId,
  entityType: 'payment',
  entityId: paymentId,
  data: paymentData
});

// Pagamento falhou
await eventEmitter.emit({
  eventType: 'payment.failed',
  tenantId,
  entityType: 'payment',
  entityId: paymentId,
  data: { reason, ...paymentData }
});

// Pagamento em atraso
await eventEmitter.emitPaymentOverdue(
  tenantId, paymentId, paymentData
);
```

---

### ✅ 4. WHATSAPP (Opcional - já tem webhook)
**Arquivo:** `backend/src/services/WahaService.ts`
**Método:** `handleMessageWebhook()`

**Evento:**
```typescript
// Mensagem recebida
await eventEmitter.emitWhatsAppMessageReceived(
  tenantId, messageId, messageData
);
```

---

## 🔧 IMPLEMENTAÇÃO PASSO A PASSO

### Passo 1: Importar EventEmitterService

No início do arquivo do serviço:

```typescript
import { getEventEmitterService } from '@/services/EventEmitterService';
import { getDatabase } from '@/database/connection'; // Ajustar path conforme projeto
```

### Passo 2: Inicializar no construtor/classe

```typescript
export class LeadService {
  // ... outros repositórios ...
  private eventEmitter = getEventEmitterService(getDatabase());

  // Ou se usar DI:
  constructor(
    private readonly eventEmitter: EventEmitterService
  ) {}
}
```

### Passo 3: Adicionar emissão de eventos

Após operações importantes (create, update, delete):

```typescript
async createLead(data: CreateLeadDTO) {
  // ... lógica existente ...
  const lead = await this.leadRepository.save(newLead);

  // ✅ ADICIONAR ESTA LINHA:
  await this.eventEmitter.emitLeadCreated(
    data.tenantId,
    lead.id,
    lead
  );

  return lead;
}
```

### Passo 4: Tratar erros (opcional mas recomendado)

```typescript
try {
  await this.eventEmitter.emitLeadCreated(
    data.tenantId,
    lead.id,
    lead
  );
} catch (error) {
  console.error('[LeadService] Falha ao emitir evento:', error);
  // NÃO re-throw - evento é secundário, não quebra fluxo principal
}
```

---

## 🧪 TESTES

### Como testar se está funcionando:

1. **Verificar logs:**
```bash
# Logs do backend
docker service logs nexus_backend --tail 100 | grep EventEmitter

# Procurar por:
# [EventEmitter] ✅ Event emitted: lead.created
# [EventEmitter] Event saved to database with ID: xxx
```

2. **Verificar banco de dados:**
```sql
SELECT * FROM automation_events
ORDER BY created_at DESC
LIMIT 10;
```

3. **Verificar RabbitMQ:**
```bash
# Management UI: https://rabbitmq.nexusatemporal.com.br
# Verificar exchange: nexus.automation.events
# Verificar se há mensagens publicadas
```

4. **Teste end-to-end:**
```
1. Criar trigger no banco:
   - event: lead.created
   - action: enviar webhook

2. Criar lead via API

3. Verificar se webhook foi disparado
```

---

## 📊 EVENTOS DISPONÍVEIS

### Leads
- `lead.created`
- `lead.updated`
- `lead.stage_changed`
- `lead.status_changed`
- `lead.assigned`
- `lead.converted`

### Appointments
- `appointment.scheduled`
- `appointment.confirmed`
- `appointment.cancelled`
- `appointment.completed`
- `appointment.no_show`
- `appointment.rescheduled`

### Payments
- `payment.pending`
- `payment.received`
- `payment.overdue`
- `payment.failed`

### WhatsApp
- `whatsapp.message.received`
- `whatsapp.message.sent`

### Clientes
- `client.birthday` (via job agendado)
- `client.inactive` (via job agendado)
- `client.reactivated`

---

## ⚠️ IMPORTANTE

### O que NÃO fazer:

❌ **Não usar await sem try/catch em prod**
```typescript
// RUIM:
await this.eventEmitter.emit(...); // Se falhar, quebra tudo
```

✅ **Sempre tratar erros:**
```typescript
// BOM:
try {
  await this.eventEmitter.emit(...);
} catch (error) {
  console.error('Erro ao emitir evento:', error);
}

// OU usar o padrão do EventEmitter que já faz isso internamente
await this.eventEmitter.emitLeadCreated(...); // Já tem try/catch interno
```

❌ **Não bloquear o fluxo principal:**
```typescript
// RUIM - aguarda evento antes de retornar
const lead = await this.createLead(data);
await this.eventEmitter.emit(...);
return lead; // Cliente espera o evento ser processado
```

✅ **Emitir evento mas retornar imediatamente:**
```typescript
// BOM - retorna rápido pro cliente
const lead = await this.createLead(data);
this.eventEmitter.emit(...); // Fire and forget (ou com await + try/catch)
return lead; // Retorna imediatamente
```

---

## 🚀 CHECKLIST DE IMPLEMENTAÇÃO

### Leads
- [ ] Importar EventEmitterService
- [ ] Inicializar no construtor
- [ ] `createLead()` - emitir `lead.created`
- [ ] `updateLead()` - emitir eventos conforme mudanças
- [ ] Testar criação de lead
- [ ] Verificar evento no banco
- [ ] Verificar logs

### Appointments
- [ ] Importar EventEmitterService
- [ ] Inicializar no construtor
- [ ] `createAppointment()` - emitir `appointment.scheduled`
- [ ] `confirmAppointment()` - emitir `appointment.confirmed`
- [ ] `cancelAppointment()` - emitir `appointment.cancelled`
- [ ] `completeAppointment()` - emitir `appointment.completed`
- [ ] Testar fluxo completo
- [ ] Verificar eventos no banco

### Payments
- [ ] Importar EventEmitterService
- [ ] Inicializar no construtor
- [ ] `createPayment()` - emitir `payment.pending`
- [ ] `confirmPayment()` - emitir `payment.received`
- [ ] `failPayment()` - emitir `payment.failed`
- [ ] Job de verificação - emitir `payment.overdue`
- [ ] Testar fluxo de pagamento
- [ ] Verificar eventos no banco

---

## 📝 EXEMPLO COMPLETO

```typescript
// backend/src/modules/leads/lead.service.ts

import { CrmDataSource } from '@/database/data-source';
import { Lead } from './lead.entity';
import { getEventEmitterService } from '@/services/EventEmitterService';
import { getDatabase } from '@/database/connection';

export class LeadService {
  private leadRepository = CrmDataSource.getRepository(Lead);
  private eventEmitter = getEventEmitterService(getDatabase());

  async createLead(data: CreateLeadDTO) {
    // Lógica existente
    const lead = this.leadRepository.create(data);
    const savedLead = await this.leadRepository.save(lead);

    // ✅ NOVA INTEGRAÇÃO
    await this.eventEmitter.emitLeadCreated(
      data.tenantId,
      savedLead.id,
      {
        ...savedLead,
        createdBy: data.createdById
      }
    );

    return savedLead;
  }

  async updateLead(id: string, tenantId: string, data: UpdateLeadDTO, userId: string) {
    const lead = await this.leadRepository.findOne({ where: { id, tenantId } });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Detectar mudanças importantes
    const stageChanged = data.stageId && data.stageId !== lead.stageId;
    const statusChanged = data.status && data.status !== lead.status;

    // Atualizar
    await this.leadRepository.update({ id, tenantId }, data);
    const updatedLead = await this.leadRepository.findOne({ where: { id, tenantId } });

    // ✅ EMITIR EVENTOS
    if (stageChanged) {
      await this.eventEmitter.emit({
        eventType: 'lead.stage_changed',
        tenantId,
        entityType: 'lead',
        entityId: id,
        data: {
          leadId: id,
          oldStage: lead.stageId,
          newStage: data.stageId,
          lead: updatedLead
        }
      });
    }

    if (statusChanged) {
      await this.eventEmitter.emitLeadStatusChanged(
        tenantId,
        id,
        lead.status,
        data.status,
        updatedLead
      );
    }

    // Evento genérico de atualização
    await this.eventEmitter.emit({
      eventType: 'lead.updated',
      tenantId,
      entityType: 'lead',
      entityId: id,
      data: {
        leadId: id,
        changes: data,
        lead: updatedLead,
        updatedBy: userId
      }
    });

    return updatedLead;
  }
}
```

---

## 🎯 PRÓXIMOS PASSOS

Após integrar EventEmitter:

1. ✅ **Testar eventos no banco** - Verificar se estão sendo salvos
2. ✅ **Criar triggers de teste** - Via API ou SQL direto
3. ✅ **Testar automações** - Lead criado → Trigger dispara → Workflow executa
4. ✅ **Dashboard de eventos** - Frontend para visualizar eventos
5. ✅ **Métricas** - Quantos eventos, taxa de sucesso, etc

---

**Versão:** 1.0
**Data:** 20/10/2025
**Status:** ✅ PRONTO PARA IMPLEMENTAÇÃO
