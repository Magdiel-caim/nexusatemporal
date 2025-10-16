import React, { useState, useEffect } from 'react';
import CalendarView from './CalendarView';
import TimeSlotPicker from './TimeSlotPicker';
import appointmentService, { Appointment } from '@/services/appointmentService';
import { leadsService } from '@/services/leadsService';
import { X, Plus, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface AgendaCalendarProps {
  appointments: Appointment[];
  onRefresh: () => void;
}

const AgendaCalendar: React.FC<AgendaCalendarProps> = ({ appointments, onRefresh }) => {
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    leadId: '',
    procedureId: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    location: 'moema',
    paymentAmount: '',
    paymentMethod: 'pix',
    hasReturn: false,
    returnCount: 0,
    returnFrequency: 30,
    notes: '',
  });

  useEffect(() => {
    loadLeads();
    loadProcedures();
  }, []);

  useEffect(() => {
    if (formData.scheduledDate && formData.location) {
      loadOccupiedSlots();
    }
  }, [formData.scheduledDate, formData.location]);

  const loadLeads = async () => {
    try {
      const data = await leadsService.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    }
  };

  const loadProcedures = async () => {
    try {
      const data = await leadsService.getProcedures();
      setProcedures(data);
    } catch (error) {
      console.error('Erro ao carregar procedimentos:', error);
    }
  };

  const loadOccupiedSlots = async () => {
    try {
      const slots = await appointmentService.getOccupiedSlots(
        formData.scheduledDate,
        formData.location
      );
      setOccupiedSlots(slots);
    } catch (error) {
      console.error('Erro ao carregar slots ocupados:', error);
    }
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    const date = slotInfo.start.toISOString().split('T')[0];
    const time = slotInfo.start.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    setFormData({
      ...formData,
      scheduledDate: date,
      scheduledTime: time,
    });

    setShowNewAppointmentModal(true);
  };

  const handleSelectEvent = (event: any) => {
    // Pode abrir modal de detalhes ou edição
    console.log('Evento selecionado:', event);
  };

  const handleNavigate = (_date: Date) => {
    // Navegação do calendário
  };

  const handleTimeSelect = (time: string) => {
    setFormData({ ...formData, scheduledTime: time });
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar horário disponível
    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`);
    const selectedProcedure = procedures.find(p => p.id === formData.procedureId);
    const duration = selectedProcedure?.duration || 60;

    try {
      // Verificar disponibilidade
      const availability = await appointmentService.checkAvailability(
        scheduledDateTime.toISOString(),
        duration,
        formData.location
      );

      if (!availability.available) {
        toast.error(
          `Horário indisponível! Há ${availability.conflicts.length} conflito(s) neste horário.`
        );
        return;
      }

      // Criar agendamento
      await appointmentService.create({
        leadId: formData.leadId,
        procedureId: formData.procedureId,
        scheduledDate: scheduledDateTime.toISOString(),
        location: formData.location,
        paymentAmount: formData.paymentAmount ? parseFloat(formData.paymentAmount) : undefined,
        paymentMethod: formData.paymentMethod,
        hasReturn: formData.hasReturn,
        returnCount: formData.hasReturn ? formData.returnCount : undefined,
        returnFrequency: formData.hasReturn ? formData.returnFrequency : undefined,
        notes: formData.notes || undefined,
      });

      toast.success('Agendamento criado com sucesso!');
      setShowNewAppointmentModal(false);
      onRefresh();

      // Reset form
      setFormData({
        leadId: '',
        procedureId: '',
        scheduledDate: '',
        scheduledTime: '09:00',
        location: 'moema',
        paymentAmount: '',
        paymentMethod: 'pix',
        hasReturn: false,
        returnCount: 0,
        returnFrequency: 30,
        notes: '',
      });
    } catch (error: any) {
      toast.error('Erro ao criar agendamento: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendário */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon size={24} />
            Calendário de Agendamentos
          </h2>
          <button
            onClick={() => setShowNewAppointmentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Novo Agendamento
          </button>
        </div>

        <CalendarView
          appointments={appointments}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Modal de Novo Agendamento */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Agendamento</h2>
                <button
                  onClick={() => setShowNewAppointmentModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Coluna Esquerda - Formulário */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Paciente *
                      </label>
                      <select
                        required
                        value={formData.leadId}
                        onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                      >
                        <option value="">Selecione um paciente</option>
                        {leads.map((lead) => (
                          <option key={lead.id} value={lead.id}>
                            {lead.name} - {lead.phone}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Procedimento *
                      </label>
                      <select
                        required
                        value={formData.procedureId}
                        onChange={(e) => setFormData({ ...formData, procedureId: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                      >
                        <option value="">Selecione um procedimento</option>
                        {procedures.map((proc) => (
                          <option key={proc.id} value={proc.id}>
                            {proc.name} - R$ {proc.price} ({proc.duration}min)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Local *
                      </label>
                      <select
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                      >
                        <option value="moema">Moema</option>
                        <option value="av_paulista">Av. Paulista</option>
                        <option value="perdizes">Perdizes</option>
                        <option value="online">Online</option>
                        <option value="a_domicilio">A Domicílio</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Observações
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                        rows={3}
                        placeholder="Observações sobre o agendamento..."
                      />
                    </div>
                  </div>

                  {/* Coluna Direita - Seletor de Horário */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Horário Disponível *
                    </label>
                    <TimeSlotPicker
                      selectedDate={formData.scheduledDate}
                      selectedTime={formData.scheduledTime}
                      occupiedSlots={occupiedSlots}
                      onTimeSelect={handleTimeSelect}
                      location={formData.location}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowNewAppointmentModal(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.leadId || !formData.procedureId || !formData.scheduledDate || !formData.scheduledTime}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Criar Agendamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaCalendar;
