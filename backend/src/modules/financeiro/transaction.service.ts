import { CrmDataSource } from '@/database/data-source';
import {
  Transaction,
  TransactionType,
  TransactionCategory,
  TransactionStatus,
  PaymentMethod,
} from './transaction.entity';
import { Lead } from '../leads/lead.entity';
import { Appointment } from '../agenda/appointment.entity';
import { Between, Like, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

export class TransactionService {
  private transactionRepository = CrmDataSource.getRepository(Transaction);
  private leadRepository = CrmDataSource.getRepository(Lead);
  private appointmentRepository = CrmDataSource.getRepository(Appointment);

  async createTransaction(data: {
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    description: string;
    paymentMethod?: PaymentMethod;
    status?: TransactionStatus;
    leadId?: string;
    appointmentId?: string;
    procedureId?: string;
    supplierId?: string;
    dueDate: string;
    paymentDate?: string;
    referenceDate: string;
    attachments?: any[];
    notes?: string;
    isInstallment?: boolean;
    installmentNumber?: number;
    totalInstallments?: number;
    parentTransactionId?: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
    recurringGroupId?: string;
    tenantId: string;
    createdById: string;
  }) {
    const transaction = this.transactionRepository.create({
      ...data,
      status: data.status || TransactionStatus.PENDENTE,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    return this.getTransactionById(savedTransaction.id, data.tenantId);
  }

  async getTransactionsByTenant(
    tenantId: string,
    filters?: {
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
    }
  ) {
    const where: any = { tenantId };

    if (filters?.type) where.type = filters.type;
    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;
    if (filters?.paymentMethod) where.paymentMethod = filters.paymentMethod;
    if (filters?.leadId) where.leadId = filters.leadId;
    if (filters?.appointmentId) where.appointmentId = filters.appointmentId;
    if (filters?.supplierId) where.supplierId = filters.supplierId;

    if (filters?.dateFrom && filters?.dateTo) {
      where.paymentDate = Between(filters.dateFrom, filters.dateTo);
    }

    if (filters?.dueDateFrom && filters?.dueDateTo) {
      where.dueDate = Between(filters.dueDateFrom, filters.dueDateTo);
    }

    if (filters?.search) {
      where.description = Like(`%${filters.search}%`);
    }

    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .where(where)
      .leftJoinAndSelect('transaction.lead', 'lead')
      .leftJoinAndSelect('transaction.appointment', 'appointment')
      .leftJoinAndSelect('transaction.procedure', 'procedure')
      .leftJoinAndSelect('transaction.supplier', 'supplier')
      .leftJoinAndSelect('transaction.createdBy', 'createdBy')
      .leftJoinAndSelect('transaction.approvedBy', 'approvedBy');

    if (filters?.minAmount !== undefined) {
      query.andWhere('transaction.amount >= :minAmount', {
        minAmount: filters.minAmount,
      });
    }

    if (filters?.maxAmount !== undefined) {
      query.andWhere('transaction.amount <= :maxAmount', {
        maxAmount: filters.maxAmount,
      });
    }

    query.orderBy('transaction.dueDate', 'DESC');

    return query.getMany();
  }

  async getTransactionById(id: string, tenantId: string) {
    return this.transactionRepository.findOne({
      where: { id, tenantId },
      relations: [
        'lead',
        'appointment',
        'procedure',
        'supplier',
        'createdBy',
        'approvedBy',
      ],
    });
  }

  async updateTransaction(
    id: string,
    tenantId: string,
    data: Partial<Transaction>,
    userId: string
  ) {
    const transaction = await this.transactionRepository.findOne({
      where: { id, tenantId },
    });

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    // Não permitir edição de transação confirmada (apenas estornar)
    if (
      transaction.status === TransactionStatus.CONFIRMADA &&
      data.status !== TransactionStatus.ESTORNADA
    ) {
      throw new Error(
        'Transação confirmada não pode ser editada. Use a opção de estorno.'
      );
    }

    await this.transactionRepository.update({ id, tenantId }, data);
    return this.getTransactionById(id, tenantId);
  }

  async confirmTransaction(
    id: string,
    tenantId: string,
    data: {
      paymentDate: string;
      paymentMethod?: PaymentMethod;
      approvedById: string;
    }
  ) {
    const transaction = await this.getTransactionById(id, tenantId);

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    if (transaction.status === TransactionStatus.CONFIRMADA) {
      throw new Error('Transação já confirmada');
    }

    // Keep paymentDate as string - no timezone conversion
    await this.transactionRepository.update(
      { id, tenantId },
      {
        status: TransactionStatus.CONFIRMADA,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod || transaction.paymentMethod,
        approvedById: data.approvedById,
        approvedAt: new Date(),
      }
    );

    return this.getTransactionById(id, tenantId);
  }

  async cancelTransaction(
    id: string,
    tenantId: string,
    userId: string,
    reason?: string
  ) {
    const transaction = await this.getTransactionById(id, tenantId);

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    if (transaction.status === TransactionStatus.CONFIRMADA) {
      throw new Error(
        'Transação confirmada não pode ser cancelada. Use a opção de estorno.'
      );
    }

    await this.transactionRepository.update(
      { id, tenantId },
      {
        status: TransactionStatus.CANCELADA,
        notes: reason
          ? `${transaction.notes || ''}\n\nMotivo do cancelamento: ${reason}`
          : transaction.notes,
      }
    );

    return this.getTransactionById(id, tenantId);
  }

  async reverseTransaction(
    id: string,
    tenantId: string,
    userId: string,
    reason: string
  ) {
    const transaction = await this.getTransactionById(id, tenantId);

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    if (transaction.status !== TransactionStatus.CONFIRMADA) {
      throw new Error('Apenas transações confirmadas podem ser estornadas');
    }

    await this.transactionRepository.update(
      { id, tenantId },
      {
        status: TransactionStatus.ESTORNADA,
        notes: `${transaction.notes || ''}\n\nMotivo do estorno: ${reason}`,
      }
    );

    return this.getTransactionById(id, tenantId);
  }

  async deleteTransaction(id: string, tenantId: string) {
    const transaction = await this.getTransactionById(id, tenantId);

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    if (transaction.status === TransactionStatus.CONFIRMADA) {
      throw new Error(
        'Transação confirmada não pode ser excluída. Use a opção de estorno.'
      );
    }

    // Soft delete (cancelar ao invés de excluir)
    await this.transactionRepository.update(
      { id, tenantId },
      {
        status: TransactionStatus.CANCELADA,
        notes: `${transaction.notes || ''}\n\nTransação excluída`,
      }
    );

    return { success: true };
  }

  async createInstallmentTransactions(data: {
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
    tenantId: string;
    createdById: string;
  }) {
    const installmentAmount = data.totalAmount / data.totalInstallments;
    const transactions: Transaction[] = [];

    const parentTransaction = await this.createTransaction({
      type: data.type,
      category: data.category,
      amount: data.totalAmount,
      description: `${data.description} (Total ${data.totalInstallments}x)`,
      paymentMethod: data.paymentMethod,
      status: TransactionStatus.CONFIRMADA,
      leadId: data.leadId,
      appointmentId: data.appointmentId,
      procedureId: data.procedureId,
      supplierId: data.supplierId,
      dueDate: data.firstDueDate,
      referenceDate: data.referenceDate,
      isInstallment: true,
      totalInstallments: data.totalInstallments,
      tenantId: data.tenantId,
      createdById: data.createdById,
    });

    if (!parentTransaction) {
      throw new Error('Erro ao criar transação pai do parcelamento');
    }

    for (let i = 1; i <= data.totalInstallments; i++) {
      // Calculate dueDate as string (no timezone issues)
      const [year, month, day] = data.firstDueDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      date.setMonth(date.getMonth() + (i - 1));

      const newYear = date.getFullYear();
      const newMonth = String(date.getMonth() + 1).padStart(2, '0');
      const newDay = String(date.getDate()).padStart(2, '0');
      const dueDate = `${newYear}-${newMonth}-${newDay}`;

      const transaction = await this.createTransaction({
        type: data.type,
        category: data.category,
        amount: installmentAmount,
        description: `${data.description} (${i}/${data.totalInstallments})`,
        paymentMethod: data.paymentMethod,
        status: TransactionStatus.PENDENTE,
        leadId: data.leadId,
        appointmentId: data.appointmentId,
        procedureId: data.procedureId,
        supplierId: data.supplierId,
        dueDate,
        referenceDate: data.referenceDate,
        isInstallment: true,
        installmentNumber: i,
        totalInstallments: data.totalInstallments,
        parentTransactionId: parentTransaction.id,
        tenantId: data.tenantId,
        createdById: data.createdById,
      });

      if (transaction) {
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  // Analytics and Reports
  async getTransactionStats(
    tenantId: string,
    dateFrom: string,
    dateTo: string
  ) {
    const transactions = await this.getTransactionsByTenant(tenantId, {
      dateFrom,
      dateTo,
      status: TransactionStatus.CONFIRMADA,
    });

    // Helper para garantir valor numérico válido
    const safeAmount = (amount: any): number => {
      const num = Number(amount);
      return isNaN(num) ? 0 : num;
    };

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.RECEITA)
      .reduce((sum, t) => sum + safeAmount(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.DESPESA)
      .reduce((sum, t) => sum + safeAmount(t.amount), 0);

    const balance = totalIncome - totalExpense;

    const byCategory = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + safeAmount(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const byPaymentMethod = transactions.reduce((acc, t) => {
      if (t.paymentMethod) {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + safeAmount(t.amount);
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length,
      byCategory,
      byPaymentMethod,
    };
  }

  async getAccountsReceivable(tenantId: string, dateLimit?: string) {
    let limit: string;
    if (dateLimit) {
      limit = dateLimit;
    } else {
      // Próximos 30 dias por padrão
      const date = new Date();
      date.setDate(date.getDate() + 30);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      limit = `${year}-${month}-${day}`;
    }

    return this.getTransactionsByTenant(tenantId, {
      type: TransactionType.RECEITA,
      status: TransactionStatus.PENDENTE,
      dueDateTo: limit,
    });
  }

  async getAccountsPayable(tenantId: string, dateLimit?: string) {
    let limit: string;
    if (dateLimit) {
      limit = dateLimit;
    } else {
      // Próximos 30 dias por padrão
      const date = new Date();
      date.setDate(date.getDate() + 30);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      limit = `${year}-${month}-${day}`;
    }

    return this.getTransactionsByTenant(tenantId, {
      type: TransactionType.DESPESA,
      status: TransactionStatus.PENDENTE,
      dueDateTo: limit,
    });
  }

  async getOverdueTransactions(tenantId: string) {
    // Get today as YYYY-MM-DD string (no timezone issues)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.tenantId = :tenantId', { tenantId })
      .andWhere('transaction.status = :status', {
        status: TransactionStatus.PENDENTE,
      })
      .andWhere('transaction.dueDate < :today', { today: todayString })
      .leftJoinAndSelect('transaction.lead', 'lead')
      .leftJoinAndSelect('transaction.supplier', 'supplier')
      .orderBy('transaction.dueDate', 'ASC');

    return query.getMany();
  }

  async getCashFlow(tenantId: string, month: number, year: number) {
    // Create start and end dates as strings (YYYY-MM-DD)
    const startDay = '01';
    const lastDay = new Date(year, month, 0).getDate(); // Last day of month
    const monthStr = String(month).padStart(2, '0');
    const lastDayStr = String(lastDay).padStart(2, '0');

    const startDate = `${year}-${monthStr}-${startDay}`;
    const endDate = `${year}-${monthStr}-${lastDayStr}`;

    const transactions = await this.getTransactionsByTenant(tenantId, {
      dateFrom: startDate,
      dateTo: endDate,
      status: TransactionStatus.CONFIRMADA,
    });

    const dailyFlow: Record<
      string,
      { income: number; expense: number; balance: number }
    > = {};

    for (const t of transactions) {
      // paymentDate is already a string in YYYY-MM-DD format
      const dateKey = t.paymentDate!.split('T')[0];

      if (!dailyFlow[dateKey]) {
        dailyFlow[dateKey] = { income: 0, expense: 0, balance: 0 };
      }

      if (t.type === TransactionType.RECEITA) {
        dailyFlow[dateKey].income += Number(t.amount);
      } else if (t.type === TransactionType.DESPESA) {
        dailyFlow[dateKey].expense += Number(t.amount);
      }

      dailyFlow[dateKey].balance =
        dailyFlow[dateKey].income - dailyFlow[dateKey].expense;
    }

    return dailyFlow;
  }
}
