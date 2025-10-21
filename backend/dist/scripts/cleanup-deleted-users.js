"use strict";
/**
 * Cleanup Deleted Users Script
 *
 * This script:
 * 1. Finds users deleted more than 30 days ago
 * 2. Transfers their leads and appointments to manager/admin
 * 3. Permanently deletes the users
 *
 * Run daily via cron: 0 2 * * * (at 2 AM)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupDeletedUsers = cleanupDeletedUsers;
const data_source_1 = require("../database/data-source");
const logger_1 = require("../shared/utils/logger");
async function findManagerOrAdmin(tenantId, pool) {
    // Try to find manager first
    const managerResult = await pool.query(`SELECT id FROM users
     WHERE "tenantId" = $1
     AND role IN ('manager', 'admin', 'owner')
     AND status = 'active'
     ORDER BY
       CASE role
         WHEN 'owner' THEN 1
         WHEN 'admin' THEN 2
         WHEN 'manager' THEN 3
       END
     LIMIT 1`, [tenantId]);
    return managerResult.rows[0]?.id || null;
}
async function transferUserData(userId, newOwnerId, pool) {
    logger_1.logger.info(`Transferring data from user ${userId} to ${newOwnerId}`);
    // Transfer leads
    const leadsResult = await pool.query(`UPDATE leads SET "ownerId" = $1, "updatedAt" = NOW()
     WHERE "ownerId" = $2`, [newOwnerId, userId]);
    logger_1.logger.info(`Transferred ${leadsResult.rowCount} leads`);
    // Transfer appointments
    const appointmentsResult = await pool.query(`UPDATE appointments SET "userId" = $1, "updatedAt" = NOW()
     WHERE "userId" = $2`, [newOwnerId, userId]);
    logger_1.logger.info(`Transferred ${appointmentsResult.rowCount} appointments`);
    // Transfer activities
    const activitiesResult = await pool.query(`UPDATE activities SET "userId" = $1, "updatedAt" = NOW()
     WHERE "userId" = $2`, [newOwnerId, userId]);
    logger_1.logger.info(`Transferred ${activitiesResult.rowCount} activities`);
}
async function cleanupDeletedUsers() {
    try {
        logger_1.logger.info('Starting cleanup of deleted users...');
        if (!data_source_1.CrmDataSource.isInitialized) {
            await data_source_1.CrmDataSource.initialize();
        }
        const pool = data_source_1.CrmDataSource.driver.master;
        // Find users deleted more than 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const deletedUsers = await pool.query(`SELECT id, email, name, "tenantId", "deletedAt"
       FROM users
       WHERE "deletedAt" IS NOT NULL
       AND "deletedAt" < $1
       AND status = 'inactive'
       ORDER BY "deletedAt" ASC`, [thirtyDaysAgo]);
        if (deletedUsers.rows.length === 0) {
            logger_1.logger.info('No users to cleanup');
            return;
        }
        logger_1.logger.info(`Found ${deletedUsers.rows.length} users to cleanup`);
        for (const user of deletedUsers.rows) {
            try {
                logger_1.logger.info(`Processing user: ${user.email} (deleted on ${user.deletedAt})`);
                // Find manager or admin to transfer data
                const newOwnerId = await findManagerOrAdmin(user.tenantId, pool);
                if (!newOwnerId) {
                    logger_1.logger.warn(`No manager/admin found for tenant ${user.tenantId}, skipping user ${user.email}`);
                    continue;
                }
                // Start transaction
                await pool.query('BEGIN');
                // Transfer data
                await transferUserData(user.id, newOwnerId, pool);
                // Permanently delete user
                await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
                await pool.query('COMMIT');
                logger_1.logger.info(`✅ Successfully cleaned up user: ${user.email}`);
            }
            catch (error) {
                await pool.query('ROLLBACK');
                logger_1.logger.error(`Error cleaning up user ${user.email}:`, error);
            }
        }
        logger_1.logger.info('Cleanup completed successfully');
    }
    catch (error) {
        logger_1.logger.error('Error in cleanup process:', error);
        throw error;
    }
    finally {
        if (data_source_1.CrmDataSource.isInitialized) {
            await data_source_1.CrmDataSource.destroy();
        }
    }
}
// Run if called directly
if (require.main === module) {
    cleanupDeletedUsers()
        .then(() => {
        logger_1.logger.info('Script finished successfully');
        process.exit(0);
    })
        .catch((error) => {
        logger_1.logger.error('Script failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=cleanup-deleted-users.js.map