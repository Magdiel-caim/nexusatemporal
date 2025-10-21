# 📊 SESSÃO A - Especificação Módulo BI (Business Intelligence)

**Data de Início:** 21 de Outubro de 2025
**Sessão:** A (Trabalho em Paralelo com Sessão B)
**Branch:** `feature/bi-module`
**Responsável:** Claude (Sessão A)
**Estimativa:** 40-50 horas

---

## 🎯 OBJETIVO

Criar um módulo completo de Business Intelligence (BI) para o Nexus CRM, permitindo análises avançadas, dashboards interativos e relatórios executivos baseados nos dados de todos os módulos existentes.

---

## 📋 ESCOPO DO MÓDULO BI

### 1. **Dashboards Executivos**
- Dashboard Geral (Visão 360º do negócio)
- Dashboard Comercial (Vendas, Leads, Conversão)
- Dashboard Financeiro (Receitas, Despesas, Fluxo de Caixa)
- Dashboard Operacional (Estoque, Agendamentos, Atendimentos)
- Dashboard de Atendimento (Chat, WhatsApp, Tempo médio)

### 2. **Análises Avançadas**
- Análise de Funil de Vendas
- Análise de Cohort (retenção de clientes)
- Análise de RFM (Recency, Frequency, Monetary)
- Análise de Tendências (séries temporais)
- Análise de Performance por Vendedor

### 3. **Relatórios Personalizados**
- Gerador de relatórios customizados
- Templates de relatórios pré-configurados
- Agendamento de relatórios (diário/semanal/mensal)
- Export (PDF, Excel, CSV)
- Compartilhamento via email

### 4. **Indicadores (KPIs)**
- **Comerciais:** Taxa de conversão, Ticket médio, CAC, LTV
- **Financeiros:** Margem bruta, ROI, Break-even
- **Operacionais:** Taxa de ocupação, Tempo médio de atendimento
- **Atendimento:** NPS, CSAT, Taxa de resposta

### 5. **Visualizações**
- Gráficos de linha (tendências)
- Gráficos de barra (comparações)
- Gráficos de pizza (distribuições)
- Mapas de calor (performance)
- Funis (conversão)
- Tabelas dinâmicas

---

## 🏗️ ARQUITETURA DO MÓDULO

### Backend (`backend/src/modules/bi/`)

```
bi/
├── controllers/
│   ├── dashboard.controller.ts       # Dashboards principais
│   ├── analytics.controller.ts       # Análises avançadas
│   ├── kpi.controller.ts             # Cálculo de KPIs
│   └── report.controller.ts          # Geração de relatórios
│
├── services/
│   ├── dashboard.service.ts          # Lógica de dashboards
│   ├── analytics.service.ts          # Cálculos analíticos
│   ├── kpi.service.ts                # Cálculo de indicadores
│   ├── report.service.ts             # Geração de relatórios
│   ├── data-aggregator.service.ts    # Agregação de dados
│   └── export.service.ts             # Export PDF/Excel
│
├── entities/
│   ├── dashboard-config.entity.ts    # Configurações de dashboard
│   ├── custom-report.entity.ts       # Relatórios personalizados
│   ├── scheduled-report.entity.ts    # Agendamento de relatórios
│   └── kpi-target.entity.ts          # Metas de KPIs
│
├── dto/
│   ├── dashboard.dto.ts              # DTOs de dashboard
│   ├── analytics.dto.ts              # DTOs de analytics
│   ├── kpi.dto.ts                    # DTOs de KPIs
│   └── report.dto.ts                 # DTOs de relatórios
│
├── interfaces/
│   ├── dashboard.interface.ts        # Interfaces de dashboard
│   ├── kpi.interface.ts              # Interfaces de KPIs
│   └── chart.interface.ts            # Interfaces de gráficos
│
└── bi.routes.ts                      # Rotas do módulo BI
```

### Frontend (`frontend/src/`)

```
pages/BI/
├── BIDashboard.tsx                   # Página principal BI
├── ExecutiveDashboard.tsx            # Dashboard executivo
├── SalesDashboard.tsx                # Dashboard de vendas
├── FinancialDashboard.tsx            # Dashboard financeiro
├── OperationalDashboard.tsx          # Dashboard operacional
├── CustomReports.tsx                 # Relatórios personalizados
└── KPIManager.tsx                    # Gerenciador de KPIs

components/bi/
├── charts/
│   ├── LineChart.tsx                 # Gráfico de linha
│   ├── BarChart.tsx                  # Gráfico de barras
│   ├── PieChart.tsx                  # Gráfico de pizza
│   ├── HeatMap.tsx                   # Mapa de calor
│   └── FunnelChart.tsx               # Gráfico de funil
│
├── widgets/
│   ├── KPICard.tsx                   # Card de KPI
│   ├── TrendIndicator.tsx            # Indicador de tendência
│   ├── ComparisonWidget.tsx          # Widget de comparação
│   └── ProgressWidget.tsx            # Widget de progresso
│
└── filters/
    ├── DateRangePicker.tsx           # Seletor de período
    ├── DimensionFilter.tsx           # Filtro por dimensão
    └── QuickFilters.tsx              # Filtros rápidos

services/
└── biService.ts                      # Service de API BI
```

