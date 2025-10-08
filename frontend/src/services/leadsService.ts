import api from './api';

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  isActive: boolean;
  order: number;
  color: string;
  stages: Stage[];
  createdAt: string;
  updatedAt: string;
}

export interface Stage {
  id: string;
  name: string;
  description: string;
  pipelineId: string;
  order: number;
  color: string;
  probability: number;
  isWon: boolean;
  isLost: boolean;
  leads?: Lead[];
  createdAt: string;
  updatedAt: string;
}

export interface Procedure {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  price?: number;
  duration?: number;
  category?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  phone2?: string;
  whatsapp?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  channel?: 'whatsapp' | 'phone' | 'email' | 'instagram' | 'facebook' | 'website' | 'in_person' | 'other';
  clientStatus?: 'conversa_iniciada' | 'agendamento_pendente' | 'agendado' | 'em_tratamento' | 'finalizado' | 'cancelado';
  attendanceLocation?: 'moema' | 'perdizes' | 'online' | 'a_domicilio';
  company?: string;
  position?: string;
  stageId: string;
  procedureId?: string;
  procedure?: Procedure;
  assignedToId?: string;
  assignedTo?: User;
  status: 'active' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'referral' | 'social_media' | 'email' | 'phone' | 'other';
  estimatedValue?: number;
  expectedCloseDate?: string;
  notes?: string;
  tags?: string[];
  createdBy?: any;
  activities?: Activity[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  leadId: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'task' | 'lead_created' | 'stage_change' | 'status_change' | 'lead_assigned';
  title: string;
  description?: string;
  scheduledAt?: string;
  completedAt?: string;
  isCompleted: boolean;
  user?: any;
  createdAt: string;
  updatedAt: string;
}

export const leadsService = {
  // Pipeline operations
  async getPipelines(): Promise<Pipeline[]> {
    const { data } = await api.get('/leads/pipelines');
    return data;
  },

  async getPipeline(id: string): Promise<Pipeline> {
    const { data } = await api.get(`/leads/pipelines/${id}`);
    return data;
  },

  async createPipeline(pipelineData: Partial<Pipeline>): Promise<Pipeline> {
    const { data } = await api.post('/leads/pipelines', pipelineData);
    return data;
  },

  async updatePipeline(id: string, pipelineData: Partial<Pipeline>): Promise<Pipeline> {
    const { data } = await api.put(`/leads/pipelines/${id}`, pipelineData);
    return data;
  },

  async deletePipeline(id: string): Promise<void> {
    await api.delete(`/leads/pipelines/${id}`);
  },

  // Stage operations
  async createStage(stageData: Partial<Stage>): Promise<Stage> {
    const { data } = await api.post('/leads/stages', stageData);
    return data;
  },

  async updateStage(id: string, stageData: Partial<Stage>): Promise<Stage> {
    const { data } = await api.put(`/leads/stages/${id}`, stageData);
    return data;
  },

  async deleteStage(id: string): Promise<void> {
    await api.delete(`/leads/stages/${id}`);
  },

  async reorderStages(stageOrders: Array<{ id: string; order: number }>): Promise<void> {
    await api.post('/leads/stages/reorder', { stageOrders });
  },

  // Lead operations
  async getLeads(filters?: {
    stageId?: string;
    assignedToId?: string;
    status?: string;
    priority?: string;
    source?: string;
    search?: string;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Lead[]> {
    const { data } = await api.get('/leads/leads', { params: filters });
    return data;
  },

  async getLead(id: string): Promise<Lead> {
    const { data } = await api.get(`/leads/leads/${id}`);
    return data;
  },

  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    const { data } = await api.post('/leads/leads', leadData);
    return data;
  },

  async updateLead(id: string, leadData: Partial<Lead>): Promise<Lead> {
    const { data } = await api.put(`/leads/leads/${id}`, leadData);
    return data;
  },

  async deleteLead(id: string): Promise<void> {
    await api.delete(`/leads/leads/${id}`);
  },

  async moveLeadToStage(leadId: string, stageId: string): Promise<Lead> {
    const { data } = await api.post(`/leads/leads/${leadId}/move`, { stageId });
    return data;
  },

  async bulkUpdateLeads(leadIds: string[], updateData: Partial<Lead>): Promise<Lead[]> {
    const { data } = await api.post('/leads/leads/bulk-update', { leadIds, data: updateData });
    return data;
  },

  // Activity operations
  async getLeadActivities(leadId: string): Promise<Activity[]> {
    const { data } = await api.get(`/leads/leads/${leadId}/activities`);
    return data;
  },

  async createActivity(leadId: string, activityData: Partial<Activity>): Promise<Activity> {
    const { data } = await api.post(`/leads/leads/${leadId}/activities`, activityData);
    return data;
  },

  async completeActivity(activityId: string): Promise<Activity> {
    const { data } = await api.put(`/leads/activities/${activityId}/complete`);
    return data;
  },

  // Analytics
  async getLeadStats(): Promise<any> {
    const { data } = await api.get('/leads/leads/stats');
    return data;
  },

  // Procedure operations
  async getProcedures(): Promise<Procedure[]> {
    const { data } = await api.get('/leads/procedures');
    return data;
  },

  async getProcedure(id: string): Promise<Procedure> {
    const { data } = await api.get(`/leads/procedures/${id}`);
    return data;
  },

  async createProcedure(procedureData: Partial<Procedure>): Promise<Procedure> {
    const { data } = await api.post('/leads/procedures', procedureData);
    return data;
  },

  async updateProcedure(id: string, procedureData: Partial<Procedure>): Promise<Procedure> {
    const { data } = await api.put(`/leads/procedures/${id}`, procedureData);
    return data;
  },

  async deleteProcedure(id: string): Promise<void> {
    await api.delete(`/leads/procedures/${id}`);
  },
};
