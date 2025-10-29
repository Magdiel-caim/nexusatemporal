import { Calendar, Plus, AlertCircle, Clock, MapPin, User, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import pacienteService from '../../services/pacienteService';
import toast from 'react-hot-toast';

interface AgendamentosTabProps {
  patientId: string;
}

interface Appointment {
  id: string;
  dateTime: string;
  status: string;
  procedure: {
    id: string;
    name: string;
  };
  professional: {
    id: string;
    name: string;
  };
  location: string;
  notes?: string;
}

export default function AgendamentosTab({ patientId }: AgendamentosTabProps) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [patientId]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await pacienteService.getAppointments(patientId);
      setAppointments(data);
    } catch (error: any) {
      console.error('Erro ao carregar agendamentos:', error);
      if (error.response?.status !== 404) {
        toast.error('Erro ao carregar agendamentos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewAppointment = () => {
    navigate('/agenda', {
      state: {
        patientId: patientId,
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      aguardando_pagamento: 'Aguardando Pagamento',
      pagamento_confirmado: 'Pagamento Confirmado',
      aguardando_confirmacao: 'Aguardando Confirmação',
      confirmado: 'Confirmado',
      reagendado: 'Reagendado',
      em_atendimento: 'Em Atendimento',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado',
      nao_compareceu: 'Não Compareceu',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      aguardando_pagamento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      pagamento_confirmado: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      aguardando_confirmacao: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      confirmado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      reagendado: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      em_atendimento: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      finalizado: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      nao_compareceu: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'finalizado' || status === 'confirmado') {
      return <CheckCircle className="w-4 h-4" />;
    }
    if (status === 'cancelado' || status === 'nao_compareceu') {
      return <XCircle className="w-4 h-4" />;
    }
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Agendamentos
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Histórico de agendamentos do paciente
          </p>
        </div>

        <button
          onClick={handleNewAppointment}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Appointments List */}
      {!loading && appointments.length > 0 && (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/agenda`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {appointment.procedure?.name || 'Procedimento não especificado'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      {formatDate(appointment.dateTime)} às {formatTime(appointment.dateTime)}
                    </div>
                  </div>
                </div>

                <span
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    appointment.status
                  )}`}
                >
                  {getStatusIcon(appointment.status)}
                  {getStatusLabel(appointment.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {appointment.professional && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>{appointment.professional.name}</span>
                  </div>
                )}

                {appointment.location && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{appointment.location}</span>
                  </div>
                )}
              </div>

              {appointment.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && appointments.length === 0 && (
        <div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Integração com Módulo de Agenda
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  Esta seção exibe automaticamente os agendamentos do paciente. Para criar um novo agendamento:
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 ml-4 list-disc">
                  <li>Clique no botão "Novo Agendamento" acima</li>
                  <li>Acesse o módulo de Agenda diretamente no menu</li>
                  <li>Associe o agendamento a este paciente</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Nenhum agendamento encontrado
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Os agendamentos aparecerão aqui automaticamente quando criados
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
