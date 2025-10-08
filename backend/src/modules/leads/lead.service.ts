import { AppDataSource } from '@/database/data-source';
import { Lead, LeadStatus, LeadPriority, LeadSource } from './lead.entity';
import { Activity, ActivityType } from './activity.entity';
import { Between, Like, In } from 'typeorm';

export class LeadService {
  private leadRepository = AppDataSource.getRepository(Lead);
  private activityRepository = AppDataSource.getRepository(Activity);

  async createLead(data: {
    name: string;
    email?: string;
    phone?: string;
    phone2?: string;
    whatsapp?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    channel?: any;
    clientStatus?: any;
    attendanceLocation?: any;
    company?: string;
    position?: string;
    tenantId: string;
    stageId: string;
    procedureId?: string;
    assignedToId?: string;
    source?: LeadSource;
    priority?: LeadPriority;
    estimatedValue?: number;
    expectedCloseDate?: Date;
    notes?: string;
    tags?: string[];
    createdById: string;
  }) {
    const lead = this.leadRepository.create(data);
    const savedLead = await this.leadRepository.save(lead);

    // Create initial activity
    await this.createActivity({
      leadId: savedLead.id,
      type: ActivityType.LEAD_CREATED,
      title: 'Lead created',
      description: `Lead ${data.name} was created`,
      userId: data.createdById,
    });

    return this.getLeadById(savedLead.id, data.tenantId);
  }

