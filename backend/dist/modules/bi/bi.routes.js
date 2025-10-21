"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_service_1 = require("./services/dashboard.service");
const kpi_service_1 = require("./services/kpi.service");
const data_aggregator_service_1 = require("./services/data-aggregator.service");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Aplicar autenticação em todas as rotas
router.use(auth_middleware_1.authenticate);
// Instanciar services
const dashboardService = new dashboard_service_1.DashboardService();
const kpiService = new kpi_service_1.KpiService();
const dataAggregator = new data_aggregator_service_1.DataAggregatorService();
/**
 * GET /api/bi/dashboards/executive
 * Retorna dados do dashboard executivo
 */
router.get('/dashboards/executive', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Tenant não identificado' });
        }
        // Validação de datas
        if (startDate && isNaN(Date.parse(startDate))) {
            return res.status(400).json({ error: 'Formato de startDate inválido' });
        }
        if (endDate && isNaN(Date.parse(endDate))) {
            return res.status(400).json({ error: 'Formato de endDate inválido' });
        }
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ error: 'startDate deve ser anterior a endDate' });
        }
        const data = await dashboardService.getExecutiveDashboard(tenantId, startDate, endDate);
        res.json(data);
    }
    catch (error) {
        console.error('Error getting executive dashboard:', error);
        res.status(500).json({ error: error.message });
    }
});
/**
 * GET /api/bi/dashboards/sales
 * Retorna dados do dashboard de vendas
 */
router.get('/dashboards/sales', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Tenant não identificado' });
        }
        // Validação de datas
        if (startDate && isNaN(Date.parse(startDate))) {
            return res.status(400).json({ error: 'Formato de startDate inválido' });
        }
        if (endDate && isNaN(Date.parse(endDate))) {
            return res.status(400).json({ error: 'Formato de endDate inválido' });
        }
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ error: 'startDate deve ser anterior a endDate' });
        }
        const data = await dashboardService.getSalesDashboard(tenantId, startDate, endDate);
        res.json(data);
    }
    catch (error) {
        console.error('Error getting sales dashboard:', error);
        res.status(500).json({ error: error.message });
    }
});
/**
 * GET /api/bi/kpis
 * Retorna todos os KPIs
 */
router.get('/kpis', async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Tenant não identificado' });
        }
        const kpis = await kpiService.getAllKPIs(tenantId, {
            startDate: startDate,
            endDate: endDate,
            category: category,
        });
        res.json(kpis);
    }
    catch (error) {
        console.error('Error getting KPIs:', error);
        res.status(500).json({ error: error.message });
    }
});
/**
 * GET /api/bi/data/summary
 * Retorna resumo agregado de dados
 */
router.get('/data/summary', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Tenant não identificado' });
        }
        const summary = await dataAggregator.getDataSummary(tenantId, startDate, endDate);
        res.json(summary);
    }
    catch (error) {
        console.error('Error getting data summary:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=bi.routes.js.map