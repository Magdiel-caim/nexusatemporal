"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAutomationDbPool = getAutomationDbPool;
exports.query = query;
const data_source_1 = require("../../database/data-source");
/**
 * Get PostgreSQL Pool from TypeORM CrmDataSource
 *
 * This provides a pg.Pool instance for raw SQL queries in the automation module.
 * The automation tables (triggers, workflows, etc) are in the CRM database.
 */
function getAutomationDbPool() {
    // TypeORM's driver exposes the underlying pg.Pool
    const driver = data_source_1.CrmDataSource.driver;
    if (!driver.master) {
        throw new Error('CrmDataSource not initialized. Call CrmDataSource.initialize() first.');
    }
    return driver.master;
}
/**
 * Execute a raw SQL query on the CRM database
 * Convenience function for simple queries
 */
async function query(sql, params) {
    const pool = getAutomationDbPool();
    return pool.query(sql, params);
}
//# sourceMappingURL=database.js.map