"use strict";
/**
 * Dashboard Interfaces
 * Módulo BI - Business Intelligence
 * Sessão A - Desenvolvimento em Paralelo
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateRangeType = exports.WidgetType = exports.DashboardType = void 0;
var DashboardType;
(function (DashboardType) {
    DashboardType["EXECUTIVE"] = "executive";
    DashboardType["SALES"] = "sales";
    DashboardType["FINANCIAL"] = "financial";
    DashboardType["OPERATIONAL"] = "operational";
    DashboardType["ATTENDANCE"] = "attendance";
    DashboardType["CUSTOM"] = "custom";
})(DashboardType || (exports.DashboardType = DashboardType = {}));
var WidgetType;
(function (WidgetType) {
    WidgetType["KPI_CARD"] = "kpi_card";
    WidgetType["LINE_CHART"] = "line_chart";
    WidgetType["BAR_CHART"] = "bar_chart";
    WidgetType["PIE_CHART"] = "pie_chart";
    WidgetType["FUNNEL_CHART"] = "funnel_chart";
    WidgetType["HEAT_MAP"] = "heat_map";
    WidgetType["TABLE"] = "table";
    WidgetType["TREND_INDICATOR"] = "trend_indicator";
})(WidgetType || (exports.WidgetType = WidgetType = {}));
var DateRangeType;
(function (DateRangeType) {
    DateRangeType["TODAY"] = "today";
    DateRangeType["YESTERDAY"] = "yesterday";
    DateRangeType["LAST_7_DAYS"] = "last_7_days";
    DateRangeType["LAST_30_DAYS"] = "last_30_days";
    DateRangeType["THIS_MONTH"] = "this_month";
    DateRangeType["LAST_MONTH"] = "last_month";
    DateRangeType["THIS_QUARTER"] = "this_quarter";
    DateRangeType["LAST_QUARTER"] = "last_quarter";
    DateRangeType["THIS_YEAR"] = "this_year";
    DateRangeType["LAST_YEAR"] = "last_year";
    DateRangeType["CUSTOM"] = "custom";
})(DateRangeType || (exports.DateRangeType = DateRangeType = {}));
//# sourceMappingURL=dashboard.interface.js.map