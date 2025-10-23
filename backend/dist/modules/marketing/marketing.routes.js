"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const marketing_controller_1 = require("./marketing.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new marketing_controller_1.MarketingController();
// Configurar storage do multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../../uploads/marketing');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only images are allowed'));
        }
    }
});
// WAHA Webhook (no auth required) - must be before authenticate middleware
router.post('/waha/webhook', (req, res) => controller.wahaWebhook(req, res));
// Apply authentication to all routes
router.use(auth_middleware_1.authenticate);
// ============================================
// CAMPAIGNS
// ============================================
router.post('/campaigns', (req, res) => controller.createCampaign(req, res));
router.get('/campaigns', (req, res) => controller.getCampaigns(req, res));
router.get('/campaigns/stats', (req, res) => controller.getCampaignStats(req, res));
router.get('/campaigns/:id', (req, res) => controller.getCampaignById(req, res));
router.put('/campaigns/:id', (req, res) => controller.updateCampaign(req, res));
router.delete('/campaigns/:id', (req, res) => controller.deleteCampaign(req, res));
// ============================================
// SOCIAL POSTS
// ============================================
router.post('/social-posts', (req, res) => controller.createSocialPost(req, res));
router.get('/social-posts', (req, res) => controller.getSocialPosts(req, res));
router.get('/social-posts/:id', (req, res) => controller.getSocialPostById(req, res));
router.put('/social-posts/:id', (req, res) => controller.updateSocialPost(req, res));
router.delete('/social-posts/:id', (req, res) => controller.deleteSocialPost(req, res));
router.post('/social-posts/:id/schedule', (req, res) => controller.scheduleSocialPost(req, res));
// ============================================
// BULK MESSAGES
// ============================================
router.post('/bulk-messages', (req, res) => controller.createBulkMessage(req, res));
router.get('/bulk-messages', (req, res) => controller.getBulkMessages(req, res));
router.get('/bulk-messages/:id', (req, res) => controller.getBulkMessageById(req, res));
// ============================================
// LANDING PAGES
// ============================================
router.post('/landing-pages', (req, res) => controller.createLandingPage(req, res));
router.get('/landing-pages', (req, res) => controller.getLandingPages(req, res));
router.get('/landing-pages/:id', (req, res) => controller.getLandingPageById(req, res));
router.put('/landing-pages/:id', (req, res) => controller.updateLandingPage(req, res));
router.post('/landing-pages/:id/publish', (req, res) => controller.publishLandingPage(req, res));
router.get('/landing-pages/:id/analytics', (req, res) => controller.getLandingPageAnalytics(req, res));
// ============================================
// AI ASSISTANT
// ============================================
router.post('/ai/analyze', (req, res) => controller.analyzeWithAI(req, res));
router.get('/ai/analyses', (req, res) => controller.getAIAnalyses(req, res));
router.post('/ai/optimize-copy', (req, res) => controller.optimizeCopy(req, res));
router.post('/ai/generate-image', (req, res) => controller.generateImage(req, res));
// ============================================
// INTEGRATIONS
// ============================================
router.post('/integrations', (req, res) => controller.upsertIntegration(req, res));
router.get('/integrations', (req, res) => controller.getIntegrations(req, res));
router.get('/integrations/ai-providers', (req, res) => controller.getAIProviders(req, res));
router.get('/integrations/:platform', (req, res) => controller.getIntegrationByPlatform(req, res));
router.post('/integrations/:id/test', (req, res) => controller.testIntegration(req, res));
router.delete('/integrations/:id', (req, res) => controller.deleteIntegration(req, res));
// ============================================
// WAHA SESSIONS
// ============================================
router.post('/waha/sessions', (req, res) => controller.createWahaSession(req, res));
router.get('/waha/sessions', (req, res) => controller.getWahaSessions(req, res));
router.get('/waha/sessions/:id', (req, res) => controller.getWahaSession(req, res));
router.post('/waha/sessions/:id/start', (req, res) => controller.startWahaSession(req, res));
router.post('/waha/sessions/:id/stop', (req, res) => controller.stopWahaSession(req, res));
router.get('/waha/sessions/:id/qr', (req, res) => controller.getWahaQRCode(req, res));
router.delete('/waha/sessions/:id', (req, res) => controller.deleteWahaSession(req, res));
router.post('/waha/sessions/:id/send', (req, res) => controller.sendWahaMessage(req, res));
// ============================================
// IMAGE UPLOAD
// ============================================
router.post('/upload-image', upload.single('image'), (req, res) => controller.uploadImage(req, res));
// ============================================
// AI ASSISTANT - GENERATE COPY
// ============================================
router.post('/ai-assistant/generate-copy', (req, res) => controller.generateAICopy(req, res));
// ============================================
// AI INTEGRATIONS CONFIG
// ============================================
router.get('/ai/configs', (req, res) => controller.listAIConfigs(req, res));
router.post('/ai/configs', (req, res) => controller.createOrUpdateAIConfig(req, res));
router.delete('/ai/configs/:provider', (req, res) => controller.deleteAIConfig(req, res));
exports.default = router;
//# sourceMappingURL=marketing.routes.js.map