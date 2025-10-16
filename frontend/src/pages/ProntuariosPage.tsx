import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Phone,
  Mail,
  FileSearch,
} from 'lucide-react';
import medicalRecordsService, { MedicalRecord } from '../services/medicalRecordsService';
import CreateMedicalRecordForm from '../components/prontuarios/CreateMedicalRecordForm';
import EditMedicalRecordForm from '../components/prontuarios/EditMedicalRecordForm';
import ViewMedicalRecord from '../components/prontuarios/ViewMedicalRecord';

const ProntuariosPage: React.FC = () => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'view' | 'edit'>('list');

  useEffect(() => {
    loadMedicalRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, medicalRecords]);

  const loadMedicalRecords = async () => {
    try {
      setLoading(true);
      const records = await medicalRecordsService.getAllMedicalRecords();
      setMedicalRecords(records);
    } catch (error) {
      console.error('Erro ao carregar prontuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    if (!searchTerm.trim()) {
      setFilteredRecords(medicalRecords);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = medicalRecords.filter((record) => {
      return (
        record.fullName.toLowerCase().includes(term) ||
        record.recordNumber.toLowerCase().includes(term) ||
        record.cpf?.toLowerCase().includes(term) ||
        record.phone?.toLowerCase().includes(term) ||
        record.email?.toLowerCase().includes(term)
      );
    });

    setFilteredRecords(filtered);
  };

  const handleViewRecord = async (record: MedicalRecord) => {
    try {
      const completeRecord = await medicalRecordsService.getMedicalRecordComplete(record.id);
      setSelectedRecord(completeRecord);
      setViewMode('view');
    } catch (error) {
      console.error('Erro ao carregar prontuário completo:', error);
    }
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewMode('edit');
  };

  const handleDeleteRecord = async (record: MedicalRecord) => {
    if (!window.confirm(`Deseja realmente excluir o prontuário de ${record.fullName}?`)) {
      return;
    }

    try {
      await medicalRecordsService.deleteMedicalRecord(record.id);
      await loadMedicalRecords();
    } catch (error) {
      console.error('Erro ao excluir prontuário:', error);
      alert('Erro ao excluir prontuário');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedRecord(null);
  };

  if (viewMode === 'view' && selectedRecord) {
    return (
      <ViewMedicalRecord
        record={selectedRecord}
        onBack={handleBackToList}
        onEdit={() => setViewMode('edit')}
      />
    );
  }

  if (viewMode === 'edit' && selectedRecord) {
    return (
      <EditMedicalRecordForm
        record={selectedRecord}
        onSuccess={async () => {
          await loadMedicalRecords();
          handleBackToList();
        }}
        onClose={handleBackToList}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-gray-100">
            <FileText className="text-purple-600" />
            Prontuários Médicos
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gerencie os prontuários médicos dos pacientes
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Prontuário
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, telefone, e-mail ou número do prontuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total de Prontuários</p>
              <p className="text-2xl font-bold dark:text-white">{medicalRecords.length}</p>
            </div>
            <FileText className="text-purple-600" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Prontuários Ativos</p>
              <p className="text-2xl font-bold dark:text-white">
                {medicalRecords.filter((r) => r.isActive).length}
              </p>
            </div>
            <User className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Com Anamnese</p>
              <p className="text-2xl font-bold dark:text-white">
                {medicalRecords.filter((r) => r.anamnesisList && r.anamnesisList.length > 0).length}
              </p>
            </div>
            <FileSearch className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      {/* Medical Records List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nº Prontuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Data Criação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Carregando prontuários...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Nenhum prontuário encontrado
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      {record.recordNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{record.fullName}</div>
                      {record.cpf && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">CPF: {record.cpf}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-300">
                      {record.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          {record.phone}
                        </div>
                      )}
                      {record.email && (
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          {record.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar size={14} />
                      {new Date(record.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewRecord(record)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="Visualizar"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateMedicalRecordForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadMedicalRecords();
          }}
        />
      )}
    </div>
  );
};

export default ProntuariosPage;
