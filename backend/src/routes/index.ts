import { Router } from 'express';
import authRoutes from '@/modules/auth/auth.routes';
import dataRoutes from '@/modules/config/data.routes';
import leadsRoutes from '@/modules/leads/leads.routes';
import chatRoutes from '@/modules/chat/chat.routes';
// Import other module routes as they are created
// import agendaRoutes from '@/modules/agenda/agenda.routes';
// import prontuariosRoutes from '@/modules/prontuarios/prontuarios.routes';
// import financeiroRoutes from '@/modules/financeiro/financeiro.routes';
// import estoqueRoutes from '@/modules/estoque/estoque.routes';
// import colaboracaoRoutes from '@/modules/colaboracao/colaboracao.routes';
// import biRoutes from '@/modules/bi/bi.routes';
// import marketingRoutes from '@/modules/marketing/marketing.routes';
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

// Uncomment as modules are implemented
// router.use('/agenda', agendaRoutes);
// router.use('/prontuarios', prontuariosRoutes);
// router.use('/financeiro', financeiroRoutes);
// router.use('/estoque', estoqueRoutes);
// router.use('/colaboracao', colaboracaoRoutes);
// router.use('/bi', biRoutes);
// router.use('/marketing', marketingRoutes);
// router.use('/config', configRoutes);

export default router;
