"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendasDbPool = getVendasDbPool;
const data_source_1 = require("@/database/data-source");
let pool = null;
/**
 * Obtém o pool de conexões do CrmDataSource
 * Lazy initialization - só cria quando necessário
 */
function getVendasDbPool() {
    if (!pool) {
        if (!data_source_1.CrmDataSource.isInitialized) {
            throw new Error('CrmDataSource not initialized');
        }
        // Get the native PostgreSQL driver from TypeORM
        const driver = data_source_1.CrmDataSource.driver;
        pool = driver.master;
        if (!pool) {
            throw new Error('Failed to get database pool from CrmDataSource');
        }
    }
    return pool;
}
//# sourceMappingURL=database.js.map