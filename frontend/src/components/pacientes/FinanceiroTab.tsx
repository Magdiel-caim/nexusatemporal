import { DollarSign, Plus, AlertCircle, Calendar, CreditCard, TrendingUp, TrendingDown, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import pacienteService from '../../services/pacienteService';
import toast from 'react-hot-toast';

interface FinanceiroTabProps {
  patientId: string;
}

interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  status: string;
  paymentMethod?: string;
  dueDate: string;
  paymentDate?: string;
  createdAt: string;
}

interface Summary {
  total: number;
  paid: number;
  pending: number;
}

export default function FinanceiroTab({ patientId }: FinanceiroTabProps) {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, paid: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [patientId]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await pacienteService.getTransactions(patientId);
      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch (error: any) {
      console.error('Erro ao carregar transações:', error);
      if (error.response?.status !== 404) {
        toast.error('Erro ao carregar transações');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransaction = () => {
    navigate('/financeiro', {
      state: {
        patientId: patientId,
      },
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pendente: 'Pendente',
      pago: 'Pago',
      atrasado: 'Atrasado',
      cancelado: 'Cancelado',
      reembolsado: 'Reembolsado',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      pago: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      atrasado: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      cancelado: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      reembolsado: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    return type === 'receita' ? 'Receita' : 'Despesa';
  };

  const getTypeIcon = (type: string) => {
    return type === 'receita' ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return '-';
    const methodMap: Record<string, string> = {
      dinheiro: 'Dinheiro',
      pix: 'PIX',
      credito: 'Crédito',
      debito: 'Débito',
      boleto: 'Boleto',
      transferencia: 'Transferência',
    };
    return methodMap[method] || method;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Financeiro
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Histórico de transações financeiras do paciente
          </p>
        </div>

        <button
          onClick={handleNewTransaction}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Transação
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Summary Cards */}
      {!loading && transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(summary.total)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pago</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(summary.paid)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pendente</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {formatCurrency(summary.pending)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      {!loading && transactions.length > 0 && (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/financeiro`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    {getTypeIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {transaction.description}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getTypeLabel(transaction.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {transaction.category}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-xl font-bold ${
                    transaction.type === 'receita'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {getStatusLabel(transaction.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Venc: {formatDate(transaction.dueDate)}</span>
                </div>

                {transaction.paymentDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Pago: {formatDate(transaction.paymentDate)}</span>
                  </div>
                )}

                {transaction.paymentMethod && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>{getPaymentMethodLabel(transaction.paymentMethod)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Integração com Módulo Financeiro
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  Esta seção exibe automaticamente as transações financeiras do paciente. Para criar uma nova transação:
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 ml-4 list-disc">
                  <li>Clique no botão "Nova Transação" acima</li>
                  <li>Acesse o módulo Financeiro diretamente no menu</li>
                  <li>Associe a transação a este paciente</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Summary Cards - Zerado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    R$ 0,00
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pago</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    R$ 0,00
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendente</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    R$ 0,00
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Nenhuma transação encontrada
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              As transações aparecerão aqui automaticamente quando criadas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
