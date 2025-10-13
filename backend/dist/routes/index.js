"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const data_routes_1 = __importDefault(require("../modules/config/data.routes"));
const leads_routes_1 = __importDefault(require("../modules/leads/leads.routes"));
const chat_routes_1 = __importDefault(require("../modules/chat/chat.routes"));
// Import other module routes as they are created
// import agendaRoutes from '@/modules/agenda/agenda.routes';
// import prontuariosRoutes from '@/modules/prontuarios/prontuarios.routes';
// import financeiroRoutes from '@/modules/financeiro/financeiro.routes';
// import estoqueRoutes from '@/modules/estoque/estoque.routes';
// import colaboracaoRoutes from '@/modules/colaboracao/colaboracao.routes';
// import biRoutes from '@/modules/bi/bi.routes';
// import marketingRoutes from '@/modules/marketing/marketing.routes';
// import configRoutes from '@/modules/config/config.routes';
const router = (0, express_1.Router)();
// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});
// Module routes
router.use('/auth', auth_routes_1.default);
router.use('/data', data_routes_1.default); // Required /api/data endpoint
router.use('/leads', leads_routes_1.default);
router.use('/chat', chat_routes_1.default);
// Uncomment as modules are implemented
// router.use('/agenda', agendaRoutes);
// router.use('/prontuarios', prontuariosRoutes);
// router.use('/financeiro', financeiroRoutes);
// router.use('/estoque', estoqueRoutes);
// router.use('/colaboracao', colaboracaoRoutes);
// router.use('/bi', biRoutes);
// router.use('/marketing', marketingRoutes);
// router.use('/config', configRoutes);
exports.default = router;
//# sourceMappingURL=index.js.map