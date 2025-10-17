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

import { CrmDataSource } from '../database/data-source';
import { logger } from '../shared/utils/logger';

interface DeletedUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  deletedAt: Date;
}

async function findManagerOrAdmin(tenantId: string, pool: any): Promise<string | null> {
  // Try to find manager first
  const managerResult = await pool.query(
    `SELECT id FROM users
     WHERE "tenantId" = $1
     AND role IN ('manager', 'admin', 'owner')
     AND status = 'active'
     ORDER BY
       CASE role
         WHEN 'owner' THEN 1
         WHEN 'admin' THEN 2
         WHEN 'manager' THEN 3
       END
     LIMIT 1`,
    [tenantId]
  );

  return managerResult.rows[0]?.id || null;
}

async function transferUserData(userId: string, newOwnerId: string, pool: any) {
  logger.info(`Transferring data from user ${userId} to ${newOwnerId}`);

  // Transfer leads
  const leadsResult = await pool.query(
    `UPDATE leads SET "ownerId" = $1, "updatedAt" = NOW()
     WHERE "ownerId" = $2`,
    [newOwnerId, userId]
  );
  logger.info(`Transferred ${leadsResult.rowCount} leads`);

  // Transfer appointments
  const appointmentsResult = await pool.query(
    `UPDATE appointments SET "userId" = $1, "updatedAt" = NOW()
     WHERE "userId" = $2`,
    [newOwnerId, userId]
  );
  logger.info(`Transferred ${appointmentsResult.rowCount} appointments`);

  // Transfer activities
  const activitiesResult = await pool.query(
    `UPDATE activities SET "userId" = $1, "updatedAt" = NOW()
     WHERE "userId" = $2`,
    [newOwnerId, userId]
  );
  logger.info(`Transferred ${activitiesResult.rowCount} activities`);
}

async function cleanupDeletedUsers() {
  try {
    logger.info('Starting cleanup of deleted users...');

    if (!CrmDataSource.isInitialized) {
      await CrmDataSource.initialize();
    }

    const pool = (CrmDataSource.driver as any).master;

    // Find users deleted more than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedUsers = await pool.query(
      `SELECT id, email, name, "tenantId", "deletedAt"
       FROM users
       WHERE "deletedAt" IS NOT NULL
       AND "deletedAt" < $1
       AND status = 'inactive'
       ORDER BY "deletedAt" ASC`,
      [thirtyDaysAgo]
    );

    if (deletedUsers.rows.length === 0) {
      logger.info('No users to cleanup');
      return;
    }

    logger.info(`Found ${deletedUsers.rows.length} users to cleanup`);

    for (const user of deletedUsers.rows) {
      try {
        logger.info(`Processing user: ${user.email} (deleted on ${user.deletedAt})`);

        // Find manager or admin to transfer data
        const newOwnerId = await findManagerOrAdmin(user.tenantId, pool);

        if (!newOwnerId) {
          logger.warn(`No manager/admin found for tenant ${user.tenantId}, skipping user ${user.email}`);
          continue;
        }

        // Start transaction
        await pool.query('BEGIN');

        // Transfer data
        await transferUserData(user.id, newOwnerId, pool);

        // Permanently delete user
        await pool.query('DELETE FROM users WHERE id = $1', [user.id]);

        await pool.query('COMMIT');

        logger.info(`✅ Successfully cleaned up user: ${user.email}`);
      } catch (error) {
        await pool.query('ROLLBACK');
        logger.error(`Error cleaning up user ${user.email}:`, error);
      }
    }

    logger.info('Cleanup completed successfully');
  } catch (error) {
    logger.error('Error in cleanup process:', error);
    throw error;
  } finally {
    if (CrmDataSource.isInitialized) {
      await CrmDataSource.destroy();
    }
  }
}

// Run if called directly
if (require.main === module) {
  cleanupDeletedUsers()
    .then(() => {
      logger.info('Script finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Script failed:', error);
      process.exit(1);
    });
}

export { cleanupDeletedUsers };
