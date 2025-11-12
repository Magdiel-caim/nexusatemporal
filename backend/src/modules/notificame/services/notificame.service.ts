import axios from 'axios';
import logger from '../utils/logger';
import { AppDataSource } from '../../../database/data-source';
import { SocialConnection } from '../entities';
import tokenService from './token.service';

interface SendMessagePayload {
    connection_id: string;
    to: string;
    message: string;
    media_url?: string;
}

interface CreateChannelPayload {
    platform: string;
    access_token: string;
    platform_user_id: string;
    platform_username: string;
}

class NotificaMeService {
    private apiToken: string;
    private baseUrl: string;
    private connectionRepository = AppDataSource.getRepository(SocialConnection);

    constructor() {
        this.apiToken = process.env.NOTIFICAME_API_TOKEN || '';
        this.baseUrl = process.env.NOTIFICAME_BASE_URL || 'https://api.notificame.com.br';

        if (!this.apiToken) {
            logger.warn('NOTIFICAME_API_TOKEN não configurado');
        }
    }

    /**
     * Cria ou registra um canal no Notifica.me
     */
    async createChannel(payload: CreateChannelPayload): Promise<{ channel_id: string; status: string }> {
        try {
            logger.info(`[NotificaMeService] Criando canal ${payload.platform} para ${payload.platform_username}`);

            // Exemplo de requisição ao Notifica.me API
            // Adaptar conforme documentação real da API
            const response = await axios.post(
                `${this.baseUrl}/v1/channels`,
                {
                    platform: payload.platform,
                    access_token: payload.access_token,
                    platform_user_id: payload.platform_user_id,
                    platform_username: payload.platform_username
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            logger.info(`[NotificaMeService] Canal criado: ${response.data.channel_id}`);

            return {
                channel_id: response.data.channel_id,
                status: response.data.status || 'active'
            };
        } catch (error: any) {
            logger.error('[NotificaMeService] Erro ao criar canal:', error.response?.data || error);
            throw new Error(`Erro ao criar canal: ${error.message}`);
        }
    }

    /**
     * Envia mensagem através de um canal
     */
    async sendMessage({ connection_id, to, message, media_url }: SendMessagePayload): Promise<void> {
        try {
            // Buscar conexão
            const connection = await this.connectionRepository.findOne({
                where: { id: connection_id }
            });

            if (!connection) {
                throw new Error('Conexão não encontrada');
            }

            if (!connection.notificame_channel_id) {
                throw new Error('Canal Notifica.me não configurado para esta conexão');
            }

            // Verificar e renovar token se necessário
            await tokenService.refreshIfNeeded(connection_id);

            logger.info(`[NotificaMeService] Enviando mensagem via ${connection.platform} para ${to}`);

            // Obter token descriptografado
            const tokenData = await tokenService.getToken(connection_id);

            // Enviar mensagem via Notifica.me API
            await axios.post(
                `${this.baseUrl}/v1/channels/${connection.notificame_channel_id}/messages`,
                {
                    to: to,
                    type: media_url ? 'media' : 'text',
                    content: message,
                    media_url: media_url
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'X-Access-Token': tokenData.access_token,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            // Atualizar last_sync_at
            await this.connectionRepository.update(
                { id: connection_id },
                { last_sync_at: new Date() }
            );

            logger.info('[NotificaMeService] Mensagem enviada com sucesso');
        } catch (error: any) {
            logger.error('[NotificaMeService] Erro ao enviar mensagem:', error.response?.data || error);
            throw error;
        }
    }

    /**
     * Lista canais ativos
     */
    async listChannels(): Promise<any> {
        try {
            logger.info('[NotificaMeService] Listando canais');

            const response = await axios.get(
                `${this.baseUrl}/v1/channels`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            return response.data;
        } catch (error: any) {
            logger.error('[NotificaMeService] Erro ao listar canais:', error);
            throw error;
        }
    }

    /**
     * Remove/desativa um canal
     */
    async deleteChannel(channel_id: string): Promise<void> {
        try {
            logger.info(`[NotificaMeService] Deletando canal ${channel_id}`);

            await axios.delete(
                `${this.baseUrl}/v1/channels/${channel_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            logger.info('[NotificaMeService] Canal deletado com sucesso');
        } catch (error: any) {
            logger.error('[NotificaMeService] Erro ao deletar canal:', error);
            throw error;
        }
    }

    /**
     * Testa conectividade com a API Notifica.me
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/health`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`
                    },
                    timeout: 5000
                }
            );

            return response.status === 200;
        } catch (error) {
            logger.error('[NotificaMeService] Erro ao testar conexão:', error);
            return false;
        }
    }
}

export default new NotificaMeService();
