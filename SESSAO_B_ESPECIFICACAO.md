# 📋 ESPECIFICAÇÃO SESSÃO B - Melhorias Módulos Existentes

## 🎯 OBJETIVO
Implementar melhorias prioritárias nos módulos existentes do sistema conforme solicitações dos colaboradores.

---

## ⚠️ REGRAS IMPORTANTES

### 🚫 O QUE NÃO FAZER
- ❌ **NÃO TOCAR** em arquivos da pasta `backend/src/automation/` (Sessão A está trabalhando)
- ❌ **NÃO MODIFICAR** contratos em `backend/src/automation/contracts/` (apenas ler se necessário)
- ❌ **NÃO FAZER DEPLOY** sem avisar na coordenação
- ❌ **NÃO FAZER COMMITS** na branch `feature/automation-backend`

### ✅ O QUE FAZER
- ✅ Trabalhar exclusivamente na branch `feature/modules-improvements`
- ✅ Fazer commits frequentes com mensagens descritivas
- ✅ Testar cada módulo após implementação
- ✅ Pausar antes de fazer deploy (avisar usuário)
- ✅ Seguir padrões existentes do projeto

---

## 📦 MÓDULOS A IMPLEMENTAR

### 1️⃣ PRONTUÁRIOS - 12h
**Prioridade:** 🔴 Crítica
**Branch:** `feature/modules-improvements`

#### 📁 Arquivos a criar/modificar:
```
backend/src/medical-records/
├── dto/
│   ├── upload-photo.dto.ts          [CRIAR]
│   ├── upload-terms.dto.ts          [CRIAR]
│   └── export-pdf.dto.ts            [CRIAR]
├── medical-records.service.ts       [MODIFICAR]
└── medical-records.controller.ts    [MODIFICAR]

backend/src/common/
└── utils/
    └── pdf-generator.util.ts        [CRIAR]
```

#### 🎯 Funcionalidades:

**A) Upload de Fotos do Cliente (3h)**
- Endpoint: `POST /api/medical-records/:id/photos`
- Suportar múltiplos arquivos (PNG, JPG, JPEG)
- Armazenar em `uploads/medical-records/{recordId}/photos/`
- Vincular ao prontuário (tabela `medical_records`)
- Resposta: array de URLs das fotos

**B) Upload de Termos Assinados (3h)**
- Endpoint: `POST /api/medical-records/:id/terms`
- Suportar PDF e imagens
- Tipos: consentimento, anamnese, contrato
- Armazenar em `uploads/medical-records/{recordId}/terms/`
- Registrar timestamp e usuário que fez upload

**C) Anamnese Completa (3h)**
- Adicionar campos à tabela `medical_records`:
  - `anamnesis` (JSONB) - dados estruturados
  - `allergies` (TEXT[])
  - `medications` (TEXT[])
  - `medical_history` (TEXT)
  - `family_history` (TEXT)
- Endpoints:
  - `PUT /api/medical-records/:id/anamnesis`
  - `GET /api/medical-records/:id/anamnesis`

**D) Exportação PDF Completa (3h)**
- Endpoint: `GET /api/medical-records/:id/export-pdf`
- Incluir no PDF:
  - Dados do paciente
  - Anamnese completa
  - Fotos anexadas (thumbnails)
  - Lista de termos assinados
  - Histórico de atendimentos
  - Assinatura digital do profissional
- Usar biblioteca: `pdfkit` ou `puppeteer`
- Formato: A4, com logo e cabeçalho

#### 🧪 Testes:
- Testar upload de múltiplas fotos
- Testar upload de diferentes formatos de termos
- Testar salvamento de anamnese completa
- Testar geração de PDF com todos os dados

---

### 2️⃣ FINANCEIRO - 18h
**Prioridade:** 🔴 Crítica
**Branch:** `feature/modules-improvements`

