"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BIModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
// Entities do módulo BI
const dashboard_config_entity_1 = require("./entities/dashboard-config.entity");
const kpi_target_entity_1 = require("./entities/kpi-target.entity");
const custom_report_entity_1 = require("./entities/custom-report.entity");
const scheduled_report_entity_1 = require("./entities/scheduled-report.entity");
// Entities de outros módulos (para consulta)
const transaction_entity_1 = require("../financeiro/transaction.entity");
const venda_entity_1 = require("../vendas/venda.entity");
const lead_entity_1 = require("../leads/lead.entity");
const procedure_entity_1 = require("../leads/procedure.entity");
const vendedor_entity_1 = require("../vendas/vendedor.entity");
const user_entity_1 = require("../auth/user.entity");
// Services
const dashboard_service_1 = require("./services/dashboard.service");
const kpi_service_1 = require("./services/kpi.service");
const data_aggregator_service_1 = require("./services/data-aggregator.service");
const analytics_service_1 = require("./services/analytics.service");
const report_service_1 = require("./services/report.service");
const export_service_1 = require("./services/export.service");
// Controllers
const dashboard_controller_1 = require("./controllers/dashboard.controller");
const kpi_controller_1 = require("./controllers/kpi.controller");
const analytics_controller_1 = require("./controllers/analytics.controller");
const report_controller_1 = require("./controllers/report.controller");
let BIModule = class BIModule {
};
exports.BIModule = BIModule;
exports.BIModule = BIModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                // Entities do módulo BI
                dashboard_config_entity_1.DashboardConfig,
                kpi_target_entity_1.KpiTarget,
                custom_report_entity_1.CustomReport,
                scheduled_report_entity_1.ScheduledReport,
                // Entities de outros módulos (somente leitura para análises)
                transaction_entity_1.Transaction,
                venda_entity_1.Venda,
                lead_entity_1.Lead,
                procedure_entity_1.Procedure,
                vendedor_entity_1.Vendedor,
                user_entity_1.User,
            ]),
        ],
        controllers: [
            dashboard_controller_1.DashboardController,
            kpi_controller_1.KpiController,
            analytics_controller_1.AnalyticsController,
            report_controller_1.ReportController,
        ],
        providers: [
            dashboard_service_1.DashboardService,
            kpi_service_1.KpiService,
            data_aggregator_service_1.DataAggregatorService,
            analytics_service_1.AnalyticsService,
            report_service_1.ReportService,
            export_service_1.ExportService,
        ],
        exports: [
            dashboard_service_1.DashboardService,
            kpi_service_1.KpiService,
            data_aggregator_service_1.DataAggregatorService,
            analytics_service_1.AnalyticsService,
            report_service_1.ReportService,
            export_service_1.ExportService,
        ],
    })
], BIModule);
//# sourceMappingURL=bi.module.js.map