import React, { useState, useEffect } from 'react';
import { X, User, Phone, Calendar, Clock, MapPin, FileText, History, DollarSign } from 'lucide-react';
import { Appointment } from '@/services/appointmentService';
import appointmentService from '@/services/appointmentService';

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  onClose: () => void;
  onRefresh?: () => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  onClose,
}) => {
  const [appointmentHistory, setAppointmentHistory] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [appointment.id]);

  const loadDetails = async () => {
    try {
      setLoading(true);

      // Buscar histórico de agendamentos do Lead
      if (appointment.leadId) {
        try {
          const history = await appointmentService.getByLead(appointment.leadId);
          setAppointmentHistory(history.filter(apt => apt.id !== appointment.id));
        } catch (error) {
          console.error('Erro ao carregar histórico:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      aguardando_pagamento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      pagamento_confirmado: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      aguardando_confirmacao: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      confirmado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      em_atendimento: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      finalizado: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      cancelado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
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
    return texts[status] || status;
  };

  const getLocationText = (location: string) => {
    const locations: Record<string, string> = {
      moema: 'Moema',
      av_paulista: 'Av. Paulista',
    };
    return locations[location] || location;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Detalhes do Agendamento
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
              {getStatusText(appointment.status)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Informações do Paciente */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <User size={20} />
                Informações do Paciente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {appointment.lead?.name || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Telefone</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Phone size={16} />
                    {appointment.lead?.phone || 'Não informado'}
                  </p>
                </div>
                {appointment.lead?.whatsapp && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {appointment.lead.whatsapp}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Informações do Agendamento */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Calendar size={20} />
                Informações do Agendamento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Procedimento</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {appointment.procedure?.name || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data e Horário</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock size={16} />
                    {formatDate(appointment.scheduledDate)} às {formatTime(appointment.scheduledDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Local</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin size={16} />
                    {getLocationText(appointment.location)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Duração</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {appointment.estimatedDuration || appointment.procedure?.duration || 60} minutos
                  </p>
                </div>
                {appointment.paymentAmount && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Valor</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <DollarSign size={16} />
                      R$ {typeof appointment.paymentAmount === 'number'
                        ? appointment.paymentAmount.toFixed(2)
                        : parseFloat(appointment.paymentAmount).toFixed(2)}
                    </p>
                  </div>
                )}
                {appointment.paymentMethod && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Forma de Pagamento</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {appointment.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            {appointment.notes && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FileText size={20} />
                  Observações
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {appointment.notes}
                </p>
              </div>
            )}

            {/* Histórico de Agendamentos */}
            {appointmentHistory.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <History size={20} />
                  Histórico de Agendamentos
                </h3>
                <div className="space-y-2">
                  {appointmentHistory.slice(0, 5).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border dark:border-gray-600"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {apt.procedure?.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDate(apt.scheduledDate)} - {getLocationText(apt.location)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {getStatusText(apt.status)}
                      </span>
                    </div>
                  ))}
                  {appointmentHistory.length > 5 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      + {appointmentHistory.length - 5} agendamentos anteriores
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer com ações */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
