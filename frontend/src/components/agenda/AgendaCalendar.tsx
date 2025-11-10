import React, { useState, useEffect } from 'react';
import CalendarView from './CalendarView';
import TimeSlotPicker from './TimeSlotPicker';
import MultiTimeSlotPicker from './MultiTimeSlotPicker';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import PatientSearchInput from './PatientSearchInput';
import appointmentService, { Appointment } from '@/services/appointmentService';
import { leadsService } from '@/services/leadsService';
import { X, Plus, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDragValidation } from '@/hooks/useDragValidation';
import { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';

interface AgendaCalendarProps {
  appointments: Appointment[];
  onRefresh: () => void;
}

const AgendaCalendar: React.FC<AgendaCalendarProps> = ({ appointments, onRefresh }) => {
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);

  // Hooks para drag & drop
  const { validateDragStart, validateDragEnd, EDITABLE_STATUSES } = useDragValidation();

  const [formData, setFormData] = useState({
    leadId: '',
    procedureId: '',
    procedureIds: [] as string[], // Múltiplos procedimentos
    scheduledDate: '',
    scheduledTime: '09:00',
    selectedTimes: [] as string[], // Múltiplos horários consecutivos
    startTime: '', // Hora inicial manual
    endTime: '', // Hora final manual
    timeSelectionMode: 'single' as 'single' | 'multiple' | 'manual', // single, multiple ou manual
    location: 'moema',
    paymentAmount: '',
    paymentMethod: 'pix',
    hasReturn: false,
    returnCount: 0,
    returnFrequency: 30,
    notes: '',
  });

  useEffect(() => {
    loadProcedures();
  }, []);

  useEffect(() => {
    if (formData.scheduledDate && formData.location) {
      loadOccupiedSlots();
    }
  }, [formData.scheduledDate, formData.location]);

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
    // Abrir modal de detalhes do agendamento
    if (event.resource) {
      setSelectedAppointment(event.resource);
      setShowDetailsModal(true);
    }
  };

  const handleNavigate = (_date: Date) => {
    // Navegação do calendário
  };

  const handleTimeSelect = (time: string) => {
    setFormData({ ...formData, scheduledTime: time });
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determinar horário e duração baseado no modo selecionado
    let scheduledDateTime: Date;
    let totalDuration: number;

    if (formData.timeSelectionMode === 'manual') {
      // Modo manual: usa startTime e endTime
      if (!formData.startTime || !formData.endTime) {
        toast.error('Por favor, preencha hora inicial e final');
        return;
      }

      scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.startTime}:00`);

      // Calcular duração em minutos
      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      const [endHour, endMin] = formData.endTime.split(':').map(Number);
      totalDuration = (endHour * 60 + endMin) - (startHour * 60 + startMin);

      if (totalDuration <= 0) {
        toast.error('Hora final deve ser maior que hora inicial');
        return;
      }
    } else if (formData.timeSelectionMode === 'multiple') {
      // Modo múltiplos horários: usa selectedTimes
      if (formData.selectedTimes.length === 0) {
        toast.error('Por favor, selecione pelo menos um horário');
        return;
      }

      // Usar o primeiro horário como scheduledDate
      scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.selectedTimes[0]}:00`);

      // Calcular duração total dos slots selecionados
      const sortedTimes = [...formData.selectedTimes].sort();
      const firstTime = sortedTimes[0];
      const lastTime = sortedTimes[sortedTimes.length - 1];

      const [firstHour, firstMin] = firstTime.split(':').map(Number);
      const [lastHour, lastMin] = lastTime.split(':').map(Number);

      totalDuration = (lastHour * 60 + lastMin) - (firstHour * 60 + firstMin) + 5; // +5 para incluir o último slot
    } else {
      // Modo single (TimeSlotPicker): usa scheduledTime
      scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`);

      // Calcular duração total baseado em múltiplos procedimentos ou procedimento único
      if (formData.procedureIds.length > 0) {
        // Múltiplos procedimentos selecionados
        totalDuration = 0;
        formData.procedureIds.forEach(procId => {
          const proc = procedures.find(p => p.id === procId);
          if (proc) {
            totalDuration += proc.duration || 60;
          }
        });
      } else {
        // Procedimento único
        const selectedProcedure = procedures.find(p => p.id === formData.procedureId);
        totalDuration = selectedProcedure?.duration || 60;
      }
    }

    // Calcular valor total
    let totalAmount = 0;
    if (formData.procedureIds.length > 0) {
      formData.procedureIds.forEach(procId => {
        const proc = procedures.find(p => p.id === procId);
        if (proc) {
          totalAmount += parseFloat(proc.price) || 0;
        }
      });
    } else {
      const selectedProcedure = procedures.find(p => p.id === formData.procedureId);
      totalAmount = selectedProcedure ? parseFloat(selectedProcedure.price) : 0;
    }

    try {
      // Verificar disponibilidade
      const availability = await appointmentService.checkAvailability(
        scheduledDateTime.toISOString(),
        totalDuration,
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
        procedureIds: formData.procedureIds.length > 0 ? formData.procedureIds : undefined,
        scheduledDate: scheduledDateTime.toISOString(),
        estimatedDuration: totalDuration,
        location: formData.location,
        paymentAmount: formData.paymentAmount ? parseFloat(formData.paymentAmount) : totalAmount,
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
        procedureIds: [],
        scheduledDate: '',
        scheduledTime: '09:00',
        selectedTimes: [],
        startTime: '',
        endTime: '',
        timeSelectionMode: 'single',
        location: 'moema',
        paymentAmount: '',
        paymentMethod: 'pix',
        hasReturn: false,
        returnCount: 0,
        returnFrequency: 30,
        notes: '',
      });
      setSelectedPatientName('');
    } catch (error: any) {
      toast.error('Erro ao criar agendamento: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handler para drag & drop de eventos
  const handleEventDrop = async (data: EventInteractionArgs<any>) => {
    const { event, start } = data;
    const appointment: Appointment = event.resource;
    const newDate = typeof start === 'string' ? new Date(start) : start;

    console.log('[Drag & Drop] Iniciando reagendamento', {
      appointmentId: appointment.id,
      oldDate: appointment.scheduledDate,
      newDate: newDate,
    });

    // 1. Validar status editável
    const startValidation = validateDragStart(appointment);
    if (!startValidation.valid) {
      toast.error(startValidation.reason || 'Agendamento não pode ser movido');
      return;
    }

    // 2. Validar nova data/horário
    const duration = appointment.estimatedDuration || appointment.procedure?.duration || 60;
    const endValidation = validateDragEnd(newDate, duration);

    if (!endValidation.valid) {
      toast.error(endValidation.reason || 'Horário inválido');
      return;
    }

    if (endValidation.reason && endValidation.reason.includes('AVISO')) {
      toast(endValidation.reason.replace('AVISO: ', ''), { icon: '⚠️', duration: 4000 });
    }

    // 3. Atualizar diretamente no backend
    try {
      await appointmentService.update(appointment.id, {
        scheduledDate: newDate.toISOString()
      });

      toast.success('Agendamento reagendado com sucesso!');

      // 4. Recarregar appointments
      onRefresh();
    } catch (error: any) {
      console.error('[Drag & Drop] Erro ao atualizar:', error);
      toast.error('Erro ao reagendar: ' + (error.response?.data?.message || error.message));
    }
  };

  // Função que determina se um evento pode ser arrastado
  const draggableAccessor = (event: any): boolean => {
    const appointment: Appointment = event.resource;
    return EDITABLE_STATUSES.includes(appointment.status);
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
          onEventDrop={handleEventDrop}
          draggableAccessor={draggableAccessor}
        />
      </div>

      {/* Modal de Detalhes do Agendamento */}
      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAppointment(null);
          }}
          onRefresh={onRefresh}
        />
      )}

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
                      <PatientSearchInput
                        value={formData.leadId}
                        selectedPatientName={selectedPatientName}
                        onChange={(patientId, patientData) => {
                          setFormData({ ...formData, leadId: patientId });
                          setSelectedPatientName(patientData.name);
                        }}
                        placeholder="Buscar por nome, CPF ou RG..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Procedimento(s) *
                      </label>

                      {/* Modo de seleção */}
                      <div className="mb-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, procedureIds: [], procedureId: '' })}
                          className={`px-3 py-1 text-xs rounded ${formData.procedureIds.length === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                        >
                          Único
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, procedureId: '' })}
                          className={`px-3 py-1 text-xs rounded ${formData.procedureIds.length > 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                        >
                          Múltiplos
                        </button>
                      </div>

                      {formData.procedureIds.length === 0 ? (
                        // Seleção única
                        <select
                          required
                          value={formData.procedureId}
                          onChange={(e) => setFormData({ ...formData, procedureId: e.target.value })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                        >
                          <option value="">Selecione um procedimento</option>
                          {procedures.map((proc) => (
                            <option key={proc.id} value={proc.id}>
                              {proc.name} - R$ {proc.price} ({proc.duration}min)
                            </option>
                          ))}
                        </select>
                      ) : (
                        // Seleção múltipla
                        <div className="space-y-2">
                          <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                            {procedures.map((proc) => (
                              <label key={proc.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.procedureIds.includes(proc.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        procedureIds: [...formData.procedureIds, proc.id],
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        procedureIds: formData.procedureIds.filter(id => id !== proc.id),
                                      });
                                    }
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {proc.name} - R$ {proc.price} ({proc.duration}min)
                                </span>
                              </label>
                            ))}
                          </div>

                          {formData.procedureIds.length > 0 && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                {formData.procedureIds.length} procedimento(s) selecionado(s)
                              </div>
                              <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                Duração total: {formData.procedureIds.reduce((sum, id) => {
                                  const proc = procedures.find(p => p.id === id);
                                  return sum + (proc?.duration || 60);
                                }, 0)} min
                              </div>
                              <div className="text-xs text-blue-700 dark:text-blue-300">
                                Valor total: R$ {formData.procedureIds.reduce((sum, id) => {
                                  const proc = procedures.find(p => p.id === id);
                                  return sum + (parseFloat(proc?.price || '0'));
                                }, 0).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Local *
                      </label>
                      <select
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                      >
                        <option value="moema">Moema</option>
                        <option value="av_paulista">Av. Paulista</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Observações
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                        rows={3}
                        placeholder="Observações sobre o agendamento..."
                      />
                    </div>
                  </div>

                  {/* Coluna Direita - Seletor de Horário */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Horário *
                    </label>

                    {/* Toggle entre modos de seleção */}
                    <div className="mb-3 flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, timeSelectionMode: 'single', selectedTimes: [], startTime: '', endTime: '' })}
                        className={`px-3 py-1 text-xs rounded ${formData.timeSelectionMode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        Único
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, timeSelectionMode: 'multiple', scheduledTime: '', startTime: '', endTime: '' })}
                        className={`px-3 py-1 text-xs rounded ${formData.timeSelectionMode === 'multiple' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        Múltiplos
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, timeSelectionMode: 'manual', scheduledTime: '', selectedTimes: [] })}
                        className={`px-3 py-1 text-xs rounded ${formData.timeSelectionMode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        Manual
                      </button>
                    </div>

                    {formData.timeSelectionMode === 'single' ? (
                      // TimeSlotPicker - Seleção única
                      <TimeSlotPicker
                        selectedDate={formData.scheduledDate}
                        selectedTime={formData.scheduledTime}
                        occupiedSlots={occupiedSlots}
                        onTimeSelect={handleTimeSelect}
                        location={formData.location}
                      />
                    ) : formData.timeSelectionMode === 'multiple' ? (
                      // MultiTimeSlotPicker - Seleção múltipla
                      <MultiTimeSlotPicker
                        selectedDate={formData.scheduledDate}
                        selectedTimes={formData.selectedTimes}
                        occupiedSlots={occupiedSlots}
                        onTimesSelect={(times) => setFormData({ ...formData, selectedTimes: times })}
                        location={formData.location}
                      />
                    ) : (
                      // Campos manuais de hora inicial e final
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Hora Inicial *
                          </label>
                          <input
                            type="time"
                            required={formData.timeSelectionMode === 'manual'}
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                            min="07:00"
                            max="20:00"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Hora Final *
                          </label>
                          <input
                            type="time"
                            required={formData.timeSelectionMode === 'manual'}
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                            min="07:00"
                            max="20:00"
                          />
                        </div>

                        {formData.startTime && formData.endTime && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                            <div className="text-xs text-blue-700 dark:text-blue-300">
                              Duração: {(() => {
                                const [startHour, startMin] = formData.startTime.split(':').map(Number);
                                const [endHour, endMin] = formData.endTime.split(':').map(Number);
                                const durationMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                                return durationMin > 0 ? `${durationMin} minutos` : 'Inválido';
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                    disabled={
                      !formData.leadId ||
                      (!formData.procedureId && formData.procedureIds.length === 0) ||
                      !formData.scheduledDate ||
                      (formData.timeSelectionMode === 'single' && !formData.scheduledTime) ||
                      (formData.timeSelectionMode === 'multiple' && formData.selectedTimes.length === 0) ||
                      (formData.timeSelectionMode === 'manual' && (!formData.startTime || !formData.endTime))
                    }
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
