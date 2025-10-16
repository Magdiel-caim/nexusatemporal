import api from './api';

// ==============================================
// TYPES & INTERFACES
// ==============================================

export type TransactionType = 'receita' | 'despesa' | 'transferencia';

export type TransactionCategory =
  | 'procedimento'
  | 'consulta'
  | 'retorno'
  | 'produto'
  | 'outros_receitas'
  | 'salario'
  | 'fornecedor'
  | 'aluguel'
  | 'energia'
  | 'agua'
  | 'internet'
  | 'telefone'
  | 'marketing'
  | 'material_escritorio'
  | 'material_medico'
  | 'impostos'
  | 'manutencao'
  | 'contabilidade'
  | 'software'
  | 'limpeza'
  | 'seguranca'
  | 'outros_despesas';

export type PaymentMethod =
  | 'pix'
  | 'dinheiro'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'link_pagamento'
  | 'transferencia_bancaria'
  | 'boleto'
  | 'cheque';

export type TransactionStatus = 'pendente' | 'confirmada' | 'cancelada' | 'estornada';

export type InvoiceType = 'recibo' | 'nota_fiscal' | 'nota_servico';
export type InvoiceStatus = 'rascunho' | 'emitida' | 'enviada' | 'cancelada';

export type PurchaseOrderStatus =
  | 'orcamento'
  | 'aprovado'
  | 'pedido_realizado'
  | 'em_transito'
  | 'recebido'
  | 'parcialmente_recebido'
  | 'cancelado';

