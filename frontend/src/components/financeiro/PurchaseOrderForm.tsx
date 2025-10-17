import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { financialService, Supplier } from '../../services/financialService';
import { toast } from 'react-hot-toast';

interface PurchaseOrderItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PurchaseOrderFormProps {
  orderId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PurchaseOrderForm({ orderId, onClose, onSuccess }: PurchaseOrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    priority: 'normal' as 'baixa' | 'normal' | 'alta' | 'urgente',
    notes: '',
  });
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 },
  ]);

  useEffect(() => {
    loadSuppliers();
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadSuppliers = async () => {
    try {
      const data = await financialService.getSuppliers({ isActive: true });
      setSuppliers(data);
    } catch (error: any) {
      toast.error('Erro ao carregar fornecedores: ' + error.message);
    }
  };

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const orders = await financialService.getPurchaseOrders({});
      const order = orders.find(o => o.id === orderId);

      if (order) {
        setFormData({
          supplierId: order.supplierId,
          orderDate: order.orderDate.split('T')[0],
          expectedDeliveryDate: order.expectedDeliveryDate?.split('T')[0] || '',
          priority: order.priority as any,
          notes: order.notes || '',
        });
        setItems(order.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })));
      }
    } catch (error: any) {
      toast.error('Erro ao carregar ordem: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, key: keyof PurchaseOrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };

    // Auto-calculate totalPrice
    if (key === 'quantity' || key === 'unitPrice') {
      const quantity = key === 'quantity' ? Number(value) : newItems[index].quantity;
      const unitPrice = key === 'unitPrice' ? Number(value) : newItems[index].unitPrice;
      newItems[index].totalPrice = quantity * unitPrice;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      toast.error('Deve haver pelo menos um item');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.supplierId) {
      toast.error('Selecione um fornecedor');
      return;
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Preencha todos os itens corretamente');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        supplierId: formData.supplierId,
        orderDate: formData.orderDate,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
        priority: formData.priority,
        notes: formData.notes || undefined,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        totalAmount: calculateTotal(),
      };

      if (orderId) {
        await financialService.updatePurchaseOrder(orderId, orderData);
        toast.success('Ordem atualizada com sucesso!');
      } else {
        await financialService.createPurchaseOrder(orderData);
        toast.success('Ordem criada com sucesso!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Erro ao salvar ordem: ' + error.message);
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {orderId ? 'Editar Ordem de Compra' : 'Nova Ordem de Compra'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fornecedor *
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  required
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                >
                  <option value="">Selecione...</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridade *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  required
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                >
                  <option value="baixa">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data do Pedido *
                </label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  required
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data de Entrega Prevista
                </label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                placeholder="Informações adicionais..."
              />
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Itens da Ordem *
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Descrição do item *"
                          required
                          className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          placeholder="Qtd *"
                          min="1"
                          required
                          className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          placeholder="Preço Unit. *"
                          min="0"
                          step="0.01"
                          required
                          className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm text-sm"
                        />
                      </div>
                    </div>
                    <div className="w-32">
                      <input
                        type="text"
                        value={formatCurrency(item.totalPrice)}
                        disabled
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white shadow-sm text-sm font-medium"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end items-center gap-4">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {loading ? 'Salvando...' : orderId ? 'Atualizar Ordem' : 'Criar Ordem'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
