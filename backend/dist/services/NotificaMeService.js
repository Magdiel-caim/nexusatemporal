"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificaMeService = void 0;
const axios_1 = __importDefault(require("axios"));
class NotificaMeService {
    client;
    apiKey;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.client = axios_1.default.create({
            baseURL: config.baseURL || 'https://app.notificame.com.br/api',
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.apiKey,
            },
            timeout: 30000,
        });
        // Interceptor para log de erros
        this.client.interceptors.response.use((response) => response, (error) => {
            console.error('[NotificaMe] API Error:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                data: error.response?.data,
            });
            throw error;
        });
    }
    /**
     * Teste de conectividade com a API
     */
    async testConnection() {
        try {
            const response = await this.client.get('/me');
            return {
                success: true,
                message: 'Conexão com Notifica.me estabelecida com sucesso',
                data: response.data,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erro ao conectar com Notifica.me',
                data: error.response?.data,
            };
        }
    }
    /**
     * Envia mensagem de texto
     */
    async sendMessage(payload) {
        try {
            const response = await this.client.post('/messages/send', {
                phone: payload.phone,
                message: payload.message,
                instance_id: payload.instanceId,
            });
            console.log('[NotificaMe] Mensagem enviada:', {
                phone: payload.phone,
                messageId: response.data?.id,
            });
            return response.data;
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao enviar mensagem:', error);
            throw new Error(error.response?.data?.message || 'Erro ao enviar mensagem via Notifica.me');
        }
    }
    /**
     * Envia mídia (imagem, vídeo, áudio, documento)
     */
    async sendMedia(payload) {
        try {
            const response = await this.client.post('/messages/send-media', {
                phone: payload.phone,
                media_url: payload.mediaUrl,
                media_type: payload.mediaType,
                caption: payload.caption,
                filename: payload.filename,
                instance_id: payload.instanceId,
            });
            console.log('[NotificaMe] Mídia enviada:', {
                phone: payload.phone,
                mediaType: payload.mediaType,
                messageId: response.data?.id,
            });
            return response.data;
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao enviar mídia:', error);
            throw new Error(error.response?.data?.message || 'Erro ao enviar mídia via Notifica.me');
        }
    }
    /**
     * Envia template de mensagem (HSM)
     */
    async sendTemplate(payload) {
        try {
            const response = await this.client.post('/messages/send-template', {
                phone: payload.phone,
                template_name: payload.templateName,
                template_params: payload.templateParams,
                instance_id: payload.instanceId,
            });
            console.log('[NotificaMe] Template enviado:', {
                phone: payload.phone,
                template: payload.templateName,
                messageId: response.data?.id,
            });
            return response.data;
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao enviar template:', error);
            throw new Error(error.response?.data?.message || 'Erro ao enviar template via Notifica.me');
        }
    }
    /**
     * Envia mensagem com botões
     */
    async sendButtons(payload) {
        try {
            const response = await this.client.post('/messages/send-buttons', {
                phone: payload.phone,
                message: payload.message,
                buttons: payload.buttons,
                footer: payload.footerText,
                instance_id: payload.instanceId,
            });
            console.log('[NotificaMe] Mensagem com botões enviada:', {
                phone: payload.phone,
                buttonsCount: payload.buttons.length,
                messageId: response.data?.id,
            });
            return response.data;
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao enviar botões:', error);
            throw new Error(error.response?.data?.message || 'Erro ao enviar botões via Notifica.me');
        }
    }
    /**
     * Envia mensagem com lista
     */
    async sendList(payload) {
        try {
            const response = await this.client.post('/messages/send-list', {
                phone: payload.phone,
                message: payload.message,
                button_text: payload.buttonText,
                sections: payload.sections,
                instance_id: payload.instanceId,
            });
            console.log('[NotificaMe] Lista enviada:', {
                phone: payload.phone,
                sectionsCount: payload.sections.length,
                messageId: response.data?.id,
            });
            return response.data;
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao enviar lista:', error);
            throw new Error(error.response?.data?.message || 'Erro ao enviar lista via Notifica.me');
        }
    }
    /**
     * Lista instâncias (WhatsApp/Instagram)
     */
    async getInstances() {
        try {
            const response = await this.client.get('/instances');
            return response.data;
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao listar instâncias:', error);
            throw new Error(error.response?.data?.message || 'Erro ao listar instâncias');
        }
    }
    /**
     * Obtém informações de uma instância específica
     */
    async getInstance(instanceId) {
        try {
            const response = await this.client.get(`/instances/${instanceId}`);
            return response.data;
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao obter instância:', error);
            throw new Error(error.response?.data?.message || 'Erro ao obter informações da instância');
        }
    }
    /**
     * Gera QR Code para conectar instância
     */
    async getQRCode(instanceId) {
        try {
            const response = await this.client.get(`/instances/${instanceId}/qrcode`);
            return response.data;
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao obter QR Code:', error);
            throw new Error(error.response?.data?.message || 'Erro ao gerar QR Code');
        }
    }
    /**
     * Desconecta instância
     */
    async disconnectInstance(instanceId) {
        try {
            await this.client.post(`/instances/${instanceId}/disconnect`);
            console.log('[NotificaMe] Instância desconectada:', instanceId);
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao desconectar instância:', error);
            throw new Error(error.response?.data?.message || 'Erro ao desconectar instância');
        }
    }
    /**
     * Processa webhook recebido
     */
    processWebhook(webhookData) {
        // Normaliza dados do webhook para formato padrão
        return {
            id: webhookData.id || webhookData.message_id,
            from: webhookData.from || webhookData.sender,
            to: webhookData.to || webhookData.recipient,
            timestamp: webhookData.timestamp || Date.now(),
            type: webhookData.type || 'text',
            text: webhookData.text || webhookData.message,
            mediaUrl: webhookData.media_url || webhookData.mediaUrl,
            caption: webhookData.caption,
            latitude: webhookData.latitude,
            longitude: webhookData.longitude,
            contactName: webhookData.contact_name || webhookData.contactName,
            contactPhone: webhookData.contact_phone || webhookData.contactPhone,
        };
    }
    /**
     * Marca mensagem como lida
     */
    async markAsRead(messageId, instanceId) {
        try {
            await this.client.post('/messages/mark-read', {
                message_id: messageId,
                instance_id: instanceId,
            });
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao marcar como lida:', error);
            throw new Error(error.response?.data?.message || 'Erro ao marcar mensagem como lida');
        }
    }
    /**
     * Obtém histórico de mensagens
     */
    async getMessageHistory(phone, limit = 50) {
        try {
            const response = await this.client.get('/messages/history', {
                params: { phone, limit },
            });
            return response.data.map((msg) => this.processWebhook(msg));
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao obter histórico:', error);
            throw new Error(error.response?.data?.message || 'Erro ao obter histórico de mensagens');
        }
    }
    /**
     * Cria uma nova instância para Instagram ou Messenger
     */
    async createInstance(platform, name) {
        try {
            const response = await this.client.post('/instances/create', {
                platform,
                name,
            });
            console.log('[NotificaMe] Instância criada:', {
                platform,
                instanceId: response.data?.instanceId,
            });
            return {
                instanceId: response.data?.instanceId || response.data?.id,
                authUrl: response.data?.authUrl || response.data?.authorization_url,
            };
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao criar instância:', error);
            throw new Error(error.response?.data?.message || 'Erro ao criar instância');
        }
    }
    /**
     * Obtém URL de autorização OAuth para Instagram/Messenger
     */
    async getAuthorizationUrl(instanceId, callbackUrl) {
        try {
            const response = await this.client.post(`/instances/${instanceId}/authorize`, {
                callback_url: callbackUrl,
                redirect_uri: callbackUrl,
            });
            const authUrl = response.data?.authUrl ||
                response.data?.authorization_url ||
                response.data?.url;
            console.log('[NotificaMe] URL de autorização gerada:', {
                instanceId,
                authUrl,
            });
            return authUrl;
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao obter URL de autorização:', error);
            throw new Error(error.response?.data?.message || 'Erro ao gerar URL de autorização');
        }
    }
    /**
     * Processa callback OAuth após autorização
     */
    async processOAuthCallback(instanceId, code, state) {
        try {
            const response = await this.client.post(`/instances/${instanceId}/callback`, {
                code,
                state,
            });
            console.log('[NotificaMe] Callback OAuth processado:', {
                instanceId,
                status: response.data?.status,
            });
            return response.data;
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao processar callback OAuth:', error);
            throw new Error(error.response?.data?.message || 'Erro ao processar autorização');
        }
    }
    /**
     * Sincroniza status da instância
     */
    async syncInstanceStatus(instanceId) {
        try {
            const response = await this.client.get(`/instances/${instanceId}/sync`);
            console.log('[NotificaMe] Status sincronizado:', {
                instanceId,
                status: response.data?.status,
            });
            return response.data;
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao sincronizar status:', error);
            // Se endpoint não existir, fallback para getInstance
            return this.getInstance(instanceId);
        }
    }
    /**
     * Lista instâncias filtradas por plataforma
     */
    async getInstancesByPlatform(platform) {
        try {
            const allInstances = await this.getInstances();
            return allInstances.filter(instance => instance.platform === platform);
        }
        catch (error) {
            console.error('[NotificaMe] Erro ao filtrar instâncias:', error);
            throw new Error(error.response?.data?.message || 'Erro ao filtrar instâncias');
        }
    }
}
exports.NotificaMeService = NotificaMeService;
exports.default = NotificaMeService;
//# sourceMappingURL=NotificaMeService.js.map