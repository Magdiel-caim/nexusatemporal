import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle,
  XCircle,
  RefreshCw,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight
} from 'lucide-react';
import { financialService, Transaction, TransactionType, TransactionStatus, PaymentMethod } from '../../services/financialService';
import { toast } from 'react-hot-toast';

interface TransactionListProps {
  onEditTransaction?: (transaction: Transaction) => void;
  onCreateTransaction?: () => void;
}

export default function TransactionList({ onEditTransaction, onCreateTransaction }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    type: '' as TransactionType | '',
    status: '' as TransactionStatus | '',
    category: '',
    paymentMethod: '' as PaymentMethod | '',
    search: '',
    dateFrom: '',
    dateTo: '',
    dueDateFrom: '',
    dueDateTo: '',
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await financialService.getTransactions({
        type: filters.type || undefined,
        status: filters.status || undefined,
        category: filters.category as any || undefined,
        paymentMethod: filters.paymentMethod || undefined,
        search: filters.search || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        dueDateFrom: filters.dueDateFrom || undefined,
        dueDateTo: filters.dueDateTo || undefined,
      });
      setTransactions(data);
    } catch (error: any) {
      toast.error('Erro ao carregar transações: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    loadTransactions();
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      status: '',
      category: '',
      paymentMethod: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      dueDateFrom: '',
      dueDateTo: '',
    });
    setTimeout(() => loadTransactions(), 100);
  };

  const handleConfirmTransaction = async (id: string) => {
    try {
      await financialService.confirmTransaction(id, {
        paymentDate: new Date().toISOString().split('T')[0],
      });
      toast.success('Transação confirmada com sucesso!');
      loadTransactions();
    } catch (error: any) {
      toast.error('Erro ao confirmar transação: ' + error.message);
    }
  };

  const handleCancelTransaction = async (id: string) => {
    const reason = prompt('Motivo do cancelamento:');
    if (!reason) return;

    try {
      await financialService.cancelTransaction(id, reason);
      toast.success('Transação cancelada com sucesso!');
      loadTransactions();
    } catch (error: any) {
      toast.error('Erro ao cancelar transação: ' + error.message);
    }
  };

  const handleReverseTransaction = async (id: string) => {
    const reason = prompt('Motivo do estorno:');
    if (!reason) return;

    try {
      await financialService.reverseTransaction(id, reason);
      toast.success('Transação estornada com sucesso!');
      loadTransactions();
    } catch (error: any) {
      toast.error('Erro ao estornar transação: ' + error.message);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      await financialService.deleteTransaction(id);
      toast.success('Transação excluída com sucesso!');
      loadTransactions();
    } catch (error: any) {
      toast.error('Erro ao excluir transação: ' + error.message);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'receita':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'despesa':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'transferencia':
        return <ArrowLeftRight className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const styles: Record<TransactionStatus, string> = {
      pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelada: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      estornada: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };

    const labels: Record<TransactionStatus, string> = {
      pendente: 'Pendente',
      confirmada: 'Confirmada',
      cancelada: 'Cancelada',
      estornada: 'Estornada',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTypeLabel = (type: TransactionType) => {
    const labels: Record<TransactionType, string> = {
      receita: 'Receita',
      despesa: 'Despesa',
      transferencia: 'Transferência',
    };
    return labels[type];
  };

  const exportTransactions = () => {
    // TODO: Implementar exportação
    toast.success('Exportação em desenvolvimento...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Transações
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {transactions.length} registro(s)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
          <button
            onClick={exportTransactions}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          {onCreateTransaction && (
            <button
              onClick={onCreateTransaction}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </button>
          )}
        </div>
      </div>

      {/* Painel de Filtros */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Descrição..."
                  className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="estornada">Estornada</option>
              </select>
            </div>

            {/* Método de Pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pagamento
              </label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="boleto">Boleto</option>
                <option value="transferencia">Transferência</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            {/* Data de Vencimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vencimento De
              </label>
              <input
                type="date"
                value={filters.dueDateFrom}
                onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vencimento Até
              </label>
              <input
                type="date"
                value={filters.dueDateTo}
                onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Data de Pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pagamento De
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pagamento Até
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botões de ação dos filtros */}
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Limpar
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Tabela de Transações */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Nenhuma transação encontrada
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {onCreateTransaction ? 'Comece criando uma nova transação.' : 'Ajuste os filtros para ver resultados.'}
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(transaction.type)}
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">
                          {getTypeLabel(transaction.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {transaction.description}
                      </div>
                      {transaction.lead && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Lead: {transaction.lead.fullName}
                        </div>
                      )}
                      {transaction.supplier && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Fornecedor: {transaction.supplier.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        transaction.type === 'receita'
                          ? 'text-green-600 dark:text-green-400'
                          : transaction.type === 'despesa'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                      {transaction.isInstallment && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.installmentNumber}/{transaction.totalInstallments}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(transaction.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.paymentDate ? formatDate(transaction.paymentDate) : '-'}
                      {transaction.paymentMethod && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {transaction.paymentMethod.replace('_', ' ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {transaction.status === 'pendente' && (
                          <>
                            <button
                              onClick={() => handleConfirmTransaction(transaction.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Confirmar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancelTransaction(transaction.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Cancelar"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            {onEditTransaction && (
                              <button
                                onClick={() => onEditTransaction(transaction)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {transaction.status === 'confirmada' && (
                          <button
                            onClick={() => handleReverseTransaction(transaction.id)}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                            title="Estornar"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rodapé com totais */}
      {transactions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Receitas</div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(
                  transactions
                    .filter(t => t.type === 'receita')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Despesas</div>
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(
                  transactions
                    .filter(t => t.type === 'despesa')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Saldo</div>
              <div className={`text-lg font-semibold ${
                transactions
                  .filter(t => t.type === 'receita')
                  .reduce((sum, t) => sum + t.amount, 0) -
                transactions
                  .filter(t => t.type === 'despesa')
                  .reduce((sum, t) => sum + t.amount, 0) >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(
                  transactions
                    .filter(t => t.type === 'receita')
                    .reduce((sum, t) => sum + t.amount, 0) -
                  transactions
                    .filter(t => t.type === 'despesa')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
