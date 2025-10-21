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
const appointment_routes_1 = __importDefault(require("../modules/agenda/appointment.routes"));
const public_appointment_routes_1 = __importDefault(require("../modules/agenda/public-appointment.routes"));
const medical_record_routes_1 = __importDefault(require("../modules/medical-records/medical-record.routes"));
const financeiro_routes_1 = __importDefault(require("../modules/financeiro/financeiro.routes"));
const payment_gateway_routes_1 = __importDefault(require("../modules/payment-gateway/payment-gateway.routes"));
const users_routes_1 = __importDefault(require("../modules/users/users.routes"));
const automation_routes_1 = __importDefault(require("../modules/automation/automation.routes"));
const estoque_routes_1 = __importDefault(require("../modules/estoque/estoque.routes"));
const vendas_routes_1 = __importDefault(require("../modules/vendas/vendas.routes"));
// Import other module routes as they are created
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
router.use('/appointments', appointment_routes_1.default);
router.use('/public/appointments', public_appointment_routes_1.default); // Public API for external integrations
router.use('/medical-records', medical_record_routes_1.default);
router.use('/financial', financeiro_routes_1.default);
router.use('/payment-gateway', payment_gateway_routes_1.default); // Payment gateway integration (Asaas, PagBank)
router.use('/users', users_routes_1.default); // User management and permissions
router.use('/automation', automation_routes_1.default); // Automation system (triggers, workflows, integrations)
router.use('/stock', estoque_routes_1.default); // Stock/Inventory management
router.use('/vendas', vendas_routes_1.default); // Sales and commissions management
// Uncomment as modules are implemented
// router.use('/colaboracao', colaboracaoRoutes);
// router.use('/bi', biRoutes);
// router.use('/marketing', marketingRoutes);
// router.use('/config', configRoutes);
exports.default = router;
//# sourceMappingURL=index.js.map