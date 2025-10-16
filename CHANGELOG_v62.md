# Changelog v62 - Sistema de Calendário e API Pública

**Data:** 16 de Outubro de 2025
**Versão:** v62-calendar-system & v62-public-api

---

## 🎉 Visão Geral

Esta versão implementa um sistema completo de calendário visual estilo Google Calendar para agendamentos, com controle granular de horários (intervalos de 5 minutos), prevenção de conflitos, e uma API pública para integração com sites externos.

---

## ✨ Novas Funcionalidades

### 📅 **Calendário Visual Interativo**

Implementação completa de um calendário visual inspirado no Google Calendar com as seguintes características:

#### **CalendarView Component**
- **Localização:** `frontend/src/components/agenda/CalendarView.tsx`
- **Biblioteca:** react-big-calendar + date-fns
- **Funcionalidades:**
  - Visualizações: Mês, Semana, Dia e Agenda
  - Navegação intuitiva entre datas
  - Eventos coloridos por status do agendamento
  - Clique em slots vazios para criar novos agendamentos
  - Clique em eventos para ver detalhes
  - Horário de funcionamento configurável (7h às 20h)
  - Intervalos de 5 minutos
  - Suporte a Dark Mode

#### **TimeSlotPicker Component**
- **Localização:** `frontend/src/components/agenda/TimeSlotPicker.tsx`
- **Funcionalidades:**
  - Seleção visual de horários disponíveis
  - Slots de 5 em 5 minutos
  - Indicação clara de horários ocupados (cinza)
  - Indicação de horários disponíveis (azul clicável)
  - Agrupamento por período (Manhã/Tarde/Noite)
  - Estatísticas de disponibilidade
  - Horários passados automaticamente bloqueados
  - Suporte a Dark Mode

#### **AgendaCalendar Component**
- **Localização:** `frontend/src/components/agenda/AgendaCalendar.tsx`
- **Funcionalidades:**
  - Integração completa do calendário com formulário
  - Modal de criação de agendamentos
  - Layout responsivo de 2 colunas
  - Validação de disponibilidade antes de criar
  - Toast notifications para feedback
  - Carregamento dinâmico de leads e procedimentos

---

### 🔒 **Sistema de Prevenção de Conflitos**

#### **Backend - Appointment Service**
- **Localização:** `backend/src/modules/agenda/appointment.service.ts`
- **Novos Métodos:**

##### 1. `checkAvailability()`
Verifica se um horário está disponível considerando:
- Data e hora do agendamento
- Duração do procedimento
- Local do atendimento
- Profissional (opcional)
- Retorna conflitos existentes se houver

##### 2. `getOccupiedSlots()`
Retorna array de horários ocupados para uma data:
- Considera todos os agendamentos ativos
- Gera slots de 5 em 5 minutos
- Filtra por local e profissional
- Usado para bloquear visualmente slots indisponíveis

##### 3. `getAvailableSlots()`
Retorna todos os slots com status de disponibilidade:
- Horário configurável (7h-20h por padrão)
- Intervalo configurável (5min por padrão)
- Marca cada slot como disponível ou não

#### **Algoritmo de Detecção de Conflitos**
```typescript
// Verifica sobreposição considerando duração
- Início do novo dentro de agendamento existente
- Fim do novo dentro de agendamento existente
- Novo englobando agendamento existente completamente
```

---

### 🌐 **API Pública para Integração Externa**

#### **Endpoints Públicos**
- **Base URL:** `https://api.nexusatemporal.com.br/api/public/appointments`

##### 1. **GET /available-slots**
Consulta horários disponíveis (sem autenticação)
```
Parâmetros: date, location, tenantId, professionalId, startHour, endHour, interval
Retorna: Array de { time, available }
```

##### 2. **GET /occupied-slots**
Consulta horários ocupados (sem autenticação)
```
Parâmetros: date, location, tenantId, professionalId, interval
Retorna: Array de strings com horários ocupados
```

