import { AppDataSource } from '../../../database/data-source';
import { SocialConnection } from '../entities';
import encryptionService from './encryption.service';
import oauthService from './oauth.service';
import logger from '../utils/logger';

interface TokenData {
    connection_id: string;
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
}

interface DecryptedTokenData {
    access_token: string;
    refresh_token?: string;
    expires_at?: Date;
    platform: string;
}

class TokenService {
    private connectionRepository = AppDataSource.getRepository(SocialConnection);

    /**
     * Salva token criptografado no banco
     */
    async saveToken({ connection_id, access_token, refresh_token, expires_in }: TokenData): Promise<void> {
        try {
            const encryptedAccessToken = encryptionService.encrypt(access_token);
            const encryptedRefreshToken = refresh_token
                ? encryptionService.encrypt(refresh_token)
                : undefined;

            const expiresAt = expires_in
                ? new Date(Date.now() + expires_in * 1000)
                : undefined;

            await this.connectionRepository.update(
                { id: connection_id },
                {
                    access_token_encrypted: encryptedAccessToken,
                    refresh_token_encrypted: encryptedRefreshToken,
                    token_expires_at: expiresAt,
                    updated_at: new Date()
                }
            );

            logger.info(`[TokenService] Token salvo para connection ${connection_id}`);
        } catch (error) {
            logger.error('[TokenService] Erro ao salvar token:', error);
            throw error;
        }
    }

    /**
     * Obtém token descriptografado
     */
    async getToken(connection_id: string): Promise<DecryptedTokenData> {
        try {
            const connection = await this.connectionRepository.findOne({
                where: { id: connection_id }
            });

            if (!connection) {
                throw new Error('Conexão não encontrada');
            }

            const access_token = encryptionService.decrypt(connection.access_token_encrypted);
            const refresh_token = connection.refresh_token_encrypted
                ? encryptionService.decrypt(connection.refresh_token_encrypted)
                : undefined;

            return {
                access_token,
                refresh_token,
                expires_at: connection.token_expires_at,
                platform: connection.platform
            };
        } catch (error) {
            logger.error('[TokenService] Erro ao obter token:', error);
            throw error;
        }
    }

    /**
     * Verifica se token está próximo de expirar (< 7 dias)
     */
    async isTokenExpiringSoon(connection_id: string): Promise<boolean> {
        try {
            const connection = await this.connectionRepository.findOne({
                where: { id: connection_id },
                select: ['token_expires_at']
            });

            if (!connection || !connection.token_expires_at) {
                return false;
            }

            const expiresAt = new Date(connection.token_expires_at);
            const now = new Date();
            const daysUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

            return daysUntilExpiry < 7;
        } catch (error) {
            logger.error('[TokenService] Erro ao verificar expiração:', error);
            return false;
        }
    }

    /**
     * Renova token se necessário
     */
    async refreshIfNeeded(connection_id: string): Promise<boolean> {
        try {
            const isExpiring = await this.isTokenExpiringSoon(connection_id);

            if (!isExpiring) {
                logger.info(`[TokenService] Token ainda válido para ${connection_id}`);
                return false;
            }

            logger.info(`[TokenService] Token expirando, renovando para ${connection_id}`);

            const tokenData = await this.getToken(connection_id);

            if (!tokenData.refresh_token) {
                logger.warn(`[TokenService] Sem refresh token para ${connection_id}`);
                return false;
            }

            // Renovar token
            const newTokenData = await oauthService.refreshToken(tokenData.refresh_token);

            // Salvar novo token
            await this.saveToken({
                connection_id,
                access_token: newTokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_in: newTokenData.expires_in
            });

            logger.info(`[TokenService] Token renovado com sucesso para ${connection_id}`);

            return true;
        } catch (error) {
            logger.error('[TokenService] Erro ao renovar token:', error);

            // Marcar conexão como expirada
            await this.connectionRepository.update(
                { id: connection_id },
                { connection_status: 'expired' }
            );

            return false;
        }
    }

    /**
     * Job para renovar tokens que estão expirando
     * Executar diariamente via cron job
     */
    async renewExpiringTokens(): Promise<void> {
        try {
            logger.info('[TokenService] Verificando tokens expirando');

            // Buscar conexões com token expirando em < 7 dias
            const connections = await this.connectionRepository
                .createQueryBuilder('conn')
                .select(['conn.id', 'conn.platform', 'conn.platform_username'])
                .where('conn.connection_status = :status', { status: 'active' })
                .andWhere('conn.token_expires_at IS NOT NULL')
                .andWhere('conn.token_expires_at < :date', {
                    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                })
                .getMany();

            logger.info(`[TokenService] Encontradas ${connections.length} conexões com tokens expirando`);

            for (const conn of connections) {
                try {
                    await this.refreshIfNeeded(conn.id);
                } catch (error) {
                    logger.error(`[TokenService] Erro ao renovar token de ${conn.id}:`, error);
                }
            }

            logger.info('[TokenService] Renovação de tokens concluída');
        } catch (error) {
            logger.error('[TokenService] Erro no job de renovação:', error);
        }
    }
}

export default new TokenService();