#### 📁 Arquivos a criar/modificar:
```
backend/src/financial/
├── dto/
│   ├── financial-report.dto.ts      [CRIAR]
│   ├── bank-import.dto.ts           [CRIAR]
│   └── reconciliation.dto.ts        [CRIAR]
├── financial.service.ts             [MODIFICAR]
├── financial.controller.ts          [MODIFICAR]
└── utils/
    ├── ofx-parser.util.ts           [CRIAR]
    ├── csv-parser.util.ts           [CRIAR]
    └── reconciliation.util.ts       [CRIAR]
```

#### 🎯 Funcionalidades:

**A) Relatórios Financeiros Avançados (8h)**

**A1) Fluxo de Caixa (3h)**
- Endpoint: `GET /api/financial/reports/cash-flow`
- Parâmetros: `startDate`, `endDate`, `groupBy` (day/week/month)
- Retornar:
  ```typescript
  {
    totalRevenue: number,
    totalExpenses: number,
    netCashFlow: number,
    cashFlowByPeriod: Array<{
      period: string,
      revenue: number,
      expenses: number,
      balance: number
    }>,
    revenueByCategory: Record<string, number>,
    expensesByCategory: Record<string, number>
  }
  ```

**A2) DRE Simplificado (2h)**
- Endpoint: `GET /api/financial/reports/dre`
- Parâmetros: `month`, `year`
- Calcular:
  - Receita Bruta
  - (-) Deduções (cancelamentos, devoluções)
  - = Receita Líquida
  - (-) Custos Diretos
  - = Lucro Bruto
  - (-) Despesas Operacionais
  - = Lucro Operacional

**A3) Contas a Receber/Pagar (3h)**
- Endpoints:
  - `GET /api/financial/reports/receivables`
  - `GET /api/financial/reports/payables`
- Parâmetros: `status` (pending/overdue/paid), `startDate`, `endDate`
- Agrupar por:
  - Vencimento (hoje, esta semana, este mês, vencidas)
  - Cliente/Fornecedor
  - Categoria

**B) Importação Bancária (10h)**

**B1) Parser OFX (4h)**
- Endpoint: `POST /api/financial/bank-import/ofx`
- Aceitar arquivo .ofx
- Extrair:
  - Data da transação
  - Descrição
  - Valor
  - Tipo (débito/crédito)
  - Saldo
- Criar transações pendentes de conciliação

**B2) Parser CSV Genérico (3h)**
- Endpoint: `POST /api/financial/bank-import/csv`
- Body incluir mapeamento de colunas:
  ```typescript
  {
    file: File,
    mapping: {
      dateColumn: number,
      descriptionColumn: number,
      valueColumn: number,
      typeColumn?: number
    },
    dateFormat: string, // 'DD/MM/YYYY', etc
    delimiter: ',' | ';' | '\t'
  }
  ```
- Validar e criar transações

**B3) Conciliação Automática (3h)**
- Endpoint: `POST /api/financial/reconcile`
- Algoritmo:
  1. Buscar transações no sistema por data ±3 dias
  2. Comparar valores (exato ou ±2%)
  3. Comparar descrições (similaridade > 70%)
  4. Sugerir matches
- Permitir conciliação manual:
  - `POST /api/financial/reconcile/manual`
  - Body: `{ bankTransactionId, systemTransactionId }`

#### 🧪 Testes:
- Testar cada tipo de relatório com dados reais
- Testar importação OFX de diferentes bancos
- Testar importação CSV com diferentes formatos
- Testar conciliação automática e manual

---

### 3️⃣ ESTOQUE - 12h
**Prioridade:** 🔴 Crítica
**Branch:** `feature/modules-improvements`

#### 📁 Arquivos a criar/modificar:
```
backend/src/inventory/
├── dto/
│   ├── nf-entry.dto.ts              [CRIAR]
│   ├── auto-withdrawal.dto.ts       [CRIAR]
│   └── alert-config.dto.ts          [CRIAR]
├── inventory.service.ts             [MODIFICAR]
├── inventory.controller.ts          [MODIFICAR]
└── jobs/
    └── inventory-alerts.job.ts      [CRIAR]
```

