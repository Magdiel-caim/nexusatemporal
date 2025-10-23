import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { MarketingController } from './marketing.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new MarketingController();

// Configurar storage do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/marketing');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// WAHA Webhook (no auth required) - must be before authenticate middleware
router.post('/waha/webhook', (req, res) => controller.wahaWebhook(req, res));

// Apply authentication to all routes
router.use(authenticate);

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

export default router;
