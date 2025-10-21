import { useState, useEffect } from 'react';
import { Search, Package, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ProcedureStockManager from './ProcedureStockManager';

interface Procedure {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
}

export default function ProcedureStockTab() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [filteredProcedures, setFilteredProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | null>(null);

  useEffect(() => {
    loadProcedures();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProcedures(procedures);
    } else {
      const filtered = procedures.filter((proc) =>
        proc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProcedures(filtered);
    }
  }, [searchTerm, procedures]);

  const loadProcedures = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch procedures
      // For now, using mock data
      const mockProcedures: Procedure[] = [
        {
          id: '1',
          name: 'Consulta Geral',
          description: 'Consulta médica geral',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Limpeza Dental',
          description: 'Procedimento de limpeza e profilaxia',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      ];
      setProcedures(mockProcedures);
      setFilteredProcedures(mockProcedures);
    } catch (error: any) {
      console.error('Erro ao carregar procedimentos:', error);
      toast.error('Erro ao carregar procedimentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProcedure = (procedureId: string) => {
    setSelectedProcedureId(procedureId);
  };

  const handleCloseProcedureManager = () => {
    setSelectedProcedureId(null);
    // Optionally refresh procedures list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-100 dark:border-gray-600">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Gestão de Produtos por Procedimento
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Vincule produtos aos procedimentos e controle o consumo automático de estoque
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Validação automática de estoque
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Baixa automática ao finalizar
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Histórico de consumo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar procedimentos por nome ou descrição..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Procedures List */}
      {filteredProcedures.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border border-gray-100 dark:border-gray-700 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'Nenhum procedimento encontrado' : 'Nenhum procedimento cadastrado'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm
              ? 'Tente ajustar os termos de busca'
              : 'Cadastre procedimentos para vincular produtos'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProcedures.map((procedure) => (
            <div
              key={procedure.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectProcedure(procedure.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                    {procedure.name}
                  </h3>
                  {procedure.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {procedure.description}
                    </p>
                  )}
                </div>
                <div className="ml-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      procedure.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {procedure.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Criado em: {new Date(procedure.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectProcedure(procedure.id);
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Gerenciar →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Procedure Stock Manager Modal */}
      {selectedProcedureId && (
        <ProcedureStockManager
          procedureId={selectedProcedureId}
          onClose={handleCloseProcedureManager}
        />
      )}
    </div>
  );
}
