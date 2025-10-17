import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Filter,
  Search,
  Package,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { financialService, PurchaseOrder, Supplier } from '../../services/financialService';
import { toast } from 'react-hot-toast';

export default function PurchaseOrderView() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    supplierId: '',
    priority: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, suppliersData] = await Promise.all([
        financialService.getPurchaseOrders({
          search: filters.search || undefined,
          status: (filters.status || undefined) as any,
          supplierId: filters.supplierId || undefined,
          priority: (filters.priority || undefined) as any,
        }),
        financialService.getSuppliers({ isActive: true }),
      ]);
      setOrders(ordersData);
      setSuppliers(suppliersData);
    } catch (error: any) {
      toast.error('Erro ao carregar ordens: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await financialService.approvePurchaseOrder(id);
      toast.success('Ordem aprovada!');
      loadData();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    }
  };

  const handleMarkInTransit = async (id: string) => {
    try {
      await financialService.markPurchaseOrderInTransit(id);
      toast.success('Marcado como em trânsito!');
      loadData();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    }
  };

  const handleReceive = async (id: string) => {
    try {
      const order = orders.find(o => o.id === id);
      if (!order) return;

      const receivedItems = order.items.map(item => ({
        ...item,
        receivedQuantity: item.quantity,
      }));

      await financialService.receivePurchaseOrder(id, { items: receivedItems, receivedDate: new Date().toISOString() });
      toast.success('Ordem recebida!');
      loadData();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
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

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      orcamento: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-200',
        label: 'Orçamento',
        icon: <Clock className="w-4 h-4" />,
      },
      aprovado: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-800 dark:text-blue-200',
        label: 'Aprovado',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      pedido_realizado: {
        bg: 'bg-indigo-100 dark:bg-indigo-900',
        text: 'text-indigo-800 dark:text-indigo-200',
        label: 'Pedido Realizado',
        icon: <ShoppingCart className="w-4 h-4" />,
      },
      em_transito: {
        bg: 'bg-yellow-100 dark:bg-yellow-900',
        text: 'text-yellow-800 dark:text-yellow-200',
        label: 'Em Trânsito',
        icon: <Truck className="w-4 h-4" />,
      },
      recebido: {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-800 dark:text-green-200',
        label: 'Recebido',
        icon: <Package className="w-4 h-4" />,
      },
      cancelado: {
        bg: 'bg-red-100 dark:bg-red-900',
        text: 'text-red-800 dark:text-red-200',
        label: 'Cancelado',
        icon: <XCircle className="w-4 h-4" />,
      },
    };

    const badge = badges[status] || badges.orcamento;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      baixa: 'text-gray-600',
      normal: 'text-blue-600',
      alta: 'text-orange-600',
      urgente: 'text-red-600',
    };

    return (
      <span className={`text-xs font-medium ${colors[priority] || colors.normal}`}>
        {priority.toUpperCase()}
      </span>
    );
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Ordens de Compra
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {orders.length} ordem(ns)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Ordem
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Número, descrição..."
                  className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
              >
                <option value="">Todos</option>
                <option value="orcamento">Orçamento</option>
                <option value="aprovado">Aprovado</option>
                <option value="pedido_realizado">Pedido Realizado</option>
                <option value="em_transito">Em Trânsito</option>
                <option value="recebido">Recebido</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fornecedor
              </label>
              <select
                value={filters.supplierId}
                onChange={(e) => setFilters(prev => ({ ...prev, supplierId: e.target.value }))}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
              >
                <option value="">Todos</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={loadData}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4">
        {orders.length === 0 ? (
          <div className="card text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Nenhuma ordem encontrada
            </h3>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="card p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </h3>
                    {getStatusBadge(order.status)}
                    {getPriorityBadge(order.priority)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fornecedor: {order.supplier?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Data: {formatDate(order.orderDate)} |
                    {order.expectedDeliveryDate && ` Entrega prevista: ${formatDate(order.expectedDeliveryDate)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {order.items.length} item(ns)
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Itens:
                </p>
                <div className="space-y-1">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.description} (x{item.quantity})
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-500">
                      + {order.items.length - 3} mais...
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                {order.status === 'orcamento' && (
                  <button
                    onClick={() => handleApprove(order.id)}
                    className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Aprovar
                  </button>
                )}
                {order.status === 'pedido_realizado' && (
                  <button
                    onClick={() => handleMarkInTransit(order.id)}
                    className="text-xs px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Em Trânsito
                  </button>
                )}
                {order.status === 'em_transito' && (
                  <button
                    onClick={() => handleReceive(order.id)}
                    className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Receber
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Simple Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowForm(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Nova Ordem de Compra
              </h3>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Formulário em desenvolvimento...</p>
                <p className="text-sm mt-2">Use a API diretamente por enquanto</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
