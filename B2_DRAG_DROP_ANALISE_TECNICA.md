# B2. Agenda Drag & Drop - Análise Técnica Completa
**Data:** 08/11/2025
**Sprint:** Sprint 2 - Semana 1
**Estimativa:** 8h
**Status:** FASE 1 - ANÁLISE PROFUNDA ✅

---

## 📋 ÍNDICE
1. [Arquitetura Atual](#arquitetura-atual)
2. [Mapeamento de Dependências](#mapeamento-de-dependências)
3. [Fluxos de Dados](#fluxos-de-dados)
4. [Cenários de Uso](#cenários-de-uso)
5. [Validações Necessárias](#validações-necessárias)
6. [Estratégia de Implementação](#estratégia-de-implementação)
7. [Riscos e Mitigações](#riscos-e-mitigações)

---

## 1. ARQUITETURA ATUAL

### 1.1 Stack Tecnológica
```
Frontend:
├── React 18.2.0
├── TypeScript 5.2.2
├── Vite 5.0.8
├── @tanstack/react-query 5.90.7 (data fetching)
├── react-big-calendar 1.19.4 (calendário atual)
├── @dnd-kit/core 6.1.0 ✅ (já instalado)
├── @dnd-kit/sortable 8.0.0 ✅
├── @dnd-kit/utilities 3.2.2 ✅
├── date-fns 3.6.0 (manipulação de datas)
└── zustand 4.4.7 (state management)

Backend:
├── Express.js
├── TypeORM
├── PostgreSQL 16
└── JWT + RBAC
```

### 1.2 Componentes Existentes

**frontend/src/components/agenda/AgendaCalendar.tsx** (340 linhas)
- Componente principal da agenda
- Gerencia estado local (formData, appointments, procedures)
- Usa React Query para fetching
- Renderiza CalendarView e modais

**frontend/src/components/agenda/CalendarView.tsx** (130 linhas)
- Wrapper do react-big-calendar
- Views: month, week, day, agenda
- Default: week view
- Localizer: date-fns pt-BR
- Eventos estilizados por status

**frontend/src/services/appointmentService.ts** (200+ linhas)
- Camada de API
- Endpoints: create, update, delete, checkAvailability
- DTO interfaces definidas

### 1.3 Backend API

**Endpoints Relevantes:**
```typescript
PUT /api/appointments/:id
- Input: UpdateAppointmentDto
- Validações: NENHUMA (apenas update direto!)
- Retorno: { success: boolean, data: Appointment }

POST /api/appointments/check-availability
- Input: { scheduledDate, duration, location, professionalId?, excludeAppointmentId? }
- Validações: conflitos de horário, sobreposição
- Retorno: { available: boolean, conflicts: Appointment[] }
```

**⚠️ IMPORTANTE:** O endpoint de update NÃO valida conflitos automaticamente!

### 1.4 Estrutura de Dados

**Appointment Entity:**
```typescript
interface Appointment {
  id: string;
  leadId: string;
  procedureId: string;
  professionalId?: string;
  scheduledDate: Date;           // ← Campo que será alterado no drag
  estimatedDuration: number;     // Em minutos
  location: AppointmentLocation; // moema | av_paulista | perdizes | online | a_domicilio
  status: AppointmentStatus;     // 8 estados possíveis
  tenantId: string;
  // ... outros campos (pagamento, anamnese, etc.)
}

enum AppointmentStatus {
  AGUARDANDO_PAGAMENTO = 'aguardando_pagamento',
  PAGAMENTO_CONFIRMADO = 'pagamento_confirmado',
  AGUARDANDO_CONFIRMACAO = 'aguardando_confirmacao',
  CONFIRMADO = 'confirmado',
  REAGENDADO = 'reagendado',
  EM_ATENDIMENTO = 'em_atendimento',      // ← NÃO editável
  FINALIZADO = 'finalizado',              // ← NÃO editável
  CANCELADO = 'cancelado',                // ← NÃO editável
  NAO_COMPARECEU = 'nao_compareceu',      // ← NÃO editável
}
```

**CalendarEvent (Frontend):**
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment; // Dados completos do agendamento
  status: string;
}
```

---

## 2. MAPEAMENTO DE DEPENDÊNCIAS

### 2.1 Dependências Diretas

```
AgendaCalendar.tsx
│
├── React Query
│   └── useQuery(['appointments', { startDate, endDate }])
│
├── appointmentService
│   ├── findAll()
│   ├── update(id, dto)
│   └── checkAvailability(...)
│
├── CalendarView.tsx
│   └── react-big-calendar
│       ├── Calendar component
│       └── date-fns localizer
│
└── Modais
    ├── CreateAppointmentModal
    ├── DetailsModal
    └── EditModal
```

### 2.2 Dependências Adicionais (Drag & Drop)

```
@dnd-kit/core
├── DndContext         → Provider principal
├── useSensor          → Detecção de mouse/touch
├── useSensors         → Combinação de sensores
├── PointerSensor      → Mouse events
├── TouchSensor        → Touch events
└── DragOverlay        → Preview visual durante drag

@dnd-kit/utilities
└── CSS.Translate      → Transformações CSS
```

### 2.3 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTADO DA APLICAÇÃO                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   React Query    │
                    │   Cache Layer    │
                    └──────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐      ┌──────────┐       ┌──────────┐
    │ Fetch    │      │  Mutate  │       │ Optimistic│
    │ (GET)    │      │ (PUT)    │       │  Update  │
    └──────────┘      └──────────┘       └──────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                    ┌──────────────────┐
                    │ appointmentService│
                    │   (Axios)        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Backend API     │
                    │  (Express)       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │   Database       │
                    └──────────────────┘
```

---

## 3. FLUXOS DE DADOS

### 3.1 Fluxo Atual (Clique)

```
1. Usuário clica em slot vazio
   → handleSelectSlot(slotInfo)
   → Abre modal de criação
   → Preenche formulário
   → Salva via appointmentService.create()

2. Usuário clica em evento existente
   → handleSelectEvent(event)
   → Abre modal de detalhes
   → Opção de editar
   → Abre modal de edição
   → Salva via appointmentService.update()
```

### 3.2 Fluxo Proposto (Drag & Drop)

```
┌────────────────────────────────────────────────────────────┐
│ FASE 1: Início do Drag                                     │
└────────────────────────────────────────────────────────────┘
1. Usuário arrasta evento
   → onDragStart(event)
   → Captura: appointmentId, scheduledDate original
   → Validação: status editável?
   → Se NÃO → cancela drag
   → Se SIM → continua

┌────────────────────────────────────────────────────────────┐
│ FASE 2: Durante o Drag                                     │
└────────────────────────────────────────────────────────────┘
2. Usuário move sobre calendário
   → onDragOver(event)
   → Mostra visual feedback (overlay)
   → Destaca slot de destino

┌────────────────────────────────────────────────────────────┐
│ FASE 3: Drop                                               │
└────────────────────────────────────────────────────────────┘
3. Usuário solta evento
   → onDragEnd({ active, over })
   → Captura: novo slot (data/hora)
   → Calcula: nova scheduledDate

┌────────────────────────────────────────────────────────────┐
│ FASE 4: Validação                                          │
└────────────────────────────────────────────────────────────┘
4. Validações assíncronas
   → checkAvailability(newDate, duration, location, professionalId, excludeId)
   → Se conflito → mostra modal de confirmação
   → Se disponível → continua

┌────────────────────────────────────────────────────────────┐
│ FASE 5: Atualização                                        │
└────────────────────────────────────────────────────────────┘
5. Atualização otimista
   → Atualiza UI localmente (cache React Query)
   → Chama appointmentService.update(id, { scheduledDate })
   → Se sucesso → confirma mudança
   → Se erro → reverte (rollback)
   → Toast de feedback
```

---

## 4. CENÁRIOS DE USO

### 4.1 Cenários de Sucesso ✅

| # | Cenário | Descrição | Validações |
|---|---------|-----------|------------|
| S1 | Arrastar para slot vazio | Usuário arrasta evento para horário disponível | ✓ Status editável<br>✓ Sem conflitos<br>✓ Mesma location |
| S2 | Reagendar para outro dia | Usuário arrasta para outro dia da semana | ✓ Status editável<br>✓ Sem conflitos<br>✓ Data futura |
| S3 | Ajustar horário (mesmo dia) | Usuário ajusta apenas o horário | ✓ Status editável<br>✓ Sem conflitos |
| S4 | Mudar profissional | Arrastar entre views de profissionais diferentes | ✓ Status editável<br>✓ Disponibilidade do profissional |

### 4.2 Cenários de Validação ⚠️

| # | Cenário | Comportamento Esperado | Feedback |
|---|---------|------------------------|----------|
| V1 | Status não editável | Cancelar drag, mostrar tooltip | "Agendamentos finalizados não podem ser reagendados" |
| V2 | Conflito de horário | Modal de confirmação ou bloqueio | "Este horário já está ocupado. Deseja sobrescrever?" |
| V3 | Agendamento no passado | Cancelar drag | "Não é possível agendar no passado" |
| V4 | Duração ultrapassa horário comercial | Aviso | "O agendamento terminará após o horário de fechamento" |
| V5 | Profissional indisponível | Bloqueio ou aviso | "Profissional não disponível neste horário" |
| V6 | Location diferente | Confirmar mudança | "Deseja alterar a localização do atendimento?" |

### 4.3 Cenários de Erro ❌

| # | Cenário | Causa | Tratamento |
|---|---------|-------|------------|
| E1 | Erro de rede | API offline ou timeout | Rollback + toast de erro + retry |
| E2 | Permissão negada | Usuário sem RBAC adequado | Reverter + toast "Sem permissão" |
| E3 | Agendamento não encontrado | ID inválido ou deletado | Refresh da lista + toast |
| E4 | Validação backend falhou | Regra de negócio no backend | Reverter + mostrar mensagem |
| E5 | Conflito de concorrência | Outro usuário editou simultaneamente | Refresh + aviso de atualização |

### 4.4 Cenários de UX 🎨

| # | Cenário | Comportamento |
|---|---------|---------------|
| U1 | Hover sobre evento | Mostrar cursor "grab" se editável, "not-allowed" se não |
| U2 | Durante drag | Overlay semi-transparente seguindo cursor |
| U3 | Sobre slot válido | Highlight verde no slot |
| U4 | Sobre slot inválido | Highlight vermelho + cursor "not-allowed" |
| U5 | Drop com sucesso | Animação suave para nova posição |
| U6 | Drop cancelado (ESC) | Animação de retorno à posição original |

---

## 5. VALIDAÇÕES NECESSÁRIAS

### 5.1 Validações no Frontend (Antes de chamar API)

```typescript
// 1. Status Editável
const EDITABLE_STATUSES = [
  'aguardando_pagamento',
  'pagamento_confirmado',
  'aguardando_confirmacao',
  'confirmado',
  'reagendado'
];

function isEditable(appointment: Appointment): boolean {
  return EDITABLE_STATUSES.includes(appointment.status);
}

// 2. Data no Futuro
function isFutureDate(date: Date): boolean {
  const now = new Date();
  return date > now;
}

// 3. Horário Comercial (7h - 20h)
function isBusinessHours(date: Date, duration: number): boolean {
  const hour = date.getHours();
  const endTime = new Date(date.getTime() + duration * 60000);
  const endHour = endTime.getHours();

  return hour >= 7 && endHour <= 20;
}

// 4. Mesma Location (ou confirmar mudança)
function locationChanged(old: string, new: string): boolean {
  return old !== new;
}
```

### 5.2 Validações na API (checkAvailability)

```typescript
// Backend já valida:
✓ Conflitos de horário (sobreposição)
✓ Status válidos (ignora cancelados/finalizados)
✓ Location matching
✓ Professional availability (se especificado)
✓ Suporta excludeAppointmentId para edição
```

### 5.3 Matriz de Validação

| Validação | Frontend | Backend | Momento |
|-----------|----------|---------|---------|
| Status editável | ✅ | ❌ | onDragStart |
| Data no passado | ✅ | ❌ | onDragEnd |
| Horário comercial | ✅ | ❌ | onDragEnd |
| Conflito de horário | ❌ | ✅ | Antes de update |
| RBAC | ❌ | ✅ | Na API |
| Timezone | ✅ | ✅ | Sempre (São Paulo) |

---

## 6. ESTRATÉGIA DE IMPLEMENTAÇÃO

### 6.1 Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────────┐
│                    AgendaCalendar.tsx                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              DndContext (Provider)                    │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │          CalendarView.tsx                       │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │      react-big-calendar                  │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐ │  │  │  │
│  │  │  │  │  Draggable Events (@dnd-kit)       │ │  │  │  │
│  │  │  │  └─────────────────────────────────────┘ │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  Handlers:                                            │  │
│  │  - handleDragStart                                    │  │
│  │  - handleDragEnd                                      │  │
│  │  - handleDragCancel                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Hooks:                                                     │
│  - useDragValidation                                        │
│  - useOptimisticUpdate                                      │
│  - useConflictCheck                                         │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Componentes a Criar/Modificar

**MODIFICAR:**
1. `AgendaCalendar.tsx`
   - Adicionar DndContext wrapper
   - Implementar handlers de drag
   - Adicionar lógica de validação

2. `CalendarView.tsx`
   - Tornar eventos draggable
   - Adicionar visual feedback

**CRIAR:**
3. `hooks/useDragValidation.ts`
   - Validações de status/data/horário

4. `hooks/useAppointmentDrag.ts`
   - Lógica centralizada de drag & drop
   - State management do drag

5. `components/DraggableEvent.tsx`
   - Wrapper para eventos draggable

6. `components/DragOverlay.tsx`
   - Preview visual durante drag

### 6.3 Hooks Customizados

```typescript
// useDragValidation.ts
export function useDragValidation() {
  const validateDragStart = (appointment: Appointment) => {
    if (!isEditable(appointment)) {
      return { valid: false, reason: 'Status não editável' };
    }
    return { valid: true };
  };

  const validateDragEnd = (newDate: Date, duration: number) => {
    if (!isFutureDate(newDate)) {
      return { valid: false, reason: 'Data no passado' };
    }
    if (!isBusinessHours(newDate, duration)) {
      return { valid: false, reason: 'Fora do horário comercial' };
    }
    return { valid: true };
  };

  return { validateDragStart, validateDragEnd };
}

// useOptimisticUpdate.ts
export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  const updateOptimistic = (appointmentId: string, newDate: Date) => {
    queryClient.setQueryData(['appointments'], (old: Appointment[]) => {
      return old.map(apt =>
        apt.id === appointmentId
          ? { ...apt, scheduledDate: newDate }
          : apt
      );
    });
  };

  const rollback = () => {
    queryClient.invalidateQueries(['appointments']);
  };

  return { updateOptimistic, rollback };
}
```

### 6.4 Fluxo de Implementação (4 Fases)

**FASE 1: Setup Básico (2h)**
- Configurar DndContext no AgendaCalendar
- Criar componente DraggableEvent
- Testar drag básico (sem salvar)

**FASE 2: Validações (2h)**
- Implementar useDragValidation
- Adicionar validações de status/data
- Integrar checkAvailability API
- Mostrar feedback visual

**FASE 3: Persistência (2h)**
- Implementar useOptimisticUpdate
- Integrar com appointmentService.update
- Adicionar tratamento de erros
- Implementar rollback

**FASE 4: UX/Polish (2h)**
- Adicionar DragOverlay
- Animações suaves
- Toasts de feedback
- Testes de todos os cenários

---

## 7. RISCOS E MITIGAÇÕES

### 7.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| @dnd-kit incompatível com react-big-calendar | Média | Alto | Testar integração no FASE 1, ter plano B (HTML5 drag) |
| Conflito de eventos (mouse vs drag) | Alta | Médio | Configurar sensores corretamente, delay no drag |
| Performance em agendas grandes (100+ eventos) | Baixa | Médio | Virtualização, limitar eventos visíveis |
| Timezone inconsistente (UTC vs São Paulo) | Média | Alto | Sempre usar date-fns com timezone fixo |
| Race condition em updates simultâneos | Baixa | Alto | Optimistic locking no backend, conflict resolution |

### 7.2 Riscos de UX

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Drag acidental (muito sensível) | Alta | Baixo | Delay de 150ms antes de iniciar drag |
| Feedback visual confuso | Média | Médio | Design claro, testar com usuários |
| Mobile touch não funciona | Alta | Alto | TouchSensor do @dnd-kit, testar mobile |
| Eventos pequenos difíceis de arrastar | Média | Médio | Aumentar área de hit, handle visual |

### 7.3 Riscos de Negócio

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Usuarios sobrescrevem agendamentos acidentalmente | Média | Alto | Modal de confirmação em conflitos |
| Perda de dados em erro de rede | Baixa | Alto | Rollback automático, salvar draft local |
| Mudanças não notificam paciente | Média | Alto | Integrar com sistema de notificações (Sprint 2 C2) |

---

## 8. PRÓXIMOS PASSOS

### ✅ Concluído
- [x] Análise de código frontend
- [x] Análise de código backend
- [x] Mapeamento de dependências
- [x] Identificação de cenários
- [x] Definição de validações
- [x] Estratégia de implementação

### 🔄 Em Andamento
- [ ] Finalizar mapeamento de cenários edge cases

### ⏳ Pendente
- [ ] FASE 2: Implementação
- [ ] FASE 3: Testes
- [ ] FASE 4: Deploy e documentação

---

## 9. DECISÕES TÉCNICAS

### 9.1 Escolha: @dnd-kit vs HTML5 Drag API

**Decisão:** @dnd-kit ✅

**Razões:**
1. Já está instalado no projeto
2. Melhor suporte a touch (mobile)
3. API mais flexível e moderna
4. Hooks-based (integra bem com React)
5. Performance superior
6. Comunidade ativa

**Alternativa considerada:** HTML5 Drag API (nativa)
- ❌ Suporte touch limitado
- ❌ API menos intuitiva
- ❌ Mais bugs cross-browser

### 9.2 Escolha: Validação no Frontend vs Backend

**Decisão:** Híbrida ✅

**Validações Frontend (UX rápida):**
- Status editável
- Data no passado
- Horário comercial

**Validações Backend (Segurança):**
- Conflitos de horário (source of truth)
- RBAC
- Regras de negócio

**Razão:** Melhor UX sem comprometer segurança

### 9.3 Escolha: Optimistic Update vs Confirmação

**Decisão:** Optimistic Update com Rollback ✅

**Razões:**
1. UX mais fluida (sem loading)
2. React Query facilita rollback
3. Maioria dos drags será bem-sucedida
4. Feedback imediato

**Fallback:** Em caso de conflito, mostrar modal de confirmação

---

## 10. MÉTRICAS DE SUCESSO

### 10.1 Técnicas
- ✅ 0 erros no console
- ✅ Tempo de drag < 16ms (60fps)
- ✅ Rollback funciona em 100% dos erros
- ✅ Compatibilidade: Chrome, Firefox, Safari, Mobile

### 10.2 Funcionais
- ✅ Todos os cenários de sucesso funcionam
- ✅ Todas as validações bloqueiam corretamente
- ✅ Todos os erros são tratados

### 10.3 UX
- ✅ Feedback visual claro em todas as fases
- ✅ Tempo de resposta percebido < 200ms
- ✅ Sem drags acidentais (delay configurado)
- ✅ Toasts informativos em todas as ações

---

**Próximo passo:** Iniciar FASE 2 - IMPLEMENTAÇÃO

**Documento criado por:** Claude (AI Assistant)
**Baseado em:** Análise completa do código existente
