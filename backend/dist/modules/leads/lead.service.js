"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadService = void 0;
const data_source_1 = require("../../database/data-source");
const lead_entity_1 = require("./lead.entity");
const activity_entity_1 = require("./activity.entity");
const typeorm_1 = require("typeorm");
class LeadService {
    leadRepository = data_source_1.CrmDataSource.getRepository(lead_entity_1.Lead);
    activityRepository = data_source_1.CrmDataSource.getRepository(activity_entity_1.Activity);
    async createLead(data) {
        const lead = this.leadRepository.create(data);
        const savedLead = await this.leadRepository.save(lead);
        // Create initial activity
        await this.createActivity({
            leadId: savedLead.id,
            type: activity_entity_1.ActivityType.LEAD_CREATED,
            title: 'Lead created',
            description: `Lead ${data.name} was created`,
            userId: data.createdById,
        });
        return this.getLeadById(savedLead.id, data.tenantId);
    }
    async getLeadsByTenant(tenantId, filters) {
        const where = { tenantId, isActive: true };
        if (filters?.stageId)
            where.stageId = filters.stageId;
        if (filters?.assignedToId)
            where.assignedToId = filters.assignedToId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.priority)
            where.priority = filters.priority;
        if (filters?.source)
            where.source = filters.source;
        if (filters?.search) {
            where.name = (0, typeorm_1.Like)(`%${filters.search}%`);
        }
        if (filters?.dateFrom && filters?.dateTo) {
            where.createdAt = (0, typeorm_1.Between)(filters.dateFrom, filters.dateTo);
        }
        return this.leadRepository.find({
            where,
            relations: ['stage', 'assignedTo', 'createdBy', 'procedure'],
            order: { createdAt: 'DESC' },
        });
    }
    async getLeadById(id, tenantId) {
        return this.leadRepository.findOne({
            where: { id, tenantId },
            relations: ['stage', 'assignedTo', 'createdBy', 'procedure', 'activities', 'activities.user'],
            order: { activities: { createdAt: 'DESC' } },
        });
    }
    async updateLead(id, tenantId, data, userId) {
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
                type: activity_entity_1.ActivityType.STAGE_CHANGE,
                title: 'Mudança de estágio',
                description: `Estágio alterado`,
                userId,
            });
        }
        // Track status changes
        if (data.status && data.status !== lead.status) {
            await this.createActivity({
                leadId: id,
                type: activity_entity_1.ActivityType.STATUS_CHANGE,
                title: 'Mudança de status',
                description: `Status alterado de ${lead.status} para ${data.status}`,
                userId,
            });
        }
        // Track assignment changes
        if (data.assignedToId && data.assignedToId !== lead.assignedToId) {
            await this.createActivity({
                leadId: id,
                type: activity_entity_1.ActivityType.LEAD_ASSIGNED,
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
                type: activity_entity_1.ActivityType.FIELD_CHANGE,
                title: change.title,
                description: change.description,
                userId,
                metadata: { field: change.field, oldValue: change.oldValue, newValue: change.newValue },
            });
        }
        await this.leadRepository.update({ id, tenantId }, data);
        return this.getLeadById(id, tenantId);
    }
    detectFieldChanges(lead, data) {
        const changes = [];
        const fieldLabels = {
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
            const oldValue = lead[field];
            const newValue = data[field];
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
                const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
                description = oldValue
                    ? `${label} alterado de ${formatCurrency(oldValue)} para ${formatCurrency(newValue)}`
                    : `${label} definido como ${formatCurrency(newValue)}`;
            }
            else if (field === 'expectedCloseDate') {
                const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR');
                description = oldValue
                    ? `${label} alterada de ${formatDate(oldValue)} para ${formatDate(newValue)}`
                    : `${label} definida para ${formatDate(newValue)}`;
            }
            else {
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
    async deleteLead(id, tenantId) {
        await this.leadRepository.update({ id, tenantId }, { isActive: false });
        return { success: true };
    }
    async moveLeadToStage(leadId, stageId, tenantId, userId) {
        return this.updateLead(leadId, tenantId, { stageId }, userId);
    }
    async bulkUpdateLeads(leadIds, tenantId, data, userId) {
        const promises = leadIds.map((id) => this.updateLead(id, tenantId, data, userId));
        return Promise.all(promises);
    }
    // Activity operations
    async createActivity(data) {
        const activity = this.activityRepository.create(data);
        return this.activityRepository.save(activity);
    }
    async getLeadActivities(leadId) {
        return this.activityRepository.find({
            where: { leadId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }
    async updateActivity(id, data) {
        await this.activityRepository.update({ id }, data);
        return this.activityRepository.findOne({
            where: { id },
            relations: ['user'],
        });
    }
    async completeActivity(id) {
        return this.updateActivity(id, {
            isCompleted: true,
            completedAt: new Date(),
        });
    }
    // Analytics
    async getLeadStats(tenantId) {
        const leads = await this.leadRepository.find({
            where: { tenantId, isActive: true },
            relations: ['stage'],
        });
        const totalLeads = leads.length;
        const totalValue = leads.reduce((sum, lead) => sum + Number(lead.estimatedValue), 0);
        const byStatus = leads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {});
        const byPriority = leads.reduce((acc, lead) => {
            acc[lead.priority] = (acc[lead.priority] || 0) + 1;
            return acc;
        }, {});
        const bySource = leads.reduce((acc, lead) => {
            acc[lead.source] = (acc[lead.source] || 0) + 1;
            return acc;
        }, {});
        const byStage = leads.reduce((acc, lead) => {
            const stageName = lead.stage?.name || 'Unknown';
            acc[stageName] = (acc[stageName] || 0) + 1;
            return acc;
        }, {});
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
exports.LeadService = LeadService;
//# sourceMappingURL=lead.service.js.map