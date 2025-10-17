import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Building,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { financialService, Supplier } from '../../services/financialService';
import { toast } from 'react-hot-toast';

interface SupplierListProps {
  onEditSupplier?: (supplier: Supplier) => void;
  onCreateSupplier?: () => void;
}

export default function SupplierList({ onEditSupplier, onCreateSupplier }: SupplierListProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    isActive: true,
    city: '',
    state: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await financialService.getSuppliers({
        search: filters.search || undefined,
        isActive: filters.isActive,
        city: filters.city || undefined,
        state: filters.state || undefined,
      });
      setSuppliers(data);
    } catch (error: any) {
      toast.error('Erro ao carregar fornecedores: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;

    try {
      await financialService.deleteSupplier(id);
      toast.success('Fornecedor excluído com sucesso!');
      loadSuppliers();
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await financialService.deactivateSupplier(id);
        toast.success('Fornecedor desativado');
      } else {
        await financialService.activateSupplier(id);
        toast.success('Fornecedor ativado');
      }
      loadSuppliers();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    }
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
            Fornecedores
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {suppliers.length} registro(s)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
          {onCreateSupplier && (
            <button
              onClick={onCreateSupplier}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Fornecedor
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  placeholder="Nome, CNPJ..."
                  className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.isActive ? 'true' : 'false'}
                onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadSuppliers}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Nenhum fornecedor encontrado
            </h3>
          </div>
        ) : (
          suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {supplier.name}
                    </h3>
                    {supplier.cnpj && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        CNPJ: {supplier.cnpj}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(supplier.id, supplier.isActive)}
                  className={`p-1 rounded ${
                    supplier.isActive
                      ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={supplier.isActive ? 'Ativo' : 'Inativo'}
                >
                  {supplier.isActive ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Informações */}
              <div className="space-y-2 mb-4">
                {supplier.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    {supplier.phone}
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 mr-2" />
                    {supplier.email}
                  </div>
                )}
                {supplier.city && supplier.state && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {supplier.city}/{supplier.state}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                {onEditSupplier && (
                  <button
                    onClick={() => onEditSupplier(supplier)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
