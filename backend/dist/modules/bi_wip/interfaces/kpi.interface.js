"use strict";
/**
 * KPI (Key Performance Indicator) Interfaces
 * Módulo BI - Business Intelligence
 * Sessão A - Desenvolvimento em Paralelo
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PREDEFINED_KPIS = exports.TrendDirection = exports.KPIStatus = exports.KPICategory = void 0;
var KPICategory;
(function (KPICategory) {
    KPICategory["SALES"] = "sales";
    KPICategory["FINANCIAL"] = "financial";
    KPICategory["OPERATIONAL"] = "operational";
    KPICategory["CUSTOMER"] = "customer";
    KPICategory["MARKETING"] = "marketing";
})(KPICategory || (exports.KPICategory = KPICategory = {}));
var KPIStatus;
(function (KPIStatus) {
    KPIStatus["ABOVE_TARGET"] = "above_target";
    KPIStatus["ON_TARGET"] = "on_target";
    KPIStatus["BELOW_TARGET"] = "below_target";
    KPIStatus["NO_TARGET"] = "no_target";
})(KPIStatus || (exports.KPIStatus = KPIStatus = {}));
var TrendDirection;
(function (TrendDirection) {
    TrendDirection["UP"] = "up";
    TrendDirection["DOWN"] = "down";
    TrendDirection["STABLE"] = "stable";
})(TrendDirection || (exports.TrendDirection = TrendDirection = {}));
// KPIs Pré-definidos
exports.PREDEFINED_KPIS = {
    // Comerciais
    TOTAL_SALES: 'total_sales',
    TOTAL_REVENUE: 'total_revenue',
    CONVERSION_RATE: 'conversion_rate',
    AVERAGE_TICKET: 'average_ticket',
    CAC: 'customer_acquisition_cost',
    LTV: 'lifetime_value',
    LTV_CAC_RATIO: 'ltv_cac_ratio',
    // Financeiros
    GROSS_MARGIN: 'gross_margin',
    NET_MARGIN: 'net_margin',
    ROI: 'return_on_investment',
    CASH_FLOW: 'cash_flow',
    ACCOUNTS_RECEIVABLE: 'accounts_receivable',
    ACCOUNTS_PAYABLE: 'accounts_payable',
    // Operacionais
    OCCUPANCY_RATE: 'occupancy_rate',
    AVERAGE_SERVICE_TIME: 'average_service_time',
    STOCK_TURNOVER: 'stock_turnover',
    OUT_OF_STOCK_RATE: 'out_of_stock_rate',
    // Atendimento
    NPS: 'net_promoter_score',
    CSAT: 'customer_satisfaction',
    RESPONSE_RATE: 'response_rate',
    AVERAGE_RESPONSE_TIME: 'average_response_time',
    FIRST_RESPONSE_TIME: 'first_response_time',
};
//# sourceMappingURL=kpi.interface.js.map