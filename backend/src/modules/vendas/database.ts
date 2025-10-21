import { Pool } from 'pg';
import { CrmDataSource } from '@/database/data-source';

let pool: Pool | null = null;

/**
 * Obtém o pool de conexões do CrmDataSource
 * Lazy initialization - só cria quando necessário
 */
export function getVendasDbPool(): Pool {
  if (!pool) {
    if (!CrmDataSource.isInitialized) {
      throw new Error('CrmDataSource not initialized');
    }

    // Get the native PostgreSQL driver from TypeORM
    const driver = CrmDataSource.driver as any;
    pool = driver.master as Pool;

    if (!pool) {
      throw new Error('Failed to get database pool from CrmDataSource');
    }
  }

  return pool;
}
