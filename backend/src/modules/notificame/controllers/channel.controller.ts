import { Request, Response } from 'express';
import { AppDataSource } from '../../../database/data-source';
import { SocialConnection } from '../entities';
import { notificameService } from '../services';
import logger from '../utils/logger';

class ChannelController {
    private connectionRepository = AppDataSource.getRepository(SocialConnection);

    /**
     * GET /api/notificame/channels
     * Lista todas as conexões de um cliente
     */
    async list(req: Request, res: Response): Promise<Response> {
        try {
            const { cliente_id } = req.query;

            if (!cliente_id) {
                return res.status(400).json({ error: 'cliente_id é obrigatório' });
            }

            const connections = await this.connectionRepository.find({
                where: { cliente_id: cliente_id as string },
                order: { created_at: 'DESC' }
            });

            // Remover tokens criptografados da resposta
            const safeConnections = connections.map(conn => {
                const { access_token_encrypted, refresh_token_encrypted, ...rest } = conn;
                return rest;
            });

            return res.json({ connections: safeConnections });
        } catch (error: any) {
            logger.error('[ChannelController] Erro ao listar conexões:', error);
            return res.status(500).json({ error: 'Erro ao listar conexões' });
        }
    }

    /**
     * DELETE /api/notificame/channels/:id
     * Desconecta/remove uma conexão
     */
    async disconnect(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const connection = await this.connectionRepository.findOne({
                where: { id }
            });

            if (!connection) {
                return res.status(404).json({ error: 'Conexão não encontrada' });
            }

            // Desativar no Notifica.me
            if (connection.notificame_channel_id) {
                try {
                    await notificameService.deleteChannel(connection.notificame_channel_id);
                } catch (error) {
                    logger.warn('[ChannelController] Erro ao deletar canal no Notifica.me:', error);
                }
            }

            // Marcar como desconectado
            await this.connectionRepository.update(
                { id },
                {
                    connection_status: 'disconnected',
                    notificame_channel_status: 'inactive',
                    updated_at: new Date()
                }
            );

            logger.info(`[ChannelController] Conexão ${id} desconectada`);

            return res.json({ message: 'Conexão desconectada com sucesso' });
        } catch (error: any) {
            logger.error('[ChannelController] Erro ao desconectar:', error);
            return res.status(500).json({ error: 'Erro ao desconectar' });
        }
    }

    /**
     * POST /api/notificame/channels/:id/test
     * Testa uma conexão enviando mensagem de teste
     */
    async test(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { to, message } = req.body;

            if (!to || !message) {
                return res.status(400).json({ error: 'to e message são obrigatórios' });
            }

            await notificameService.sendMessage({
                connection_id: id,
                to,
                message
            });

            logger.info(`[ChannelController] Mensagem de teste enviada via ${id}`);

            return res.json({ message: 'Mensagem de teste enviada com sucesso' });
        } catch (error: any) {
            logger.error('[ChannelController] Erro ao testar conexão:', error);
            return res.status(500).json({ error: 'Erro ao enviar mensagem de teste' });
        }
    }
}

export default new ChannelController();
