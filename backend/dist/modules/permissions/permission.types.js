"use strict";
/**
 * Permission Types
 *
 * Define todos os tipos de permissões disponíveis no sistema.
 * Baseado no documento de Sistema de Permissões RBAC v1.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsByModule = exports.Permission = void 0;
var Permission;
(function (Permission) {
    // Dashboard
    Permission["DASHBOARD_VIEW_ALL"] = "dashboard.view_all";
    Permission["DASHBOARD_VIEW_PERSONAL"] = "dashboard.view_personal";
    Permission["DASHBOARD_VIEW_OPERATIONAL"] = "dashboard.view_operational";
    // Leads
    Permission["LEADS_CREATE"] = "leads.create";
    Permission["LEADS_READ"] = "leads.read";
    Permission["LEADS_READ_ALL"] = "leads.read_all";
    Permission["LEADS_READ_ASSIGNED"] = "leads.read_assigned";
    Permission["LEADS_UPDATE"] = "leads.update";
    Permission["LEADS_UPDATE_ALL"] = "leads.update_all";
    Permission["LEADS_UPDATE_OWN"] = "leads.update_own";
    Permission["LEADS_DELETE"] = "leads.delete";
    Permission["LEADS_ASSIGN"] = "leads.assign";
    Permission["LEADS_EXPORT"] = "leads.export";
    Permission["LEADS_IMPORT"] = "leads.import";
    Permission["LEADS_CONFIGURE"] = "leads.configure";
    // Agenda
    Permission["AGENDA_VIEW_ALL"] = "agenda.view_all";
    Permission["AGENDA_VIEW_OWN"] = "agenda.view_own";
    Permission["AGENDA_CREATE"] = "agenda.create";
    Permission["AGENDA_CREATE_FOR_OTHERS"] = "agenda.create_for_others";
    Permission["AGENDA_UPDATE"] = "agenda.update";
    Permission["AGENDA_UPDATE_OWN"] = "agenda.update_own";
    Permission["AGENDA_DELETE"] = "agenda.delete";
    Permission["AGENDA_CONFIGURE"] = "agenda.configure";
    Permission["AGENDA_BLOCK_TIMES"] = "agenda.block_times";
    // Prontuários
    Permission["RECORDS_VIEW_ALL"] = "records.view_all";
    Permission["RECORDS_VIEW_OWN_PATIENTS"] = "records.view_own_patients";
    Permission["RECORDS_CREATE"] = "records.create";
    Permission["RECORDS_UPDATE"] = "records.update";
    Permission["RECORDS_DELETE"] = "records.delete";
    Permission["RECORDS_SIGN"] = "records.sign";
    Permission["RECORDS_EXPORT"] = "records.export";
    Permission["RECORDS_ATTACH_FILES"] = "records.attach_files";
    // Financeiro
    Permission["FINANCIAL_VIEW_ALL"] = "financial.view_all";
    Permission["FINANCIAL_VIEW_SUMMARY"] = "financial.view_summary";
    Permission["FINANCIAL_VIEW_OWN_COMMISSIONS"] = "financial.view_own_commissions";
    Permission["FINANCIAL_CREATE_REVENUE"] = "financial.create_revenue";
    Permission["FINANCIAL_CREATE_EXPENSE"] = "financial.create_expense";
    Permission["FINANCIAL_APPROVE_PAYMENTS"] = "financial.approve_payments";
    Permission["FINANCIAL_CONFIGURE_GATEWAYS"] = "financial.configure_gateways";
    Permission["FINANCIAL_MANAGE_CASH_FLOW"] = "financial.manage_cash_flow";
    Permission["FINANCIAL_EXPORT_REPORTS"] = "financial.export_reports";
    // Usuários
    Permission["USERS_VIEW_ALL"] = "users.view_all";
    Permission["USERS_CREATE"] = "users.create";
    Permission["USERS_CREATE_BASIC"] = "users.create_basic";
    Permission["USERS_UPDATE"] = "users.update";
    Permission["USERS_UPDATE_BASIC"] = "users.update_basic";
    Permission["USERS_DELETE"] = "users.delete";
    Permission["USERS_CHANGE_ROLES"] = "users.change_roles";
    Permission["USERS_RESET_PASSWORD"] = "users.reset_password";
    Permission["USERS_VIEW_LOGS"] = "users.view_logs";
    Permission["USERS_BLOCK"] = "users.block";
    // Configurações
    Permission["CONFIG_VIEW"] = "config.view";
    Permission["CONFIG_UPDATE"] = "config.update";
    Permission["CONFIG_MANAGE_INTEGRATIONS"] = "config.manage_integrations";
    Permission["CONFIG_MANAGE_BILLING"] = "config.manage_billing";
    Permission["CONFIG_BACKUP"] = "config.backup";
    Permission["CONFIG_SECURITY"] = "config.security";
    Permission["CONFIG_WHITE_LABEL"] = "config.white_label";
    // BI & Analytics
    Permission["BI_VIEW_ALL"] = "bi.view_all";
    Permission["BI_VIEW_OPERATIONAL"] = "bi.view_operational";
    Permission["BI_VIEW_PERSONAL"] = "bi.view_personal";
    Permission["BI_EXPORT"] = "bi.export";
    Permission["BI_USE_AI"] = "bi.use_ai";
    // Marketing
    Permission["MARKETING_VIEW"] = "marketing.view";
    Permission["MARKETING_CREATE"] = "marketing.create";
    Permission["MARKETING_UPDATE"] = "marketing.update";
    Permission["MARKETING_DELETE"] = "marketing.delete";
    // Estoque
    Permission["INVENTORY_VIEW"] = "inventory.view";
    Permission["INVENTORY_CREATE"] = "inventory.create";
    Permission["INVENTORY_UPDATE"] = "inventory.update";
    Permission["INVENTORY_DELETE"] = "inventory.delete";
    Permission["INVENTORY_MANAGE"] = "inventory.manage";
    // Chat/WhatsApp
    Permission["CHAT_VIEW_ALL"] = "chat.view_all";
    Permission["CHAT_VIEW_ASSIGNED"] = "chat.view_assigned";
    Permission["CHAT_VIEW_OWN_PATIENTS"] = "chat.view_own_patients";
    Permission["CHAT_SEND"] = "chat.send";
    Permission["CHAT_CONFIGURE"] = "chat.configure";
    // Super Admin (cross-tenant)
    Permission["SUPERADMIN_ACCESS_ALL_TENANTS"] = "superadmin.access_all_tenants";
    Permission["SUPERADMIN_MANAGE_TENANTS"] = "superadmin.manage_tenants";
    Permission["SUPERADMIN_VIEW_LOGS"] = "superadmin.view_logs";
    Permission["SUPERADMIN_MANAGE_INFRASTRUCTURE"] = "superadmin.manage_infrastructure";
})(Permission || (exports.Permission = Permission = {}));
/**
 * Mapeamento de módulos para suas permissões
 */
