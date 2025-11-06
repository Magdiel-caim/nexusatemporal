"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WAHAService = void 0;
const axios_1 = __importDefault(require("axios"));
class WAHAService {
    client;
    sessionName;
    constructor(config) {
        this.sessionName = config.sessionName;
        this.client = axios_1.default.create({
            baseURL: config.baseUrl,
            headers: {
                'X-Api-Key': config.apiKey,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
    }
    /**
     * ===== SESSION MANAGEMENT =====
     */
    async getSessionInfo() {
        const { data } = await this.client.get(`/api/sessions/${this.sessionName}`);
        return data;
    }
    async getSessionStatus() {
        const session = await this.getSessionInfo();
        return {
            name: session.name,
            status: session.status, // STOPPED, STARTING, SCAN_QR_CODE, WORKING, FAILED
            me: session.me,
        };
    }
    /**
     * ===== CHATS (CONVERSAS) =====
     */
    async listChats(params) {
        const queryParams = new URLSearchParams();
        if (params?.limit)
            queryParams.append('limit', params.limit.toString());
        if (params?.offset)
            queryParams.append('offset', params.offset.toString());
        if (params?.sortBy)
            queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder)
            queryParams.append('sortOrder', params.sortOrder);
        const { data } = await this.client.get(`/api/${this.sessionName}/chats?${queryParams.toString()}`);
        return data;
    }
    async getChatOverview(params) {
        if (params?.ids && params.ids.length > 0) {
            // POST para grandes volumes ou filtros
            const { data } = await this.client.post(`/api/${this.sessionName}/chats/overview`, {
                pagination: {
                    limit: params.limit || 20,
                    offset: params.offset || 0,
                },
                filter: {
                    ids: params.ids,
                },
            });
            return data;
        }
        // GET para queries simples
        const queryParams = new URLSearchParams();
        if (params?.limit)
            queryParams.append('limit', params.limit.toString());
        if (params?.offset)
            queryParams.append('offset', params.offset.toString());
        const { data } = await this.client.get(`/api/${this.sessionName}/chats/overview?${queryParams.toString()}`);
        return data;
    }
    async archiveChat(chatId) {
        const { data } = await this.client.post(`/api/${this.sessionName}/chats/${this.escapeId(chatId)}/archive`);
        return data;
    }
    async unarchiveChat(chatId) {
        const { data } = await this.client.post(`/api/${this.sessionName}/chats/${this.escapeId(chatId)}/unarchive`);
        return data;
    }
    async markChatAsUnread(chatId) {
        const { data } = await this.client.post(`/api/${this.sessionName}/chats/${this.escapeId(chatId)}/unread`);
        return data;
    }
    async deleteChat(chatId) {
        const { data } = await this.client.delete(`/api/${this.sessionName}/chats/${this.escapeId(chatId)}`);
        return data;
    }
    /**
     * ===== MESSAGES =====
     */
    async listMessages(chatId, params) {
        const queryParams = new URLSearchParams();
        if (params?.limit)
            queryParams.append('limit', params.limit.toString());
        if (params?.offset)
            queryParams.append('offset', params.offset.toString());
        if (params?.downloadMedia !== undefined)
            queryParams.append('downloadMedia', params.downloadMedia.toString());
        if (params?.filter) {
            if (params.filter['timestamp.gte'])
                queryParams.append('filter.timestamp.gte', params.filter['timestamp.gte'].toString());
            if (params.filter['timestamp.lte'])
                queryParams.append('filter.timestamp.lte', params.filter['timestamp.lte'].toString());
            if (params.filter.fromMe !== undefined)
                queryParams.append('filter.fromMe', params.filter.fromMe.toString());
            if (params.filter.ack)
                queryParams.append('filter.ack', params.filter.ack);
        }
        const { data } = await this.client.get(`/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages?${queryParams.toString()}`);
        return data;
    }
    async getMessage(chatId, messageId, downloadMedia = false) {
        const { data } = await this.client.get(`/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages/${messageId}?downloadMedia=${downloadMedia}`);
        return data;
    }
    async markMessagesAsRead(chatId, options) {
        const { data } = await this.client.post(`/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages/read`, options || {});
        return data;
    }
    async editMessage(chatId, messageId, newText) {
        const { data } = await this.client.put(`/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages/${messageId}`, { text: newText });
        return data;
    }
    async deleteMessage(chatId, messageId) {
        const { data } = await this.client.delete(`/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages/${messageId}`);
        return data;
    }
    async pinMessage(chatId, messageId, durationSeconds) {
        const { data } = await this.client.post(`/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages/${messageId}/pin`, { duration: durationSeconds });
        return data;
    }
    async unpinMessage(chatId, messageId) {
        const { data } = await this.client.post(`/api/${this.sessionName}/chats/${this.escapeId(chatId)}/messages/${messageId}/unpin`);
        return data;
    }
    /**
     * ===== SEND MESSAGES =====
     */
    async sendText(request) {
        const { data } = await this.client.post('/api/sendText', {
            session: this.sessionName,
            ...request,
        });
        return data;
    }
    async sendImage(request) {
        const { data } = await this.client.post('/api/sendImage', {
            session: this.sessionName,
            ...request,
        });
        return data;
    }
    async sendVideo(request) {
        const { data } = await this.client.post('/api/sendVideo', {
            session: this.sessionName,
            ...request,
        });
        return data;
    }
    async sendVoice(request) {
        const { data } = await this.client.post('/api/sendVoice', {
            session: this.sessionName,
            ...request,
        });
        return data;
    }
    async sendFile(request) {
        const { data } = await this.client.post('/api/sendFile', {
            session: this.sessionName,
            ...request,
        });
        return data;
    }
    async sendLocation(chatId, latitude, longitude, title) {
        const { data } = await this.client.post('/api/sendLocation', {
            session: this.sessionName,
            chatId,
            latitude,
            longitude,
            title,
        });
        return data;
    }
    async sendSeen(chatId, messageId) {
        const { data } = await this.client.post('/api/sendSeen', {
            session: this.sessionName,
            chatId,
            messageId,
        });
        return data;
    }
    /**
     * ===== UTILS =====
     */
    /**
     * Escape @ symbol in chatId for URL
     * Example: 123123@c.us -> 123123%40c.us
     */
    escapeId(id) {
        return id.replace(/@/g, '%40');
    }
    /**
     * Formata número de telefone para chatId WhatsApp
     * Example: 5541992431011 -> 5541992431011@c.us
     */
    formatPhoneToChatId(phone) {
        // Remove caracteres não numéricos
        const cleanPhone = phone.replace(/\D/g, '');
        return `${cleanPhone}@c.us`;
    }
    /**
     * Extrai número de telefone do chatId
     * Example: 5541992431011@c.us -> 5541992431011
     */
    extractPhoneFromChatId(chatId) {
        return chatId.replace(/@.*/, '');
    }
    /**
     * Verifica se é um chat de grupo
     */
    isGroupChat(chatId) {
        return chatId.endsWith('@g.us');
    }
    /**
     * Mapeia ACK number para status string
     */
    mapAckToStatus(ack) {
        switch (ack) {
            case -1:
                return 'failed'; // ERROR
            case 0:
                return 'pending'; // PENDING
            case 1:
            case 2:
                return 'sent'; // SERVER or DEVICE
            case 3:
                return 'delivered'; // READ (marca dupla)
            case 4:
                return 'read'; // PLAYED (azul)
            default:
                return 'pending';
        }
    }
}
exports.WAHAService = WAHAService;
exports.default = WAHAService;
//# sourceMappingURL=waha.service.js.map