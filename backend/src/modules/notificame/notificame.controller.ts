import { Request, Response } from 'express';
import { NotificaMeService } from '../../services/NotificaMeService';
import { getAutomationDbPool } from '../automation/database';
import NotificaMeStatsService from './notificame-stats.service';

/**
 * Controller para Notifica.me (WhatsApp e Instagram)
 */
export class NotificaMeController {
  /**
   * Obter instância do serviço com as credenciais do tenant
   */
  private async getServiceInstance(tenantId: string): Promise<NotificaMeService> {
    const db = getAutomationDbPool();

    const query = `
      SELECT * FROM integrations
      WHERE tenant_id = $1
      AND integration_type = 'notificame'
      AND status = 'active'
      LIMIT 1
    `;

    const result = await db.query(query, [tenantId]);

    if (!result.rows[0]) {
      throw new Error('Integração Notifica.me não configurada. Configure em Configurações > Integrações');
    }

    const integration = result.rows[0];
    const credentials = typeof integration.credentials === 'string'
      ? JSON.parse(integration.credentials)
      : integration.credentials;

    if (!credentials?.notificame_api_key) {
      throw new Error('API Key do Notifica.me não configurada');
    }

    return new NotificaMeService({
      apiKey: credentials.notificame_api_key,
      baseURL: credentials.notificame_api_url,
    });
  }

  /**
   * POST /api/notificame/test-connection
   * Testa conectividade com API
   */
  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const service = await this.getServiceInstance(tenantId);
      const result = await service.testConnection();

