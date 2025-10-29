import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  FileText,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import pacienteService, { Patient } from '../services/pacienteService';

// Importar os componentes de tabs
import DadosPessoaisTab from '../components/pacientes/DadosPessoaisTab';
import ProntuarioTab from '../components/pacientes/ProntuarioTab';
import ImagensTab from '../components/pacientes/ImagensTab';
import AgendamentosTab from '../components/pacientes/AgendamentosTab';
import FinanceiroTab from '../components/pacientes/FinanceiroTab';
import ChatTab from '../components/pacientes/ChatTab';

type TabType = 'dados' | 'prontuario' | 'imagens' | 'agendamentos' | 'financeiro' | 'chat';

export default function PacienteFichaPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dados');

  useEffect(() => {
    if (id) {
      loadPatient(id);
    }
  }, [id]);

  const loadPatient = async (patientId: string) => {
    try {
      setLoading(true);
      const data = await pacienteService.getById(patientId);
      setPatient(data);
    } catch (error) {
      console.error('Erro ao carregar paciente:', error);
      alert('Erro ao carregar dados do paciente');
      navigate('/pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!patient || !window.confirm(`Tem certeza que deseja excluir ${patient.name}?`)) {
      return;
    }

    try {
      await pacienteService.delete(patient.id);
      navigate('/pacientes');
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      alert('Erro ao excluir paciente');
    }
  };

  const calculateAge = (birthDate?: string): string => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  const formatPhone = (phone?: string): string => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatCpf = (cpf?: string): string => {
    if (!cpf) return '-';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return cpf;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Paciente não encontrado</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dados', label: 'Dados Pessoais', icon: User },
    { id: 'prontuario', label: 'Prontuário', icon: FileText },
    { id: 'imagens', label: 'Imagens', icon: ImageIcon },
    { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
  ] as const;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/pacientes')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {/* Photo */}
            <div>
              {patient.profilePhotoUrl ? (
                <img
                  src={patient.profilePhotoUrl}
                  alt={patient.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {patient.name}
                </h1>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    patient.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  <span className="text-sm">
                    CPF: {formatCpf(patient.cpf)} | {calculateAge(patient.birthDate)}
                  </span>
                </div>

                {patient.whatsapp && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{formatPhone(patient.whatsapp)}</span>
                  </div>
                )}

                {patient.email && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{patient.email}</span>
                  </div>
                )}
              </div>

              {(patient.street || patient.city) && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {[patient.street, patient.number, patient.neighborhood, patient.city, patient.state]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/pacientes/${patient.id}/editar`)}
              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Tab Headers */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'dados' && <DadosPessoaisTab patient={patient} onUpdate={loadPatient} />}
          {activeTab === 'prontuario' && <ProntuarioTab patientId={patient.id} />}
          {activeTab === 'imagens' && <ImagensTab patientId={patient.id} />}
          {activeTab === 'agendamentos' && <AgendamentosTab patientId={patient.id} />}
          {activeTab === 'financeiro' && <FinanceiroTab patientId={patient.id} />}
          {activeTab === 'chat' && <ChatTab patient={patient} />}
        </div>
      </div>
    </div>
  );
}
