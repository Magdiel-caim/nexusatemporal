import { useState, useEffect } from 'react';
import { stockService, Product, ProductCategory } from '@/services/stockService';
import { Package, Edit2, Trash2, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductListProps {
  onEdit: (product: Product) => void;
  refreshKey: number;
}

export default function ProductList({ onEdit, refreshKey }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | ''>('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [activeOnlyFilter, setActiveOnlyFilter] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [refreshKey, categoryFilter, lowStockFilter, activeOnlyFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await stockService.getProducts({
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
        lowStock: lowStockFilter,
        isActive: activeOnlyFilter,
      });
      setProducts(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      return;
    }

    try {
      await stockService.deleteProduct(product.id);
      toast.success('Produto excluído com sucesso');
      loadProducts();
    } catch (error: any) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) {
      return { text: 'Sem estoque', color: 'bg-red-100 text-red-800' };
    } else if (product.currentStock <= product.minimumStock) {
      return { text: 'Estoque baixo', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'Normal', color: 'bg-green-100 text-green-800' };
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar por nome, SKU ou código de barras..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
              />
            </div>
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Todas as categorias</option>
              <option value="MEDICAMENTO">Medicamento</option>
              <option value="MATERIAL">Material</option>
              <option value="EQUIPAMENTO">Equipamento</option>
              <option value="COSMETICO">Cosmético</option>
              <option value="SUPLEMENTO">Suplemento</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => setLowStockFilter(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Estoque baixo</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeOnlyFilter}
                onChange={(e) => setActiveOnlyFilter(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Somente ativos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-600">
            {searchTerm || categoryFilter || lowStockFilter
              ? 'Tente ajustar os filtros de busca'
              : 'Comece cadastrando seu primeiro produto'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mín / Máx
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preços
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const status = getStockStatus(product);
                  const isLowStock = product.currentStock <= product.minimumStock;
                  const isOutOfStock = product.currentStock === 0;
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isOutOfStock ? 'bg-red-50' : isLowStock ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              {product.sku && `SKU: ${product.sku}`}
                              {product.barcode && ` • Código: ${product.barcode}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.currentStock} {product.unit}
                        </div>
                        {product.location && (
                          <div className="text-sm text-gray-500">Local: {product.location}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.minimumStock} / {product.maximumStock || '—'} {product.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                          {isOutOfStock ? (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          ) : isLowStock ? (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.purchasePrice && (
                          <div>Compra: R$ {product.purchasePrice.toFixed(2)}</div>
                        )}
                        {product.salePrice && (
                          <div>Venda: R$ {product.salePrice.toFixed(2)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => onEdit(product)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          title="Editar"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {products.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Mostrando {products.length} produto(s)
        </div>
      )}
    </div>
  );
}
