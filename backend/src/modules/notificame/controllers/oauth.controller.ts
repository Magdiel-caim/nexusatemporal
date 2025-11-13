import { Request, Response } from 'express';
import { AppDataSource } from '../../../database/data-source';
import { SocialConnection } from '../entities';
import { oauthService, tokenService, notificameService, encryptionService } from '../services';
import logger from '../utils/logger';
import * as validators from '../utils/validators';

class OAuthController {
    private connectionRepository = AppDataSource.getRepository(SocialConnection);
    private oauthStates = new Map<string, { cliente_id: string; empresa_id: string; created_at: number }>();

    /**
     * GET /api/notificame/oauth/authorize/instagram
     * Gera URL de autorização OAuth para Instagram
     */
    async authorizeInstagram(req: Request, res: Response): Promise<Response> {
        try {
            const { cliente_id, empresa_id } = req.query;

            if (!cliente_id || !validators.isValidUUID(cliente_id as string)) {
                return res.status(400).json({ error: 'cliente_id inválido' });
            }

            if (!empresa_id || !validators.isValidUUID(empresa_id as string)) {
                return res.status(400).json({ error: 'empresa_id inválido' });
            }

            // Gerar state para CSRF protection
            const state = encryptionService.generateRandomString(32);

            // Armazenar state temporariamente (15 minutos)
            this.oauthStates.set(state, {
                cliente_id: cliente_id as string,
                empresa_id: empresa_id as string,
                created_at: Date.now()
            });

            // Limpar states antigos
            this.cleanupOldStates();

            const authUrl = oauthService.buildInstagramAuthUrl(state);

            logger.info(`[OAuthController] URL autorização Instagram gerada para cliente ${cliente_id}`);

            return res.json({ authUrl, state });
        } catch (error: any) {
            logger.error('[OAuthController] Erro ao gerar URL Instagram:', error);
            return res.status(500).json({ error: 'Erro ao gerar URL de autorização' });
        }
    }

    /**
     * GET /api/notificame/oauth/callback/instagram
     * Callback OAuth Instagram
     */
    async callbackInstagram(req: Request, res: Response): Promise<void> {
        try {
            const { code, state } = req.query;

            if (!code || !state) {
                res.redirect(`${process.env.FRONTEND_URL}/configuracoes/integracoes?error=missing_params`);
                return;
            }

            // Validar state
            const stateData = this.oauthStates.get(state as string);
            if (!stateData) {
                logger.error('[OAuthController] State inválido ou expirado');
                res.redirect(`${process.env.FRONTEND_URL}/configuracoes/integracoes?error=invalid_state`);
                return;
            }

            // Remover state usado
            this.oauthStates.delete(state as string);

            // Trocar código por token
            const { access_token, user_id } = await oauthService.exchangeInstagramCode(code as string);

            // Obter perfil
            const profile = await oauthService.getInstagramProfile(access_token, user_id);

            // Trocar por long-lived token
            const longLivedToken = await oauthService.exchangeForLongLivedToken(access_token);

            // Criar canal no Notifica.me
            const channel = await notificameService.createChannel({
                platform: 'instagram',
                access_token: longLivedToken.access_token,
                platform_user_id: user_id,
                platform_username: profile.username
            });

            // Salvar conexão no banco
            const connection = this.connectionRepository.create({
                cliente_id: stateData.cliente_id,
                empresa_id: stateData.empresa_id,
                platform: 'instagram',
                platform_user_id: user_id,
                platform_username: profile.username,
                access_token_encrypted: encryptionService.encrypt(longLivedToken.access_token),
                token_expires_at: longLivedToken.expires_in
                    ? new Date(Date.now() + longLivedToken.expires_in * 1000)
                    : undefined,
                notificame_channel_id: channel.channel_id,
                notificame_channel_status: channel.status,
                connection_status: 'active',
                granted_permissions: ['instagram_basic', 'instagram_manage_messages'],
                metadata: { account_type: profile.account_type }
            });

            await this.connectionRepository.save(connection);

            logger.info(`[OAuthController] Conexão Instagram criada: ${connection.id}`);

            res.redirect(`${process.env.FRONTEND_URL}/configuracoes/integracoes?success=instagram_connected`);
        } catch (error: any) {
            logger.error('[OAuthController] Erro no callback Instagram:', error);
            res.redirect(`${process.env.FRONTEND_URL}/configuracoes/integracoes?error=connection_failed`);
        }
    }

    /**
     * GET /api/notificame/oauth/authorize/facebook
     * Gera URL de autorização OAuth para Facebook
     */
    async authorizeFacebook(req: Request, res: Response): Promise<Response> {
        try {
            const { cliente_id, empresa_id } = req.query;

            if (!cliente_id || !validators.isValidUUID(cliente_id as string)) {
                return res.status(400).json({ error: 'cliente_id inválido' });
            }

            if (!empresa_id || !validators.isValidUUID(empresa_id as string)) {
                return res.status(400).json({ error: 'empresa_id inválido' });
            }

            const state = encryptionService.generateRandomString(32);

            this.oauthStates.set(state, {
                cliente_id: cliente_id as string,
                empresa_id: empresa_id as string,
                created_at: Date.now()
            });

            this.cleanupOldStates();

            const authUrl = oauthService.buildFacebookAuthUrl(state);

            logger.info(`[OAuthController] URL autorização Facebook gerada para cliente ${cliente_id}`);

            return res.json({ authUrl, state });
        } catch (error: any) {
            logger.error('[OAuthController] Erro ao gerar URL Facebook:', error);
            return res.status(500).json({ error: 'Erro ao gerar URL de autorização' });
        }
    }

    /**
     * Limpa states OAuth antigos (> 15 minutos)
     */
    private cleanupOldStates(): void {
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000;

        for (const [state, data] of this.oauthStates.entries()) {
            if (now - data.created_at > fifteenMinutes) {
                this.oauthStates.delete(state);
            }
        }
    }
}

export default new OAuthController();
