import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { leadsService, Pipeline, Stage, Lead, Procedure } from '@/services/leadsService';
import appointmentService, { CreateAppointmentDto } from '@/services/appointmentService';
import { useAuthStore } from '@/store/authStore';
import Modal from '@/components/ui/Modal';
import LeadDetails from '@/components/leads/LeadDetails';
import LeadsFilter, { LeadFilters } from '@/components/leads/LeadsFilter';
import ErrorBoundary from '@/components/ErrorBoundary';
import DroppableStageColumn from '@/components/leads/DroppableStageColumn';
import DraggableLeadCard from '@/components/leads/DraggableLeadCard';
import ListView from '@/components/leads/ListView';
import GridView from '@/components/leads/GridView';
import TimelineView from '@/components/leads/TimelineView';
import DivisionView from '@/components/leads/DivisionView';
import toast from 'react-hot-toast';
import { LayoutGrid, List, Columns, Clock, Split, X } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';

type ViewMode = 'kanban' | 'list' | 'grid' | 'timeline' | 'division';

export default function LeadsPage() {
  const location = useLocation();
  const { user } = useAuthStore();
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);
  const [activeDragLead, setActiveDragLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<LeadFilters>({});

  // Appointment modal states
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [leadForAppointment, setLeadForAppointment] = useState<Lead | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [refreshAppointmentsTrigger, setRefreshAppointmentsTrigger] = useState(0);
  const [appointmentData, setAppointmentData] = useState({
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadPipelines();
    loadProcedures();
  }, []);

  useEffect(() => {
    if (selectedPipeline) {
      loadLeads();
    }
  }, [selectedPipeline]);

  useEffect(() => {
    // Reaplicar filtros quando leads mudarem
    if (Object.keys(filters).length > 0) {
      applyFilters(filters);
    }
  }, [leads]);

  useEffect(() => {
    // Verificar se há um lead para abrir vindo do Dashboard
    const state = location.state as { openLeadId?: string };
    if (state?.openLeadId && leads.length > 0) {
      const leadToOpen = leads.find(l => l.id === state.openLeadId);
      if (leadToOpen) {
        handleEditLead(leadToOpen);
        // Limpar o state para evitar reabrir ao navegar de volta
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, leads]);

  const loadPipelines = async () => {
    try {
      const data = await leadsService.getPipelines();
      if (data.length > 0) {
        setSelectedPipeline(data[0]);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar pipelines');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      const data = await leadsService.getLeads();
      setLeads(data);
      setFilteredLeads(data);
    } catch (error: any) {
      toast.error('Erro ao carregar leads');
      console.error(error);
    }
  };

  const loadProcedures = async () => {
    try {
      const data = await leadsService.getProcedures();
      setProcedures(data);
    } catch (error: any) {
      console.error('Erro ao carregar procedimentos:', error);
    }
  };

  const handleScheduleAppointment = (lead: Lead) => {
    setLeadForAppointment(lead);
    setAppointmentData({
      scheduledDate: '',
      scheduledTime: '09:00',
      location: 'moema',
      paymentAmount: lead.procedure?.price?.toString() || '',
      paymentMethod: 'pix',
      hasReturn: false,
      returnCount: 0,
      returnFrequency: 30,
      notes: '',
    });
    setIsAppointmentModalOpen(true);
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadForAppointment) return;

    try {
      const scheduledDate = new Date(`${appointmentData.scheduledDate}T${appointmentData.scheduledTime}:00`);

      const dto: CreateAppointmentDto = {
        leadId: leadForAppointment.id,
        procedureId: leadForAppointment.procedureId || procedures[0]?.id,
        scheduledDate: scheduledDate.toISOString(),
        location: appointmentData.location,
        paymentAmount: appointmentData.paymentAmount ? parseFloat(appointmentData.paymentAmount) : undefined,
        paymentMethod: appointmentData.paymentMethod,
        hasReturn: appointmentData.hasReturn,
        returnCount: appointmentData.hasReturn ? appointmentData.returnCount : undefined,
        returnFrequency: appointmentData.hasReturn ? appointmentData.returnFrequency : undefined,
        notes: appointmentData.notes || undefined,
      };

      await appointmentService.create(dto);
      toast.success('Agendamento criado com sucesso!');
      setIsAppointmentModalOpen(false);
      setLeadForAppointment(null);
      // Trigger refresh dos agendamentos no card do lead
      setRefreshAppointmentsTrigger(prev => prev + 1);
    } catch (error: any) {
      toast.error('Erro ao criar agendamento: ' + (error.response?.data?.message || error.message));
    }
  };

  const applyFilters = (newFilters: LeadFilters) => {
    let filtered = [...leads];

    // Filtro por busca de nome
    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.includes(newFilters.search!)
      );
    }

    // Filtro por estágio
    if (newFilters.stageId) {
      filtered = filtered.filter(lead => lead.stageId === newFilters.stageId);
    }

    // Filtro por procedimento
    if (newFilters.procedureId) {
      filtered = filtered.filter(lead => lead.procedureId === newFilters.procedureId);
    }

    // Filtro por responsável
    if (newFilters.assignedToId) {
      filtered = filtered.filter(lead => lead.assignedToId === newFilters.assignedToId);
    }

    // Filtro por status do cliente
    if (newFilters.clientStatus) {
      filtered = filtered.filter(lead => lead.clientStatus === newFilters.clientStatus);
    }

    // Filtro por canal
    if (newFilters.channel) {
      filtered = filtered.filter(lead => lead.channel === newFilters.channel);
    }

    // Filtro por local de atendimento
    if (newFilters.attendanceLocation) {
      filtered = filtered.filter(lead => lead.attendanceLocation === newFilters.attendanceLocation);
    }

    // Filtro por faixa de valor
    if (newFilters.minValue !== undefined) {
      filtered = filtered.filter(lead => (lead.estimatedValue || 0) >= newFilters.minValue!);
    }
    if (newFilters.maxValue !== undefined) {
      filtered = filtered.filter(lead => (lead.estimatedValue || 0) <= newFilters.maxValue!);
    }

    setFilteredLeads(filtered);
    setFilters(newFilters);
  };

  const handleApplyFilters = (newFilters: LeadFilters) => {
    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setFilteredLeads(leads);
  };

  const handleCreateLead = () => {
    setSelectedLead(undefined);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(undefined);
  };

  const handleSubmitLead = async (data: Partial<Lead>) => {
    if (selectedLead) {
      await leadsService.updateLead(selectedLead.id, data);
    } else {
      await leadsService.createLead(data);
    }
    await loadLeads();
    handleCloseModal();
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (!window.confirm(`Tem certeza que deseja excluir o lead "${lead.name}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await leadsService.deleteLead(lead.id);
      toast.success('Lead excluído com sucesso!');
      await loadLeads();
    } catch (error: any) {
      console.error('Erro ao excluir lead:', error);
      toast.error('Erro ao excluir lead');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = filteredLeads.find(l => l.id === active.id);
    setActiveDragLead(lead || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragLead(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStageId = over.id as string;

    const lead = filteredLeads.find(l => l.id === leadId);
    if (!lead || lead.stageId === newStageId) return;

    try {
      // Atualiza localmente primeiro para feedback imediato
      const updateLeadStage = (leads: Lead[]) =>
        leads.map(l =>
          l.id === leadId ? { ...l, stageId: newStageId } : l
        );

      setLeads(updateLeadStage);
      setFilteredLeads(updateLeadStage);

      // Chama a API
      await leadsService.moveLeadToStage(leadId, newStageId);
      toast.success('Lead movido com sucesso!');
    } catch (error) {
      console.error('Erro ao mover lead:', error);
      toast.error('Erro ao mover lead');
      // Reverte a mudança local em caso de erro
      await loadLeads();
    }
  };

  const getLeadsByStage = (stageId: string) => {
    return filteredLeads.filter(lead => lead.stageId === stageId);
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!selectedPipeline) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nenhum Pipeline Encontrado</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Crie seu primeiro pipeline para começar a gerenciar leads.</p>
          <button className="btn-primary">
            Criar Pipeline
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        return (
          <ListView
            leads={filteredLeads}
            stages={selectedPipeline?.stages || []}
            formatCurrency={formatCurrency}
            onLeadClick={handleEditLead}
          />
        );
      case 'grid':
        return (
          <GridView
            leads={filteredLeads}
            stages={selectedPipeline?.stages || []}
            formatCurrency={formatCurrency}
            onLeadClick={handleEditLead}
          />
        );
      case 'timeline':
        return (
          <TimelineView
            leads={filteredLeads}
            stages={selectedPipeline?.stages || []}
            formatCurrency={formatCurrency}
            onLeadClick={handleEditLead}
          />
        );
      case 'division':
        return (
          <DivisionView
            leads={filteredLeads}
            stages={selectedPipeline?.stages || []}
            formatCurrency={formatCurrency}
            onLeadClick={handleEditLead}
            onScheduleAppointment={handleScheduleAppointment}
            refreshTrigger={refreshAppointmentsTrigger}
          />
        );
      case 'kanban':
      default:
        return (
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 min-h-[calc(100vh-20rem)] pb-4">
              {selectedPipeline.stages?.map((stage: Stage) => {
                const stageLeads = getLeadsByStage(stage.id);
                const stageValue = stageLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);

                return (
                  <div
                    key={stage.id}
                    className="flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col"
                  >
                    {/* Stage Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          ></div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{stage.name}</h3>
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stageLeads.length}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(stageValue)} • {stage.probability}% prob.
                      </div>
                    </div>

                    {/* Leads List */}
                    <DroppableStageColumn id={stage.id}>
                      {stageLeads.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                          Nenhum lead neste estágio
                        </div>
                      ) : (
                        stageLeads.map((lead) => (
                          <DraggableLeadCard
                            key={lead.id}
                            lead={lead}
                            formatCurrency={formatCurrency}
                            onClick={() => handleEditLead(lead)}
                            onDelete={handleDeleteLead}
                            userRole={user?.role}
                          />
                        ))
                      )}
                    </DroppableStageColumn>
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedPipeline.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pipeline de vendas</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 relative"
              >
                Filtros
                {Object.keys(filters).filter(key => filters[key as keyof LeadFilters]).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {Object.keys(filters).filter(key => filters[key as keyof LeadFilters]).length}
                  </span>
                )}
              </button>
              <button onClick={handleCreateLead} className="btn-primary">
                + Novo Lead
              </button>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Visualização:</span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Columns size={16} />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <List size={16} />
                Lista
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <LayoutGrid size={16} />
                Grade
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Clock size={16} />
                Timeline
              </button>
              <button
                onClick={() => setViewMode('division')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'division'
                    ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Split size={16} />
                Divisão
              </button>
            </div>
          </div>
        </div>

        {/* Content - Conditional Rendering */}
        {viewMode === 'kanban' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {renderContent()}
            <DragOverlay>
              {activeDragLead ? (
                <DraggableLeadCard
                  lead={activeDragLead}
                  formatCurrency={formatCurrency}
                  onClick={() => {}}
                  onDelete={handleDeleteLead}
                  userRole={user?.role}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {renderContent()}
          </div>
        )}

      {/* Modal de Lead */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedLead ? 'Editar Lead' : 'Novo Lead'}
          size="lg"
        >
          <ErrorBoundary>
            {selectedPipeline && (
              <LeadDetails
                lead={selectedLead}
                stages={selectedPipeline.stages || []}
                onSubmit={handleSubmitLead}
                onClose={handleCloseModal}
                onScheduleAppointment={handleScheduleAppointment}
                refreshAppointmentsTrigger={refreshAppointmentsTrigger}
              />
            )}
          </ErrorBoundary>
        </Modal>
      )}

      {/* Modal de Agendamento */}
      {isAppointmentModalOpen && leadForAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-[10100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">Novo Agendamento</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Paciente: <span className="font-medium">{leadForAppointment.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsAppointmentModalOpen(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitAppointment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data *</label>
                    <input
                      type="date"
                      required
                      value={appointmentData.scheduledDate}
                      onChange={(e) => setAppointmentData({ ...appointmentData, scheduledDate: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horário *</label>
                    <input
                      type="time"
                      required
                      value={appointmentData.scheduledTime}
                      onChange={(e) => setAppointmentData({ ...appointmentData, scheduledTime: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Local *</label>
                  <select
                    value={appointmentData.location}
                    onChange={(e) => setAppointmentData({ ...appointmentData, location: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                  >
                    <option value="moema">Moema</option>
                    <option value="av_paulista">Av. Paulista</option>
                    <option value="perdizes">Perdizes</option>
                    <option value="online">Online</option>
                    <option value="a_domicilio">A Domicílio</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                    <input
                      type="number"
                      step="0.01"
                      value={appointmentData.paymentAmount}
                      onChange={(e) => setAppointmentData({ ...appointmentData, paymentAmount: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Forma de Pagamento</label>
                    <select
                      value={appointmentData.paymentMethod}
                      onChange={(e) => setAppointmentData({ ...appointmentData, paymentMethod: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
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
                      checked={appointmentData.hasReturn}
                      onChange={(e) => setAppointmentData({ ...appointmentData, hasReturn: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agendar retornos automáticos</span>
                  </label>
                </div>

                {appointmentData.hasReturn && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade de retornos</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={appointmentData.returnCount}
                        onChange={(e) => setAppointmentData({ ...appointmentData, returnCount: parseInt(e.target.value) })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">A cada (dias)</label>
                      <input
                        type="number"
                        min="1"
                        value={appointmentData.returnFrequency}
                        onChange={(e) => setAppointmentData({ ...appointmentData, returnFrequency: parseInt(e.target.value) })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                  <textarea
                    value={appointmentData.notes}
                    onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                    rows={3}
                    placeholder="Observações sobre o agendamento..."
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAppointmentModalOpen(false)}
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

      {/* Painel de Filtros */}
      <LeadsFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        stages={selectedPipeline?.stages || []}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
