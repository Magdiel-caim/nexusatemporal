"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingController = void 0;
const bulk_message_worker_1 = require("./workers/bulk-message.worker");
const data_source_1 = require("../../database/data-source");
const bulk_message_contact_entity_1 = require("./entities/bulk-message-contact.entity");
const services_1 = require("./services");
class MarketingController {
    // Lazy initialization - services são criados sob demanda
    get campaignService() {
        return new services_1.CampaignService();
    }
    get socialPostService() {
        return new services_1.SocialPostService();
    }
    get bulkMessageService() {
        return new services_1.BulkMessageService();
    }
    get landingPageService() {
        return new services_1.LandingPageService();
    }
    get aiAssistantService() {
        return new services_1.AIAssistantService();
    }
    get integrationService() {
        return new services_1.MarketingIntegrationService();
    }
    get wahaService() {
        return new services_1.WahaService();
    }
    // ============================================
    // CAMPAIGNS
    // ============================================
    async createCampaign(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized: tenant_id required' });
                return;
            }
            const campaign = await this.campaignService.create(tenantId, req.body, userId);
            res.status(201).json(campaign);
        }
        catch (error) {
            console.error('[MarketingController] createCampaign error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getCampaigns(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { status, type, startDate, endDate } = req.query;
            const campaigns = await this.campaignService.findAll(tenantId, {
                status: status,
                type: type,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            });
            res.json(campaigns);
        }
        catch (error) {
            console.error('[MarketingController] getCampaigns error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getCampaignById(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const campaign = await this.campaignService.findById(req.params.id, tenantId);
            if (!campaign) {
                res.status(404).json({ error: 'Campaign not found' });
                return;
            }
            res.json(campaign);
        }
        catch (error) {
            console.error('[MarketingController] getCampaignById error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async updateCampaign(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const campaign = await this.campaignService.update(req.params.id, tenantId, req.body);
            if (!campaign) {
                res.status(404).json({ error: 'Campaign not found' });
                return;
            }
            res.json(campaign);
        }
        catch (error) {
            console.error('[MarketingController] updateCampaign error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async deleteCampaign(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const deleted = await this.campaignService.delete(req.params.id, tenantId);
            if (!deleted) {
                res.status(404).json({ error: 'Campaign not found' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('[MarketingController] deleteCampaign error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getCampaignStats(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const stats = await this.campaignService.getStats(tenantId);
            res.json(stats);
        }
        catch (error) {
            console.error('[MarketingController] getCampaignStats error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // ============================================
    // SOCIAL POSTS
    // ============================================
    async createSocialPost(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const post = await this.socialPostService.create(tenantId, req.body, userId);
            res.status(201).json(post);
        }
        catch (error) {
            console.error('[MarketingController] createSocialPost error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getSocialPosts(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { status, platform, campaignId } = req.query;
            const posts = await this.socialPostService.findAll(tenantId, {
                status: status,
                platform: platform,
                campaignId: campaignId,
            });
            res.json(posts);
        }
        catch (error) {
            console.error('[MarketingController] getSocialPosts error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getSocialPostById(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const post = await this.socialPostService.findById(req.params.id, tenantId);
            if (!post) {
                res.status(404).json({ error: 'Post not found' });
                return;
            }
            res.json(post);
        }
        catch (error) {
            console.error('[MarketingController] getSocialPostById error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async updateSocialPost(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const post = await this.socialPostService.update(req.params.id, tenantId, req.body);
            if (!post) {
                res.status(404).json({ error: 'Post not found' });
                return;
            }
            res.json(post);
        }
        catch (error) {
            console.error('[MarketingController] updateSocialPost error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async deleteSocialPost(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const deleted = await this.socialPostService.delete(req.params.id, tenantId);
            if (!deleted) {
                res.status(404).json({ error: 'Post not found' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('[MarketingController] deleteSocialPost error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async scheduleSocialPost(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { scheduledAt } = req.body;
            if (!scheduledAt) {
                res.status(400).json({ error: 'scheduledAt is required' });
                return;
            }
            const post = await this.socialPostService.schedule(req.params.id, tenantId, new Date(scheduledAt));
            if (!post) {
                res.status(404).json({ error: 'Post not found' });
                return;
            }
            res.json(post);
        }
        catch (error) {
            console.error('[MarketingController] scheduleSocialPost error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // ============================================
    // BULK MESSAGES
    // ============================================
    async createBulkMessage(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;
            if (!tenantId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const { sessionId, contacts, message, imageUrl, minDelaySeconds = 1, maxDelaySeconds = 5, scheduledFor, } = req.body;
            // Validações
            if (!sessionId) {
                res.status(400).json({ success: false, message: 'Session ID is required' });
                return;
            }
            if (!contacts || contacts.length === 0) {
                res.status(400).json({ success: false, message: 'Contacts list is required' });
                return;
            }
            if (!message) {
                res.status(400).json({ success: false, message: 'Message is required' });
                return;
            }
            // Criar bulk message usando o service existente
            const bulkMessage = await this.bulkMessageService.create(tenantId, {
                platform: 'whatsapp',
                content: message,
                status: (scheduledFor ? 'scheduled' : 'sending'),
                scheduledAt: scheduledFor ? new Date(scheduledFor) : undefined,
                totalRecipients: contacts.length,
                sentCount: 0,
                deliveredCount: 0,
                openedCount: 0,
                clickedCount: 0,
                failedCount: 0,
            }, userId);
            // Criar registros de contatos
            const contactRepo = data_source_1.AppDataSource.getRepository(bulk_message_contact_entity_1.BulkMessageContact);
            for (const contact of contacts) {
                await contactRepo.save({
                    bulkMessageId: bulkMessage.id,
                    name: contact.name,
                    phoneNumber: contact.phone,
                    status: 'pending',
                });
            }
            // Adicionar à fila
            const delay = scheduledFor ? new Date(scheduledFor).getTime() - Date.now() : 0;
            await bulk_message_worker_1.bulkMessageQueue.add('send-bulk', {
                bulkMessageId: bulkMessage.id,
                sessionId,
                tenantId,
                message,
                imageUrl,
                contacts,
                minDelay: minDelaySeconds,
                maxDelay: maxDelaySeconds,
            }, {
                delay: Math.max(0, delay),
            });
            console.log(`[MarketingController] Bulk message ${bulkMessage.id} created and queued with ${contacts.length} contacts`);
            res.status(201).json({
                success: true,
                data: bulkMessage,
                message: scheduledFor
                    ? `Disparo agendado para ${new Date(scheduledFor).toLocaleString()}`
                    : 'Disparo iniciado! Processamento em andamento.',
            });
        }
        catch (error) {
            console.error('[MarketingController] createBulkMessage error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async getBulkMessages(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { status, platform, campaignId } = req.query;
            const messages = await this.bulkMessageService.findAll(tenantId, {
                status: status,
                platform: platform,
                campaignId: campaignId,
            });
            res.json(messages);
        }
        catch (error) {
            console.error('[MarketingController] getBulkMessages error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getBulkMessageById(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const message = await this.bulkMessageService.findById(req.params.id, tenantId);
            if (!message) {
                res.status(404).json({ error: 'Bulk message not found' });
                return;
            }
            res.json(message);
        }
        catch (error) {
            console.error('[MarketingController] getBulkMessageById error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // ============================================
    // LANDING PAGES
    // ============================================
    async createLandingPage(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const page = await this.landingPageService.create(tenantId, req.body, userId);
            res.status(201).json(page);
        }
        catch (error) {
            console.error('[MarketingController] createLandingPage error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getLandingPages(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { status, campaignId } = req.query;
            const pages = await this.landingPageService.findAll(tenantId, {
                status: status,
                campaignId: campaignId,
            });
            res.json(pages);
        }
        catch (error) {
            console.error('[MarketingController] getLandingPages error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getLandingPageById(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const page = await this.landingPageService.findById(req.params.id, tenantId);
            if (!page) {
                res.status(404).json({ error: 'Landing page not found' });
                return;
            }
            res.json(page);
        }
        catch (error) {
            console.error('[MarketingController] getLandingPageById error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async updateLandingPage(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const page = await this.landingPageService.update(req.params.id, tenantId, req.body);
            if (!page) {
                res.status(404).json({ error: 'Landing page not found' });
                return;
            }
            res.json(page);
        }
        catch (error) {
            console.error('[MarketingController] updateLandingPage error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async publishLandingPage(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const page = await this.landingPageService.publish(req.params.id, tenantId);
            if (!page) {
                res.status(404).json({ error: 'Landing page not found' });
                return;
            }
            res.json(page);
        }
        catch (error) {
            console.error('[MarketingController] publishLandingPage error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getLandingPageAnalytics(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const days = parseInt(req.query.days) || 30;
            const analytics = await this.landingPageService.getAnalytics(req.params.id, tenantId, days);
            res.json(analytics);
        }
        catch (error) {
            console.error('[MarketingController] getLandingPageAnalytics error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // ============================================
    // AI ASSISTANT
    // ============================================
    async analyzeWithAI(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { provider, model, analysisType, inputData } = req.body;
            if (!provider || !model || !analysisType || !inputData) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            const analysis = await this.aiAssistantService.analyze(tenantId, provider, model, analysisType, inputData, userId);
            res.json(analysis);
        }
        catch (error) {
            console.error('[MarketingController] analyzeWithAI error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getAIAnalyses(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const limit = parseInt(req.query.limit) || 10;
            const analyses = await this.aiAssistantService.getRecentAnalyses(tenantId, limit);
            res.json(analyses);
        }
        catch (error) {
            console.error('[MarketingController] getAIAnalyses error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async optimizeCopy(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { content, context } = req.body;
            if (!content) {
                res.status(400).json({ error: 'Content is required' });
                return;
            }
            const analysis = await this.aiAssistantService.optimizeCopy(tenantId, content, context || {}, userId);
            res.json(analysis);
        }
        catch (error) {
            console.error('[MarketingController] optimizeCopy error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async generateImage(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { prompt, options } = req.body;
            if (!prompt) {
                res.status(400).json({ error: 'Prompt is required' });
                return;
            }
            const analysis = await this.aiAssistantService.generateImage(tenantId, prompt, options || {}, userId);
            res.json(analysis);
        }
        catch (error) {
            console.error('[MarketingController] generateImage error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // ============================================
    // INTEGRATIONS
    // ============================================
    async upsertIntegration(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { platform, name, credentials, config, status } = req.body;
            if (!platform) {
                res.status(400).json({ error: 'Platform is required' });
                return;
            }
            const integration = await this.integrationService.upsert(tenantId, platform, { name, credentials, config, status }, userId);
            res.json(integration);
        }
        catch (error) {
            console.error('[MarketingController] upsertIntegration error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getIntegrations(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { status } = req.query;
            const integrations = await this.integrationService.getAll(tenantId, {
                status: status,
            });
            res.json(integrations);
        }
        catch (error) {
            console.error('[MarketingController] getIntegrations error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getIntegrationByPlatform(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const integration = await this.integrationService.getByPlatform(tenantId, req.params.platform);
            if (!integration) {
                res.status(404).json({ error: 'Integration not found' });
                return;
            }
            res.json(integration);
        }
        catch (error) {
            console.error('[MarketingController] getIntegrationByPlatform error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getAIProviders(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const providers = await this.integrationService.getAIProviders(tenantId);
            res.json(providers);
        }
        catch (error) {
            console.error('[MarketingController] getAIProviders error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async testIntegration(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const result = await this.integrationService.testConnection(req.params.id, tenantId);
            res.json(result);
        }
        catch (error) {
            console.error('[MarketingController] testIntegration error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async deleteIntegration(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const deleted = await this.integrationService.delete(req.params.id, tenantId);
            if (!deleted) {
                res.status(404).json({ error: 'Integration not found' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('[MarketingController] deleteIntegration error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // ============================================
    // WAHA SESSIONS
    // ============================================
    async createWahaSession(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const session = await this.wahaService.createSession(tenantId, req.body, userId);
            res.status(201).json(session);
        }
        catch (error) {
            console.error('[MarketingController] createWahaSession error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getWahaSessions(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { isActive } = req.query;
            const sessions = await this.wahaService.getSessions(tenantId, {
                isActive: isActive === 'true',
            });
            res.json(sessions);
        }
        catch (error) {
            console.error('[MarketingController] getWahaSessions error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getWahaSession(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const session = await this.wahaService.getSession(req.params.id, tenantId);
            if (!session) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }
            res.json(session);
        }
        catch (error) {
            console.error('[MarketingController] getWahaSession error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async startWahaSession(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const result = await this.wahaService.startSession(req.params.id, tenantId);
            res.json(result);
        }
        catch (error) {
            console.error('[MarketingController] startWahaSession error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async stopWahaSession(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const session = await this.wahaService.stopSession(req.params.id, tenantId);
            res.json(session);
        }
        catch (error) {
            console.error('[MarketingController] stopWahaSession error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getWahaQRCode(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const qrCode = await this.wahaService.getQRCode(req.params.id, tenantId);
            res.json({ qrCode });
        }
        catch (error) {
            console.error('[MarketingController] getWahaQRCode error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async deleteWahaSession(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const deleted = await this.wahaService.deleteSession(req.params.id, tenantId);
            if (!deleted) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('[MarketingController] deleteWahaSession error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async sendWahaMessage(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const { phoneNumber, message, mediaUrl } = req.body;
            if (!phoneNumber || !message) {
                res.status(400).json({ error: 'Phone number and message are required' });
                return;
            }
            const result = await this.wahaService.sendMessage(req.params.id, tenantId, {
                phoneNumber,
                message,
                mediaUrl,
            });
            res.json(result);
        }
        catch (error) {
            console.error('[MarketingController] sendWahaMessage error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // WAHA Webhook handler
    async wahaWebhook(req, res) {
        try {
            console.log('[MarketingController] WAHA webhook received:', JSON.stringify(req.body, null, 2));
            // Process webhook payload from WAHA
            const { event, session, payload } = req.body;
            // Handle different event types
            if (event === 'session.status') {
                // Update session status
                console.log(`[WAHA Webhook] Session ${session} status changed to ${payload?.status}`);
            }
            else if (event === 'message') {
                // Process incoming message
                console.log(`[WAHA Webhook] Message received on session ${session}`);
            }
            res.status(200).json({ success: true });
        }
        catch (error) {
            console.error('[MarketingController] wahaWebhook error:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // ============================================
    // IMAGE UPLOAD
    // ============================================
    async uploadImage(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            const file = req.file;
            if (!tenantId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            if (!file) {
                res.status(400).json({ success: false, message: 'No file uploaded' });
                return;
            }
            // URL pública da imagem
            const imageUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/uploads/marketing/${file.filename}`;
            console.log('[MarketingController] Image uploaded:', imageUrl);
            res.json({ success: true, url: imageUrl });
        }
        catch (error) {
            console.error('[MarketingController] Upload image error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    // ============================================
    // AI ASSISTANT - GENERATE COPY
    // ============================================
    async generateAICopy(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            const { prompt, context } = req.body;
            if (!tenantId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            if (!prompt) {
                res.status(400).json({ success: false, message: 'Prompt is required' });
                return;
            }
            // Por enquanto, retornar placeholder
            // Na próxima versão, implementar chamadas reais para OpenRouter/Groq
            const generatedText = `Olá {nome}! 👋\n\nTenho uma novidade incrível para você!\n\n${prompt}\n\nQuer saber mais? Responda esta mensagem!`;
            const result = {
                generatedText,
                variations: [
                    'Variação 1: Mais formal',
                    'Variação 2: Mais casual',
                    'Variação 3: Com urgência'
                ]
            };
            console.log('[MarketingController] AI Copy generated for tenant:', tenantId);
            res.json({ success: true, output: result });
        }
        catch (error) {
            console.error('[MarketingController] Generate copy error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    // ============================================
    // AI INTEGRATIONS CONFIG
    // ============================================
    async listAIConfigs(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const aiConfigService = (await Promise.resolve().then(() => __importStar(require('./ai-config.service')))).default;
            const configs = await aiConfigService.listConfigs(tenantId);
            res.json({ success: true, data: configs });
        }
        catch (error) {
            console.error('[MarketingController] List AI configs error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async createOrUpdateAIConfig(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            if (!tenantId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const { provider, apiKey, model, isActive } = req.body;
            if (!provider || !apiKey || !model) {
                res.status(400).json({ success: false, message: 'Missing required fields' });
                return;
            }
            const aiConfigService = (await Promise.resolve().then(() => __importStar(require('./ai-config.service')))).default;
            const config = await aiConfigService.upsertConfig({
                tenant_id: tenantId,
                provider,
                api_key: apiKey,
                model,
                is_active: isActive !== false,
            });
            res.json({ success: true, data: config });
        }
        catch (error) {
            console.error('[MarketingController] Create/Update AI config error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async deleteAIConfig(req, res) {
        try {
            const tenantId = req.user?.tenantId;
            const { provider } = req.params;
            if (!tenantId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const aiConfigService = (await Promise.resolve().then(() => __importStar(require('./ai-config.service')))).default;
            const deleted = await aiConfigService.deleteConfig(tenantId, provider);
            if (!deleted) {
                res.status(404).json({ success: false, message: 'Config not found' });
                return;
            }
            res.json({ success: true, message: 'Config deleted' });
        }
        catch (error) {
            console.error('[MarketingController] Delete AI config error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.MarketingController = MarketingController;
//# sourceMappingURL=marketing.controller.js.map