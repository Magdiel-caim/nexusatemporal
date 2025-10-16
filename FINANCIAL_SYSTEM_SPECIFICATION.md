# 💰 ESPECIFICAÇÃO TÉCNICA - MÓDULO FINANCEIRO

**Projeto:** Nexus Atemporal CRM
**Módulo:** Sistema Financeiro Completo
**Versão:** 1.0
**Data:** 16 de Outubro de 2025

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Integrações Necessárias](#integrações-necessárias)
3. [Estrutura de Dados](#estrutura-de-dados)
4. [Funcionalidades](#funcionalidades)
5. [Fluxos de Processo](#fluxos-de-processo)
6. [API Endpoints](#api-endpoints)
7. [Interface do Usuário](#interface-do-usuário)
8. [Regras de Negócio](#regras-de-negócio)

---

## 🎯 VISÃO GERAL

O módulo financeiro será responsável por:

- **Controle de Caixa**: Entradas e saídas financeiras
- **Gestão de Recebimentos**: PIX, Cartão (Crédito/Débito), Dinheiro, Links de Pagamento
- **Contas a Pagar**: Fornecedores e despesas operacionais
- **Faturamento**: Emissão de recibos e relatórios
- **Compras**: Registro de produtos adquiridos com anexo de NFs
- **Integração com Agendamentos**: Pagamentos vinculados a procedimentos
- **Relatórios**: DRE, fluxo de caixa, análises financeiras

---

## 🔗 INTEGRAÇÕES NECESSÁRIAS

### 1. **Integração com Leads/Pipeline**
```typescript
// Quando lead é convertido
Lead → Pagamento Confirmado → Transaction (RECEITA)
- Captura: estimatedValue, procedureId, leadId
- Atualiza: Lead.status → 'won'
```

### 2. **Integração com Appointments/Agenda**
```typescript
// Fluxo de pagamento de agendamentos
Appointment.paymentStatus: PENDENTE → PAGO
- Gera: Transaction (RECEITA)
- Armazena: paymentProof, paymentMethod, paymentAmount
- Libera: Acesso à agenda para escolher data/hora
```

### 3. **Integração com Procedures**
```typescript
// Registro de procedimentos realizados
Procedure → Transaction
- Vincula valor do procedimento à transação
- Histórico de procedimentos por paciente
```

### 4. **Webhook de Pagamento (PIX/Cartão)**
```typescript
POST /api/financial/webhooks/payment-confirmation
{
  "transactionId": "uuid",
  "status": "paid",
  "paymentMethod": "pix",
  "amount": 1500.00,
  "paidAt": "2025-10-16T10:30:00Z",
  "proof": "base64_or_url"
}
```

---

## 🗄️ ESTRUTURA DE DADOS

### **1. Transactions (Transações Financeiras)**

```typescript
enum TransactionType {
  RECEITA = 'receita',           // Entrada
  DESPESA = 'despesa',           // Saída
  TRANSFERENCIA = 'transferencia' // Transferência entre contas
}

enum TransactionCategory {
  // RECEITAS
  PROCEDIMENTO = 'procedimento',
  CONSULTA = 'consulta',
  RETORNO = 'retorno',
  PRODUTO = 'produto',
  OUTROS_RECEITAS = 'outros_receitas',

  // DESPESAS
  SALARIO = 'salario',
  FORNECEDOR = 'fornecedor',
  ALUGUEL = 'aluguel',
  ENERGIA = 'energia',
  AGUA = 'agua',
  INTERNET = 'internet',
  MARKETING = 'marketing',
  MATERIAL_ESCRITORIO = 'material_escritorio',
  MATERIAL_MEDICO = 'material_medico',
  IMPOSTOS = 'impostos',
  MANUTENCAO = 'manutencao',
  OUTROS_DESPESAS = 'outros_despesas'
}

enum PaymentMethod {
  PIX = 'pix',
  DINHEIRO = 'dinheiro',
  CARTAO_CREDITO = 'cartao_credito',
  CARTAO_DEBITO = 'cartao_debito',
  LINK_PAGAMENTO = 'link_pagamento',
  TRANSFERENCIA_BANCARIA = 'transferencia_bancaria',
  BOLETO = 'boleto',
  CHEQUE = 'cheque'
}

enum TransactionStatus {
  PENDENTE = 'pendente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  ESTORNADA = 'estornada'
}

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionCategory })
  category: TransactionCategory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDENTE })
  status: TransactionStatus;

  // Relacionamentos
  @Column({ type: 'varchar', nullable: true })
  leadId: string;

  @Column({ type: 'varchar', nullable: true })
  appointmentId: string;

  @Column({ type: 'varchar', nullable: true })
  procedureId: string;

  @Column({ type: 'varchar', nullable: true })
  supplierId: string; // ID do fornecedor

  // Datas
  @Column({ type: 'date' })
  dueDate: Date; // Data de vencimento

  @Column({ type: 'date', nullable: true })
  paymentDate: Date; // Data de pagamento efetivo

  @Column({ type: 'date' })
  referenceDate: Date; // Data de competência

  // Comprovantes e anexos
  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    type: 'nf' | 'recibo' | 'comprovante' | 'outro';
    filename: string;
    url: string;
    uploadedAt: Date;
  }>;

  // Observações
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Parcelamento
  @Column({ type: 'boolean', default: false })
  isInstallment: boolean;

  @Column({ type: 'int', nullable: true })
  installmentNumber: number; // Ex: 1, 2, 3...

  @Column({ type: 'int', nullable: true })
  totalInstallments: number; // Ex: 12x

  @Column({ type: 'varchar', nullable: true })
  parentTransactionId: string; // ID da transação pai (se parcelado)

  // Recorrência
  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'varchar', nullable: true })
  recurringFrequency: string; // 'monthly', 'quarterly', 'yearly'

  @Column({ type: 'varchar', nullable: true })
  recurringGroupId: string; // Agrupa transações recorrentes

  // Tenant e auditoria
  @Column({ type: 'varchar' })
  tenantId: string;

  @Column({ type: 'varchar', nullable: true })
  createdById: string;

  @Column({ type: 'varchar', nullable: true })
  approvedById: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### **2. Suppliers (Fornecedores)**

```typescript
@Entity('suppliers')
class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 18, nullable: true })
  cnpj: string;

  @Column({ type: 'varchar', length: 14, nullable: true })
  cpf: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  state: string;

  @Column({ type: 'varchar', nullable: true })
  zipCode: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar' })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### **3. Invoices (Recibos/Notas)**

```typescript
enum InvoiceType {
  RECIBO = 'recibo',
  NOTA_FISCAL = 'nota_fiscal',
  NOTA_SERVICO = 'nota_servico'
}

@Entity('invoices')
class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  invoiceNumber: string; // Número sequencial

  @Column({ type: 'enum', enum: InvoiceType })
  type: InvoiceType;

  @Column({ type: 'varchar' })
  transactionId: string;

  @Column({ type: 'varchar', nullable: true })
  leadId: string; // Cliente

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'varchar', nullable: true })
  pdfUrl: string; // URL do PDF gerado

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Dados adicionais

  @Column({ type: 'varchar' })
  tenantId: string;

  @Column({ type: 'varchar', nullable: true })
  issuedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### **4. Cash Flow (Fluxo de Caixa)**

```typescript
@Entity('cash_flow')
class CashFlow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  openingBalance: number; // Saldo inicial

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalIncome: number; // Total de entradas

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalExpense: number; // Total de saídas

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  closingBalance: number; // Saldo final

  @Column({ type: 'varchar' })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### **5. Purchase Orders (Compras/Pedidos)**

```typescript
enum PurchaseOrderStatus {
  ORCAMENTO = 'orcamento',
  APROVADO = 'aprovado',
  PEDIDO_REALIZADO = 'pedido_realizado',
  RECEBIDO = 'recebido',
  CANCELADO = 'cancelado'
}

@Entity('purchase_orders')
class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  orderNumber: string;

  @Column({ type: 'varchar' })
  supplierId: string;

  @Column({ type: 'enum', enum: PurchaseOrderStatus, default: PurchaseOrderStatus.ORCAMENTO })
  status: PurchaseOrderStatus;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  receivedDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'jsonb' })
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    type: 'nf' | 'orcamento' | 'outro';
    filename: string;
    url: string;
  }>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar' })
  tenantId: string;

  @Column({ type: 'varchar', nullable: true })
  createdById: string;

  @Column({ type: 'varchar', nullable: true })
  approvedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## ⚙️ FUNCIONALIDADES

### 📊 **1. Dashboard Financeiro**

**Componentes:**
- Saldo atual do caixa
- Receitas do mês (gráfico)
- Despesas do mês (gráfico)
- Contas a receber (próximos 30 dias)
- Contas a pagar (próximos 30 dias)
- Lucro/Prejuízo do mês
- Comparativo mês anterior
- Top 5 categorias de despesas
- Top 5 procedimentos mais lucrativos

### 💰 **2. Controle de Caixa**

**Funcionalidades:**
- Abrir caixa (saldo inicial)
- Registrar entrada/saída
- Fechar caixa (saldo final)
- Histórico de movimentações
- Sangria (retirada de dinheiro)
- Reforço (adição de dinheiro)
- Conciliação bancária

### 📥 **3. Contas a Receber**

**Funcionalidades:**
- Listar recebimentos pendentes
- Filtrar por data, cliente, status
- Marcar como recebido
- Enviar link de pagamento
- Registro de parcelamentos
- Histórico de recebimentos

### 📤 **4. Contas a Pagar**

**Funcionalidades:**
- Listar pagamentos pendentes
- Filtrar por data, fornecedor, categoria
- Marcar como pago
- Agendar pagamentos recorrentes
- Anexar comprovantes
- Histórico de pagamentos

### 🧾 **5. Emissão de Recibos**

**Funcionalidades:**
- Gerar recibo automaticamente após pagamento
- Numeração sequencial
- PDF com logo da clínica
- Envio automático por email/WhatsApp
- Reimprimir recibos
- Histórico de recibos emitidos

### 📦 **6. Gestão de Compras**

**Funcionalidades:**
- Cadastro de fornecedores
- Criar ordem de compra
- Anexar orçamentos
- Anexar notas fiscais
- Controle de recebimento
- Histórico de compras por fornecedor

### 📈 **7. Relatórios Financeiros**

**Relatórios Disponíveis:**
- DRE (Demonstrativo de Resultado)
- Fluxo de Caixa (Realizado e Projetado)
- Análise por Categoria
- Análise por Procedimento
- Análise por Profissional
- Comparativo de Períodos
- Inadimplência
- Exportação (PDF, Excel)

---

## 🔄 FLUXOS DE PROCESSO

### **Fluxo 1: Pagamento de Agendamento**

```mermaid
Lead Criado
   ↓
Vendedor envia Link de Pagamento
   ↓
Cliente escolhe forma (PIX/Cartão/Débito)
   ↓
Webhook recebe confirmação
   ↓
Sistema cria Transaction (RECEITA)
   ↓
Appointment.paymentStatus → PAGO
   ↓
Appointment.status → PAGAMENTO_CONFIRMADO
   ↓
Libera Agenda para escolher data/hora
   ↓
Gera Recibo automaticamente
   ↓
Envia Recibo para cliente (Email/WhatsApp)
   ↓
Atualiza Lead.status → WON
```

### **Fluxo 2: Registro de Despesa**

```mermaid
Usuário acessa "Contas a Pagar"
   ↓
Clica em "Nova Despesa"
   ↓
Preenche: categoria, valor, fornecedor, vencimento
   ↓
Anexa NF (se houver)
   ↓
Salva como PENDENTE
   ↓
No vencimento: notificação automática
   ↓
Usuário marca como PAGA
   ↓
Anexa comprovante
   ↓
Transaction criada (DESPESA)
   ↓
Atualiza Fluxo de Caixa
```

### **Fluxo 3: Compra de Produtos**

```mermaid
Usuário acessa "Compras"
   ↓
Cria Ordem de Compra
   ↓
Seleciona Fornecedor
   ↓
Adiciona itens (descrição, qtd, valor)
   ↓
Anexa Orçamento
   ↓
Status: ORÇAMENTO
   ↓
Aprovação
   ↓
Status: APROVADO → PEDIDO_REALIZADO
   ↓
Produto é entregue
   ↓
Usuário marca como RECEBIDO
   ↓
Anexa Nota Fiscal
   ↓
Cria Transaction (DESPESA)
   ↓
Integra com Estoque (se aplicável)
```

---

## 🌐 API ENDPOINTS

### **Transactions**
```
POST   /api/financial/transactions              - Criar transação
GET    /api/financial/transactions              - Listar transações
GET    /api/financial/transactions/:id          - Detalhes
PUT    /api/financial/transactions/:id          - Atualizar
DELETE /api/financial/transactions/:id          - Excluir
PATCH  /api/financial/transactions/:id/confirm  - Confirmar transação
PATCH  /api/financial/transactions/:id/cancel   - Cancelar transação
```

### **Suppliers**
```
POST   /api/financial/suppliers                 - Criar fornecedor
GET    /api/financial/suppliers                 - Listar fornecedores
GET    /api/financial/suppliers/:id             - Detalhes
PUT    /api/financial/suppliers/:id             - Atualizar
DELETE /api/financial/suppliers/:id             - Excluir
```

### **Invoices**
```
POST   /api/financial/invoices                  - Gerar recibo
GET    /api/financial/invoices                  - Listar recibos
GET    /api/financial/invoices/:id              - Detalhes
GET    /api/financial/invoices/:id/pdf          - Download PDF
POST   /api/financial/invoices/:id/send         - Enviar por email/WhatsApp
```

### **Purchase Orders**
```
POST   /api/financial/purchase-orders           - Criar ordem
GET    /api/financial/purchase-orders           - Listar ordens
GET    /api/financial/purchase-orders/:id       - Detalhes
PUT    /api/financial/purchase-orders/:id       - Atualizar
PATCH  /api/financial/purchase-orders/:id/approve - Aprovar
PATCH  /api/financial/purchase-orders/:id/receive - Marcar como recebido
```

### **Reports**
```
GET    /api/financial/reports/cash-flow         - Fluxo de caixa
GET    /api/financial/reports/dre               - DRE
GET    /api/financial/reports/by-category       - Por categoria
GET    /api/financial/reports/by-procedure      - Por procedimento
GET    /api/financial/reports/dashboard         - Dados do dashboard
```

### **Webhooks**
```
POST   /api/financial/webhooks/payment-confirmation  - Confirmação de pagamento
```

---

## 🎨 INTERFACE DO USUÁRIO

### **Página: /financeiro**

#### **Layout:**
```
┌─────────────────────────────────────────────────┐
│  💰 Financeiro                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Dashboard] [Caixa] [Receber] [Pagar]         │
│  [Compras] [Fornecedores] [Recibos] [Relatórios]│
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ Saldo Atual  │  │ Receitas Mês │            │
│  │  R$ 45.230   │  │  R$ 78.500   │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ Despesas Mês │  │ Lucro Mês    │            │
│  │  R$ 33.270   │  │  R$ 45.230   │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  📊 Gráfico Receitas vs Despesas (12 meses)    │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │     [Gráfico de barras/linhas]         │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  📋 Contas a Receber (Próximos 30 dias)        │
│  ┌─────────────────────────────────────────┐   │
│  │ Data  │ Cliente │ Valor   │ Status │ Ação│  │
│  │ 17/10 │ João S. │ R$ 1.500│ Pend. │ [✓] │  │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  📋 Contas a Pagar (Próximos 30 dias)          │
│  ┌─────────────────────────────────────────┐   │
│  │ Data  │ Fornec. │ Valor   │ Status │ Ação│  │
│  │ 20/10 │ Energia │ R$ 850  │ Pend. │ [✓] │  │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### **Componentes React a Criar:**

1. **FinanceiroPage.tsx** - Página principal
2. **FinancialDashboard.tsx** - Dashboard com cards e gráficos
3. **CaixaControl.tsx** - Controle de caixa
4. **TransactionList.tsx** - Lista de transações
5. **TransactionForm.tsx** - Formulário de transação
6. **ContasReceber.tsx** - Contas a receber
7. **ContasPagar.tsx** - Contas a pagar
8. **SupplierList.tsx** - Lista de fornecedores
9. **SupplierForm.tsx** - Formulário de fornecedor
10. **PurchaseOrderList.tsx** - Lista de ordens de compra
11. **PurchaseOrderForm.tsx** - Formulário de ordem
12. **InvoiceList.tsx** - Lista de recibos
13. **InvoiceGenerator.tsx** - Gerador de recibos
14. **ReportsPage.tsx** - Página de relatórios
15. **FinancialFilters.tsx** - Filtros avançados

---

## 🔐 REGRAS DE NEGÓCIO

### **1. Permissões**
- **Admin**: Acesso total
- **Gestor**: Acesso total exceto exclusão
- **Financeiro**: Acesso total ao módulo financeiro
- **Vendedor**: Apenas visualização de suas vendas
- **Recepcionista**: Apenas registrar recebimentos

### **2. Validações**
- Valor deve ser maior que zero
- Data de vencimento não pode ser anterior à data atual (para novos lançamentos)
- Transação confirmada não pode ser editada (apenas estornada)
- Recibo só pode ser gerado após confirmação de pagamento

### **3. Automações**
- Gerar transação automaticamente quando appointment.paymentStatus = PAGO
- Gerar recibo automaticamente após confirmação de pagamento
- Enviar notificação 3 dias antes do vencimento de contas a pagar
- Atualizar fluxo de caixa diariamente (cron job)
- Calcular saldo automaticamente

### **4. Integridade**
- Transação vinculada a appointment não pode ser excluída (apenas cancelada)
- Fornecedor com transações não pode ser excluído (apenas desativado)
- Número de recibo deve ser sequencial e único

---

## 📅 CRONOGRAMA DE IMPLEMENTAÇÃO

### **Fase 1: Backend Core** (Estimativa: 3-4 dias)
- [ ] Criar entidades (Transaction, Supplier, Invoice, PurchaseOrder, CashFlow)
- [ ] Criar migrations no banco de dados
- [ ] Implementar services e controllers
- [ ] Criar rotas da API
- [ ] Implementar validações
- [ ] Testes unitários

### **Fase 2: Integrações** (Estimativa: 2-3 dias)
- [ ] Webhook de confirmação de pagamento
- [ ] Integração com Appointments
- [ ] Integração com Leads
- [ ] Integração com Procedures
- [ ] Atualização automática de status

### **Fase 3: Frontend Core** (Estimativa: 4-5 dias)
- [ ] Criar página principal (FinanceiroPage)
- [ ] Dashboard financeiro
- [ ] Lista de transações
- [ ] Formulários (Transaction, Supplier, Purchase Order)
- [ ] Dark mode completo

### **Fase 4: Funcionalidades Avançadas** (Estimativa: 3-4 dias)
- [ ] Controle de caixa (abrir/fechar)
- [ ] Geração de recibos (PDF)
- [ ] Sistema de anexos (upload de NFs)
- [ ] Contas a receber/pagar
- [ ] Filtros avançados

### **Fase 5: Relatórios** (Estimativa: 3-4 dias)
- [ ] DRE
- [ ] Fluxo de Caixa
- [ ] Análise por categoria
- [ ] Análise por procedimento
- [ ] Exportação (PDF/Excel)
- [ ] Gráficos interativos

### **Fase 6: Testes e Deploy** (Estimativa: 2 dias)
- [ ] Testes integrados
- [ ] Ajustes e correções
- [ ] Documentação
- [ ] Build e deploy
- [ ] Backup do banco

**TOTAL ESTIMADO: 17-22 dias de desenvolvimento**

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Analisar estrutura atual do sistema
2. ✅ Verificar banco de dados existente
3. ✅ Criar especificação técnica
4. ⏳ Criar entidades (models)
5. ⏳ Criar migrations
6. ⏳ Implementar services
7. ⏳ Implementar controllers
8. ⏳ Criar rotas
9. ⏳ Implementar frontend

---

**Documento criado por:** Claude Code
**Última atualização:** 16/10/2025 - 19:45 UTC