---

## 📊 FONTES DE DADOS

O módulo BI agregará dados dos seguintes módulos:

### 1. **Módulo de Vendas**
- Vendas realizadas
- Comissões geradas
- Performance de vendedores
- Produtos mais vendidos

### 2. **Módulo de Leads**
- Leads captados
- Taxa de conversão
- Tempo médio de conversão
- Origem dos leads

### 3. **Módulo Financeiro**
- Receitas e despesas
- Fluxo de caixa
- Contas a pagar/receber
- Margem de lucro

### 4. **Módulo de Estoque**
- Movimentações
- Inventário físico
- Produtos em falta
- Custo médio

### 5. **Módulo de Chat/WhatsApp**
- Mensagens enviadas/recebidas
- Tempo médio de resposta
- Taxa de engajamento
- Sessões ativas

### 6. **Módulo de Agendamentos**
- Agendamentos realizados
- Taxa de ocupação
- Cancelamentos
- No-show rate

### 7. **Módulo de Procedimentos**
- Procedimentos mais realizados
- Faturamento por procedimento
- Custo vs. Receita

---

## 🔌 ENDPOINTS DA API

### **Dashboards**

```typescript
GET    /api/bi/dashboards/executive           # Dashboard executivo
GET    /api/bi/dashboards/sales                # Dashboard de vendas
GET    /api/bi/dashboards/financial            # Dashboard financeiro
GET    /api/bi/dashboards/operational          # Dashboard operacional
GET    /api/bi/dashboards/custom/:id           # Dashboard personalizado
POST   /api/bi/dashboards/custom               # Criar dashboard personalizado
PUT    /api/bi/dashboards/custom/:id           # Atualizar dashboard
DELETE /api/bi/dashboards/custom/:id           # Deletar dashboard
```

### **KPIs**

```typescript
GET    /api/bi/kpis/summary                    # Resumo de KPIs
GET    /api/bi/kpis/:category                  # KPIs por categoria
GET    /api/bi/kpis/:name/history              # Histórico de um KPI
POST   /api/bi/kpis/targets                    # Definir meta de KPI
GET    /api/bi/kpis/targets/:id                # Buscar meta
PUT    /api/bi/kpis/targets/:id                # Atualizar meta
```

### **Analytics**

```typescript
GET    /api/bi/analytics/sales-funnel          # Funil de vendas
GET    /api/bi/analytics/cohort                # Análise de cohort
GET    /api/bi/analytics/rfm                   # Análise RFM
GET    /api/bi/analytics/trends                # Análise de tendências
GET    /api/bi/analytics/performance           # Performance vendedores
```

### **Relatórios**

```typescript
GET    /api/bi/reports                         # Listar relatórios
GET    /api/bi/reports/:id                     # Buscar relatório
POST   /api/bi/reports                         # Criar relatório
PUT    /api/bi/reports/:id                     # Atualizar relatório
DELETE /api/bi/reports/:id                     # Deletar relatório
POST   /api/bi/reports/:id/generate            # Gerar relatório
GET    /api/bi/reports/:id/download            # Download (PDF/Excel)
POST   /api/bi/reports/:id/schedule            # Agendar envio
```

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **Tabelas Principais**

#### 1. **bi_dashboard_configs**
```sql
CREATE TABLE bi_dashboard_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'executive', 'sales', 'custom'
  config JSONB NOT NULL, -- Configuração dos widgets
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. **bi_kpi_targets**
```sql
CREATE TABLE bi_kpi_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  kpi_name VARCHAR(100) NOT NULL,
  target_value DECIMAL(15,2) NOT NULL,
  period VARCHAR(20) NOT NULL, -- 'daily', 'monthly', 'quarterly', 'yearly'
  start_date DATE NOT NULL,
  end_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. **bi_custom_reports**
```sql
CREATE TABLE bi_custom_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  query_config JSONB NOT NULL, -- Configuração da query
  visualization_config JSONB, -- Config de visualização
  created_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. **bi_scheduled_reports**
```sql
CREATE TABLE bi_scheduled_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  report_id UUID REFERENCES bi_custom_reports(id),
  frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  recipients TEXT[], -- Array de emails
  format VARCHAR(10) NOT NULL, -- 'pdf', 'excel', 'csv'
  next_run_at TIMESTAMP NOT NULL,
  last_run_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📦 DEPENDÊNCIAS NECESSÁRIAS