#### 🎯 Funcionalidades:

**A) Entrada com Nota Fiscal (3h)**
- Endpoint: `POST /api/inventory/entries/nf`
- Body:
  ```typescript
  {
    nfNumber: string,
    nfDate: Date,
    supplier: string,
    totalValue: number,
    items: Array<{
      productId: string,
      quantity: number,
      unitCost: number,
      batchNumber?: string,
      expiryDate?: Date
    }>
  }
  ```
- Validações:
  - NF não duplicada
  - Produtos existem
  - Quantidades > 0
- Atualizar estoque e custos médios

**B) Saída Automática por Atendimento (3h)**
- Integrar com módulo de agendamentos
- Ao finalizar agendamento (`appointments.status = 'completed'`):
  1. Buscar produtos/serviços do agendamento
  2. Dar baixa automática no estoque
  3. Registrar movimentação vinculada ao atendimento
- Endpoint manual (se necessário):
  - `POST /api/inventory/withdrawals/appointment/:appointmentId`

**C) Alertas de Estoque Baixo (4h)**
- Adicionar à tabela `products`:
  - `min_stock` (INTEGER)
  - `alert_enabled` (BOOLEAN)
- Job agendado (cron: diariamente às 8h):
  - Verificar produtos com `current_stock <= min_stock`
  - Criar notificações no sistema
  - Enviar email para responsável
  - Registrar em tabela `inventory_alerts`
- Endpoints:
  - `GET /api/inventory/alerts` - listar alertas ativos
  - `PUT /api/inventory/alerts/:id/resolve` - marcar como resolvido

**D) Relatórios de Movimentação (2h)**
- Endpoint: `GET /api/inventory/reports/movements`
- Parâmetros: `startDate`, `endDate`, `productId?`, `type?` (entry/withdrawal)
- Retornar:
  ```typescript
  {
    movements: Array<{
      date: Date,
      product: string,
      type: 'entry' | 'withdrawal',
      quantity: number,
      reason: string,
      user: string,
      reference?: string // NF ou Appointment ID
    }>,
    summary: {
      totalEntries: number,
      totalWithdrawals: number,
      netChange: number
    }
  }
  ```

#### 🧪 Testes:
- Testar entrada com NF (diferentes formatos)
- Testar saída automática ao finalizar agendamento
- Testar job de alertas
- Testar relatórios de movimentação

---

### 4️⃣ VENDAS E COMISSÕES - 20h
**Prioridade:** 🔴 Crítica
**Branch:** `feature/modules-improvements`

#### 📁 Arquivos a criar/modificar:
```
backend/src/sales/
├── entities/
│   ├── sale.entity.ts               [CRIAR]
│   ├── commission.entity.ts         [CRIAR]
│   └── commission-rule.entity.ts    [CRIAR]
├── dto/
│   ├── create-sale.dto.ts           [CRIAR]
│   ├── create-commission-rule.dto.ts [CRIAR]
│   └── commission-report.dto.ts     [CRIAR]
├── sales.service.ts                 [CRIAR]
├── sales.controller.ts              [CRIAR]
├── commissions.service.ts           [CRIAR]
└── commissions.controller.ts        [CRIAR]

backend/migrations/
└── XXXXX-create-sales-tables.sql    [CRIAR]

frontend/src/pages/sales/              [CRIAR]
```

#### 🎯 Funcionalidades:

**A) Entidades e Migrations (4h)**

