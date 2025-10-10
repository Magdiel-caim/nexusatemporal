import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { leadsService, Pipeline, Stage, Lead } from '@/services/leadsService';
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
import { LayoutGrid, List, Columns, Clock, Split } from 'lucide-react';
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadPipelines();
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
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!selectedPipeline) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nenhum Pipeline Encontrado</h2>
          <p className="text-gray-600 mb-6">Crie seu primeiro pipeline para começar a gerenciar leads.</p>
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
                    className="flex-shrink-0 w-80 bg-gray-100 rounded-lg flex flex-col"
                  >
                    {/* Stage Header */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          ></div>
                          <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {stageLeads.length}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(stageValue)} • {stage.probability}% prob.
                      </div>
                    </div>

                    {/* Leads List */}
                    <DroppableStageColumn id={stage.id}>
                      {stageLeads.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          Nenhum lead neste estágio
                        </div>
                      ) : (
                        stageLeads.map((lead) => (
                          <DraggableLeadCard
                            key={lead.id}
                            lead={lead}
                            formatCurrency={formatCurrency}
                            onClick={() => handleEditLead(lead)}
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
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{selectedPipeline.name}</h2>
              <p className="text-sm text-gray-500">Pipeline de vendas</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 relative"
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
            <span className="text-sm text-gray-600 mr-2">Visualização:</span>
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Columns size={16} />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={16} />
                Lista
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid size={16} />
                Grade
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Clock size={16} />
                Timeline
              </button>
              <button
                onClick={() => setViewMode('division')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'division'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
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
              />
            )}
          </ErrorBoundary>
        </Modal>
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
