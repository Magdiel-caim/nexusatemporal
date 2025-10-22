"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingController = void 0;
const services_1 = require("./services");
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
            const campaignService = new services_1.CampaignService();
            const campaign = await campaignService.create(tenantId, req.body, userId);
            res.status(201).json(campaign);
        }
        catch (error) {
            console.error('[MarketingController] createCampaign error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}
exports.MarketingController = MarketingController;
//# sourceMappingURL=marketing.controller.fixed.js.map