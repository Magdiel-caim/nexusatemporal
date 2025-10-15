import { useState, useEffect } from 'react';
import { Lead, Stage, leadsService } from '@/services/leadsService';
import appointmentService, { Appointment } from '@/services/appointmentService';
import { useAuthStore } from '@/store/authStore';
import LeadForm from './LeadForm';
import ActivitiesTimeline from './ActivitiesTimeline';
import ActivityForm from './ActivityForm';
import Modal from '@/components/ui/Modal';
import { FileText, Clock, Plus, Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeadDetailsProps {
  lead?: Lead;
  stages: Stage[];
  onSubmit: (data: Partial<Lead>) => Promise<void>;
  onClose: () => void;
  onScheduleAppointment?: (lead: Lead) => void;
  refreshAppointmentsTrigger?: number;
}

type TabType = 'details' | 'activities';

export default function LeadDetails({ lead, stages, onSubmit, onClose, onScheduleAppointment, refreshAppointmentsTrigger }: LeadDetailsProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Verificar permissão
  const canDelete = user?.role === 'admin' || user?.role === 'gestor';

  useEffect(() => {
    const loadAppointments = async () => {
      if (lead?.id) {
        try {
          const data = await appointmentService.getByLead(lead.id);
          setAppointments(data);
        } catch (error) {
          console.error('Erro ao carregar agendamentos:', error);
          setAppointments([]);
        }
      }
    };
    loadAppointments();
  }, [lead?.id, refreshAppointmentsTrigger]);

  const handleActivitySubmit = async (data: any) => {
    if (!lead) return;

    await leadsService.createActivity(lead.id, data);
    setShowActivityForm(false);
    // Refresh activities timeline by changing key
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (!canDelete) {
      toast.error('Você não tem permissão para excluir agendamentos');
      return;
    }

    const leadName = lead?.name || 'este agendamento';
    if (!window.confirm(`Tem certeza que deseja excluir o agendamento de "${leadName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    const reason = prompt('Motivo do cancelamento (opcional):');

    try {
      await appointmentService.cancel(appointment.id, reason || 'Cancelado pelo sistema');
      toast.success('Agendamento excluído com sucesso!');
      // Recarregar agendamentos
      if (lead?.id) {
        const data = await appointmentService.getByLead(lead.id);
        setAppointments(data);
      }
    } catch (error: any) {
      console.error('Erro ao excluir agendamento:', error);
      toast.error('Erro ao excluir agendamento');
    }
  };

  return (
    <div>
      {/* Header com Abas e Ação */}
      <div className="flex items-center justify-between border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'details'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Detalhes
          </button>
          {lead && (
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'activities'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              Histórico
            </button>
          )}
        </div>

        {/* Botão Nova Atividade - apenas na aba Detalhes */}
        {activeTab === 'details' && lead && (
          <button
            onClick={() => setShowActivityForm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Atividade
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'details' && (
          <div className="space-y-6">
            <LeadForm
              onSubmit={onSubmit}
              onCancel={onClose}
              initialData={lead}
              stages={stages}
            />

            {/* Agendamentos - apenas se lead já existe */}
            {lead && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Agendamentos
                  </h3>
                  <button
                    onClick={() => onScheduleAppointment?.(lead)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Novo Agendamento
                  </button>
                </div>

                {appointments.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <Calendar size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Nenhum agendamento registrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar size={18} className="text-blue-600" />
                              <span className="text-sm font-semibold text-gray-900">
                                {new Date(apt.scheduledDate).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                })} às {new Date(apt.scheduledDate).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div className="ml-8 space-y-1">
                              {apt.procedure && (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Procedimento:</span> {apt.procedure.name}
                                </p>
                              )}
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Local:</span> {apt.location === 'moema' ? 'Moema' : 'Av. Paulista'}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                                  apt.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                                  apt.status === 'aguardando_confirmacao' ? 'bg-orange-100 text-orange-800' :
                                  apt.status === 'finalizado' ? 'bg-gray-100 text-gray-800' :
                                  apt.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {apt.status === 'aguardando_pagamento' ? 'Aguardando Pagamento' :
                                   apt.status === 'aguardando_confirmacao' ? 'Aguardando Confirmação' :
                                   apt.status === 'confirmado' ? 'Confirmado' :
                                   apt.status === 'finalizado' ? 'Finalizado' :
                                   apt.status === 'cancelado' ? 'Cancelado' :
                                   apt.status}
                                </span>
                                {apt.paymentAmount && (
                                  <span className="text-sm font-semibold text-green-600">
                                    R$ {Number(apt.paymentAmount).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteAppointment(apt)}
                              className="flex-shrink-0 p-2 rounded hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
                              title="Excluir agendamento"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Atividades Manuais - apenas se lead já existe */}
            {lead && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Atividades e Follow-ups
                </h3>
                <ActivitiesTimeline
                  key={`activities-${refreshKey}`}
                  leadId={lead.id}
                  showOnlyHistory={false}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'activities' && lead && (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Histórico de alterações e atividades realizadas neste lead
              </p>
            </div>
            <ActivitiesTimeline
              key={`history-${refreshKey}`}
              leadId={lead.id}
              showOnlyHistory={true}
            />
          </div>
        )}
      </div>

      {/* Modal para Adicionar Atividade */}
      {showActivityForm && (
        <Modal
          isOpen={showActivityForm}
          onClose={() => setShowActivityForm(false)}
          title="Nova Atividade"
          size="md"
        >
          <ActivityForm
            onSubmit={handleActivitySubmit}
            onCancel={() => setShowActivityForm(false)}
          />
        </Modal>
      )}
    </div>
  );
}
