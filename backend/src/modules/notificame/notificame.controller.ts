import { Request, Response } from 'express';
import { NotificaMeService } from '../../services/NotificaMeService';
import { getAutomationDbPool } from '../automation/database';

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

      // Processar webhook usando o service
      // Nota: Como é webhook público, não temos tenantId aqui
      // Você pode identificar o tenant pelo instanceId ou outro campo do webhook

      // TODO: Implementar lógica de processamento do webhook
      // - Salvar mensagem no banco
      // - Atualizar status de envio
      // - Disparar eventos para automação
      // - Integrar com n8n se configurado

      res.status(200).json({ success: true, message: 'Webhook processado' });
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
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
}

export default new NotificaMeController();