exports.PermissionsByModule = {
    dashboard: [
        Permission.DASHBOARD_VIEW_ALL,
        Permission.DASHBOARD_VIEW_PERSONAL,
        Permission.DASHBOARD_VIEW_OPERATIONAL,
    ],
    leads: [
        Permission.LEADS_CREATE,
        Permission.LEADS_READ,
        Permission.LEADS_READ_ALL,
        Permission.LEADS_READ_ASSIGNED,
        Permission.LEADS_UPDATE,
        Permission.LEADS_UPDATE_ALL,
        Permission.LEADS_UPDATE_OWN,
        Permission.LEADS_DELETE,
        Permission.LEADS_ASSIGN,
        Permission.LEADS_EXPORT,
        Permission.LEADS_IMPORT,
        Permission.LEADS_CONFIGURE,
    ],
    agenda: [
        Permission.AGENDA_VIEW_ALL,
        Permission.AGENDA_VIEW_OWN,
        Permission.AGENDA_CREATE,
        Permission.AGENDA_CREATE_FOR_OTHERS,
        Permission.AGENDA_UPDATE,
        Permission.AGENDA_UPDATE_OWN,
        Permission.AGENDA_DELETE,
        Permission.AGENDA_CONFIGURE,
        Permission.AGENDA_BLOCK_TIMES,
    ],
    records: [
        Permission.RECORDS_VIEW_ALL,
        Permission.RECORDS_VIEW_OWN_PATIENTS,
        Permission.RECORDS_CREATE,
        Permission.RECORDS_UPDATE,
        Permission.RECORDS_DELETE,
        Permission.RECORDS_SIGN,
        Permission.RECORDS_EXPORT,
        Permission.RECORDS_ATTACH_FILES,
    ],
    financial: [
        Permission.FINANCIAL_VIEW_ALL,
        Permission.FINANCIAL_VIEW_SUMMARY,
        Permission.FINANCIAL_VIEW_OWN_COMMISSIONS,
        Permission.FINANCIAL_CREATE_REVENUE,
        Permission.FINANCIAL_CREATE_EXPENSE,
        Permission.FINANCIAL_APPROVE_PAYMENTS,
        Permission.FINANCIAL_CONFIGURE_GATEWAYS,
        Permission.FINANCIAL_MANAGE_CASH_FLOW,
        Permission.FINANCIAL_EXPORT_REPORTS,
    ],
    users: [
        Permission.USERS_VIEW_ALL,
        Permission.USERS_CREATE,
        Permission.USERS_CREATE_BASIC,
        Permission.USERS_UPDATE,
        Permission.USERS_UPDATE_BASIC,
        Permission.USERS_DELETE,
        Permission.USERS_CHANGE_ROLES,
        Permission.USERS_RESET_PASSWORD,
        Permission.USERS_VIEW_LOGS,
        Permission.USERS_BLOCK,
    ],
    config: [
        Permission.CONFIG_VIEW,
        Permission.CONFIG_UPDATE,
        Permission.CONFIG_MANAGE_INTEGRATIONS,
        Permission.CONFIG_MANAGE_BILLING,
        Permission.CONFIG_BACKUP,
        Permission.CONFIG_SECURITY,
        Permission.CONFIG_WHITE_LABEL,
    ],
    bi: [
        Permission.BI_VIEW_ALL,
        Permission.BI_VIEW_OPERATIONAL,
        Permission.BI_VIEW_PERSONAL,
        Permission.BI_EXPORT,
        Permission.BI_USE_AI,
    ],
    marketing: [
        Permission.MARKETING_VIEW,
        Permission.MARKETING_CREATE,
        Permission.MARKETING_UPDATE,
        Permission.MARKETING_DELETE,
    ],
    inventory: [
        Permission.INVENTORY_VIEW,
        Permission.INVENTORY_CREATE,
        Permission.INVENTORY_UPDATE,
        Permission.INVENTORY_DELETE,
        Permission.INVENTORY_MANAGE,
    ],
    chat: [
        Permission.CHAT_VIEW_ALL,
        Permission.CHAT_VIEW_ASSIGNED,
        Permission.CHAT_VIEW_OWN_PATIENTS,
        Permission.CHAT_SEND,
        Permission.CHAT_CONFIGURE,
    ],
    superadmin: [
        Permission.SUPERADMIN_ACCESS_ALL_TENANTS,
        Permission.SUPERADMIN_MANAGE_TENANTS,
        Permission.SUPERADMIN_VIEW_LOGS,
        Permission.SUPERADMIN_MANAGE_INFRASTRUCTURE,
    ],
};
//# sourceMappingURL=permission.types.js.map