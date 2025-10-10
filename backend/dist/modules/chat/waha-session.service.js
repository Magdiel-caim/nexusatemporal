"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WAHASessionService = void 0;
const axios_1 = __importDefault(require("axios"));
const data_source_1 = require("@/database/data-source");
const conversation_entity_1 = require("./conversation.entity");
class WAHASessionService {
    wahaUrl;
    wahaToken;
    conversationRepository = data_source_1.AppDataSource.getRepository(conversation_entity_1.Conversation);
    constructor() {
        this.wahaUrl = process.env.WAHA_URL || 'https://apiwts.nexusatemporal.com.br';
        this.wahaToken = process.env.WAHA_API_KEY || 'bd0c416348b2f04d198ff8971b608a87';
    }
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Api-Key': this.wahaToken,
        };
    }
    // ===== SESSION MANAGEMENT =====
    /**
     * Cria uma nova sessão no WAHA
     */
    async createSession(sessionName, userId) {
        try {
            // Verificar se a sessão já existe
            let sessionExists = false;
            try {
                await this.getSessionStatus(sessionName);
                sessionExists = true;
                console.log(`Session ${sessionName} already exists, deleting it first...`);
                // Deletar sessão existente
                await this.deleteSession(sessionName);
                // Aguardar um pouco para garantir que foi deletada
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                // Sessão não existe, pode criar
                if (error.response?.status !== 404) {
                    console.log('Session does not exist, creating new one...');
                }
            }
            const webhookUrl = `${process.env.BACKEND_URL}/api/chat/webhook/waha/status`;
            const response = await axios_1.default.post(`${this.wahaUrl}/api/sessions`, {
                name: sessionName,
                config: {
                    engine: 'GOWS', // Usando engine GO (mais rápida e estável)
                    webhooks: [
                        {
                            url: webhookUrl,
                            events: ['session.status', 'message'],
                        },
                    ],
                },
            }, { headers: this.getHeaders() });
            // Tentar criar ou atualizar conversation no nosso banco (opcional - não falha se tabela não existir)
            try {
                const existingConversation = await this.conversationRepository.findOne({
                    where: { whatsappInstanceId: sessionName },
                });
                if (existingConversation) {
                    // Atualizar conversation existente
                    await this.conversationRepository.update({ whatsappInstanceId: sessionName }, {
                        status: 'waiting',
                        assignedUserId: userId,
                        metadata: {
                            wahaSessionName: sessionName,
                            updatedBy: userId,
                            lastUpdate: new Date(),
                        },
                    });
                }
                else {
                    // Criar nova conversation
                    await this.conversationRepository.save({
                        contactName: `WhatsApp - ${sessionName}`,
                        phoneNumber: sessionName,
                        whatsappInstanceId: sessionName,
                        assignedUserId: userId,
                        status: 'waiting',
                        metadata: {
                            wahaSessionName: sessionName,
                            createdBy: userId,
                            engine: 'GOWS',
                        },
                    });
                }
            }
            catch (convError) {
                console.log('Could not create/update conversation (table may not exist):', convError.message);
            }
            return response.data;
        }
        catch (error) {
            console.error('Error creating WAHA session:', error.response?.data || error.message);
            throw new Error(`Failed to create session: ${error.response?.data?.message || error.message}`);
        }
    }
    /**
     * Inicia uma sessão (gera QR Code)
     */
    async startSession(sessionName) {
        try {
            const response = await axios_1.default.post(`${this.wahaUrl}/api/sessions/${sessionName}/start`, {}, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            console.error('Error starting WAHA session:', error.response?.data || error.message);
            throw new Error(`Failed to start session: ${error.response?.data?.message || error.message}`);
        }
    }
    /**
     * Obtém o QR Code da sessão
     */
    async getQRCode(sessionName) {
        try {
            const response = await axios_1.default.get(`${this.wahaUrl}/api/sessions/${sessionName}/auth/qr`, {
                headers: this.getHeaders(),
                responseType: 'json',
            });
            return response.data;
        }
        catch (error) {
            console.error('Error getting QR code:', error.response?.data || error.message);
            throw new Error(`Failed to get QR code: ${error.response?.data?.message || error.message}`);
        }
    }
    /**
     * Obtém status da sessão
     */
    async getSessionStatus(sessionName) {
        try {
            const response = await axios_1.default.get(`${this.wahaUrl}/api/sessions/${sessionName}`, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            console.error('Error getting session status:', error.response?.data || error.message);
            throw new Error(`Failed to get session status: ${error.response?.data?.message || error.message}`);
        }
    }
    /**
     * Lista todas as sessões
     */
    async listSessions() {
        try {
            const response = await axios_1.default.get(`${this.wahaUrl}/api/sessions`, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            console.error('Error listing sessions:', error.response?.data || error.message);
            throw new Error(`Failed to list sessions: ${error.response?.data?.message || error.message}`);
        }
    }
    /**
     * Para uma sessão
     */
    async stopSession(sessionName) {
        try {
            await axios_1.default.post(`${this.wahaUrl}/api/sessions/${sessionName}/stop`, {}, { headers: this.getHeaders() });
        }
        catch (error) {
            console.error('Error stopping session:', error.response?.data || error.message);
            throw new Error(`Failed to stop session: ${error.response?.data?.message || error.message}`);
        }
    }
    /**
     * Faz logout de uma sessão
     */
    async logoutSession(sessionName) {
        try {
            await axios_1.default.post(`${this.wahaUrl}/api/sessions/${sessionName}/logout`, {}, { headers: this.getHeaders() });
            // Tentar atualizar conversation no banco (opcional - não falha se tabela não existir)
            try {
                await this.conversationRepository.update({ whatsappInstanceId: sessionName }, { status: 'closed' });
            }
            catch (convError) {
                console.log('Could not update conversation status (table may not exist):', convError.message);
            }
        }
        catch (error) {
            console.error('Error logging out session:', error.response?.data || error.message);
            throw new Error(`Failed to logout session: ${error.response?.data?.message || error.message}`);
        }
    }
    /**
     * Deleta uma sessão
     */
    async deleteSession(sessionName) {
        try {
            await axios_1.default.delete(`${this.wahaUrl}/api/sessions/${sessionName}`, { headers: this.getHeaders() });
            // Tentar atualizar conversation no banco (opcional - não falha se tabela não existir)
            try {
                await this.conversationRepository.update({ whatsappInstanceId: sessionName }, { status: 'archived' });
            }
            catch (convError) {
                console.log('Could not update conversation status (table may not exist):', convError.message);
            }
        }
        catch (error) {
            console.error('Error deleting session:', error.response?.data || error.message);
            throw new Error(`Failed to delete session: ${error.response?.data?.message || error.message}`);
        }
    }
    /**
     * Trata mudanças de status da sessão (chamado pelo webhook)
     */
    async handleStatusChange(sessionName, newStatus) {
        console.log(`Session ${sessionName} status changed to: ${newStatus}`);
        // Tentar atualizar conversation no banco (opcional - não falha se tabela não existir)
        try {
            let conversationStatus = 'waiting';
            if (newStatus === 'WORKING') {
                conversationStatus = 'active';
            }
            else if (newStatus === 'FAILED' || newStatus === 'STOPPED') {
                conversationStatus = 'closed';
            }
            await this.conversationRepository.update({ whatsappInstanceId: sessionName }, {
                status: conversationStatus,
                metadata: {
                    wahaStatus: newStatus,
                    lastStatusUpdate: new Date(),
                },
            });
        }
        catch (convError) {
            console.log('Could not update conversation status (table may not exist):', convError.message);
        }
    }
}
exports.WAHASessionService = WAHASessionService;
//# sourceMappingURL=waha-session.service.js.map