  async getLeadsByTenant(
    tenantId: string,
    filters?: {
      stageId?: string;
      assignedToId?: string;
      status?: LeadStatus;
      priority?: LeadPriority;
      source?: LeadSource;
      search?: string;
      tags?: string[];
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {
    const where: any = { tenantId, isActive: true };

    if (filters?.stageId) where.stageId = filters.stageId;
    if (filters?.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.source) where.source = filters.source;

    if (filters?.search) {
      where.name = Like(`%${filters.search}%`);
    }

    if (filters?.dateFrom && filters?.dateTo) {
      where.createdAt = Between(filters.dateFrom, filters.dateTo);
    }

    return this.leadRepository.find({
      where,
      relations: ['stage', 'assignedTo', 'createdBy', 'procedure'],
      order: { createdAt: 'DESC' },
    });
  }

  async getLeadById(id: string, tenantId: string) {
    return this.leadRepository.findOne({
      where: { id, tenantId },
      relations: ['stage', 'assignedTo', 'createdBy', 'procedure', 'activities', 'activities.user'],
      order: { activities: { createdAt: 'DESC' } },
    });
  }

  async updateLead(
    id: string,
    tenantId: string,
    data: Partial<Lead>,
    userId: string
  ) {
    const lead = await this.leadRepository.findOne({
      where: { id, tenantId },
      relations: ['procedure'],
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Track stage changes
    if (data.stageId && data.stageId !== lead.stageId) {
      await this.createActivity({
        leadId: id,
        type: ActivityType.STAGE_CHANGE,
        title: 'Mudança de estágio',
        description: `Estágio alterado`,
        userId,
      });
    }

    // Track status changes
    if (data.status && data.status !== lead.status) {
      await this.createActivity({
        leadId: id,
        type: ActivityType.STATUS_CHANGE,
        title: 'Mudança de status',
        description: `Status alterado de ${lead.status} para ${data.status}`,
        userId,
      });
    }

    // Track assignment changes
    if (data.assignedToId && data.assignedToId !== lead.assignedToId) {
      await this.createActivity({
        leadId: id,
        type: ActivityType.LEAD_ASSIGNED,
        title: 'Responsável alterado',
        description: lead.assignedToId
          ? `Responsável alterado`
          : `Responsável atribuído`,
        userId,
      });
    }

    // Track other field changes
    const fieldChanges = this.detectFieldChanges(lead, data);
    for (const change of fieldChanges) {
      await this.createActivity({
        leadId: id,
        type: ActivityType.FIELD_CHANGE,
        title: change.title,
        description: change.description,
        userId,
        metadata: { field: change.field, oldValue: change.oldValue, newValue: change.newValue },
      });
    }

    await this.leadRepository.update({ id, tenantId }, data);
    return this.getLeadById(id, tenantId);
  }

  private detectFieldChanges(lead: Lead, data: Partial<Lead>) {
    const changes: Array<{ field: string; title: string; description: string; oldValue: any; newValue: any }> = [];

    const fieldLabels: Record<string, string> = {
      name: 'Nome',
      email: 'E-mail',
      phone: 'Telefone',
      phone2: 'Telefone 2',
      whatsapp: 'WhatsApp',
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'Estado',
      channel: 'Canal de comunicação',
      clientStatus: 'Status do cliente',
      attendanceLocation: 'Local de atendimento',
      procedureId: 'Procedimento',
      estimatedValue: 'Valor estimado',
      expectedCloseDate: 'Data prevista',
      notes: 'Observações',
      priority: 'Prioridade',
      source: 'Fonte',
    };

    // Check each field for changes
    for (const [field, label] of Object.entries(fieldLabels)) {
      const oldValue = (lead as any)[field];
      const newValue = (data as any)[field];

      // Skip if not in update data or unchanged
      if (newValue === undefined || oldValue === newValue) {
        continue;
      }

      // Skip stage, status, and assignedTo (handled separately)
      if (field === 'stageId' || field === 'status' || field === 'assignedToId') {
        continue;
      }

      let description = '';

      if (field === 'estimatedValue') {
        const formatCurrency = (val: number) =>
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
        description = oldValue
          ? `${label} alterado de ${formatCurrency(oldValue)} para ${formatCurrency(newValue)}`
          : `${label} definido como ${formatCurrency(newValue)}`;
      } else if (field === 'expectedCloseDate') {
        const formatDate = (date: Date) => new Date(date).toLocaleDateString('pt-BR');
        description = oldValue
          ? `${label} alterada de ${formatDate(oldValue)} para ${formatDate(newValue)}`
          : `${label} definida para ${formatDate(newValue)}`;
      } else {
        description = oldValue
          ? `${label} alterado de "${oldValue}" para "${newValue}"`
          : `${label} definido como "${newValue}"`;
      }

      changes.push({
        field,
        title: `${label} alterado`,
        description,
        oldValue,
        newValue,
      });
    }

    // Special handling for tags (array comparison)
    if (data.tags !== undefined) {
      const oldTags = lead.tags || [];
      const newTags = data.tags || [];

      if (JSON.stringify(oldTags) !== JSON.stringify(newTags)) {
        changes.push({
          field: 'tags',
          title: 'Tags alteradas',
          description: `Tags atualizadas: ${newTags.join(', ') || 'nenhuma'}`,
          oldValue: oldTags,
          newValue: newTags,
        });
      }
    }

    return changes;
  }

  async deleteLead(id: string, tenantId: string) {
    await this.leadRepository.update({ id, tenantId }, { isActive: false });
    return { success: true };
  }

  async moveLeadToStage(
    leadId: string,
    stageId: string,
    tenantId: string,
    userId: string
  ) {
    return this.updateLead(leadId, tenantId, { stageId }, userId);
  }

  async bulkUpdateLeads(
    leadIds: string[],
    tenantId: string,
    data: Partial<Lead>,
    userId: string
  ) {
    const promises = leadIds.map((id) =>
      this.updateLead(id, tenantId, data, userId)
    );
    return Promise.all(promises);
  }

  // Activity operations
  async createActivity(data: {
    leadId: string;
    type: ActivityType;
    title: string;
    description?: string;
    scheduledAt?: Date;
    userId: string;
    metadata?: Record<string, any>;
  }) {
    const activity = this.activityRepository.create(data);
    return this.activityRepository.save(activity);
  }

  async getLeadActivities(leadId: string) {
    return this.activityRepository.find({
      where: { leadId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateActivity(id: string, data: Partial<Activity>) {
    await this.activityRepository.update({ id }, data);
    return this.activityRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async completeActivity(id: string) {
    return this.updateActivity(id, {
      isCompleted: true,
      completedAt: new Date(),
    });
  }

  // Analytics
  async getLeadStats(tenantId: string) {
    const leads = await this.leadRepository.find({
      where: { tenantId, isActive: true },
      relations: ['stage'],
    });

    const totalLeads = leads.length;
    const totalValue = leads.reduce((sum, lead) => sum + Number(lead.estimatedValue), 0);

    const byStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = leads.reduce((acc, lead) => {
      acc[lead.priority] = (acc[lead.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySource = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStage = leads.reduce((acc, lead) => {
      const stageName = lead.stage?.name || 'Unknown';
      acc[stageName] = (acc[stageName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLeads,
      totalValue,
      byStatus,
      byPriority,
      bySource,
      byStage,
    };
  }
}
