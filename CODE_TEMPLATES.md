# 🚀 Templates de Código - Nexus Atemporal

Exemplos prontos para copiar e adaptar na próxima sessão.

---

## 📋 Template: Lista de Entidades

### SupplierList.tsx (Exemplo Completo)

```tsx
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
import { financialService, Supplier } from '@/services/financialService';
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
                  className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
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
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
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
```

---

## 📝 Template: Formulário de Entidade

### SupplierForm.tsx (Exemplo Completo)

```tsx
import { useState } from 'react';
import { X, Building, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { financialService, Supplier } from '@/services/financialService';
import { toast } from 'react-hot-toast';

interface SupplierFormProps {
  supplier?: Supplier;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SupplierForm({ supplier, onClose, onSuccess }: SupplierFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    cnpj: supplier?.cnpj || '',
    cpf: supplier?.cpf || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    phone2: supplier?.phone2 || '',
    contactName: supplier?.contactName || '',
    address: supplier?.address || '',
    addressNumber: supplier?.addressNumber || '',
    complement: supplier?.complement || '',
    neighborhood: supplier?.neighborhood || '',
    city: supplier?.city || '',
    state: supplier?.state || '',
    zipCode: supplier?.zipCode || '',
    website: supplier?.website || '',
    notes: supplier?.notes || '',
    // Dados bancários
    bankName: supplier?.bankInfo?.bankName || '',
    agency: supplier?.bankInfo?.agency || '',
    account: supplier?.bankInfo?.account || '',
    accountType: supplier?.bankInfo?.accountType || '',
    pixKey: supplier?.bankInfo?.pixKey || '',
  });

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.name.trim()) {
      toast.error('Informe o nome do fornecedor');
      return;
    }

    try {
      setLoading(true);

      const supplierData = {
        name: formData.name,
        cnpj: formData.cnpj || undefined,
        cpf: formData.cpf || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        phone2: formData.phone2 || undefined,
        contactName: formData.contactName || undefined,
        address: formData.address || undefined,
        addressNumber: formData.addressNumber || undefined,
        complement: formData.complement || undefined,
        neighborhood: formData.neighborhood || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        website: formData.website || undefined,
        notes: formData.notes || undefined,
        bankInfo: {
          bankName: formData.bankName || undefined,
          agency: formData.agency || undefined,
          account: formData.account || undefined,
          accountType: formData.accountType || undefined,
          pixKey: formData.pixKey || undefined,
        },
      };

      if (supplier) {
        await financialService.updateSupplier(supplier.id, supplierData);
        toast.success('Fornecedor atualizado com sucesso!');
      } else {
        await financialService.createSupplier(supplierData);
        toast.success('Fornecedor criado com sucesso!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Dados Principais */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Dados Principais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => handleChange('cnpj', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleChange('cpf', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Contato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefone 2
                  </label>
                  <input
                    type="tel"
                    value={formData.phone2}
                    onChange={(e) => handleChange('phone2', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pessoa de Contato
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                <MapPin className="w-4 h-4 inline mr-1" />
                Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Logradouro
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    value={formData.addressNumber}
                    onChange={(e) => handleChange('addressNumber', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={formData.complement}
                    onChange={(e) => handleChange('complement', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => handleChange('neighborhood', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  >
                    <option value="">Selecione...</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    {/* Adicionar outros estados */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleChange('zipCode', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>

            {/* Dados Bancários */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Dados Bancários
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Banco
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Agência
                  </label>
                  <input
                    type="text"
                    value={formData.agency}
                    onChange={(e) => handleChange('agency', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conta
                  </label>
                  <input
                    type="text"
                    value={formData.account}
                    onChange={(e) => handleChange('account', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Conta
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => handleChange('accountType', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                  >
                    <option value="">Selecione...</option>
                    <option value="corrente">Conta Corrente</option>
                    <option value="poupanca">Poupança</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    value={formData.pixKey}
                    onChange={(e) => handleChange('pixKey', e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
                    placeholder="Email, telefone, CPF/CNPJ ou chave aleatória"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm"
              />
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Salvando...' : supplier ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔗 Template: Integração na Página Principal

### Adicionar aba de Fornecedores em FinanceiroPage.tsx

```tsx
// No topo do arquivo, adicionar imports
import SupplierList from '../components/financeiro/SupplierList';
import SupplierForm from '../components/financeiro/SupplierForm';

// No estado do componente
const [showSupplierForm, setShowSupplierForm] = useState(false);
const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();

// Handlers
const handleCreateSupplier = () => {
  setSelectedSupplier(undefined);
  setShowSupplierForm(true);
};

const handleEditSupplier = (supplier: Supplier) => {
  setSelectedSupplier(supplier);
  setShowSupplierForm(true);
};

const handleCloseSupplierForm = () => {
  setShowSupplierForm(false);
  setSelectedSupplier(undefined);
};

const handleSupplierSuccess = () => {
  loadFinancialData(); // ou loadSuppliers()
};

// No JSX, substituir o placeholder da aba Suppliers
{activeTab === 'suppliers' && (
  <SupplierList
    onEditSupplier={handleEditSupplier}
    onCreateSupplier={handleCreateSupplier}
  />
)}

// No final do JSX, adicionar o modal
{showSupplierForm && (
  <SupplierForm
    supplier={selectedSupplier}
    onClose={handleCloseSupplierForm}
    onSuccess={handleSupplierSuccess}
  />
)}
```

---

## 🎨 Padrões de Estilo (Tailwind)

### Card Base
```tsx
<div className="card">
  {/* Conteúdo */}
</div>
```

### Modal/Dialog
```tsx
<div className="fixed inset-0 z-50 overflow-y-auto">
  <div className="flex min-h-screen items-center justify-center p-4">
    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full">
      {/* Conteúdo */}
    </div>
  </div>
</div>
```

### Input com Dark Mode
```tsx
<input
  type="text"
  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
/>
```

### Botão Primário
```tsx
<button className="btn-primary">
  Texto
</button>
```

### Badge de Status
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
  Ativo
</span>
```

---

## 📦 Snippets Úteis

### useEffect para Carregar Dados
```tsx
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    const data = await service.getData();
    setData(data);
  } catch (error: any) {
    toast.error('Erro: ' + error.message);
  } finally {
    setLoading(false);
  }
};
```

### Loading State
```tsx
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

### Empty State
```tsx
{items.length === 0 && (
  <div className="text-center py-12">
    <Icon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
      Nenhum item encontrado
    </h3>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Comece criando um novo item.
    </p>
  </div>
)}
```

### Confirmação de Exclusão
```tsx
const handleDelete = async (id: string) => {
  if (!confirm('Tem certeza que deseja excluir?')) return;

  try {
    await service.delete(id);
    toast.success('Excluído com sucesso!');
    loadData();
  } catch (error: any) {
    toast.error('Erro ao excluir: ' + error.message);
  }
};
```

---

## 🚀 Workflow de Deploy Rápido

```bash
# 1. Build
cd /root/nexusatemporal/frontend
npm run build

# 2. Docker
docker build -t nexus_frontend:v64-suppliers .

# 3. Deploy
docker service update --image nexus_frontend:v64-suppliers nexus_frontend

# 4. Verificar
docker service ps nexus_frontend

# 5. Git
git add -A && git commit -m "feat: Adiciona gestão de fornecedores"
git tag -a v64-suppliers -m "v64: Fornecedores"
git push origin feature/leads-procedures-config --tags
```

---

**🎯 Use este documento como referência rápida para acelerar o desenvolvimento!**
