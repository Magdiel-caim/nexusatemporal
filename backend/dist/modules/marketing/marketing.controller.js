"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingController = void 0;
const services_1 = require("./services");
const campaignService = new services_1.CampaignService();
const socialPostService = new services_1.SocialPostService();
const bulkMessageService = new services_1.BulkMessageService();
const landingPageService = new services_1.LandingPageService();
const aiAssistantService = new services_1.AIAssistantService();
class MarketingController {
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
            const campaign = await campaignService.create(tenantId, req.body, userId);
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
            const campaigns = await campaignService.findAll(tenantId, {
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
            const campaign = await campaignService.findById(req.params.id, tenantId);
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
            const campaign = await campaignService.update(req.params.id, tenantId, req.body);
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
            const deleted = await campaignService.delete(req.params.id, tenantId);
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
            const stats = await campaignService.getStats(tenantId);
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
            const post = await socialPostService.create(tenantId, req.body, userId);
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
            const posts = await socialPostService.findAll(tenantId, {
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
            const post = await socialPostService.findById(req.params.id, tenantId);
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
            const post = await socialPostService.update(req.params.id, tenantId, req.body);
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
            const deleted = await socialPostService.delete(req.params.id, tenantId);
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
            const post = await socialPostService.schedule(req.params.id, tenantId, new Date(scheduledAt));
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
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const message = await bulkMessageService.create(tenantId, req.body, userId);
            res.status(201).json(message);
        }
        catch (error) {
            console.error('[MarketingController] createBulkMessage error:', error);
            res.status(500).json({ error: error.message });
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
            const messages = await bulkMessageService.findAll(tenantId, {
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
            const message = await bulkMessageService.findById(req.params.id, tenantId);
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
            const page = await landingPageService.create(tenantId, req.body, userId);
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
            const pages = await landingPageService.findAll(tenantId, {
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
            const page = await landingPageService.findById(req.params.id, tenantId);
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
            const page = await landingPageService.update(req.params.id, tenantId, req.body);
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
            const page = await landingPageService.publish(req.params.id, tenantId);
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
            const analytics = await landingPageService.getAnalytics(req.params.id, tenantId, days);
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
            const analysis = await aiAssistantService.analyze(tenantId, provider, model, analysisType, inputData, userId);
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
            const analyses = await aiAssistantService.getRecentAnalyses(tenantId, limit);
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
            const analysis = await aiAssistantService.optimizeCopy(tenantId, content, context || {}, userId);
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
            const analysis = await aiAssistantService.generateImage(tenantId, prompt, options || {}, userId);
            res.json(analysis);
        }
        catch (error) {
            console.error('[MarketingController] generateImage error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}
exports.MarketingController = MarketingController;
//# sourceMappingURL=marketing.controller.js.map