**Tabela `sales`:**
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR NOT NULL,
  customer_id UUID REFERENCES customers(id),
  seller_id UUID REFERENCES users(id),
  sale_date TIMESTAMP NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  net_value DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR,
  status VARCHAR DEFAULT 'pending', -- pending, paid, cancelled
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Tabela `commission_rules`:**
```sql
CREATE TABLE commission_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL, -- percentage, fixed, tiered
  value DECIMAL(10,2), -- % ou valor fixo
  applies_to VARCHAR, -- all, category, product, seller
  target_id UUID, -- ID da categoria/produto/vendedor
  min_value DECIMAL(10,2), -- venda mínima
  max_value DECIMAL(10,2), -- venda máxima
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR NOT NULL,
  sale_id UUID REFERENCES sales(id),
  seller_id UUID REFERENCES users(id),
  rule_id UUID REFERENCES commission_rules(id),
  base_value DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(10,2),
  commission_value DECIMAL(10,2) NOT NULL,
  status VARCHAR DEFAULT 'pending', -- pending, paid, cancelled
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**B) Service - Vendas (6h)**
- `createSale(dto)` - criar venda com itens
- `updateSale(id, dto)` - atualizar venda
- `cancelSale(id)` - cancelar venda
- `confirmPayment(id)` - confirmar pagamento
- `getSales(filters)` - listar com filtros
- `getSaleById(id)` - buscar venda completa

**C) Service - Comissões (6h)**

**C1) Cálculo Automático:**
- Ao confirmar pagamento de venda:
  1. Buscar regras de comissão aplicáveis ao vendedor
  2. Calcular comissão baseado nas regras
  3. Criar registro em `commissions`
- Suportar múltiplas regras (somar comissões)

**C2) Tipos de Comissão:**
- **Percentage:** X% do valor da venda
- **Fixed:** Valor fixo por venda
- **Tiered:** Comissão progressiva
  ```typescript
  // Exemplo: 5% até R$1000, 7% de R$1001 a R$5000, 10% acima de R$5000
  {
    type: 'tiered',
    tiers: [
      { upTo: 1000, rate: 5 },
      { upTo: 5000, rate: 7 },
      { upTo: null, rate: 10 }
    ]
  }
  ```

**C3) Métodos:**
- `calculateCommission(sale, seller)` - calcular comissão
- `getCommissions(filters)` - listar comissões
- `payCommission(id)` - marcar como paga
- `getCommissionReport(sellerId, period)` - relatório do vendedor

**D) Relatórios (4h)**

**D1) Dashboard de Vendas:**
- Endpoint: `GET /api/sales/dashboard`
- Retornar:
  ```typescript
  {
    totalSales: number,
    totalRevenue: number,
    averageTicket: number,
    topSellers: Array<{ seller: User, sales: number, revenue: number }>,
    topProducts: Array<{ product: Product, quantity: number, revenue: number }>,
    salesByDay: Array<{ date: string, sales: number, revenue: number }>,
    salesByPaymentMethod: Record<string, number>
  }
  ```

**D2) Relatório de Comissões:**
- Endpoint: `GET /api/commissions/report`
- Parâmetros: `sellerId?`, `startDate`, `endDate`, `status?`
- Retornar:
  ```typescript
  {
    totalCommissions: number,
    paidCommissions: number,
    pendingCommissions: number,
    commissionsBySeller: Array<{
      seller: User,
      totalSales: number,
      totalCommission: number,
      paidCommission: number,
      pendingCommission: number
    }>
  }
  ```

#### 🧪 Testes:
- Testar criação de venda com múltiplos itens
- Testar cálculo de comissões (todos os tipos)
- Testar relatórios com diferentes filtros
- Testar cancelamento e estorno

---

### 5️⃣ AGENDA + DESEMPENHO - 8h
**Prioridade:** 🟡 Alta
**Branch:** `feature/modules-improvements`

#### 📁 Arquivos a criar/modificar:
```
backend/src/appointments/
├── dto/
│   └── performance-report.dto.ts    [CRIAR]
├── appointments.service.ts          [MODIFICAR]
└── appointments.controller.ts       [MODIFICAR]
```

#### 🎯 Funcionalidades:

**A) Métricas de Desempenho (4h)**
- Endpoint: `GET /api/appointments/performance`
- Parâmetros: `userId?`, `startDate`, `endDate`
- Calcular:
  ```typescript
  {
    totalAppointments: number,
    completedAppointments: number,
    cancelledAppointments: number,
    noShowAppointments: number,
    completionRate: number, // %
    cancellationRate: number, // %
    averageDuration: number, // minutos
    revenue: number,
    averageRevenue: number,
    appointmentsByDay: Array<{
      date: string,
      total: number,
      completed: number,
      cancelled: number
    }>,
    appointmentsByService: Record<string, number>,
    peakHours: Array<{ hour: number, count: number }>
  }
  ```

**B) Comparativo de Períodos (2h)**
- Endpoint: `GET /api/appointments/performance/compare`
- Parâmetros: `period1Start`, `period1End`, `period2Start`, `period2End`, `userId?`
- Retornar métricas lado a lado + % de variação

**C) Ranking de Profissionais (2h)**
- Endpoint: `GET /api/appointments/performance/ranking`
- Parâmetros: `startDate`, `endDate`, `metric` (appointments/revenue/completion_rate)
- Ordenar profissionais por métrica escolhida
- Incluir:
  - Posição no ranking
  - Nome do profissional
  - Valor da métrica
  - Variação vs período anterior

#### 🧪 Testes:
- Testar cálculo de métricas
- Testar comparativo de períodos
- Testar ranking com diferentes métricas

---

## 📅 CRONOGRAMA SESSÃO B (7 dias)

### **Dia 1 - Segunda 21/10 (11,75h)**
- ✅ Prontuários: Upload fotos (3h)
- ✅ Prontuários: Upload termos (3h)
- ✅ Prontuários: Anamnese (3h)
- ✅ Prontuários: PDF - Parte 1 (2,75h)

### **Dia 2 - Terça 22/10 (11,75h)**
- ✅ Prontuários: PDF - Parte 2 (0,25h)
- ✅ Financeiro: Relatórios - Fluxo de Caixa (3h)
- ✅ Financeiro: Relatórios - DRE (2h)
- ✅ Financeiro: Relatórios - Contas (3h)
- ✅ Financeiro: Parser OFX - Parte 1 (3,5h)

### **Dia 3 - Quarta 23/10 (11,75h)**
- ✅ Financeiro: Parser OFX - Parte 2 (0,5h)
- ✅ Financeiro: Parser CSV (3h)
- ✅ Financeiro: Conciliação (3h)
- ✅ Estoque: Entrada NF (3h)
- ✅ Estoque: Saída automática (2,25h)

### **Dia 4 - Quinta 24/10 (11,75h)**
- ✅ Estoque: Alertas (4h)
- ✅ Estoque: Relatórios (2h)
- ✅ Vendas: Entities + Migrations (4h)
- ✅ Vendas: Service Vendas - Parte 1 (1,75h)

### **Dia 5 - Sexta 25/10 (11,75h)**
- ✅ Vendas: Service Vendas - Parte 2 (4,25h)
- ✅ Vendas: Service Comissões (6h)
- ✅ Vendas: Relatórios - Parte 1 (1,5h)

### **Dia 6 - Sábado 26/10 (10h - Reduzido)**
- ✅ Vendas: Relatórios - Parte 2 (2,5h)
- ✅ Agenda: Métricas de Desempenho (4h)
- ✅ Agenda: Comparativo de Períodos (2h)
- ✅ Agenda: Ranking (1,5h)

### **Dia 7 - Domingo 27/10 (8h - Testes)**
- ✅ Testes integrados de todos os módulos (6h)
- ✅ Ajustes e correções (2h)

**📊 Total: 77h (dentro do previsto de 70h + margem)**

---

## 🔄 PONTOS DE SINCRONIZAÇÃO

### **Sync 1 - Terça 22/10 às 18h (30min)**
**Status esperado:**
- ✅ Prontuários completos
- ✅ Relatórios Financeiros prontos
- 📊 Progresso: ~20%

**Ações:**
- Informar conclusão do Prontuários
- Verificar se Sessão A já tem APIs base prontas
- Alinhar possível merge parcial

### **Sync 2 - Quinta 24/10 às 18h (30min)**
**Status esperado:**
- ✅ Financeiro completo (importação bancária)
- ✅ Estoque completo
- 📊 Progresso: ~45%

**Ações:**
- Merge parcial se necessário
- Resolver conflitos (se houver)
- Alinhar próximos passos

### **Sync 3 - Sábado 26/10 às 18h (30min)**
**Status esperado:**
- ✅ Vendas e Comissões completos
- ✅ Agenda com Desempenho completo
- 📊 Progresso: ~80%

**Ações:**
- Preparar para merge final
- Alinhar testes integrados
- Definir data do deploy final

### **Sync 4 - Segunda 28/10 (Integração Final)**
**Ações:**
- Merge das duas branches
- Resolver conflitos
- Testes end-to-end
- Deploy conjunto (PAUSAR AMBAS SESSÕES)

---

## 🚀 ANTES DE COMEÇAR

### 1. Confirmar Branch
```bash
git checkout feature/modules-improvements
git pull origin feature/modules-improvements
```

### 2. Verificar Dependências
```bash
cd backend
npm install
```

### 3. Testar Ambiente
```bash
npm run build
npm run test
```

### 4. Criar Migration Base (se necessário)
```bash
npm run migration:create -- src/migrations/improvements-modules
```

---

## ✅ CHECKLIST DE QUALIDADE

Para cada módulo implementado:

- [ ] Código seguindo padrões do projeto
- [ ] DTOs com validações (class-validator)
- [ ] Tratamento de erros adequado
- [ ] Logs em operações importantes
- [ ] Testes unitários básicos
- [ ] Documentação no código (JSDoc)
- [ ] Endpoints testados via Postman/Insomnia
- [ ] Migration executada com sucesso
- [ ] Rollback da migration testado

---

## 📞 COMUNICAÇÃO

### 🔴 AVISAR IMEDIATAMENTE SE:
- Encontrar conflito com arquivos da Sessão A
- Precisar modificar algo em `backend/src/automation/`
- Precisar fazer deploy/push
- Encontrar bloqueio técnico grave

### 🟡 AVISAR NO PRÓXIMO SYNC:
- Pequenos desvios do cronograma
- Mudanças de abordagem técnica
- Sugestões de melhorias

---

## 🎯 CRITÉRIOS DE SUCESSO

Ao final da Sessão B, devemos ter:

- ✅ 5 módulos completos e funcionais
- ✅ Todas as migrations aplicadas
- ✅ Testes básicos passando
- ✅ Documentação inline atualizada
- ✅ Zero conflitos com branch da Sessão A
- ✅ Pronto para merge e deploy

---

## 📚 REFERÊNCIAS ÚTEIS

### Padrões do Projeto
- Entities: Ver `backend/src/leads/entities/lead.entity.ts`
- Services: Ver `backend/src/leads/leads.service.ts`
- Controllers: Ver `backend/src/leads/leads.controller.ts`
- DTOs: Ver `backend/src/leads/dto/`

### Bibliotecas Importantes
- Validação: `class-validator`, `class-transformer`
- PDF: `pdfkit` ou `@nestjs/pdf`
- CSV: `csv-parser`, `papaparse`
- OFX: `ofx-js`, `banking.js`
- Jobs: `@nestjs/schedule`, `cron`

### Banco de Dados
- Host: `46.202.144.210`
- Database: `nexus_crm`
- User: `nexus_admin`
- Password: `nexus2024@secure`

---

## 🎉 BOA SORTE!

Qualquer dúvida, consultar os contratos em `backend/src/automation/contracts/` ou aguardar próximo sync.

**Lembre-se:** Qualidade > Velocidade. É melhor entregar 4 módulos bem feitos do que 5 com bugs! 🚀
