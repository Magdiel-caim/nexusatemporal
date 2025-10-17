import { useState, useEffect } from 'react';
import { financialService, Transaction, Supplier, Invoice } from '@/services/financialService';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import TransactionList from '../components/financeiro/TransactionList';
import TransactionForm from '../components/financeiro/TransactionForm';
import SupplierList from '../components/financeiro/SupplierList';
import SupplierForm from '../components/financeiro/SupplierForm';
import InvoiceList from '../components/financeiro/InvoiceList';
import InvoiceForm from '../components/financeiro/InvoiceForm';
import CashFlowView from '../components/financeiro/CashFlowView';
import PurchaseOrderView from '../components/financeiro/PurchaseOrderView';
import FinancialReports from '../components/financeiro/FinancialReports';

interface FinancialStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  accountsReceivable: number;
  accountsPayable: number;
  overdueCount: number;
}

type ActiveTab = 'dashboard' | 'transactions' | 'suppliers' | 'invoices' | 'cash-flow' | 'purchase-orders' | 'reports';

export default function FinanceiroPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [stats, setStats] = useState<FinancialStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    accountsReceivable: 0,
    accountsPayable: 0,
    overdueCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [accountsReceivable, setAccountsReceivable] = useState<Transaction[]>([]);
  const [accountsPayable, setAccountsPayable] = useState<Transaction[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const [
        monthStats,
        transactions,
        receivable,
        payable,
        overdue,
      ] = await Promise.all([
        financialService.getTransactionStats(
          firstDayOfMonth.toISOString().split('T')[0],
          lastDayOfMonth.toISOString().split('T')[0]
        ),
        financialService.getTransactions({
          status: 'confirmada',
          dateFrom: firstDayOfMonth.toISOString().split('T')[0],
          dateTo: lastDayOfMonth.toISOString().split('T')[0],
        }),
        financialService.getAccountsReceivable(),
        financialService.getAccountsPayable(),
        financialService.getOverdueTransactions(),
      ]);

      setStats({
        totalIncome: monthStats.totalIncome || 0,
        totalExpense: monthStats.totalExpense || 0,
        balance: monthStats.balance || 0,
        accountsReceivable: receivable.reduce((sum, t) => sum + Number(t.amount), 0),
        accountsPayable: payable.reduce((sum, t) => sum + Number(t.amount), 0),
        overdueCount: overdue.length,
      });

      setRecentTransactions(transactions.slice(0, 10));
      setAccountsReceivable(receivable.slice(0, 5));
      setAccountsPayable(payable.slice(0, 5));

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'receita':
        return <ArrowUpCircle className="text-green-600" size={20} />;
      case 'despesa':
        return <ArrowDownCircle className="text-red-600" size={20} />;
      default:
        return <DollarSign className="text-gray-600" size={20} />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      procedimento: 'Procedimento',
      consulta: 'Consulta',
      retorno: 'Retorno',
      produto: 'Produto',
      salario: 'Salário',
      fornecedor: 'Fornecedor',
      aluguel: 'Aluguel',
      energia: 'Energia',
      agua: 'Água',
      internet: 'Internet',
      telefone: 'Telefone',
      marketing: 'Marketing',
      material_escritorio: 'Material de Escritório',
      material_medico: 'Material Médico',
      impostos: 'Impostos',
      manutencao: 'Manutenção',
      contabilidade: 'Contabilidade',
      software: 'Software',
      limpeza: 'Limpeza',
      seguranca: 'Segurança',
      outros_receitas: 'Outras Receitas',
      outros_despesas: 'Outras Despesas',
    };
    return labels[category] || category;
  };

  const handleCreateTransaction = () => {
    setSelectedTransaction(undefined);
    setShowTransactionForm(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleCloseTransactionForm = () => {
    setShowTransactionForm(false);
    setSelectedTransaction(undefined);
  };

  const handleTransactionSuccess = () => {
    loadFinancialData();
  };

  const handleCreateSupplier = () => {
    setSelectedSupplier(undefined);
    setShowSupplierForm(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierForm(true);
  };

  const handleCloseSupplierForm = () => {
    setShowSupplierForm(false);
    setSelectedSupplier(undefined);
  };

  const handleSupplierSuccess = () => {
    loadFinancialData();
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(undefined);
    setShowInvoiceForm(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleCloseInvoiceForm = () => {
    setShowInvoiceForm(false);
    setSelectedInvoice(undefined);
  };

  const handleInvoiceSuccess = () => {
    loadFinancialData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Financeiro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestão financeira completa da clínica
          </p>
        </div>
        <button onClick={handleCreateTransaction} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Nova Transação
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Transações
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'suppliers'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Fornecedores
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Recibos/NF
          </button>
          <button
            onClick={() => setActiveTab('cash-flow')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cash-flow'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Fluxo de Caixa
          </button>
          <button
            onClick={() => setActiveTab('purchase-orders')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'purchase-orders'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Ordens de Compra
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Relatórios
          </button>
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Receitas do Mês */}
            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Receitas do Mês
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.totalIncome)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            {/* Despesas do Mês */}
            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Despesas do Mês
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats.totalExpense)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                  <TrendingDown className="text-red-600" size={24} />
                </div>
              </div>
            </div>

            {/* Saldo do Mês */}
            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Saldo do Mês
                  </p>
                  <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.balance)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Receitas - Despesas
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Wallet className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            {/* Contas em Atraso */}
            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Contas em Atraso
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.overdueCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Transações vencidas
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <AlertCircle className="text-orange-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Contas a Receber e Pagar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contas a Receber */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ArrowUpCircle className="text-green-600" size={24} />
                  Contas a Receber
                </h2>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(stats.accountsReceivable)}
                </span>
              </div>
              <div className="space-y-3">
                {accountsReceivable.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CheckCircle className="mx-auto mb-2 text-green-600" size={40} />
                    <p>Nenhuma conta a receber</p>
                  </div>
                ) : (
                  accountsReceivable.map(transaction => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Vence em {formatDate(transaction.dueDate)}
                        </p>
                      </div>
                      <span className="font-bold text-green-600">
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Contas a Pagar */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ArrowDownCircle className="text-red-600" size={24} />
                  Contas a Pagar
                </h2>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(stats.accountsPayable)}
                </span>
              </div>
              <div className="space-y-3">
                {accountsPayable.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CheckCircle className="mx-auto mb-2 text-green-600" size={40} />
                    <p>Nenhuma conta a pagar</p>
                  </div>
                ) : (
                  accountsPayable.map(transaction => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Vence em {formatDate(transaction.dueDate)}
                        </p>
                      </div>
                      <span className="font-bold text-red-600">
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Transações Recentes */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Transações Recentes
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Nenhuma transação recente
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map(transaction => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.paymentDate || transaction.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {getCategoryLabel(transaction.category)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-bold ${
                            transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <TransactionList
          onEditTransaction={handleEditTransaction}
          onCreateTransaction={handleCreateTransaction}
        />
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <SupplierList
          onEditSupplier={handleEditSupplier}
          onCreateSupplier={handleCreateSupplier}
        />
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <InvoiceList
          onEditInvoice={handleEditInvoice}
          onCreateInvoice={handleCreateInvoice}
        />
      )}

      {/* Cash Flow Tab */}
      {activeTab === 'cash-flow' && <CashFlowView />}

      {/* Purchase Orders Tab */}
      {activeTab === 'purchase-orders' && <PurchaseOrderView />}

      {/* Reports Tab */}
      {activeTab === 'reports' && <FinancialReports />}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          transaction={selectedTransaction}
          onClose={handleCloseTransactionForm}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {/* Supplier Form Modal */}
      {showSupplierForm && (
        <SupplierForm
          supplier={selectedSupplier}
          onClose={handleCloseSupplierForm}
          onSuccess={handleSupplierSuccess}
        />
      )}

      {/* Invoice Form Modal */}
      {showInvoiceForm && (
        <InvoiceForm
          invoice={selectedInvoice}
          onClose={handleCloseInvoiceForm}
          onSuccess={handleInvoiceSuccess}
        />
      )}
    </div>
  );
}
