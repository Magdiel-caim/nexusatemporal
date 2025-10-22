import { Router } from 'express';
import { MarketingController } from './marketing.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new MarketingController();

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

export default router;
