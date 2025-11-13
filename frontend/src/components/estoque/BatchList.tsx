import { useState, useEffect } from 'react';
import { stockService, StockBatch, BatchStatus } from '@/services/stockService';
import { Package, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface BatchListProps {
  productId?: string;
  refreshKey?: number;
}

export default function BatchList({ productId, refreshKey = 0 }: BatchListProps) {
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadBatches();
  }, [productId, refreshKey, statusFilter]);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const filters: any = {
        limit: 100,
      };

      if (productId) {
        filters.productId = productId;
      }

      if (statusFilter) {
        filters.status = statusFilter;
      }

      const response = await stockService.getBatches(filters);
      setBatches(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar lotes:', error);
      toast.error('Erro ao carregar lotes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (batch: StockBatch) => {
    const statusConfig = {
      [BatchStatus.ACTIVE]: {
        icon: CheckCircle,
        text: 'Ativo',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      },
      [BatchStatus.EXPIRING_SOON]: {
        icon: AlertTriangle,
        text: 'Vencendo',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      },
      [BatchStatus.EXPIRED]: {
        icon: XCircle,
        text: 'Vencido',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      },
      [BatchStatus.DEPLETED]: {
        icon: Clock,
        text: 'Esgotado',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      },
    };

    const config = statusConfig[batch.status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="h-3.5 w-3.5 mr-1" />
        {config.text}
      </span>
    );
  };

  const getDaysUntilExpiration = (expirationDate: string): number => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtrar por Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
          >
            <option value="">Todos</option>
            <option value="active">Ativo</option>
            <option value="expiring_soon">Vencendo</option>
            <option value="expired">Vencido</option>
            <option value="depleted">Esgotado</option>
          </select>
        </div>
      </div>

      {/* Lista de Lotes */}
      {batches.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum lote encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {productId
              ? 'Não há lotes cadastrados para este produto.'
              : 'Não há lotes cadastrados no sistema.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Lote
                  </th>
                  {!productId && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Produto
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Validade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Dias p/ Vencer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Localização
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {batches.map((batch) => {
                  const daysUntil = getDaysUntilExpiration(batch.expirationDate);

                  return (
                    <tr key={batch.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {batch.batchNumber}
                        </div>
                        {batch.manufacturerBatchNumber && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Fabricante: {batch.manufacturerBatchNumber}
                          </div>
                        )}
                      </td>
                      {!productId && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {batch.product?.name || '-'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(batch)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <div className="text-gray-900 dark:text-white font-medium">
                          {batch.currentStock}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          de {batch.initialStock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(batch.expirationDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`font-medium ${
                            daysUntil < 0
                              ? 'text-red-600 dark:text-red-400'
                              : daysUntil <= 30
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {daysUntil < 0 ? `${Math.abs(daysUntil)} dias atrás` : `${daysUntil} dias`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {batch.location || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumo */}
      {batches.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
            <Package className="h-5 w-5" />
            <span className="font-medium">
              Total de {batches.length} lote{batches.length !== 1 ? 's' : ''} encontrado{batches.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
