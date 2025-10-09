import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const baseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'nexus_master',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.DB_LOGGING === 'true',
  entities: [path.join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
  subscribers: [],
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

export const AppDataSource = new DataSource(baseConfig);

/**
 * Create a dynamic data source for tenant databases
 * @param tenantId - The tenant identifier
 * @returns DataSource for the tenant
 */
export const createTenantDataSource = (tenantId: string): DataSource => {
  const tenantConfig: DataSourceOptions = {
    ...baseConfig,
    database: `nexus_tenant_${tenantId}`,
    name: `tenant_${tenantId}`,
  };

  return new DataSource(tenantConfig);
};

/**
 * Get or create tenant data source
 * @param tenantId - The tenant identifier
 * @returns Initialized DataSource for the tenant
 */
const tenantDataSources = new Map<string, DataSource>();

export const getTenantDataSource = async (tenantId: string): Promise<DataSource> => {
  if (tenantDataSources.has(tenantId)) {
    const dataSource = tenantDataSources.get(tenantId)!;
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    return dataSource;
  }

  const dataSource = createTenantDataSource(tenantId);
  await dataSource.initialize();
  tenantDataSources.set(tenantId, dataSource);

  return dataSource;
};

/**
 * Close all tenant data sources
 */
export const closeAllTenantDataSources = async (): Promise<void> => {
  for (const [tenantId, dataSource] of tenantDataSources.entries()) {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    tenantDataSources.delete(tenantId);
  }
};
