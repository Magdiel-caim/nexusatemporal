import { Router } from 'express';
import authRoutes from '@/modules/auth/auth.routes';
import dataRoutes from '@/modules/config/data.routes';
import leadsRoutes from '@/modules/leads/leads.routes';
import chatRoutes from '@/modules/chat/chat.routes';
import appointmentRoutes from '@/modules/agenda/appointment.routes';
import publicAppointmentRoutes from '@/modules/agenda/public-appointment.routes';
import medicalRecordRoutes from '@/modules/medical-records/medical-record.routes';
import financeiroRoutes from '@/modules/financeiro/financeiro.routes';
import paymentGatewayRoutes from '@/modules/payment-gateway/payment-gateway.routes';
import usersRoutes from '@/modules/users/users.routes';
import automationRoutes from '@/modules/marketing/automation/automation.routes'; // Moved to Marketing module
import estoqueRoutes from '@/modules/estoque/estoque.routes';
import vendasRoutes from '@/modules/vendas/vendas.routes';
import biRoutes from '@/modules/bi/bi.routes'; // BI Module - Business Intelligence
import marketingRoutes from '@/modules/marketing/marketing.routes'; // Marketing Module - Campaigns, Social Posts, Bulk Messages, Landing Pages, AI Assistant
import metaRoutes from '@/modules/meta/meta.routes'; // Meta API Direct Integration - Instagram & Messenger (OAuth, Webhooks, Messaging)
// Import other module routes as they are created
// import colaboracaoRoutes from '@/modules/colaboracao/colaboracao.routes';
// import configRoutes from '@/modules/config/config.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Module routes
router.use('/auth', authRoutes);
router.use('/data', dataRoutes); // Required /api/data endpoint
router.use('/leads', leadsRoutes);
router.use('/chat', chatRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/public/appointments', publicAppointmentRoutes); // Public API for external integrations
router.use('/medical-records', medicalRecordRoutes);
router.use('/financial', financeiroRoutes);
router.use('/payment-gateway', paymentGatewayRoutes); // Payment gateway integration (Asaas, PagBank)
router.use('/users', usersRoutes); // User management and permissions
router.use('/marketing/automation', automationRoutes); // Automation system (triggers, workflows, integrations) - Now part of Marketing
router.use('/stock', estoqueRoutes); // Stock/Inventory management
router.use('/vendas', vendasRoutes); // Sales and commissions management
router.use('/bi', biRoutes); // Business Intelligence - Dashboards, KPIs, Analytics, Reports
router.use('/marketing', marketingRoutes); // Marketing Module - Campaigns, Social Media, Bulk Messages, Landing Pages, AI
router.use('/meta', metaRoutes); // Meta API Direct Integration - Instagram & Messenger (OAuth, Webhooks, Messaging)

// Uncomment as modules are implemented
// router.use('/colaboracao', colaboracaoRoutes);
// router.use('/config', configRoutes);

export default router;
