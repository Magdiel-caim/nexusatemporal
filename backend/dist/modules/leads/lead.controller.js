"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadController = void 0;
const lead_service_1 = require("./lead.service");
class LeadController {
    leadService = new lead_service_1.LeadService();
    createLead = async (req, res) => {
        try {
            const { tenantId, id: userId } = req.user;
            console.log('Creating lead with data:', req.body);
            const lead = await this.leadService.createLead({
                ...req.body,
                tenantId,
                createdById: userId,
            });
            res.status(201).json(lead);
        }
        catch (error) {
            console.error('Error creating lead:', error);
            res.status(400).json({ error: error.message });
        }
    };
    getLeads = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const filters = {
                stageId: req.query.stageId,
                assignedToId: req.query.assignedToId,
                status: req.query.status,
                priority: req.query.priority,
                source: req.query.source,
                search: req.query.search,
                tags: req.query.tags ? req.query.tags.split(',') : undefined,
                dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom) : undefined,
                dateTo: req.query.dateTo ? new Date(req.query.dateTo) : undefined,
            };
            const leads = await this.leadService.getLeadsByTenant(tenantId, filters);
            res.json(leads);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getLead = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const lead = await this.leadService.getLeadById(id, tenantId);
            if (!lead) {
                return res.status(404).json({ error: 'Lead not found' });
            }
            res.json(lead);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    updateLead = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId, id: userId } = req.user;
            const lead = await this.leadService.updateLead(id, tenantId, req.body, userId);
            res.json(lead);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    deleteLead = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            await this.leadService.deleteLead(id, tenantId);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    moveLeadToStage = async (req, res) => {
        try {
            const { id } = req.params;
            const { stageId } = req.body;
            const { tenantId, id: userId } = req.user;
            const lead = await this.leadService.moveLeadToStage(id, stageId, tenantId, userId);
            res.json(lead);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    bulkUpdateLeads = async (req, res) => {
        try {
            const { leadIds, data } = req.body;
            const { tenantId, id: userId } = req.user;
            const leads = await this.leadService.bulkUpdateLeads(leadIds, tenantId, data, userId);
            res.json(leads);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    // Activity operations
    createActivity = async (req, res) => {
        try {
            const { id: leadId } = req.params;
            const { id: userId } = req.user;
            const activity = await this.leadService.createActivity({
                ...req.body,
                leadId,
                userId,
            });
            res.status(201).json(activity);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getLeadActivities = async (req, res) => {
        try {
            const { id } = req.params;
            const activities = await this.leadService.getLeadActivities(id);
            res.json(activities);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    completeActivity = async (req, res) => {
        try {
            const { activityId } = req.params;
            const activity = await this.leadService.completeActivity(activityId);
            res.json(activity);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    // Analytics
    getLeadStats = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const stats = await this.leadService.getLeadStats(tenantId);
            res.json(stats);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.LeadController = LeadController;
//# sourceMappingURL=lead.controller.js.map