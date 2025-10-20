import { useState, useEffect } from 'react';
import { stockService, Product, ProcedureProduct } from '@/services/stockService';
import { Package, Plus, Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProcedureStockManagerProps {
  procedureId: string;
  onClose?: () => void;
}

export default function ProcedureStockManager({ procedureId, onClose }: ProcedureStockManagerProps) {
  const [procedureProducts, setProcedureProducts] = useState<ProcedureProduct[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isOptional, setIsOptional] = useState(true);
  const [notes, setNotes] = useState('');
  const [stockValidation, setStockValidation] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [procedureId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, procedureProductsRes] = await Promise.all([
        stockService.getProducts({ isActive: true, limit: 1000 }),
        stockService.getProcedureProducts(procedureId),
      ]);

      setAvailableProducts(productsRes.data || []);
      setProcedureProducts(procedureProductsRes.data || []);

      // Validar estoque
      await validateStock();
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const validateStock = async () => {
    try {
      const validation = await stockService.validateStockForProcedure(procedureId);
      setStockValidation(validation);
    } catch (error: any) {
      console.error('Erro ao validar estoque:', error);
    }
  };

  const handleAddProduct = async () => {
    if (!selectedProductId || quantity <= 0) {
      toast.error('Selecione um produto e informe a quantidade');
      return;
    }

    try {
      await stockService.addProductToProcedure({
        procedureId,
        productId: selectedProductId,
        quantityUsed: quantity,
        isOptional,
        notes: notes || undefined,
      });

      toast.success('Produto adicionado ao procedimento');
      setShowAddProduct(false);
      setSelectedProductId('');
      setQuantity(1);
      setNotes('');
      loadData();
    } catch (error: any) {
      console.error('Erro ao adicionar produto:', error);
      toast.error('Erro ao adicionar produto');
    }
  };

  const handleRemoveProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este produto do procedimento?')) {
      return;
    }

    try {
      await stockService.removeProcedureProduct(id);
      toast.success('Produto removido do procedimento');
      loadData();
    } catch (error: any) {
      console.error('Erro ao remover produto:', error);
      toast.error('Erro ao remover produto');
    }
  };

  const handleConsumeStock = async () => {
    if (!stockValidation?.valid) {
      toast.error('Estoque insuficiente para alguns produtos');
      return;
    }

    if (!confirm('Confirma a baixa automática de todos os produtos deste procedimento?')) {
      return;
    }

    try {
      const result = await stockService.consumeStockForProcedure(procedureId);

      if (result.success) {
        toast.success('Estoque consumido com sucesso!');
        loadData();
      } else {
        toast.error('Houve erros ao consumir o estoque');
        console.error('Errors:', result.errors);
      }
    } catch (error: any) {
      console.error('Erro ao consumir estoque:', error);
      toast.error(error.response?.data?.error || 'Erro ao consumir estoque');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Gerenciar Produtos do Procedimento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Stock Validation Alert */}
        {stockValidation && (
          <div className={`px-6 py-3 ${stockValidation.valid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <div className="flex items-center">
              {stockValidation.valid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-sm text-green-800 dark:text-green-300 font-medium">
                    Estoque suficiente para todos os produtos
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                  <div className="flex-1">
                    <span className="text-sm text-red-800 dark:text-red-300 font-medium block">
                      Estoque insuficiente:
                    </span>
                    {stockValidation.insufficientStock.map((item: any) => (
                      <span key={item.productId} className="text-xs text-red-700 dark:text-red-400 block">
                        {item.productName}: necessário {item.required}, disponível {item.available}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add Product Button */}
          <div className="mb-4">
            <button
              onClick={() => setShowAddProduct(!showAddProduct)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar Produto
            </button>
          </div>

          {/* Add Product Form */}
          {showAddProduct && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Produto
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="">Selecione um produto</option>
                    {availableProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - Estoque: {product.currentStock} {product.unit}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOptional}
                      onChange={(e) => setIsOptional(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Produto opcional</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}

          {/* Products List */}
          {procedureProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum produto vinculado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Adicione produtos ao procedimento para controlar o consumo de estoque
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {procedureProducts.map((pp) => (
                <div
                  key={pp.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {pp.product?.name || 'Produto não encontrado'}
                      </h4>
                      {pp.isOptional && (
                        <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                          Opcional
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Quantidade: {pp.quantityUsed} {pp.product?.unit}
                      {' • '}
                      Estoque disponível: {pp.product?.currentStock} {pp.product?.unit}
                    </p>
                    {pp.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                        {pp.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveProduct(pp.id)}
                    className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total de produtos: {procedureProducts.length}
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Fechar
            </button>
            <button
              onClick={handleConsumeStock}
              disabled={!stockValidation?.valid || procedureProducts.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Consumir Estoque
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
