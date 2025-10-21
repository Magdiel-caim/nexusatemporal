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
    dueDate: Date;
    paymentDate?: Date;
    referenceDate: Date;
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
      dateFrom?: Date;
      dateTo?: Date;
      dueDateFrom?: Date;
      dueDateTo?: Date;
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
      paymentDate: Date;
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
    firstDueDate: Date;
    leadId?: string;
    appointmentId?: string;
    procedureId?: string;
    supplierId?: string;
    referenceDate: Date;
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
      const dueDate = new Date(data.firstDueDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));

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
    dateFrom: Date,
    dateTo: Date
  ) {
    const transactions = await this.getTransactionsByTenant(tenantId, {
      dateFrom,
      dateTo,
      status: TransactionStatus.CONFIRMADA,
    });

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.RECEITA)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.DESPESA)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    const byCategory = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const byPaymentMethod = transactions.reduce((acc, t) => {
      if (t.paymentMethod) {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + Number(t.amount);
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

  async getAccountsReceivable(tenantId: string, dateLimit?: Date) {
    const limit = dateLimit || new Date();
    limit.setDate(limit.getDate() + 30); // Próximos 30 dias por padrão

    return this.getTransactionsByTenant(tenantId, {
      type: TransactionType.RECEITA,
      status: TransactionStatus.PENDENTE,
      dueDateTo: limit,
    });
  }

  async getAccountsPayable(tenantId: string, dateLimit?: Date) {
    const limit = dateLimit || new Date();
    limit.setDate(limit.getDate() + 30); // Próximos 30 dias por padrão

    return this.getTransactionsByTenant(tenantId, {
      type: TransactionType.DESPESA,
      status: TransactionStatus.PENDENTE,
      dueDateTo: limit,
    });
  }

  async getOverdueTransactions(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.tenantId = :tenantId', { tenantId })
      .andWhere('transaction.status = :status', {
        status: TransactionStatus.PENDENTE,
      })
      .andWhere('transaction.dueDate < :today', { today })
      .leftJoinAndSelect('transaction.lead', 'lead')
      .leftJoinAndSelect('transaction.supplier', 'supplier')
      .orderBy('transaction.dueDate', 'ASC');

    return query.getMany();
  }

  async getCashFlow(tenantId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

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
      const dateKey = t.paymentDate!.toISOString().split('T')[0];

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
