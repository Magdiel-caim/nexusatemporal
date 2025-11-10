import { useState, useEffect, lazy, Suspense } from 'react';
import { stockService, Product, AlertCount, StockValue } from '@/services/stockService';
import {
  Package,
  TrendingDown,
  AlertTriangle,
  Clock,
  DollarSign,
  ArrowUpCircle,
  Plus,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggle from '@/components/ui/ThemeToggle';

// Lazy imports for components
const ProductList = lazy(() => import('../components/estoque/ProductList'));
const ProductForm = lazy(() => import('../components/estoque/ProductForm'));
const MovementList = lazy(() => import('../components/estoque/MovementList'));
const MovementForm = lazy(() => import('../components/estoque/MovementForm'));
const AlertList = lazy(() => import('../components/estoque/AlertList'));
const ReportsView = lazy(() => import('../components/estoque/ReportsView'));
const ProcedureStockTab = lazy(() => import('../components/estoque/ProcedureStockTab'));
const InventoryCountTab = lazy(() => import('../components/estoque/InventoryCountTab'));

type ActiveTab = 'dashboard' | 'products' | 'movements' | 'alerts' | 'reports' | 'procedures' | 'inventory';

export default function EstoquePage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [stockValue, setStockValue] = useState<StockValue>({
    totalValue: 0,
    totalProducts: 0,
    totalItems: 0,
  });
  const [alertCount, setAlertCount] = useState<AlertCount>({
    total: 0,
    byType: {
      LOW_STOCK: 0,
      OUT_OF_STOCK: 0,
      EXPIRING_SOON: 0,
      EXPIRED: 0,
    },
  });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<Product[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [refreshKey]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [value, alerts, lowStock, expiring] = await Promise.all([
        stockService.getStockValue(),
        stockService.getAlertCount(),
        stockService.getLowStockProducts(),
        stockService.getExpiringProducts(30),
      ]);

      setStockValue(value);
      setAlertCount(alerts);
      setLowStockProducts(lowStock);
      setExpiringProducts(expiring);
    } catch (error: any) {
      console.error('Erro ao carregar dados do estoque:', error);
      toast.error('Erro ao carregar dados do estoque');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setSelectedProduct(undefined);
    setRefreshKey((prev) => prev + 1);
    toast.success('Produto salvo com sucesso!');
  };

  const handleMovementSaved = () => {
    setShowMovementForm(false);
    setRefreshKey((prev) => prev + 1);
    toast.success('Movimentação registrada com sucesso!');
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stockValue.totalValue)}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stockValue.totalProducts}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Itens em Estoque</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {Math.round(stockValue.totalItems)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Alertas Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {alertCount.total}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      {alertCount.total > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumo de Alertas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Estoque Baixo</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{alertCount.byType.LOW_STOCK}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Sem Estoque</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{alertCount.byType.OUT_OF_STOCK}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">A Vencer</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{alertCount.byType.EXPIRING_SOON}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Vencidos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{alertCount.byType.EXPIRED}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Produtos com Estoque Baixo</h3>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {product.sku && `SKU: ${product.sku} • `}
                    Categoria: {product.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                    {product.currentStock} {product.unit}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Mínimo: {product.minimumStock} {product.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiring Products */}
      {expiringProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Produtos Próximos ao Vencimento</h3>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {expiringProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {product.batchNumber && `Lote: ${product.batchNumber} • `}
                    Estoque: {product.currentStock} {product.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                    {product.expirationDate
                      ? new Date(product.expirationDate).toLocaleDateString('pt-BR')
                      : 'Sem data'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Validade</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Estoque</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Controle completo do seu inventário e movimentações
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={() => {
                  setSelectedProduct(undefined);
                  setShowProductForm(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="h-5 w-5 mr-2" />
                Novo Produto
              </button>
              <button
                onClick={() => setShowMovementForm(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <ArrowUpCircle className="h-5 w-5 mr-2" />
                Nova Movimentação
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'products'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                Produtos
              </button>
              <button
                onClick={() => setActiveTab('movements')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'movements'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                Movimentações
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors relative
                  ${
                    activeTab === 'alerts'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                Alertas
                {alertCount.total > 0 && (
                  <span className="absolute -top-1 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {alertCount.total > 9 ? '9+' : alertCount.total}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'reports'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                Relatórios
              </button>
              <button
                onClick={() => setActiveTab('procedures')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'procedures'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                Procedimentos
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'inventory'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                Inventário
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading && activeTab === 'dashboard' ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}

              {activeTab === 'products' && (
                <Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                }>
                  <ProductList onEdit={handleEditProduct} refreshKey={refreshKey} />
                </Suspense>
              )}

              {activeTab === 'movements' && (
                <Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                }>
                  <MovementList refreshKey={refreshKey} />
                </Suspense>
              )}

              {activeTab === 'alerts' && (
                <Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                }>
                  <AlertList refreshKey={refreshKey} onRefresh={() => setRefreshKey((prev) => prev + 1)} />
                </Suspense>
              )}

              {activeTab === 'reports' && (
                <Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                }>
                  <ReportsView />
                </Suspense>
              )}

              {activeTab === 'procedures' && (
                <Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                }>
                  <ProcedureStockTab />
                </Suspense>
              )}

              {activeTab === 'inventory' && (
                <Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                }>
                  <InventoryCountTab />
                </Suspense>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <Suspense fallback={null}>
          <ProductForm
            product={selectedProduct}
            onClose={() => {
              setShowProductForm(false);
              setSelectedProduct(undefined);
            }}
            onSave={handleProductSaved}
          />
        </Suspense>
      )}

      {/* Movement Form Modal */}
      {showMovementForm && (
        <Suspense fallback={null}>
          <MovementForm
            onClose={() => setShowMovementForm(false)}
            onSave={handleMovementSaved}
          />
        </Suspense>
      )}
    </div>
  );
}
