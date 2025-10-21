"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../../database/data-source");
const dashboard_controller_1 = require("./controllers/dashboard.controller");
const kpi_controller_1 = require("./controllers/kpi.controller");
const analytics_controller_1 = require("./controllers/analytics.controller");
const report_controller_1 = require("./controllers/report.controller");
// Services
const dashboard_service_1 = require("./services/dashboard.service");
const kpi_service_1 = require("./services/kpi.service");
const data_aggregator_service_1 = require("./services/data-aggregator.service");
const analytics_service_1 = require("./services/analytics.service");
const report_service_1 = require("./services/report.service");
const export_service_1 = require("./services/export.service");
// Entities
const dashboard_config_entity_1 = require("./entities/dashboard-config.entity");
const kpi_target_entity_1 = require("./entities/kpi-target.entity");
const custom_report_entity_1 = require("./entities/custom-report.entity");
const scheduled_report_entity_1 = require("./entities/scheduled-report.entity");
const transaction_entity_1 = require("../financeiro/transaction.entity");
const venda_entity_1 = require("../vendas/venda.entity");
const lead_entity_1 = require("../leads/lead.entity");
const procedure_entity_1 = require("../leads/procedure.entity");
const vendedor_entity_1 = require("../vendas/vendedor.entity");
const router = (0, express_1.Router)();
// Inicializar repositórios
const dashboardConfigRepo = data_source_1.CrmDataSource.getRepository(dashboard_config_entity_1.DashboardConfig);
const kpiTargetRepo = data_source_1.CrmDataSource.getRepository(kpi_target_entity_1.KpiTarget);
const customReportRepo = data_source_1.CrmDataSource.getRepository(custom_report_entity_1.CustomReport);
const scheduledReportRepo = data_source_1.CrmDataSource.getRepository(scheduled_report_entity_1.ScheduledReport);
const transactionRepo = data_source_1.CrmDataSource.getRepository(transaction_entity_1.Transaction);
const vendaRepo = data_source_1.CrmDataSource.getRepository(venda_entity_1.Venda);
const leadRepo = data_source_1.CrmDataSource.getRepository(lead_entity_1.Lead);
const procedureRepo = data_source_1.CrmDataSource.getRepository(procedure_entity_1.Procedure);
const vendedorRepo = data_source_1.CrmDataSource.getRepository(vendedor_entity_1.Vendedor);
// Inicializar services
const dataAggregatorService = new data_aggregator_service_1.DataAggregatorService(transactionRepo, vendaRepo, leadRepo, procedureRepo, vendedorRepo);
const kpiService = new kpi_service_1.KpiService(kpiTargetRepo, transactionRepo, vendaRepo, leadRepo);
const analyticsService = new analytics_service_1.AnalyticsService(leadRepo, vendaRepo, transactionRepo);
const exportService = new export_service_1.ExportService();
const reportService = new report_service_1.ReportService(customReportRepo, scheduledReportRepo, dataAggregatorService, kpiService, analyticsService);
const dashboardService = new dashboard_service_1.DashboardService(dashboardConfigRepo, dataAggregatorService, kpiService);
// Inicializar controllers
const dashboardController = new dashboard_controller_1.DashboardController(dashboardService);
const kpiController = new kpi_controller_1.KpiController(kpiService);
const analyticsController = new analytics_controller_1.AnalyticsController(analyticsService);
const reportController = new report_controller_1.ReportController(reportService, exportService);
// ============================================
// DASHBOARD ROUTES
// ============================================
router.post('/dashboards', (req, res, next) => dashboardController.create(req, res).catch(next));
router.get('/dashboards', (req, res, next) => dashboardController.findAll(req, res).catch(next));
router.get('/dashboards/default/:type', (req, res, next) => dashboardController.findDefault(req, res).catch(next));
router.get('/dashboards/:id', (req, res, next) => dashboardController.findOne(req, res).catch(next));
router.get('/dashboards/:id/data', (req, res, next) => dashboardController.getData(req, res).catch(next));
router.put('/dashboards/:id', (req, res, next) => dashboardController.update(req, res).catch(next));
router.put('/dashboards/:id/set-default', (req, res, next) => dashboardController.setAsDefault(req, res).catch(next));
router.post('/dashboards/:id/clone', (req, res, next) => dashboardController.clone(req, res).catch(next));
router.delete('/dashboards/:id', (req, res, next) => dashboardController.delete(req, res).catch(next));
// ============================================
// KPI ROUTES
// ============================================
router.get('/kpis/all', (req, res, next) => kpiController.getAllKpis(req, res).catch(next));
router.get('/kpis/revenue', (req, res, next) => kpiController.getRevenue(req, res).catch(next));
router.get('/kpis/expenses', (req, res, next) => kpiController.getExpenses(req, res).catch(next));
router.get('/kpis/net-profit', (req, res, next) => kpiController.getNetProfit(req, res).catch(next));
router.get('/kpis/profit-margin', (req, res, next) => kpiController.getProfitMargin(req, res).catch(next));
router.get('/kpis/conversion-rate', (req, res, next) => kpiController.getConversionRate(req, res).catch(next));
router.get('/kpis/average-ticket', (req, res, next) => kpiController.getAverageTicket(req, res).catch(next));
router.get('/kpis/targets', (req, res, next) => kpiController.getTargets(req, res).catch(next));
router.post('/kpis/targets', (req, res, next) => kpiController.createTarget(req, res).catch(next));
router.put('/kpis/targets/:id', (req, res, next) => kpiController.updateTarget(req, res).catch(next));
router.delete('/kpis/targets/:id', (req, res, next) => kpiController.deleteTarget(req, res).catch(next));
// ============================================
// ANALYTICS ROUTES
// ============================================
router.get('/analytics/cohort', (req, res, next) => analyticsController.cohortAnalysis(req, res).catch(next));
router.get('/analytics/trend', (req, res, next) => analyticsController.trendAnalysis(req, res).catch(next));
router.get('/analytics/segment', (req, res, next) => analyticsController.segmentAnalysis(req, res).catch(next));
router.get('/analytics/seller-performance', (req, res, next) => analyticsController.sellerPerformance(req, res).catch(next));
// ============================================
// REPORT ROUTES
// ============================================
router.get('/reports/custom', (req, res, next) => reportController.findAllCustom(req, res).catch(next));
router.get('/reports/custom/:id', (req, res, next) => reportController.findCustomById(req, res).catch(next));
router.post('/reports/custom', (req, res, next) => reportController.createCustom(req, res).catch(next));
router.put('/reports/custom/:id', (req, res, next) => reportController.updateCustom(req, res).catch(next));
router.delete('/reports/custom/:id', (req, res, next) => reportController.deleteCustom(req, res).catch(next));
router.post('/reports/custom/:id/generate', (req, res, next) => reportController.generateCustom(req, res).catch(next));
router.get('/reports/executive', (req, res, next) => reportController.getExecutiveReport(req, res).catch(next));
router.get('/reports/sales', (req, res, next) => reportController.getSalesReport(req, res).catch(next));
router.post('/reports/export', (req, res, next) => reportController.exportReport(req, res).catch(next));
router.get('/reports/scheduled', (req, res, next) => reportController.findScheduled(req, res).catch(next));
router.post('/reports/scheduled', (req, res, next) => reportController.scheduleReport(req, res).catch(next));
router.put('/reports/scheduled/:id', (req, res, next) => reportController.updateSchedule(req, res).catch(next));
router.delete('/reports/scheduled/:id', (req, res, next) => reportController.deactivateSchedule(req, res).catch(next));
exports.default = router;
//# sourceMappingURL=bi.routes.js.map