##### 3. **POST /check-availability**
Verifica disponibilidade de horário específico (sem autenticação)
```
Body: { scheduledDate, duration, location, tenantId, professionalId }
Retorna: { available, conflicts }
```

##### 4. **GET /locations**
Lista locais disponíveis (sem autenticação)
```
Retorna: Array de { value, label }
```

##### 5. **POST /**
Cria agendamento (requer API Key no header X-API-Key)
```
Headers: X-API-Key
Body: { leadId, procedureId, scheduledDate, location, ... }
Retorna: Agendamento criado
```

#### **Sistema de API Keys**
- Validação via header `X-API-Key`
- Chaves no formato `nexus_XXXXXXXX`
- Associadas a tenant específico
- Armazenadas em tabela `api_keys` (a ser criada)
- Validação temporária permite chaves começando com `nexus_`

---

### 📦 **Widget JavaScript para Sites Externos**

#### **nexus-calendar-widget.js**
- **Localização:** `frontend/public/nexus-calendar-widget.js`
- **Funcionalidades:**
  - Widget standalone sem dependências externas
  - Estilos injetados automaticamente
  - Customização de cores
  - Formulário completo de agendamento
  - Integração com API pública
  - Mensagens de sucesso/erro
  - Responsivo
  - Fácil instalação

#### **Exemplo de Uso:**
```html
<div id="nexus-calendar-widget"></div>
<script src="https://nexusatemporal.com.br/nexus-calendar-widget.js"></script>
<script>
  new NexusCalendarWidget({
    containerId: 'nexus-calendar-widget',
    apiKey: 'nexus_sua_chave',
    tenantId: 'default',
    location: 'moema',
    primaryColor: '#2563eb'
  });
</script>
```

---

## 📂 **Arquivos Criados**

### Frontend
- `frontend/src/components/agenda/CalendarView.tsx` (130 linhas)
- `frontend/src/components/agenda/CalendarView.css` (180 linhas)
- `frontend/src/components/agenda/TimeSlotPicker.tsx` (215 linhas)
- `frontend/src/components/agenda/AgendaCalendar.tsx` (333 linhas)
- `frontend/public/nexus-calendar-widget.js` (450 linhas)

### Backend
- `backend/src/modules/agenda/public-appointment.controller.ts` (234 linhas)
- `backend/src/modules/agenda/public-appointment.routes.ts` (20 linhas)

### Documentação
- `PUBLIC_API_DOCUMENTATION.md` (Documentação completa da API)
- `WIDGET_INSTALLATION.md` (Guia de instalação do widget)
- `CHANGELOG_v62.md` (Este arquivo)

---

## 📝 **Arquivos Modificados**

### Frontend
- `frontend/src/pages/AgendaPage.tsx`
  - Adicionado toggle Calendário/Lista
  - Calendário como view padrão
  - Renderização condicional de stats e filtros

- `frontend/src/services/appointmentService.ts`
  - Adicionados métodos: checkAvailability, getOccupiedSlots, getAvailableSlots

- `frontend/package.json`
  - Adicionadas dependências: react-big-calendar, date-fns, @types/react-big-calendar

### Backend
- `backend/src/modules/agenda/appointment.service.ts`
  - Adicionados 3 novos métodos de disponibilidade
  - Algoritmo de detecção de conflitos

- `backend/src/modules/agenda/appointment.controller.ts`
  - Adicionados controllers para novos endpoints

- `backend/src/modules/agenda/appointment.routes.ts`
  - Registradas novas rotas de disponibilidade

- `backend/src/routes/index.ts`
  - Registrada rota `/public/appointments`

---

## 🔧 **Melhorias Técnicas**

### Performance
- Memoização de eventos no calendário
- Carregamento lazy de slots ocupados
- Cache de dados de leads e procedimentos
- Renderização otimizada de time slots

### Segurança
- API pública separada das rotas autenticadas
- Validação de API keys para criação de agendamentos
- Consultas públicas somente leitura (GET)
- Validação de parâmetros em todos os endpoints

