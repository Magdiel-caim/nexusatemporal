import { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle,
  Trash2,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface InventoryCount {
  id: string;
  description: string;
  location?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  countDate?: string;
  completedAt?: string;
  createdAt: string;
  items: InventoryCountItem[];
  user?: { name: string };
}

interface InventoryCountItem {
  id: string;
  productId: string;
  product: {
    name: string;
    unit: string;
  };
  systemStock: number;
  countedStock: number;
  difference: number;
  discrepancyType: 'SURPLUS' | 'SHORTAGE' | 'MATCH';
  adjusted: boolean;
  notes?: string;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  currentStock: number;
  unit: string;
}

export default function InventoryCountTab() {
  const [counts, setCounts] = useState<InventoryCount[]>([]);
  const [selectedCount, setSelectedCount] = useState<InventoryCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewCountForm, setShowNewCountForm] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // New count form fields
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');

  // Add item fields
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [countedStock, setCountedStock] = useState<number>(0);
  const [itemNotes, setItemNotes] = useState('');

  useEffect(() => {
    loadCounts();
    loadProducts();
  }, []);

  const loadCounts = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockCounts: InventoryCount[] = [
        {
          id: '1',
          description: 'Contagem Mensal - Janeiro 2025',
          location: 'Depósito Principal',
          status: 'IN_PROGRESS',
          createdAt: new Date().toISOString(),
          items: [],
        },
      ];
      setCounts(mockCounts);
    } catch (error) {
      toast.error('Erro ao carregar contagens');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      // Mock data - replace with actual API call
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Luva Descartável P',
          sku: 'LUV-001-P',
          currentStock: 150,
          unit: 'un',
        },
        {
          id: '2',
          name: 'Máscara Cirúrgica',
          sku: 'MASK-002',
          currentStock: 200,
          unit: 'un',
        },
      ];
      setAvailableProducts(mockProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const handleCreateCount = async () => {
    if (!newDescription.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    try {
      // Mock creation - replace with actual API call
      const newCount: InventoryCount = {
        id: Date.now().toString(),
        description: newDescription,
        location: newLocation,
        status: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
        items: [],
      };

      setCounts([newCount, ...counts]);
      setNewDescription('');
      setNewLocation('');
      setShowNewCountForm(false);
      toast.success('Contagem criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar contagem');
    }
  };

  const handleSelectCount = (count: InventoryCount) => {
    setSelectedCount(count);
    setShowAddItem(false);
  };

  const handleAddItem = async () => {
    if (!selectedCount || !selectedProductId || countedStock === undefined) {
      toast.error('Selecione um produto e informe a quantidade contada');
      return;
    }

    try {
      const product = availableProducts.find((p) => p.id === selectedProductId);
      if (!product) return;

      const difference = countedStock - product.currentStock;
      let discrepancyType: 'SURPLUS' | 'SHORTAGE' | 'MATCH';

      if (difference > 0) {
        discrepancyType = 'SURPLUS';
      } else if (difference < 0) {
        discrepancyType = 'SHORTAGE';
      } else {
        discrepancyType = 'MATCH';
      }

      const newItem: InventoryCountItem = {
        id: Date.now().toString(),
        productId: selectedProductId,
        product: {
          name: product.name,
          unit: product.unit,
        },
        systemStock: product.currentStock,
        countedStock,
        difference,
        discrepancyType,
        adjusted: false,
        notes: itemNotes,
      };

      const updatedCount = {
        ...selectedCount,
        items: [...selectedCount.items, newItem],
      };

      setSelectedCount(updatedCount);
      setCounts(counts.map((c) => (c.id === selectedCount.id ? updatedCount : c)));

      setSelectedProductId('');
      setCountedStock(0);
      setItemNotes('');
      setShowAddItem(false);

      toast.success('Item adicionado à contagem');
    } catch (error) {
      toast.error('Erro ao adicionar item');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (!selectedCount) return;

    const updatedCount = {
      ...selectedCount,
      items: selectedCount.items.filter((item) => item.id !== itemId),
    };

    setSelectedCount(updatedCount);
    setCounts(counts.map((c) => (c.id === selectedCount.id ? updatedCount : c)));
    toast.success('Item removido');
  };

  const handleAdjustItem = async (itemId: string) => {
    if (!selectedCount) return;

    const item = selectedCount.items.find((i) => i.id === itemId);
    if (!item) return;

    try {
      const updatedItem = { ...item, adjusted: true };
      const updatedCount = {
        ...selectedCount,
        items: selectedCount.items.map((i) => (i.id === itemId ? updatedItem : i)),
      };

      setSelectedCount(updatedCount);
      setCounts(counts.map((c) => (c.id === selectedCount.id ? updatedCount : c)));

      toast.success('Item ajustado no estoque');
    } catch (error) {
      toast.error('Erro ao ajustar item');
    }
  };

  const handleCompleteCount = async () => {
    if (!selectedCount) return;

    const unadjusted = selectedCount.items.filter((item) => !item.adjusted).length;
    if (unadjusted > 0) {
      toast.error(`Ajuste todos os ${unadjusted} itens antes de finalizar`);
      return;
    }

    try {
      const updatedCount = {
        ...selectedCount,
        status: 'COMPLETED' as const,
        completedAt: new Date().toISOString(),
      };

      setSelectedCount(updatedCount);
      setCounts(counts.map((c) => (c.id === selectedCount.id ? updatedCount : c)));

      toast.success('Contagem finalizada!');
    } catch (error) {
      toast.error('Erro ao finalizar contagem');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDiscrepancyColor = (type: string) => {
    switch (type) {
      case 'SURPLUS':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700';
      case 'SHORTAGE':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
      case 'MATCH':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Detail view
  if (selectedCount) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedCount(null)}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                ← Voltar
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCount.description}
              </h2>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedCount.status)}`}>
                {selectedCount.status === 'IN_PROGRESS' ? 'Em Andamento' : selectedCount.status === 'COMPLETED' ? 'Concluída' : 'Cancelada'}
              </span>
            </div>
            {selectedCount.status === 'IN_PROGRESS' && (
              <button
                onClick={handleCompleteCount}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-5 w-5 inline mr-2" />
                Finalizar Contagem
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            {selectedCount.location && (
              <div>
                <span className="font-medium">Local:</span> {selectedCount.location}
              </div>
            )}
            <div>
              <span className="font-medium">Criado em:</span>{' '}
              {new Date(selectedCount.createdAt).toLocaleString('pt-BR')}
            </div>
            <div>
              <span className="font-medium">Itens:</span> {selectedCount.items.length}
            </div>
          </div>
        </div>

        {/* Add Item Button */}
        {selectedCount.status === 'IN_PROGRESS' && (
          <div>
            <button
              onClick={() => setShowAddItem(!showAddItem)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 inline mr-2" />
              Adicionar Produto
            </button>
          </div>
        )}

        {/* Add Item Form */}
        {showAddItem && selectedCount.status === 'IN_PROGRESS' && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Adicionar Produto à Contagem</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Produto
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="">Selecione...</option>
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - Estoque: {product.currentStock} {product.unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantidade Contada
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={countedStock}
                  onChange={(e) => setCountedStock(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações
                </label>
                <input
                  type="text"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowAddItem(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="h-5 w-5 inline mr-2" />
                Salvar
              </button>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Produtos Contados</h3>

            {selectedCount.items.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Nenhum produto adicionado ainda. Clique em "Adicionar Produto" para começar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedCount.items.map((item) => (
                  <div
                    key={item.id}
                    className={`border-2 rounded-lg p-4 ${getDiscrepancyColor(item.discrepancyType)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          {item.product.name}
                          {item.adjusted && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-600 text-white rounded-full">
                              ✓ Ajustado
                            </span>
                          )}
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Sistema:</span>
                            <span className="font-medium ml-1">{item.systemStock} {item.product.unit}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Contado:</span>
                            <span className="font-medium ml-1">{item.countedStock} {item.product.unit}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Diferença:</span>
                            <span className={`font-bold ml-1 ${item.difference > 0 ? 'text-green-600' : item.difference < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                              {item.difference > 0 ? '+' : ''}{item.difference} {item.product.unit}
                            </span>
                          </div>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {!item.adjusted && selectedCount.status === 'IN_PROGRESS' && (
                          <>
                            <button
                              onClick={() => handleAdjustItem(item.id)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                              Ajustar
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-purple-100 dark:border-gray-600">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Contagem de Inventário
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Realize contagens físicas do estoque e ajuste divergências automaticamente
            </p>
          </div>
          <button
            onClick={() => setShowNewCountForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-5 w-5 inline mr-2" />
            Nova Contagem
          </button>
        </div>
      </div>

      {/* New Count Form */}
      {showNewCountForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nova Contagem de Inventário</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição *
              </label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                placeholder="Ex: Contagem Mensal - Janeiro 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Local
              </label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                placeholder="Ex: Depósito Principal"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowNewCountForm(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateCount}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Criar Contagem
            </button>
          </div>
        </div>
      )}

      {/* Counts List */}
      {counts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border border-gray-100 dark:border-gray-700 text-center">
          <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma contagem cadastrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Crie sua primeira contagem de inventário para começar
          </p>
          <button
            onClick={() => setShowNewCountForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-5 w-5 inline mr-2" />
            Nova Contagem
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {counts.map((count) => (
            <div
              key={count.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectCount(count)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {count.description}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(count.status)}`}>
                      {count.status === 'IN_PROGRESS' ? 'Em Andamento' : count.status === 'COMPLETED' ? 'Concluída' : 'Cancelada'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {count.location && (
                      <div>
                        <span className="font-medium">Local:</span> {count.location}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Itens:</span> {count.items.length}
                    </div>
                    <div>
                      <span className="font-medium">Criado em:</span>{' '}
                      {new Date(count.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCount(count);
                  }}
                  className="ml-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                >
                  Gerenciar →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
