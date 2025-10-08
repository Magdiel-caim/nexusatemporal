import { useState, useEffect } from 'react';
import { Stage, leadsService } from '@/services/leadsService';
import { User, userService } from '@/services/userService';
import { X, Search, Filter } from 'lucide-react';

export interface LeadFilters {
  search?: string;
  stageId?: string;
  procedureId?: string;
  assignedToId?: string;
  clientStatus?: string;
  channel?: string;
  attendanceLocation?: string;
  minValue?: number;
  maxValue?: number;
}

interface LeadsFilterProps {
  isOpen: boolean;
  onClose: () => void;
  stages: Stage[];
  filters: LeadFilters;
  onApplyFilters: (filters: LeadFilters) => void;
  onClearFilters: () => void;
}

export default function LeadsFilter({
  isOpen,
  onClose,
  stages,
  filters,
  onApplyFilters,
  onClearFilters,
}: LeadsFilterProps) {
  const [localFilters, setLocalFilters] = useState<LeadFilters>(filters);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const loadData = async () => {
    try {
      const [proceduresData, usersData] = await Promise.all([
        leadsService.getProcedures(),
        userService.getUsers(),
      ]);
      setProcedures(proceduresData);
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleChange = (field: keyof LeadFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [field]: value || undefined }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const activeFiltersCount = Object.keys(filters).filter(
    key => filters[key as keyof LeadFilters] !== undefined && filters[key as keyof LeadFilters] !== ''
  ).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end">
      <div className="bg-white h-full w-full max-w-md shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-xs font-medium rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filters Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Busca por Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nome
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={localFilters.search || ''}
                onChange={(e) => handleChange('search', e.target.value)}
                placeholder="Digite o nome do lead..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Estágio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estágio
            </label>
            <select
              value={localFilters.stageId || ''}
              onChange={(e) => handleChange('stageId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os estágios</option>
              {stages.map(stage => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>

          {/* Procedimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Procedimento
            </label>
            <select
              value={localFilters.procedureId || ''}
              onChange={(e) => handleChange('procedureId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os procedimentos</option>
              {procedures.map(procedure => (
                <option key={procedure.id} value={procedure.id}>
                  {procedure.name}
                </option>
              ))}
            </select>
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsável
            </label>
            <select
              value={localFilters.assignedToId || ''}
              onChange={(e) => handleChange('assignedToId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os responsáveis</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status do Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status do Cliente
            </label>
            <select
              value={localFilters.clientStatus || ''}
              onChange={(e) => handleChange('clientStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os status</option>
              <option value="novo">Novo</option>
              <option value="recorrente">Recorrente</option>
              <option value="vip">VIP</option>
              <option value="retorno">Retorno</option>
            </select>
          </div>

          {/* Canal de Comunicação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Canal de Comunicação
            </label>
            <select
              value={localFilters.channel || ''}
              onChange={(e) => handleChange('channel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os canais</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Telefone</option>
              <option value="email">E-mail</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="website">Site</option>
              <option value="indication">Indicação</option>
              <option value="other">Outro</option>
            </select>
          </div>

          {/* Local de Atendimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Local de Atendimento
            </label>
            <select
              value={localFilters.attendanceLocation || ''}
              onChange={(e) => handleChange('attendanceLocation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos os locais</option>
              <option value="clinic">Clínica</option>
              <option value="home">Domicílio</option>
              <option value="online">Online</option>
              <option value="hospital">Hospital</option>
            </select>
          </div>

          {/* Faixa de Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Estimado
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                <input
                  type="number"
                  value={localFilters.minValue || ''}
                  onChange={(e) => handleChange('minValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="R$ 0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                <input
                  type="number"
                  value={localFilters.maxValue || ''}
                  onChange={(e) => handleChange('maxValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="R$ 10.000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Limpar Filtros
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 font-medium"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}