### Backend
```json
{
  "dependencies": {
    "chart.js": "^4.4.0",              // Geração de gráficos
    "date-fns": "^2.30.0",             // Manipulação de datas
    "pdfkit": "^0.13.0",               // Geração de PDF
    "exceljs": "^4.3.0",               // Geração de Excel
    "node-cron": "^3.0.3",             // Agendamento de relatórios
    "@nestjs/schedule": "^4.0.0"       // Agendamento NestJS
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "recharts": "^2.10.0",             // Gráficos React
    "date-fns": "^2.30.0",             // Datas
    "react-datepicker": "^4.21.0",     // Date picker
    "html2canvas": "^1.4.1",           // Screenshot de dashboards
    "jspdf": "^2.5.1"                  // Export PDF no frontend
  }
}
```

---

## 🎨 DESIGN DE INTERFACES (UX)

### Dashboard Executivo
```
┌─────────────────────────────────────────────────────┐
│  📊 Dashboard Executivo        [Período: ▼]         │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │Receita  │  │ Vendas  │  │ Leads   │  │ Tickets ││
│  │R$ 150k  │  │   234   │  │   89    │  │  1.234  ││
│  │↑ 12%    │  │↑ 8%     │  │↓ 5%     │  │↑ 15%    ││
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘│
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  Receita Mensal     │  │  Funil de Vendas    │  │
│  │  [Gráfico Linha]    │  │  [Gráfico Funil]    │  │
│  │                     │  │                     │  │
│  └─────────────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  Top Vendedores     │  │  Produtos Mais      │  │
│  │  [Tabela]           │  │  Vendidos [Tabela]  │  │
│  │                     │  │                     │  │
│  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## ⚠️ COORDENAÇÃO COM SESSÃO B

### 🟢 Áreas Seguras (SEM CONFLITO)

**Sessão A (BI) pode trabalhar livremente em:**
- ✅ Criação de todo o módulo `backend/src/modules/bi/`
- ✅ Criação de páginas `frontend/src/pages/BI/`
- ✅ Criação de components `frontend/src/components/bi/`
- ✅ Criação de migrations específicas de BI
- ✅ Leitura (somente) de dados de outros módulos via queries

### 🔴 Áreas de RISCO (Coordenar com Sessão B)

**NÃO modificar sem coordenação:**
- ❌ Módulos: `vendas/`, `leads/`, `financeiro/`, `estoque/`
- ❌ Arquivos compartilhados: `app.module.ts`, `main.ts`
- ❌ Estrutura de tabelas de outros módulos (apenas ler)

### 📞 Protocolo de Coordenação

**Antes de modificar arquivo compartilhado:**
1. Avisar no chat: "⚠️ SESSÃO A: Vou modificar [arquivo]"
2. Aguardar confirmação da Sessão B
3. Fazer modificação
4. Commitar imediatamente
5. Avisar conclusão

---

## 📅 CRONOGRAMA (Estimado)

### Fase 1: Estrutura Backend (12h)
- Dia 1-2: Entities, DTOs, Interfaces
- Dia 2-3: Services básicos (Dashboard, KPI)
- Dia 3-4: Controllers e Routes

### Fase 2: Lógica de Negócio (15h)
- Dia 4-5: Data Aggregator Service
- Dia 5-6: Analytics Service
- Dia 6-7: Report Service + Export

### Fase 3: Frontend Básico (12h)
- Dia 7-8: Estrutura de páginas
- Dia 8-9: Components de charts
- Dia 9-10: Widgets e cards

### Fase 4: Dashboards (8h)
- Dia 10-11: Dashboard Executivo
- Dia 11: Dashboard Comercial
- Dia 11-12: Dashboard Financeiro

### Fase 5: Relatórios (5h)
- Dia 12-13: Gerador de relatórios
- Dia 13: Templates pré-configurados

### Fase 6: Testes e Ajustes (8h)
- Dia 13-14: Testes de integração
- Dia 14-15: Ajustes finais
- Dia 15: Documentação

**Total:** 60 horas (~12 dias de 5h cada)

---

## ✅ CRITÉRIOS DE SUCESSO

- [ ] 4 dashboards funcionais (Executivo, Comercial, Financeiro, Operacional)
- [ ] 15+ KPIs implementados e calculados corretamente
- [ ] Sistema de relatórios customizados funcionando
- [ ] Export para PDF e Excel implementado
- [ ] Agendamento de relatórios funcionando
- [ ] Gráficos responsivos e interativos
- [ ] Performance: Queries otimizadas (<500ms)
- [ ] Zero bugs críticos
- [ ] Documentação completa
- [ ] Testes unitários passando

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. ✅ Criar branch `feature/bi-module`
2. ⏳ Criar estrutura de pastas backend
3. ⏳ Criar entities básicas
4. ⏳ Criar interfaces e DTOs
5. ⏳ Implementar primeiro service (Dashboard)
6. ⏳ Criar primeiro controller
7. ⏳ Testar primeiro endpoint

---

**Sessão:** A
**Status:** 🟢 INICIADA
**Data:** 21/10/2025
**Próxima Atualização:** Após criação de estrutura backend

