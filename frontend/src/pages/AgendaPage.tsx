import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Plus, CheckCircle, XCircle, AlertCircle, Edit, Trash2, Filter, X, LayoutGrid, List } from 'lucide-react';
import appointmentService, { Appointment, UpdateAppointmentDto } from '../services/appointmentService';
import { leadsService } from '../services/leadsService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import AgendaCalendar from '../components/agenda/AgendaCalendar';

const AgendaPage: React.FC = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');
  const [viewType, setViewType] = useState<'list' | 'calendar'>('calendar'); // Padrão: calendário

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    location: 'all',
    procedureId: 'all',
    dateFrom: '',
    dateTo: '',
  });

  // Verificar permissão
  const canDelete = user?.role === 'admin' || user?.role === 'gestor';

  // Form states
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

  const [editFormData, setEditFormData] = useState({
    scheduledDate: '',
    scheduledTime: '09:00',
    location: 'moema',
    notes: '',
  });

  useEffect(() => {
    loadAppointments();
    loadLeads();
    loadProcedures();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [viewMode]);

  // Aplicar filtros sempre que mudar
  useEffect(() => {
    applyFilters();
  }, [appointments, filters]);

  const applyFilters = () => {
    let filtered = [...appointments];

    // Filtro por busca (nome do paciente)
    if (filters.search) {
      filtered = filtered.filter(apt =>
        apt.lead?.name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro por status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    // Filtro por localização
    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter(apt => apt.location === filters.location);
    }

    // Filtro por procedimento
    if (filters.procedureId && filters.procedureId !== 'all') {
      filtered = filtered.filter(apt => apt.procedureId === filters.procedureId);
    }

    // Filtro por data inicial
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(apt => new Date(apt.scheduledDate) >= fromDate);
    }

    // Filtro por data final
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(apt => new Date(apt.scheduledDate) <= toDate);
    }

    setFilteredAppointments(filtered);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      location: 'all',
      procedureId: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      let data: Appointment[];
      if (viewMode === 'today') {
        data = await appointmentService.getToday();
      } else {
        const result = await appointmentService.getAll();
        data = result.data;
      }
      // Ordenar por data
      data.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const scheduledDate = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`);

      await appointmentService.create({
        leadId: formData.leadId,
        procedureId: formData.procedureId,
        scheduledDate: scheduledDate.toISOString(),
        location: formData.location,
        paymentAmount: formData.paymentAmount ? parseFloat(formData.paymentAmount) : undefined,
        paymentMethod: formData.paymentMethod,
        hasReturn: formData.hasReturn,
        returnCount: formData.hasReturn ? formData.returnCount : undefined,
        returnFrequency: formData.hasReturn ? formData.returnFrequency : undefined,
        notes: formData.notes || undefined,
      });

      alert('Agendamento criado com sucesso!');
      setShowNewForm(false);
      loadAppointments();

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
      alert('Erro ao criar agendamento: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const date = new Date(appointment.scheduledDate);
    setEditFormData({
      scheduledDate: date.toISOString().split('T')[0],
      scheduledTime: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      location: appointment.location,
      notes: appointment.notes || '',
    });
    setShowEditForm(true);
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAppointment) return;

    try {
      const scheduledDate = new Date(`${editFormData.scheduledDate}T${editFormData.scheduledTime}:00`);

      const dto: UpdateAppointmentDto = {
        scheduledDate: scheduledDate.toISOString(),
        location: editFormData.location,
        notes: editFormData.notes || undefined,
      };

      await appointmentService.update(selectedAppointment.id, dto);
      alert('Agendamento atualizado com sucesso!');
      setShowEditForm(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error: any) {
      alert('Erro ao atualizar agendamento: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (!canDelete) {
      toast.error('Você não tem permissão para excluir agendamentos');
      return;
    }

    const leadName = appointment.lead?.name || 'este agendamento';
    if (!window.confirm(`Tem certeza que deseja excluir o agendamento de "${leadName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    const reason = prompt('Motivo do cancelamento (opcional):');

    try {
      await appointmentService.cancel(appointment.id, reason || 'Cancelado pelo sistema');
      toast.success('Agendamento excluído com sucesso!');
      loadAppointments();
    } catch (error: any) {
      console.error('Erro ao excluir agendamento:', error);
      toast.error('Erro ao excluir agendamento');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      aguardando_pagamento: 'bg-yellow-100 text-yellow-800',
      pagamento_confirmado: 'bg-blue-100 text-blue-800',
      aguardando_confirmacao: 'bg-orange-100 text-orange-800',
      confirmado: 'bg-green-100 text-green-800',
      em_atendimento: 'bg-purple-100 text-purple-800',
      finalizado: 'bg-gray-100 text-gray-800',
      cancelado: 'bg-red-100 text-red-800',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Agenda</h1>
          <p className="text-gray-600 dark:text-gray-300">Gerencie os agendamentos da clínica</p>
        </div>
        <div className="flex gap-3">
          {/* Toggle Calendário/Lista */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewType('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewType === 'calendar'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <LayoutGrid size={18} />
              Calendário
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewType === 'list'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <List size={18} />
              Lista
            </button>
          </div>

          {viewType === 'list' && (
            <>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Filter size={20} />
                Filtros
              </button>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('today')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'today'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'all'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Todos
                </button>
              </div>
              <button
                onClick={() => setShowNewForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Novo Agendamento
              </button>
            </>
          )}
        </div>
      </div>

      {/* Painel de Filtros */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtrar Agendamentos</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <X size={16} />
              Limpar Filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar Paciente</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Nome do paciente..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="aguardando_pagamento">Aguardando Pagamento</option>
                <option value="aguardando_confirmacao">Aguardando Confirmação</option>
                <option value="confirmado">Confirmado</option>
                <option value="em_atendimento">Em Atendimento</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Local</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="moema">Moema</option>
                <option value="av_paulista">Av. Paulista</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Procedimento</label>
              <select
                value={filters.procedureId}
                onChange={(e) => setFilters({ ...filters, procedureId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                {procedures.map((proc) => (
                  <option key={proc.id} value={proc.id}>
                    {proc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Inicial</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Final</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {viewType === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{viewMode === 'today' ? 'Hoje' : 'Total'}</p>
                <p className="text-2xl font-bold dark:text-white">{filteredAppointments.length}</p>
              </div>
              <Calendar className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Confirmados</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredAppointments.filter(a => a.status === 'confirmado').length}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Aguardando</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredAppointments.filter(a => a.status === 'aguardando_confirmacao').length}
                </p>
              </div>
              <AlertCircle className="text-orange-600" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Em Atendimento</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredAppointments.filter(a => a.status === 'em_atendimento').length}
                </p>
              </div>
              <Clock className="text-purple-600" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewType === 'calendar' && (
        <AgendaCalendar
          appointments={appointments}
          onRefresh={loadAppointments}
        />
      )}

      {/* Appointments List */}
      {viewType === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-gray-100">
            {viewMode === 'today' ? 'Agendamentos de Hoje' : 'Todos os Agendamentos'}
          </h2>
        </div>

        <div className="divide-y dark:divide-gray-700">
          {filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Calendar size={48} className="mx-auto mb-2 opacity-50" />
              <p>
                {appointments.length === 0
                  ? (viewMode === 'today' ? 'Nenhum agendamento para hoje' : 'Nenhum agendamento cadastrado')
                  : 'Nenhum agendamento encontrado com os filtros aplicados'}
              </p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold dark:text-gray-100">
                        {appointment.lead?.name || 'Lead não encontrado'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {viewMode === 'all' && (
                          <span className="font-medium mr-1">
                            {new Date(appointment.scheduledDate).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </span>
                        )}
                        {new Date(appointment.scheduledDate).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <User size={16} />
                        {appointment.procedure?.name || 'Procedimento'}
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        {getLocationText(appointment.location)}
                      </div>

                      {appointment.lead?.phone && (
                        <div className="flex items-center gap-2">
                          <span>📱</span>
                          {appointment.lead.phone}
                        </div>
                      )}
                    </div>

                    {appointment.notes && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{appointment.notes}</p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4 flex-wrap">
                    <button
                      onClick={() => handleEditClick(appointment)}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 flex items-center gap-1"
                    >
                      <Edit size={14} />
                      Editar
                    </button>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteAppointment(appointment)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
                        title="Excluir agendamento"
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    )}

                    {/* Botão de confirmação de pagamento - apenas para gestão */}
                    {canDelete && appointment.status === 'aguardando_pagamento' && (
                      <button
                        onClick={async () => {
                          const proof = prompt('Link do comprovante:');
                          if (proof) {
                            try {
                              await appointmentService.confirmPayment(appointment.id, proof, 'pix');
                              toast.success('Pagamento confirmado!');
                              loadAppointments();
                            } catch (error: any) {
                              toast.error('Erro ao confirmar pagamento');
                            }
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Confirmar Pagamento
                      </button>
                    )}

                    {/* Botão de confirmação de agendamento - apenas para gestão após pagamento confirmado */}
                    {canDelete && (appointment.status === 'pagamento_confirmado' || appointment.status === 'aguardando_confirmacao') && (
                      <button
                        onClick={async () => {
                          try {
                            await appointmentService.confirm(appointment.id, true);
                            toast.success('Agendamento confirmado!');
                            loadAppointments();
                          } catch (error: any) {
                            toast.error('Erro ao confirmar agendamento');
                          }
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
                      >
                        <CheckCircle size={14} />
                        Confirmar Agendamento
                      </button>
                    )}

                    {appointment.status === 'confirmado' && (
                      <button
                        onClick={() => appointmentService.checkIn(appointment.id).then(loadAppointments)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Check-in
                      </button>
                    )}

                    {(appointment.status === 'check_in' || appointment.status === 'confirmado') && (
                      <button
                        onClick={() => appointmentService.startAttendance(appointment.id).then(loadAppointments)}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center gap-1"
                      >
                        <Clock size={14} />
                        Iniciar Atendimento
                      </button>
                    )}

                    {appointment.status === 'em_atendimento' && (
                      <button
                        onClick={() => {
                          const hasReturn = window.confirm('Agendar retorno automático?');
                          appointmentService.finalizeAttendance(appointment.id, {
                            hasReturn,
                            returnCount: hasReturn ? 1 : undefined,
                            returnFrequency: hasReturn ? 30 : undefined,
                          }).then(loadAppointments);
                        }}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 flex items-center gap-1"
                      >
                        <CheckCircle size={14} />
                        Finalizar Atendimento
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      )}

      {/* Modal Novo Agendamento */}
      {showNewForm && viewType === 'list' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Novo Agendamento</h2>
                <button
                  onClick={() => setShowNewForm(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paciente *</label>
                  <select
                    required
                    value={formData.leadId}
                    onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Procedimento *</label>
                  <select
                    required
                    value={formData.procedureId}
                    onChange={(e) => setFormData({ ...formData, procedureId: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                  >
                    <option value="">Selecione um procedimento</option>
                    {procedures.map((proc) => (
                      <option key={proc.id} value={proc.id}>
                        {proc.name} - R$ {proc.price} ({proc.duration}min)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horário *</label>
                    <input
                      type="time"
                      required
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Local *</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                  >
                    <option value="moema">Moema</option>
                    <option value="av_paulista">Av. Paulista</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.paymentAmount}
                      onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Forma de Pagamento</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                    >
                      <option value="pix">PIX</option>
                      <option value="cartao">Cartão</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="boleto">Boleto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasReturn}
                      onChange={(e) => setFormData({ ...formData, hasReturn: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agendar retornos automáticos</span>
                  </label>
                </div>

                {formData.hasReturn && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade de retornos</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.returnCount}
                        onChange={(e) => setFormData({ ...formData, returnCount: parseInt(e.target.value) })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">A cada (dias)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.returnFrequency}
                        onChange={(e) => setFormData({ ...formData, returnFrequency: parseInt(e.target.value) })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                    rows={3}
                    placeholder="Observações sobre o agendamento..."
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Criar Agendamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Agendamento */}
      {showEditForm && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">Editar Agendamento</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Paciente: <span className="font-medium">{selectedAppointment.lead?.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateAppointment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={editFormData.scheduledDate}
                      onChange={(e) => setEditFormData({ ...editFormData, scheduledDate: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horário *</label>
                    <input
                      type="time"
                      required
                      value={editFormData.scheduledTime}
                      onChange={(e) => setEditFormData({ ...editFormData, scheduledTime: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Local *</label>
                  <select
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                  >
                    <option value="moema">Moema</option>
                    <option value="av_paulista">Av. Paulista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                    rows={3}
                    placeholder="Observações sobre o agendamento..."
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Salvar Alterações
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

export default AgendaPage;
