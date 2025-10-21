import { Pool } from 'pg';
import { CrmDataSource } from '@/database/data-source';

/**
 * Get PostgreSQL Pool from TypeORM CrmDataSource
 *
 * This provides a pg.Pool instance for raw SQL queries in the automation module.
 * The automation tables (triggers, workflows, etc) are in the CRM database.
 */
export function getAutomationDbPool(): Pool {
  // TypeORM's driver exposes the underlying pg.Pool
  const driver = CrmDataSource.driver as any;

  if (!driver.master) {
    throw new Error('CrmDataSource not initialized. Call CrmDataSource.initialize() first.');
  }

  return driver.master;
}

/**
 * Execute a raw SQL query on the CRM database
 * Convenience function for simple queries
 */
export async function query(sql: string, params?: any[]): Promise<any> {
  const pool = getAutomationDbPool();
  return pool.query(sql, params);
}
