"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WahaService = void 0;
const typeorm_1 = require("typeorm");
const axios_1 = __importDefault(require("axios"));
const entities_1 = require("../entities");
class WahaService {
    repository = (0, typeorm_1.getRepository)(entities_1.WahaSession);
    /**
     * Create WAHA session
     */
    async createSession(tenantId, data, userId) {
        // If isPrimary, unset other primary sessions
        if (data.isPrimary) {
            await this.repository.update({ tenantId, isPrimary: true }, { isPrimary: false });
        }
        const session = this.repository.create({
            tenantId,
            name: data.name,
            displayName: data.displayName || data.name,
            wahaServerUrl: data.wahaServerUrl,
            wahaApiKey: data.wahaApiKey,
            isPrimary: data.isPrimary || false,
            failoverEnabled: data.failoverEnabled || false,
            failoverPriority: data.failoverPriority || 0,
            maxMessagesPerMinute: data.maxMessagesPerMinute || 30,
            minDelaySeconds: data.minDelaySeconds || 1,
            maxDelaySeconds: data.maxDelaySeconds || 5,
            status: entities_1.WahaSessionStatus.STOPPED,
            createdBy: userId,
        });
        const savedSession = await this.repository.save(session);
        // Create session on WAHA server
        try {
            await this.createWahaSession(savedSession);
        }
        catch (error) {
            console.error('[WahaService] Error creating session on WAHA:', error);
            savedSession.status = entities_1.WahaSessionStatus.FAILED;
            savedSession.errorMessage = error.message;
            await this.repository.save(savedSession);
        }
        return savedSession;
    }
    /**
     * Get all sessions for tenant
     */
    async getSessions(tenantId, filters) {
        const query = { tenantId };
        if (filters?.isActive !== undefined) {
            query.isActive = filters.isActive;
        }
        return await this.repository.find({
            where: query,
            order: { failoverPriority: 'DESC', createdAt: 'ASC' },
        });
    }
    /**
     * Get session by ID
     */
    async getSession(sessionId, tenantId) {
        const result = await this.repository.findOne({
            where: { id: sessionId, tenantId },
        });
        return result || undefined;
    }
    /**
     * Get primary session
     */
    async getPrimarySession(tenantId) {
        const result = await this.repository.findOne({
            where: { tenantId, isPrimary: true, isActive: true, status: entities_1.WahaSessionStatus.WORKING },
        });
        return result || undefined;
    }
    /**
     * Get available session with failover
     */
    async getAvailableSession(tenantId) {
        // Try primary first
        let session = await this.getPrimarySession(tenantId);
        if (!session) {
            // Get failover session with highest priority
            const sessions = await this.repository.find({
                where: {
                    tenantId,
                    isActive: true,
                    failoverEnabled: true,
                    status: entities_1.WahaSessionStatus.WORKING,
                },
                order: { failoverPriority: 'DESC' },
                take: 1,
            });
            session = sessions[0];
        }
        return session;
    }
    /**
     * Start WAHA session
     */
    async startSession(sessionId, tenantId) {
        const session = await this.getSession(sessionId, tenantId);
        if (!session) {
            throw new Error('Session not found');
        }
        try {
            session.status = entities_1.WahaSessionStatus.STARTING;
            await this.repository.save(session);
            // Start session on WAHA
            const response = await axios_1.default.post(`${session.wahaServerUrl}/api/sessions/${session.name}/start`, {}, {
                headers: { 'X-Api-Key': session.wahaApiKey },
            });
            session.status = entities_1.WahaSessionStatus.SCAN_QR_CODE;
            await this.repository.save(session);
            // Get QR code
            const qrCode = await this.getQRCode(sessionId, tenantId);
            return { session, qrCode };
        }
        catch (error) {
            console.error('[WahaService] Error starting session:', error);
            session.status = entities_1.WahaSessionStatus.FAILED;
            session.errorMessage = error.response?.data?.message || error.message;
            session.lastErrorAt = new Date();
            await this.repository.save(session);
            throw error;
        }
    }
    /**
     * Stop WAHA session
     */
    async stopSession(sessionId, tenantId) {
        const session = await this.getSession(sessionId, tenantId);
        if (!session) {
            throw new Error('Session not found');
        }
        try {
            // Stop session on WAHA
            await axios_1.default.post(`${session.wahaServerUrl}/api/sessions/${session.name}/stop`, {}, {
                headers: { 'X-Api-Key': session.wahaApiKey },
            });
            session.status = entities_1.WahaSessionStatus.STOPPED;
            await this.repository.save(session);
            return session;
        }
        catch (error) {
            console.error('[WahaService] Error stopping session:', error);
            session.errorMessage = error.response?.data?.message || error.message;
            session.lastErrorAt = new Date();
            await this.repository.save(session);
            throw error;
        }
    }
    /**
     * Get QR code
     */
    async getQRCode(sessionId, tenantId) {
        const session = await this.getSession(sessionId, tenantId);
        if (!session) {
            throw new Error('Session not found');
        }
        try {
            const response = await axios_1.default.get(`${session.wahaServerUrl}/api/sessions/${session.name}/auth/qr`, {
                headers: { 'X-Api-Key': session.wahaApiKey },
            });
            const qrCode = response.data?.qr || response.data?.qrCode;
            // Save QR code
            session.qrCode = qrCode;
            await this.repository.save(session);
            return qrCode;
        }
        catch (error) {
            console.error('[WahaService] Error getting QR code:', error);
            return undefined;
        }
    }
    /**
     * Update session status from webhook
     */
    async updateSessionStatus(sessionId, tenantId, status, phoneNumber) {
        const session = await this.getSession(sessionId, tenantId);
        if (!session) {
            throw new Error('Session not found');
        }
        session.status = status;
        if (phoneNumber) {
            session.phoneNumber = phoneNumber;
        }
        if (status === entities_1.WahaSessionStatus.WORKING) {
            session.lastConnectedAt = new Date();
            session.errorMessage = undefined;
        }
        return await this.repository.save(session);
    }
    /**
     * Send WhatsApp message via WAHA
     */
    async sendMessage(sessionId, tenantId, data) {
        const session = await this.getSession(sessionId, tenantId);
        if (!session) {
            return { success: false, error: 'Session not found' };
        }
        if (session.status !== entities_1.WahaSessionStatus.WORKING) {
            return { success: false, error: 'Session is not active' };
        }
        try {
            const chatId = `${data.phoneNumber.replace(/\D/g, '')}@c.us`;
            let response;
            if (data.mediaUrl) {
                // Send media message
                response = await axios_1.default.post(`${session.wahaServerUrl}/api/sendImage`, {
                    session: session.name,
                    chatId,
                    file: {
                        url: data.mediaUrl,
                    },
                    caption: data.message,
                }, {
                    headers: { 'X-Api-Key': session.wahaApiKey },
                });
            }
            else {
                // Send text message
                response = await axios_1.default.post(`${session.wahaServerUrl}/api/sendText`, {
                    session: session.name,
                    chatId,
                    text: data.message,
                }, {
                    headers: { 'X-Api-Key': session.wahaApiKey },
                });
            }
            return {
                success: true,
                messageId: response.data?.id || response.data?.messageId,
            };
        }
        catch (error) {
            console.error('[WahaService] Error sending message:', error);
            // Update session error
            session.errorMessage = error.response?.data?.message || error.message;
            session.lastErrorAt = new Date();
            await this.repository.save(session);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
            };
        }
    }
    /**
     * Delete session
     */
    async deleteSession(sessionId, tenantId) {
        const session = await this.getSession(sessionId, tenantId);
        if (!session) {
            return false;
        }
        try {
            // Delete session on WAHA
            await axios_1.default.delete(`${session.wahaServerUrl}/api/sessions/${session.name}`, {
                headers: { 'X-Api-Key': session.wahaApiKey },
            });
        }
        catch (error) {
            console.error('[WahaService] Error deleting session on WAHA:', error);
            // Continue anyway to delete from database
        }
        const result = await this.repository.delete({ id: sessionId, tenantId });
        return (result.affected || 0) > 0;
    }
    /**
     * Private: Create session on WAHA server
     */
    async createWahaSession(session) {
        await axios_1.default.post(`${session.wahaServerUrl}/api/sessions`, {
            name: session.name,
            config: {
                engine: 'GOWS',
                webhooks: [
                    {
                        url: `${process.env.BACKEND_URL}/api/marketing/waha/webhook`,
                        events: ['message', 'session.status'],
                    },
                ],
            },
        }, {
            headers: { 'X-Api-Key': session.wahaApiKey },
        });
    }
}
exports.WahaService = WahaService;
//# sourceMappingURL=waha.service.js.map