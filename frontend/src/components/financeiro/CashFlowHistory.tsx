import { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';
import { financialService, CashFlow } from '../../services/financialService';
import { toast } from 'react-hot-toast';

export default function CashFlowHistory() {
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    status: '',
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await financialService.getCashFlows({
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        isClosed: filters.status === 'fechado' ? true : filters.status === 'aberto' ? false : undefined,
      });
      setCashFlows(data);
    } catch (error: any) {
      toast.error('Erro ao carregar histórico: ' + error.message);
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

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (isClosed: boolean) => {
    if (isClosed) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
          Fechado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
        Aberto
      </span>
    );
  };

  const filteredCashFlows = cashFlows.filter(cf => {
    if (filters.search && !cf.date.includes(filters.search)) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Histórico de Caixas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredCashFlows.length} registro(s) encontrado(s)
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar Data
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="DD/MM/AAAA"
                  className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadHistory}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow List */}
      <div className="space-y-3">
        {filteredCashFlows.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Nenhum caixa encontrado
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Altere os filtros ou aguarde a abertura de novos caixas
            </p>
          </div>
        ) : (
          filteredCashFlows.map((cashFlow) => (
            <div
              key={cashFlow.id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDate(cashFlow.date)}
                    </h3>
                    {getStatusBadge(cashFlow.isClosed)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {/* Opening */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Abertura
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(cashFlow.openingBalance)}
                      </p>
                      {cashFlow.openedAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatTime(cashFlow.openedAt)} - {cashFlow.openedBy?.name || 'N/A'}
                        </p>
                      )}
                    </div>

                    {/* Closing */}
                    {cashFlow.isClosed && cashFlow.closingBalance !== null && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Fechamento
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(cashFlow.closingBalance)}
                        </p>
                        {cashFlow.closedAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatTime(cashFlow.closedAt)} - {cashFlow.closedBy?.name || 'N/A'}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Balance */}
                    {cashFlow.isClosed && cashFlow.closingBalance !== null && (
                      <div className={`p-3 rounded-lg ${
                        cashFlow.closingBalance >= cashFlow.openingBalance
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Saldo
                          </span>
                        </div>
                        <p className={`text-lg font-bold ${
                          cashFlow.closingBalance >= cashFlow.openingBalance
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {formatCurrency(cashFlow.closingBalance - cashFlow.openingBalance)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
