"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppController = void 0;
const whatsapp_service_1 = require("./whatsapp.service");
const websocket_service_1 = require("./websocket.service");
class WhatsAppController {
    whatsappService = new whatsapp_service_1.WhatsAppService();
    // ===== WEBHOOK ENDPOINT =====
    handleWebhook = async (req, res) => {
        try {
            console.log('WhatsApp webhook received:', JSON.stringify(req.body, null, 2));
            const { event, payload } = req.body;
            // Handle different event types
            if (event === 'message' && payload) {
                const messageData = payload;
                const result = await this.whatsappService.handleIncomingMessage(messageData);
                // Emit WebSocket event to notify frontend
                try {
                    const wsService = (0, websocket_service_1.getWebSocketService)();
                    wsService.emitNewMessage(result.conversation.id, result.message);
                    // Notify assigned user if exists
                    if (result.conversation.assignedUserId) {
                        wsService.notifyUser(result.conversation.assignedUserId, 'conversation:newMessage', {
                            conversationId: result.conversation.id,
                            message: result.message,
                        });
                    }
                }
                catch (error) {
                    console.error('Error emitting WebSocket event:', error);
                }
                return res.json({ success: true, data: result });
            }
            if (event === 'message.ack' && payload) {
                // Handle message status updates
                await this.whatsappService.handleStatusUpdate({
                    messageId: payload.id,
                    status: payload.ack === 1 ? 'sent' : payload.ack === 2 ? 'delivered' : 'read',
                });
                return res.json({ success: true });
            }
            // Default response for unknown events
            res.json({ success: true, message: 'Event received' });
        }
        catch (error) {
            console.error('Error handling WhatsApp webhook:', error);
            res.status(500).json({ error: error.message });
        }
    };
    // ===== SESSION MANAGEMENT =====
    getSessionStatus = async (req, res) => {
        try {
            const { instanceId } = req.params;
            const status = await this.whatsappService.getSessionStatus(instanceId);
            res.json(status);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    startSession = async (req, res) => {
        try {
            const { instanceId } = req.params;
            const result = await this.whatsappService.startSession(instanceId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    stopSession = async (req, res) => {
        try {
            const { instanceId } = req.params;
            const result = await this.whatsappService.stopSession(instanceId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    // ===== MEDIA DOWNLOAD =====
    downloadMedia = async (req, res) => {
        try {
            const { mediaId } = req.params;
            const { instanceId } = req.query;
            const mediaBuffer = await this.whatsappService.downloadMedia(mediaId, instanceId || 'default');
            // Set appropriate headers
            res.set('Content-Type', 'application/octet-stream');
            res.send(mediaBuffer);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.WhatsAppController = WhatsAppController;
//# sourceMappingURL=whatsapp.controller.js.map