export type PurchaseOrderPriority = 'baixa' | 'normal' | 'alta' | 'urgente';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  paymentMethod?: PaymentMethod;
  status: TransactionStatus;
  leadId?: string;
  lead?: any;
  appointmentId?: string;
  appointment?: any;
  procedureId?: string;
  procedure?: any;
  supplierId?: string;
  supplier?: Supplier;
  dueDate: string;
  paymentDate?: string;
  referenceDate: string;
  attachments?: any[];
  notes?: string;
  isInstallment: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  parentTransactionId?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  recurringGroupId?: string;
  tenantId: string;
  createdById?: string;
  createdBy?: any;
  approvedById?: string;
  approvedBy?: any;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  contactName?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  notes?: string;
  bankInfo?: {
    bankName?: string;
    agency?: string;
    account?: string;
    accountType?: string;
    pixKey?: string;
  };
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  transactionId: string;
  transaction?: Transaction;
  leadId?: string;
  lead?: any;
  amount: number;
  description?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  issueDate: string;
  dueDate?: string;
  pdfUrl?: string;
  metadata?: Record<string, any>;
  sentAt?: string;
  sentTo?: string;
  sentMethod?: string;
  tenantId: string;
  issuedById?: string;
  issuedBy?: any;
  canceledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier?: Supplier;
  status: PurchaseOrderStatus;
  priority: PurchaseOrderPriority;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  receivedDate?: string;
  totalAmount: number;
  shippingCost?: number;
  discount?: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    receivedQuantity?: number;
    sku?: string;
    category?: string;
  }>;
  attachments?: any[];
  notes?: string;
  shippingAddress?: string;
  trackingCode?: string;
  carrier?: string;
  nfeNumber?: string;
  nfeKey?: string;
  tenantId: string;
  createdById?: string;
  createdBy?: any;
  approvedById?: string;
  approvedBy?: any;
  approvedAt?: string;
  receivedById?: string;
  receivedBy?: any;
  canceledAt?: string;
  canceledById?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashFlow {
  id: string;
  date: string;
  type?: 'abertura' | 'fechamento' | 'sangria' | 'reforco';
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  closingBalance: number;
  cashAmount: number;
  pixAmount: number;
  creditCardAmount: number;
  debitCardAmount: number;
  transferAmount: number;
  otherAmount: number;
  withdrawals: number;
  deposits: number;
  notes?: string;
  isClosed: boolean;
  closedAt?: string;
  closedById?: string;
  closedBy?: any;
  tenantId: string;
  openedById?: string;
  openedBy?: any;
  openedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==============================================
// API SERVICE
// ==============================================

export const financialService = {
  // ==============================================
  // TRANSACTIONS
  // ==============================================
  async getTransactions(filters?: {
    type?: TransactionType;
    category?: TransactionCategory;
    status?: TransactionStatus;
    paymentMethod?: PaymentMethod;
    leadId?: string;
    appointmentId?: string;
    supplierId?: string;
    dateFrom?: string;
    dateTo?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    search?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<Transaction[]> {
    const { data } = await api.get('/financial/transactions', { params: filters });
    return data;
  },

  async getTransaction(id: string): Promise<Transaction> {
    const { data } = await api.get(`/financial/transactions/${id}`);
    return data;
  },

  async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    const { data } = await api.post('/financial/transactions', transactionData);
    return data;
  },

  async updateTransaction(id: string, transactionData: Partial<Transaction>): Promise<Transaction> {
    const { data } = await api.put(`/financial/transactions/${id}`, transactionData);
    return data;
  },

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/financial/transactions/${id}`);
  },

  async confirmTransaction(
    id: string,
    data: { paymentDate: string; paymentMethod?: PaymentMethod }
  ): Promise<Transaction> {
    const response = await api.patch(`/financial/transactions/${id}/confirm`, data);
    return response.data;
  },

  async cancelTransaction(id: string, reason?: string): Promise<Transaction> {
    const { data } = await api.patch(`/financial/transactions/${id}/cancel`, { reason });
    return data;
  },

  async reverseTransaction(id: string, reason: string): Promise<Transaction> {
    const { data } = await api.patch(`/financial/transactions/${id}/reverse`, { reason });
    return data;
  },

  async createInstallmentTransactions(installmentData: {
    type: TransactionType;
    category: TransactionCategory;
    totalAmount: number;
    description: string;
    paymentMethod?: PaymentMethod;
    totalInstallments: number;
    firstDueDate: string;
    leadId?: string;
    appointmentId?: string;
    procedureId?: string;
    supplierId?: string;
    referenceDate: string;
  }): Promise<Transaction[]> {
    const { data } = await api.post('/financial/transactions/installments', installmentData);
    return data;
  },

  async getTransactionStats(dateFrom: string, dateTo: string): Promise<any> {
    const { data } = await api.get('/financial/transactions/stats', {
      params: { dateFrom, dateTo },
    });
    return data;
  },

  async getAccountsReceivable(dateLimit?: string): Promise<Transaction[]> {
    const { data } = await api.get('/financial/transactions/accounts-receivable', {
      params: { dateLimit },
    });
    return data;
  },

  async getAccountsPayable(dateLimit?: string): Promise<Transaction[]> {
    const { data } = await api.get('/financial/transactions/accounts-payable', {
      params: { dateLimit },
    });
    return data;
  },

  async getOverdueTransactions(): Promise<Transaction[]> {
    const { data } = await api.get('/financial/transactions/overdue');
    return data;
  },

  async getCashFlow(month: number, year: number): Promise<any> {
    const { data } = await api.get('/financial/transactions/cash-flow', {
      params: { month, year },
    });
    return data;
  },

  // ==============================================
  // SUPPLIERS
  // ==============================================
  async getSuppliers(filters?: {
    search?: string;
    isActive?: boolean;
    city?: string;
    state?: string;
  }): Promise<Supplier[]> {
    const { data } = await api.get('/financial/suppliers', { params: filters });
    return data;
  },

  async getSupplier(id: string): Promise<Supplier> {
    const { data } = await api.get(`/financial/suppliers/${id}`);
    return data;
  },

  async createSupplier(supplierData: Partial<Supplier>): Promise<Supplier> {
    const { data } = await api.post('/financial/suppliers', supplierData);
    return data;
  },

  async updateSupplier(id: string, supplierData: Partial<Supplier>): Promise<Supplier> {
    const { data } = await api.put(`/financial/suppliers/${id}`, supplierData);
    return data;
  },

  async deleteSupplier(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/financial/suppliers/${id}`);
    return data;
  },

  async activateSupplier(id: string): Promise<Supplier> {
    const { data } = await api.patch(`/financial/suppliers/${id}/activate`);
    return data;
  },

  async deactivateSupplier(id: string): Promise<Supplier> {
    const { data } = await api.patch(`/financial/suppliers/${id}/deactivate`);
    return data;
  },

  async getSupplierStats(): Promise<any> {
    const { data } = await api.get('/financial/suppliers/stats');
    return data;
  },

  // ==============================================
  // INVOICES
  // ==============================================
  async getInvoices(filters?: {
    type?: InvoiceType;
    status?: InvoiceStatus;
    leadId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<Invoice[]> {
    const { data } = await api.get('/financial/invoices', { params: filters });
    return data;
  },

  async getInvoice(id: string): Promise<Invoice> {
    const { data } = await api.get(`/financial/invoices/${id}`);
    return data;
  },

  async getInvoiceByNumber(number: string): Promise<Invoice> {
    const { data } = await api.get(`/financial/invoices/number/${number}`);
    return data;
  },

  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    const { data } = await api.post('/financial/invoices', invoiceData);
    return data;
  },

  async updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<Invoice> {
    const { data } = await api.put(`/financial/invoices/${id}`, invoiceData);
    return data;
  },

  async cancelInvoice(id: string, reason: string): Promise<Invoice> {
    const { data } = await api.patch(`/financial/invoices/${id}/cancel`, { reason });
    return data;
  },

  async markInvoiceAsSent(id: string, sentData: { sentTo: string; sentMethod: string }): Promise<Invoice> {
    const { data } = await api.patch(`/financial/invoices/${id}/send`, sentData);
    return data;
  },

  async attachPdfToInvoice(id: string, pdfUrl: string): Promise<Invoice> {
    const { data } = await api.patch(`/financial/invoices/${id}/attach-pdf`, { pdfUrl });
    return data;
  },

  async getInvoiceStats(year?: number): Promise<any> {
    const { data } = await api.get('/financial/invoices/stats', {
      params: { year },
    });
    return data;
  },

  // ==============================================
  // PURCHASE ORDERS
  // ==============================================
  async getPurchaseOrders(filters?: {
    status?: PurchaseOrderStatus;
    priority?: PurchaseOrderPriority;
    supplierId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<PurchaseOrder[]> {
    const { data } = await api.get('/financial/purchase-orders', { params: filters });
    return data;
  },

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const { data } = await api.get(`/financial/purchase-orders/${id}`);
    return data;
  },

  async createPurchaseOrder(orderData: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const { data } = await api.post('/financial/purchase-orders', orderData);
    return data;
  },

  async updatePurchaseOrder(id: string, orderData: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const { data } = await api.put(`/financial/purchase-orders/${id}`, orderData);
    return data;
  },

  async approvePurchaseOrder(id: string): Promise<PurchaseOrder> {
    const { data } = await api.patch(`/financial/purchase-orders/${id}/approve`);
    return data;
  },

  async markPurchaseOrderAsSent(
    id: string,
    sendData: {
      trackingCode?: string;
      carrier?: string;
      expectedDeliveryDate?: string;
    }
  ): Promise<PurchaseOrder> {
    const { data } = await api.patch(`/financial/purchase-orders/${id}/send`, sendData);
    return data;
  },

  async markPurchaseOrderInTransit(id: string): Promise<PurchaseOrder> {
    const { data } = await api.patch(`/financial/purchase-orders/${id}/in-transit`);
    return data;
  },

  async receivePurchaseOrder(
    id: string,
    receiveData: {
      receivedDate?: string;
      actualDeliveryDate?: string;
      nfeNumber?: string;
      nfeKey?: string;
      items?: any[];
    }
  ): Promise<PurchaseOrder> {
    const { data } = await api.patch(`/financial/purchase-orders/${id}/receive`, receiveData);
    return data;
  },

  async cancelPurchaseOrder(id: string, cancelReason: string): Promise<PurchaseOrder> {
    const { data } = await api.patch(`/financial/purchase-orders/${id}/cancel`, { cancelReason });
    return data;
  },

  async addPurchaseOrderAttachment(
    id: string,
    attachment: {
      type: string;
      filename: string;
      url: string;
    }
  ): Promise<PurchaseOrder> {
    const { data } = await api.post(`/financial/purchase-orders/${id}/attachments`, attachment);
    return data;
  },

  async getPurchaseOrderStats(): Promise<any> {
    const { data } = await api.get('/financial/purchase-orders/stats');
    return data;
  },

  // ==============================================
  // CASH FLOW
  // ==============================================
  async getCashFlows(filters?: {
    dateFrom?: string;
    dateTo?: string;
    isClosed?: boolean;
  }): Promise<CashFlow[]> {
    const { data } = await api.get('/financial/cash-flow', { params: filters });
    return data;
  },

  async getCashFlowById(id: string): Promise<CashFlow> {
    const { data } = await api.get(`/financial/cash-flow/${id}`);
    return data;
  },

  async getCashFlowByDate(date: string): Promise<CashFlow> {
    const { data } = await api.get(`/financial/cash-flow/date/${date}`);
    return data;
  },

  async openCashFlow(cashFlowData: { date: string; openingBalance: number }): Promise<CashFlow> {
    const { data } = await api.post('/financial/cash-flow', cashFlowData);
    return data;
  },

  async closeCashFlow(
    id: string,
    closeData: {
      closingBalance: number;
      cashAmount: number;
      pixAmount: number;
      creditCardAmount: number;
      debitCardAmount: number;
      transferAmount: number;
      otherAmount: number;
      withdrawals?: number;
      deposits?: number;
      notes?: string;
    }
  ): Promise<CashFlow> {
    const { data } = await api.patch(`/financial/cash-flow/${id}/close`, closeData);
    return data;
  },

  async updateCashFlowFromTransactions(date: string): Promise<CashFlow> {
    const { data } = await api.patch(`/financial/cash-flow/${date}/update`);
    return data;
  },

  async recordWithdrawal(id: string, amount: number, notes?: string): Promise<CashFlow> {
    const { data } = await api.post(`/financial/cash-flow/${id}/withdrawal`, { amount, notes });
    return data;
  },

  async recordDeposit(id: string, amount: number, notes?: string): Promise<CashFlow> {
    const { data } = await api.post(`/financial/cash-flow/${id}/deposit`, { amount, notes });
    return data;
  },

  async getCashFlowSummary(month: number, year: number): Promise<any> {
    const { data } = await api.get('/financial/cash-flow/summary', {
      params: { month, year },
    });
    return data;
  },
};
