"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeAllTenantDataSources = exports.getTenantDataSource = exports.createTenantDataSource = exports.CrmDataSource = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const baseConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'nexus_master',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.DB_LOGGING === 'true',
    entities: [path_1.default.join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}')],
    migrations: [path_1.default.join(__dirname, 'migrations', '*{.ts,.js}')],
    subscribers: [],
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};
exports.AppDataSource = new typeorm_1.DataSource(baseConfig);
/**
 * CRM Database Configuration (VPS separada - 46.202.144.210)
 * Contém: leads, users, pipelines, procedures, stages, lead_activities
 */
const crmConfig = {
    type: 'postgres',
    host: process.env.CRM_DB_HOST || '46.202.144.210',
    port: parseInt(process.env.CRM_DB_PORT || '5432'),
    username: process.env.CRM_DB_USERNAME || 'nexus_admin',
    password: process.env.CRM_DB_PASSWORD || 'nexus2024@secure',
    database: process.env.CRM_DB_DATABASE || 'nexus_crm',
    synchronize: false, // Nunca sincronizar automaticamente em produção
    logging: process.env.DB_LOGGING === 'true',
    entities: [path_1.default.join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}')],
    ssl: false,
    name: 'crm', // Nome do datasource para referência
};
exports.CrmDataSource = new typeorm_1.DataSource(crmConfig);
/**
 * Create a dynamic data source for tenant databases
 * @param tenantId - The tenant identifier
 * @returns DataSource for the tenant
 */
const createTenantDataSource = (tenantId) => {
    const tenantConfig = {
        ...baseConfig,
        database: `nexus_tenant_${tenantId}`,
        name: `tenant_${tenantId}`,
    };
    return new typeorm_1.DataSource(tenantConfig);
};
exports.createTenantDataSource = createTenantDataSource;
/**
 * Get or create tenant data source
 * @param tenantId - The tenant identifier
 * @returns Initialized DataSource for the tenant
 */
const tenantDataSources = new Map();
const getTenantDataSource = async (tenantId) => {
    if (tenantDataSources.has(tenantId)) {
        const dataSource = tenantDataSources.get(tenantId);
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }
        return dataSource;
    }
    const dataSource = (0, exports.createTenantDataSource)(tenantId);
    await dataSource.initialize();
    tenantDataSources.set(tenantId, dataSource);
    return dataSource;
};
exports.getTenantDataSource = getTenantDataSource;
/**
 * Close all tenant data sources
 */
const closeAllTenantDataSources = async () => {
    for (const [tenantId, dataSource] of tenantDataSources.entries()) {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
        tenantDataSources.delete(tenantId);
    }
};
exports.closeAllTenantDataSources = closeAllTenantDataSources;
//# sourceMappingURL=data-source.js.map