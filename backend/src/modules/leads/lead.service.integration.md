# Integração EventEmitter no LeadService

## Mudanças necessárias no lead.service.ts

### 1. Importar EventEmitterService

```typescript
import { getEventEmitterService } from '@/services/EventEmitterService';
import { getDatabase } from '@/database/connection'; // ou onde estiver o pool
```

### 2. Adicionar ao construtor ou inicializar

```typescript
export class LeadService {
  private leadRepository = CrmDataSource.getRepository(Lead);
  private activityRepository = CrmDataSource.getRepository(Activity);
  private eventEmitter = getEventEmitterService(getDatabase()); // Adicionar esta linha
```

### 3. Emitir eventos nos métodos:

#### No `createLead()` - após linha 48:

```typescript
// Após: return this.getLeadById(savedLead.id, data.tenantId);
// Adicionar:
await this.eventEmitter.emitLeadCreated(
  data.tenantId,
  savedLead.id,
  savedLead
);
```

#### No `updateLead()` - em diferentes pontos:

**Para mudança de stage (após linha 119):**
```typescript
await this.eventEmitter.emit({
  eventType: 'lead.stage_changed',
  tenantId,
  entityType: 'lead',
  entityId: id,
  data: {
    leadId: id,
    oldStage: lead.stageId,
    newStage: data.stageId,
    lead: await this.getLeadById(id, tenantId)
  }
});
```

**Para mudança de status (após linha 131):**
```typescript
await this.eventEmitter.emitLeadStatusChanged(
  tenantId,
  id,
  lead.status,
  data.status,
  await this.getLeadById(id, tenantId)
);
```

**Para atribuição de responsável (após linha 144):**
```typescript
await this.eventEmitter.emit({
  eventType: 'lead.assigned',
  tenantId,
  entityType: 'lead',
  entityId: id,
  data: {
    leadId: id,
    oldAssigned: lead.assignedToId,
    newAssigned: data.assignedToId,
    lead: await this.getLeadById(id, tenantId)
  }
});
```

**Para qualquer atualização (após linha 160, antes do return):**
```typescript
await this.eventEmitter.emit({
  eventType: 'lead.updated',
  tenantId,
  entityType: 'lead',
  entityId: id,
  data: {
    leadId: id,
    updates: data,
    lead: await this.getLeadById(id, tenantId)
  }
});
```

## Eventos disponíveis para Leads:

- `lead.created` - Quando lead é criado
- `lead.updated` - Quando lead é atualizado
- `lead.stage_changed` - Quando muda de estágio
- `lead.status_changed` - Quando muda de status
- `lead.assigned` - Quando atribui/troca responsável
- `lead.converted` - Quando lead é convertido em cliente
- `lead.deleted` - Quando lead é deletado (soft delete)

## Performance:

- EventEmitter é assíncrono mas NÃO bloqueia o fluxo principal
- Erros na emissão de eventos são logados mas não quebram a operação
- RabbitMQ garante entrega dos eventos aos processadores