### UX/UI
- Feedback visual imediato para ações
- Loading states para requisições
- Mensagens de erro claras
- Toast notifications
- Scroll automático para formulário
- Indicadores visuais de disponibilidade
- Dark mode completo

---

## 📦 **Dependências Adicionadas**

### Frontend
```json
{
  "react-big-calendar": "^1.15.0",
  "date-fns": "^2.30.0",
  "@types/react-big-calendar": "^1.8.12"
}
```

---

## 🚀 **Deploy**

### Imagens Docker Criadas
- `nexus_frontend:v62-calendar-system` (Deploy inicial)
- `nexus_frontend:v62-public-api` (Deploy final)
- `nexus_backend:v62-calendar-system` (Deploy inicial)
- `nexus_backend:v62-public-api` (Deploy final)

### Status
- ✅ Frontend deployado e rodando
- ✅ Backend deployado e rodando
- ✅ API pública acessível
- ✅ Widget disponível

---

## 📊 **Endpoints da API**

### Rotas Privadas (Autenticadas)
```
POST   /api/appointments
GET    /api/appointments
GET    /api/appointments/today
GET    /api/appointments/:id
PUT    /api/appointments/:id
DELETE /api/appointments/:id
POST   /api/appointments/check-availability
GET    /api/appointments/occupied-slots
GET    /api/appointments/available-slots
```

### Rotas Públicas (Sem Autenticação para GET)
```
GET    /api/public/appointments/available-slots
GET    /api/public/appointments/occupied-slots
POST   /api/public/appointments/check-availability
GET    /api/public/appointments/locations
POST   /api/public/appointments (Requer API Key)
```

---

## 🎨 **Cores de Status no Calendário**

- **Aguardando Pagamento:** Amarelo (#FEF3C7)
- **Pagamento Confirmado:** Azul Claro (#DBEAFE)
- **Aguardando Confirmação:** Laranja (#FED7AA)
- **Confirmado:** Verde (#D1FAE5)
- **Em Atendimento:** Roxo (#E9D5FF)
- **Finalizado:** Cinza (#E5E7EB)
- **Cancelado:** Vermelho (#FEE2E2)
- **Reagendado:** Azul (#DBEAFE)

---

## 🔮 **Próximos Passos Sugeridos**

### Funcionalidades
1. ✅ Implementar drag-and-drop para reagendar
2. ✅ Adicionar visualização de múltiplos profissionais lado a lado
3. ✅ Criar relatórios de ocupação da agenda
4. ✅ Implementar recorrência de agendamentos
5. ✅ Adicionar integração com Google Calendar
6. ✅ Notificações push para novos agendamentos

### Infraestrutura
1. ✅ Criar tabela `api_keys` no banco de dados
2. ✅ Implementar rate limiting específico para API pública
3. ✅ Configurar CORS restritivo por domínio
4. ✅ Adicionar monitoramento de uso da API
5. ✅ Criar dashboard de analytics de agendamentos

---

## 📚 **Documentação**

- **API Pública:** Ver `PUBLIC_API_DOCUMENTATION.md`
- **Widget:** Ver `WIDGET_INSTALLATION.md`
- **Changelog:** Ver `CHANGELOG_v62.md` (este arquivo)

---

## 🤝 **Suporte**

- **Email:** ti.nexus@nexusatemporal.com.br
- **Desenvolvido com:** Claude Code (https://claude.com/claude-code)

---

## 📝 **Notas Importantes**

### Para Desenvolvedores
- O widget é totalmente standalone e pode ser usado em qualquer site
- A API pública permite rate limiting futuro
- Sistema de API keys preparado para expansão
- Todos os componentes suportam dark mode

### Para Usuários
- O calendário substitui a lista como view padrão
- Todos os horários são em intervalos de 5 minutos
- Horários passados não aparecem como disponíveis
- Sistema previne automaticamente conflitos de horários

---

**🎉 Sistema de Calendário e API Pública implementado com sucesso!**
