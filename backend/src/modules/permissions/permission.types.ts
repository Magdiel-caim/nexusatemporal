/**
 * Permission Types
 *
 * Define todos os tipos de permissões disponíveis no sistema.
 * Baseado no documento de Sistema de Permissões RBAC v1.0
 */

export enum Permission {
  // Dashboard
  DASHBOARD_VIEW_ALL = 'dashboard.view_all',
  DASHBOARD_VIEW_PERSONAL = 'dashboard.view_personal',
  DASHBOARD_VIEW_OPERATIONAL = 'dashboard.view_operational',

  // Leads
  LEADS_CREATE = 'leads.create',
  LEADS_READ = 'leads.read',
  LEADS_READ_ALL = 'leads.read_all',
  LEADS_READ_ASSIGNED = 'leads.read_assigned',
  LEADS_UPDATE = 'leads.update',
  LEADS_UPDATE_ALL = 'leads.update_all',
  LEADS_UPDATE_OWN = 'leads.update_own',
  LEADS_DELETE = 'leads.delete',
  LEADS_ASSIGN = 'leads.assign',
  LEADS_EXPORT = 'leads.export',
  LEADS_IMPORT = 'leads.import',
  LEADS_CONFIGURE = 'leads.configure',

  // Agenda
  AGENDA_VIEW_ALL = 'agenda.view_all',
  AGENDA_VIEW_OWN = 'agenda.view_own',
  AGENDA_CREATE = 'agenda.create',
  AGENDA_CREATE_FOR_OTHERS = 'agenda.create_for_others',
  AGENDA_UPDATE = 'agenda.update',
  AGENDA_UPDATE_OWN = 'agenda.update_own',
  AGENDA_DELETE = 'agenda.delete',
  AGENDA_CONFIGURE = 'agenda.configure',
  AGENDA_BLOCK_TIMES = 'agenda.block_times',

  // Prontuários
  RECORDS_VIEW_ALL = 'records.view_all',
  RECORDS_VIEW_OWN_PATIENTS = 'records.view_own_patients',
  RECORDS_CREATE = 'records.create',
  RECORDS_UPDATE = 'records.update',
  RECORDS_DELETE = 'records.delete',
  RECORDS_SIGN = 'records.sign',
  RECORDS_EXPORT = 'records.export',
  RECORDS_ATTACH_FILES = 'records.attach_files',

  // Financeiro
  FINANCIAL_VIEW_ALL = 'financial.view_all',
  FINANCIAL_VIEW_SUMMARY = 'financial.view_summary',
  FINANCIAL_VIEW_OWN_COMMISSIONS = 'financial.view_own_commissions',
  FINANCIAL_CREATE_REVENUE = 'financial.create_revenue',
  FINANCIAL_CREATE_EXPENSE = 'financial.create_expense',
  FINANCIAL_APPROVE_PAYMENTS = 'financial.approve_payments',
  FINANCIAL_CONFIGURE_GATEWAYS = 'financial.configure_gateways',
  FINANCIAL_MANAGE_CASH_FLOW = 'financial.manage_cash_flow',
  FINANCIAL_EXPORT_REPORTS = 'financial.export_reports',

  // Usuários
  USERS_VIEW_ALL = 'users.view_all',
  USERS_CREATE = 'users.create',
  USERS_CREATE_BASIC = 'users.create_basic',
  USERS_UPDATE = 'users.update',
  USERS_UPDATE_BASIC = 'users.update_basic',
  USERS_DELETE = 'users.delete',
  USERS_CHANGE_ROLES = 'users.change_roles',
  USERS_RESET_PASSWORD = 'users.reset_password',
  USERS_VIEW_LOGS = 'users.view_logs',
  USERS_BLOCK = 'users.block',

  // Configurações
  CONFIG_VIEW = 'config.view',
  CONFIG_UPDATE = 'config.update',
  CONFIG_MANAGE_INTEGRATIONS = 'config.manage_integrations',
  CONFIG_MANAGE_BILLING = 'config.manage_billing',
  CONFIG_BACKUP = 'config.backup',
  CONFIG_SECURITY = 'config.security',
  CONFIG_WHITE_LABEL = 'config.white_label',

  // BI & Analytics
  BI_VIEW_ALL = 'bi.view_all',
  BI_VIEW_OPERATIONAL = 'bi.view_operational',
  BI_VIEW_PERSONAL = 'bi.view_personal',
  BI_EXPORT = 'bi.export',
  BI_USE_AI = 'bi.use_ai',

  // Marketing
  MARKETING_VIEW = 'marketing.view',
  MARKETING_CREATE = 'marketing.create',
  MARKETING_UPDATE = 'marketing.update',
  MARKETING_DELETE = 'marketing.delete',

  // Estoque
  INVENTORY_VIEW = 'inventory.view',
  INVENTORY_CREATE = 'inventory.create',
  INVENTORY_UPDATE = 'inventory.update',
  INVENTORY_DELETE = 'inventory.delete',
  INVENTORY_MANAGE = 'inventory.manage',

  // Chat/WhatsApp
  CHAT_VIEW_ALL = 'chat.view_all',
  CHAT_VIEW_ASSIGNED = 'chat.view_assigned',
  CHAT_VIEW_OWN_PATIENTS = 'chat.view_own_patients',
  CHAT_SEND = 'chat.send',
  CHAT_CONFIGURE = 'chat.configure',

  // Super Admin (cross-tenant)
  SUPERADMIN_ACCESS_ALL_TENANTS = 'superadmin.access_all_tenants',
  SUPERADMIN_MANAGE_TENANTS = 'superadmin.manage_tenants',
  SUPERADMIN_VIEW_LOGS = 'superadmin.view_logs',
  SUPERADMIN_MANAGE_INFRASTRUCTURE = 'superadmin.manage_infrastructure',
}

/**
 * Mapeamento de módulos para suas permissões
 */
export const PermissionsByModule = {
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
