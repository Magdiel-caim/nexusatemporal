import { useState, useEffect } from 'react';
import { stockService, StockMovement, MovementType, MovementReason } from '@/services/stockService';
import { ArrowUpCircle, ArrowDownCircle, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface MovementListProps {
  refreshKey: number;
}

export default function MovementList({ refreshKey }: MovementListProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<MovementType | ''>('');
  const [reasonFilter, setReasonFilter] = useState<MovementReason | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMovements();
  }, [refreshKey, typeFilter, reasonFilter]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const response = await stockService.getMovements({
        limit: 100,
        type: typeFilter || undefined,
        reason: reasonFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setMovements(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar movimentações:', error);
      toast.error('Erro ao carregar movimentações');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    if (startDate && endDate) {
      loadMovements();
    } else if (startDate || endDate) {
      toast.error('Preencha ambas as datas');
    }
  };

  const clearFilters = () => {
    setTypeFilter('');
    setReasonFilter('');
    setStartDate('');
    setEndDate('');
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
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <Filter className="h-5 w-5" />
            <span className="font-medium">Filtros</span>
          </button>
          {(typeFilter || reasonFilter || startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as MovementType | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
                <option value="AJUSTE">Ajuste</option>
                <option value="DEVOLUCAO">Devolução</option>
                <option value="PERDA">Perda</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value as MovementReason | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Todos</option>
                <option value="COMPRA">Compra</option>
                <option value="PROCEDIMENTO">Procedimento</option>
                <option value="VENDA">Venda</option>
                <option value="AJUSTE_INVENTARIO">Ajuste de Inventário</option>
                <option value="DEVOLUCAO_FORNECEDOR">Devolução Fornecedor</option>
                <option value="DEVOLUCAO_CLIENTE">Devolução Cliente</option>
                <option value="PERDA">Perda</option>
                <option value="VENCIMENTO">Vencimento</option>
                <option value="DANO">Dano</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
                <button
                  onClick={handleDateFilter}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantidade</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Estoque</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {movements.map((movement) => (
              <tr key={movement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(movement.createdAt).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {movement.product?.name || 'Produto não encontrado'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    movement.type === 'ENTRADA' || movement.type === 'DEVOLUCAO'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {movement.type === 'ENTRADA' || movement.type === 'DEVOLUCAO' ? (
                      <ArrowUpCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownCircle className="h-3 w-3 mr-1" />
                    )}
                    {movement.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {movement.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                  {movement.quantity} {movement.product?.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {movement.previousStock} → {movement.newStock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
