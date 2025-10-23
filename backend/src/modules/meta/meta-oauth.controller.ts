/**
 * Meta OAuth Controller
 * Handles OAuth authentication flow for Instagram & Messenger
 *
 * @module modules/meta
 */

import { Request, Response } from 'express';
import { MetaOAuthService } from './meta-oauth.service';
import { Pool } from 'pg';

export class MetaOAuthController {
  private metaService: MetaOAuthService;
  private db: Pool;

  constructor(db: Pool) {
    this.metaService = new MetaOAuthService();
    this.db = db;
  }

  /**
   * GET /api/meta/oauth/start
   * Start OAuth flow - generate authorization URL
   */
  async startOAuth(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const tenantId = (req as any).user?.tenantId;

      if (!userId || !tenantId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      // Generate state for CSRF protection
      const state = this.metaService.generateState();

      // Save state temporarily in database (expires in 10 minutes)
      await this.db.query(
        `INSERT INTO oauth_states (user_id, state, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
        [userId, state]
      );

      // Generate authorization URL
      const authUrl = this.metaService.getAuthorizationUrl(state);

      console.log(`[MetaOAuth] OAuth started for user ${userId}, tenant ${tenantId}`);

      res.json({
        success: true,
        data: {
          authUrl,
          state,
        },
      });
    } catch (error: any) {
      console.error('[MetaOAuth] Error starting OAuth:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/meta/oauth/callback
   * OAuth callback - handles Meta redirect after authorization
   */
  async oauthCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, state, error, error_description } = req.query;

      // Handle OAuth error
      if (error) {
        console.error('[MetaOAuth] OAuth error:', error, error_description);
        const errorUrl = `${process.env.FRONTEND_URL}/integracoes?error=${encodeURIComponent(error as string)}`;
        res.redirect(errorUrl);
        return;
      }

      if (!code || !state) {
        res.status(400).json({ success: false, error: 'Invalid parameters' });
        return;
      }

      // Validate state (CSRF protection)
      const stateResult = await this.db.query(
        `SELECT user_id FROM oauth_states
         WHERE state = $1 AND expires_at > NOW()`,
        [state]
      );

      if (stateResult.rows.length === 0) {
        res.status(400).json({ success: false, error: 'Invalid or expired state' });
        return;
      }

      const userId = stateResult.rows[0].user_id;

      // Exchange code for access token
      const tokenData = await this.metaService.exchangeCodeForToken(code as string);

      // Get long-lived token (60 days validity)
      const longLivedTokenData = await this.metaService.getLongLivedToken(
        tokenData.access_token
      );

      // Get Instagram account data
      const instagramAccount = await this.metaService.getInstagramAccount(
        longLivedTokenData.access_token
      );

      // Encrypt token before storing
      const encryptedToken = this.metaService.encryptToken(
        longLivedTokenData.access_token
      );

      // Calculate expiration date (60 days from now)
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + (longLivedTokenData.expires_in || 5184000)); // 60 days

      // Get user's tenant
      const userResult = await this.db.query(
        `SELECT tenant_id FROM users WHERE id = $1`,
        [userId]
      );
      const tenantId = userResult.rows[0].tenant_id;

      // Save account in database (INSERT or UPDATE if already exists)
      await this.db.query(
        `INSERT INTO meta_instagram_accounts (
          tenant_id, user_id, instagram_account_id, instagram_username,
          instagram_name, profile_picture_url, facebook_page_id, facebook_page_name,
          access_token, long_lived_token, token_expires_at, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, $10, 'active')
        ON CONFLICT (instagram_account_id)
        DO UPDATE SET
          access_token = $9,
          long_lived_token = $9,
          token_expires_at = $10,
          instagram_username = $4,
          instagram_name = $5,
          profile_picture_url = $6,
          facebook_page_id = $7,
          facebook_page_name = $8,
          status = 'active',
          user_id = $2,
          tenant_id = $1,
          updated_at = NOW()`,
        [
          tenantId,
          userId,
          instagramAccount.id,
          instagramAccount.username,
          instagramAccount.name,
          instagramAccount.profile_picture_url,
          instagramAccount.facebook_page_id,
          instagramAccount.facebook_page_name,
          encryptedToken,
          expiresAt,
        ]
      );

      // Delete used state
      await this.db.query(`DELETE FROM oauth_states WHERE state = $1`, [state]);

      console.log(`[MetaOAuth] Successfully connected Instagram account @${instagramAccount.username} for user ${userId}`);

      // Redirect back to frontend with success
      const successUrl = `${process.env.FRONTEND_URL}/integracoes?success=true&account=${instagramAccount.username}`;
      res.redirect(successUrl);
    } catch (error: any) {
      console.error('[MetaOAuth] Error in callback:', error);
      const errorUrl = `${process.env.FRONTEND_URL}/integracoes?error=${encodeURIComponent(error.message)}`;
      res.redirect(errorUrl);
    }
  }

  /**
   * GET /api/meta/accounts
   * List connected Instagram accounts for tenant
   */
  async listAccounts(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;

      if (!tenantId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const result = await this.db.query(
        `SELECT
          id, instagram_account_id, instagram_username, instagram_name,
          profile_picture_url, facebook_page_id, facebook_page_name,
          platform, status, connected_at, token_expires_at, user_id
         FROM meta_instagram_accounts
         WHERE tenant_id = $1 AND status = 'active'
         ORDER BY connected_at DESC`,
        [tenantId]
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error: any) {
      console.error('[MetaOAuth] Error listing accounts:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * DELETE /api/meta/accounts/:id
   * Disconnect Instagram account
   */
  async disconnectAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = (req as any).user?.tenantId;

      if (!tenantId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      // Mark account as revoked (soft delete)
      const result = await this.db.query(
        `UPDATE meta_instagram_accounts
         SET status = 'revoked', updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2
         RETURNING instagram_username`,
        [id, tenantId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Account not found' });
        return;
      }

      console.log(`[MetaOAuth] Disconnected Instagram account @${result.rows[0].instagram_username}`);

      res.json({ success: true });
    } catch (error: any) {
      console.error('[MetaOAuth] Error disconnecting account:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