      res.json(result);
    } catch (error: any) {
      console.error('Error testing Notifica.me connection:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/notificame/send-message
   * Envia mensagem de texto
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const { phone, message, instanceId } = req.body;

      if (!phone || !message) {
        res.status(400).json({ error: 'Phone e message são obrigatórios' });
        return;
      }

      const service = await this.getServiceInstance(tenantId);
      const result = await service.sendMessage({ phone, message, instanceId });

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/notificame/send-media
   * Envia mídia (imagem, vídeo, áudio, documento)
   */
  async sendMedia(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const { phone, mediaUrl, mediaType, caption, filename, instanceId } = req.body;

      if (!phone || !mediaUrl || !mediaType) {
        res.status(400).json({ error: 'Phone, mediaUrl e mediaType são obrigatórios' });
        return;
      }

      if (!['image', 'video', 'audio', 'document'].includes(mediaType)) {
        res.status(400).json({ error: 'mediaType deve ser: image, video, audio ou document' });
        return;
      }

      const service = await this.getServiceInstance(tenantId);
      const result = await service.sendMedia({
        phone,
        mediaUrl,
        mediaType,
        caption,
        filename,
        instanceId,
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error sending media:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/notificame/send-template
   * Envia template HSM (mensagens aprovadas pelo WhatsApp)
   */
  async sendTemplate(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const { phone, templateName, templateParams, instanceId } = req.body;

      if (!phone || !templateName) {
        res.status(400).json({ error: 'Phone e templateName são obrigatórios' });
        return;
      }

      const service = await this.getServiceInstance(tenantId);
      const result = await service.sendTemplate({
        phone,
        templateName,
        templateParams: templateParams || {},
        instanceId,
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error sending template:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/notificame/send-buttons
   * Envia mensagem com botões interativos
   */
  async sendButtons(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const { phone, message, buttons, footerText, instanceId } = req.body;

      if (!phone || !message || !buttons || !Array.isArray(buttons)) {
        res.status(400).json({ error: 'Phone, message e buttons (array) são obrigatórios' });
        return;
      }

      if (buttons.length === 0 || buttons.length > 3) {
        res.status(400).json({ error: 'Buttons deve ter entre 1 e 3 botões' });
        return;
      }

      const service = await this.getServiceInstance(tenantId);
      const result = await service.sendButtons({
        phone,
        message,
        buttons,
        footerText,
        instanceId,
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error sending buttons:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/notificame/send-list
   * Envia mensagem com lista de opções
   */
  async sendList(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const { phone, message, buttonText, sections, instanceId } = req.body;

      if (!phone || !message || !buttonText || !sections || !Array.isArray(sections)) {
        res.status(400).json({ error: 'Phone, message, buttonText e sections (array) são obrigatórios' });
        return;
      }

      const service = await this.getServiceInstance(tenantId);
      const result = await service.sendList({
        phone,
        message,
        buttonText,
        sections,
        instanceId,
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error sending list:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/notificame/instances
   * Lista todas as instâncias (WhatsApp/Instagram)
   */
  async getInstances(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const service = await this.getServiceInstance(tenantId);
      const instances = await service.getInstances();

      res.json({ success: true, data: instances });
    } catch (error: any) {
      console.error('Error getting instances:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/notificame/instances/:instanceId
   * Obtém informações de uma instância específica
   */
  async getInstance(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const { instanceId } = req.params;
      if (!instanceId) {
        res.status(400).json({ error: 'instanceId é obrigatório' });
        return;
      }

      const service = await this.getServiceInstance(tenantId);
      const instance = await service.getInstance(instanceId);

      res.json({ success: true, data: instance });
    } catch (error: any) {
      console.error('Error getting instance:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/notificame/instances/:instanceId/qrcode
   * Gera QR Code para conectar instância
   */
  async getQRCode(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const { instanceId } = req.params;
      if (!instanceId) {
        res.status(400).json({ error: 'instanceId é obrigatório' });
        return;
      }

      const service = await this.getServiceInstance(tenantId);
      const result = await service.getQRCode(instanceId);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error getting QR code:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/notificame/instances/:instanceId/disconnect
   * Desconecta instância
   */
  async disconnectInstance(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const { instanceId } = req.params;
      if (!instanceId) {
        res.status(400).json({ error: 'instanceId é obrigatório' });
        return;
      }

      const service = await this.getServiceInstance(tenantId);
      await service.disconnectInstance(instanceId);

      res.json({ success: true, message: 'Instância desconectada com sucesso' });
    } catch (error: any) {
      console.error('Error disconnecting instance:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/notificame/webhook
   * Recebe webhooks do Notifica.me (mensagens recebidas, status, etc)
   */
  async webhook(req: Request, res: Response): Promise<void> {
    try {
      const webhookData = req.body;

      console.log('[NotificaMe] Webhook recebido:', JSON.stringify(webhookData, null, 2));

      // Processar webhook
      await this.processWebhookData(webhookData);

      res.status(200).json({ success: true, message: 'Webhook processado' });
    } catch (error: any) {
      console.error('[NotificaMe] Error processing webhook:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Processa dados do webhook recebido
   */
  private async processWebhookData(webhookData: any): Promise<void> {
    const { event, data } = webhookData;

    console.log(`[NotificaMe] Processing webhook event: ${event}`);

    switch (event) {
      case 'message.received':
        await this.handleMessageReceived(data);
        break;

      case 'message.sent':
        await this.handleMessageSent(data);
        break;

      case 'message.delivered':
        await this.handleMessageDelivered(data);
        break;

      case 'message.read':
        await this.handleMessageRead(data);
        break;

      case 'message.failed':
        await this.handleMessageFailed(data);
        break;

      case 'instance.connected':
        await this.handleInstanceConnected(data);
        break;

      case 'instance.disconnected':
        await this.handleInstanceDisconnected(data);
        break;

      default:
        console.log(`[NotificaMe] Evento desconhecido: ${event}`);
    }
  }

  /**
   * Processa mensagem recebida
   */
  private async handleMessageReceived(data: any): Promise<void> {
    const {
      instanceId,
      messageId,
      from,
      to,
      message,
      mediaUrl,
      mediaType,
      timestamp
    } = data;

    console.log(`[NotificaMe] Nova mensagem recebida de ${from}`);

    // 1. Identificar o tenant e channel pelo instanceId
    const db = getAutomationDbPool();

    const channelQuery = `
      SELECT nc.*, nc.tenant_id
      FROM notificame_channels nc
      WHERE nc.channel_id = $1 AND nc.is_active = true
      LIMIT 1
    `;

    const channelResult = await db.query(channelQuery, [instanceId]);

    if (!channelResult.rows[0]) {
      console.error(`[NotificaMe] Channel não encontrado para instanceId: ${instanceId}`);
      return;
    }

    const channel = channelResult.rows[0];
    const tenantId = channel.tenant_id;

    // 2. Buscar ou criar lead pelo telefone
    const leadQuery = `
      SELECT id, name, phone, "tenantId", "stageId"
      FROM leads
      WHERE phone = $1 AND "tenantId" = $2
      LIMIT 1
    `;

    let lead = await db.query(leadQuery, [from, tenantId]);

    if (!lead.rows[0]) {
      // Criar novo lead
      console.log(`[NotificaMe] Criando novo lead para ${from}`);

      // Buscar primeiro estágio do tenant
      const stageQuery = `
        SELECT id FROM stages
        WHERE "tenantId" = $1 AND "order" = 0
        LIMIT 1
      `;

      const stageResult = await db.query(stageQuery, [tenantId]);
      const stageId = stageResult.rows[0]?.id;

      if (!stageId) {
        console.error(`[NotificaMe] Nenhum estágio encontrado para tenant ${tenantId}`);
        return;
      }

      const insertLeadQuery = `
        INSERT INTO leads (
          name,
          phone,
          "tenantId",
          "stageId",
          source,
          status,
          "createdAt",
          "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, NOW(), NOW()
        )
        RETURNING id, name, phone, "tenantId", "stageId"
      `;

      lead = await db.query(insertLeadQuery, [
        `Lead ${from}`,
        from,
        tenantId,
        stageId,
        'instagram', // ou 'messenger' dependendo do tipo
        'new'
      ]);

      console.log(`[NotificaMe] Lead criado: ${lead.rows[0].id}`);
    }

    const leadId = lead.rows[0].id;

    // 3. Salvar mensagem no banco
    const insertMessageQuery = `
      INSERT INTO notificame_messages (
        tenant_id,
        channel_id,
        message_id,
        direction,
        from_user,
        to_user,
        content,
        media_url,
        status,
        sent_at,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
      )
      RETURNING id
    `;

    const messageResult = await db.query(insertMessageQuery, [
      tenantId,
      channel.id,
      messageId,
      'inbound',
      from,
      to,
      message,
      mediaUrl,
      'received',
      timestamp ? new Date(timestamp) : new Date()
    ]);

    console.log(`[NotificaMe] Mensagem salva: ${messageResult.rows[0].id}`);

    // 4. Disparar evento para automação (se configurado)
    try {
      const automationQuery = `
        SELECT * FROM triggers
        WHERE tenant_id = $1
        AND event = 'chat_message.received'
        AND is_active = true
      `;

      const triggers = await db.query(automationQuery, [tenantId]);

      if (triggers.rows.length > 0) {
        console.log(`[NotificaMe] ${triggers.rows.length} trigger(s) encontrado(s) para chat_message.received`);

        // Aqui você pode integrar com seu sistema de automação
        // Por exemplo, chamar n8n webhook ou processar triggers internamente
      }
    } catch (automationError) {
      console.error('[NotificaMe] Erro ao processar automação:', automationError);
      // Não falhar se automação der erro
    }

    // 5. Notificar atendentes via WebSocket (se disponível)
    try {
      // Assumindo que você tem io configurado no app
      // const io = (req as any).app.get('io');
      // if (io) {
      //   io.to(`tenant:${tenantId}`).emit('new_instagram_message', {
      //     leadId,
      //     message,
      //     from,
      //     timestamp
      //   });
      // }
      console.log(`[NotificaMe] WebSocket notification would be sent to tenant:${tenantId}`);
    } catch (wsError) {
      console.error('[NotificaMe] Erro ao enviar notificação WebSocket:', wsError);
    }
  }

  /**
   * Processa confirmação de mensagem enviada
   */
  private async handleMessageSent(data: any): Promise<void> {
    const { messageId } = data;

    console.log(`[NotificaMe] Mensagem enviada: ${messageId}`);

    const db = getAutomationDbPool();

    await db.query(`
      UPDATE notificame_messages
      SET status = 'sent', sent_at = NOW()
      WHERE message_id = $1
    `, [messageId]);
  }

  /**
   * Processa confirmação de entrega
   */
  private async handleMessageDelivered(data: any): Promise<void> {
    const { messageId } = data;

    console.log(`[NotificaMe] Mensagem entregue: ${messageId}`);

    const db = getAutomationDbPool();

    await db.query(`
      UPDATE notificame_messages
      SET status = 'delivered', delivered_at = NOW()
      WHERE message_id = $1
    `, [messageId]);
  }

  /**
   * Processa confirmação de leitura
   */
  private async handleMessageRead(data: any): Promise<void> {
    const { messageId } = data;

    console.log(`[NotificaMe] Mensagem lida: ${messageId}`);

    const db = getAutomationDbPool();

    await db.query(`
      UPDATE notificame_messages
      SET status = 'read', read_at = NOW()
      WHERE message_id = $1
    `, [messageId]);
  }

  /**
   * Processa falha no envio
   */
  private async handleMessageFailed(data: any): Promise<void> {
    const { messageId, error } = data;

    console.log(`[NotificaMe] Mensagem falhou: ${messageId}`, error);

    const db = getAutomationDbPool();

    await db.query(`
      UPDATE notificame_messages
      SET status = 'failed'
      WHERE message_id = $1
    `, [messageId]);
  }

  /**
   * Processa conexão de instância
   */
  private async handleInstanceConnected(data: any): Promise<void> {
    const { instanceId } = data;

    console.log(`[NotificaMe] Instância conectada: ${instanceId}`);

    const db = getAutomationDbPool();

    await db.query(`
      UPDATE notificame_channels
      SET is_active = true, connected_at = NOW(), updated_at = NOW()
      WHERE channel_id = $1
    `, [instanceId]);
  }

  /**
   * Processa desconexão de instância
   */
  private async handleInstanceDisconnected(data: any): Promise<void> {
    const { instanceId } = data;

    console.log(`[NotificaMe] Instância desconectada: ${instanceId}`);

    const db = getAutomationDbPool();

    await db.query(`
      UPDATE notificame_channels
      SET is_active = false, updated_at = NOW()
      WHERE channel_id = $1
    `, [instanceId]);
  }

  /**
   * GET /api/notificame/messages/history
   * Obtém histórico de mensagens de um contato
   */
  async getMessageHistory(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const { phone, limit } = req.query;

      if (!phone) {
        res.status(400).json({ error: 'Phone é obrigatório' });
        return;
      }

      const service = await this.getServiceInstance(tenantId);
      const messages = await service.getMessageHistory(
        phone as string,
        limit ? parseInt(limit as string) : 50
      );

      res.json({ success: true, data: messages });
    } catch (error: any) {
      console.error('Error getting message history:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/notificame/messages/:messageId/mark-read
   * Marca mensagem como lida
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const { messageId } = req.params;
      const { instanceId } = req.body;

      if (!messageId) {
        res.status(400).json({ error: 'messageId é obrigatório' });
        return;
      }

      const service = await this.getServiceInstance(tenantId);
      await service.markAsRead(messageId, instanceId);

      res.json({ success: true, message: 'Mensagem marcada como lida' });
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/notificame/stats
   * Obtém estatísticas completas do Notifica.me
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const stats = await NotificaMeStatsService.getStats(tenantId);

      res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Error getting stats:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/notificame/stats/dashboard
   * Obtém estatísticas simplificadas para o dashboard
   */
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const stats = await NotificaMeStatsService.getDashboardStats(tenantId);

      res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/notificame/stats/history
   * Obtém histórico de mensagens para gráficos
   */
  async getMessageHistoryStats(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant não identificado' });
        return;
      }

      const { days } = req.query;
      const history = await NotificaMeStatsService.getMessageHistory(
        tenantId,
        days ? parseInt(days as string) : 30
      );

      res.json({ success: true, data: history });
    } catch (error: any) {
      console.error('Error getting message history stats:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new NotificaMeController();
