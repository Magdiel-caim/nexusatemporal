"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebSocketService = exports.initializeWebSocketService = exports.WebSocketService = void 0;
const logger_1 = require("@/shared/utils/logger");
class WebSocketService {
    io;
    userSockets = new Map(); // userId -> Set of socketIds
    constructor(io) {
        this.io = io;
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info(`WebSocket connected: ${socket.id}`);
            // Handle user authentication
            socket.on('auth', (data) => {
                try {
                    // TODO: Validate token here
                    const { userId } = data;
                    // Register user socket
                    if (!this.userSockets.has(userId)) {
                        this.userSockets.set(userId, new Set());
                    }
                    this.userSockets.get(userId)?.add(socket.id);
                    // Join user's personal room
                    socket.join(`user:${userId}`);
                    logger_1.logger.info(`User ${userId} authenticated on socket ${socket.id}`);
                    socket.emit('auth:success', { userId });
                }
                catch (error) {
                    logger_1.logger.error('Socket authentication failed:', error);
                    socket.emit('auth:failed', { error: 'Authentication failed' });
                }
            });
            // Handle joining conversation room
            socket.on('conversation:join', (data) => {
                const { conversationId } = data;
                socket.join(`conversation:${conversationId}`);
                logger_1.logger.info(`Socket ${socket.id} joined conversation ${conversationId}`);
            });
            // Handle leaving conversation room
            socket.on('conversation:leave', (data) => {
                const { conversationId } = data;
                socket.leave(`conversation:${conversationId}`);
                logger_1.logger.info(`Socket ${socket.id} left conversation ${conversationId}`);
            });
            // Handle typing indicators
            socket.on('typing:start', (data) => {
                socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
                    userId: data.userId,
                    userName: data.userName,
                    conversationId: data.conversationId,
                });
            });
            socket.on('typing:stop', (data) => {
                socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
                    userId: data.userId,
                    conversationId: data.conversationId,
                });
            });
            // Handle message read receipts
            socket.on('message:read', (data) => {
                this.io.to(`conversation:${data.conversationId}`).emit('message:read', {
                    messageId: data.messageId,
                    conversationId: data.conversationId,
                    readAt: new Date(),
                });
            });
            // Handle disconnect
            socket.on('disconnect', () => {
                logger_1.logger.info(`WebSocket disconnected: ${socket.id}`);
                // Remove socket from user tracking
                for (const [userId, sockets] of this.userSockets.entries()) {
                    if (sockets.has(socket.id)) {
                        sockets.delete(socket.id);
                        if (sockets.size === 0) {
                            this.userSockets.delete(userId);
                        }
                        break;
                    }
                }
            });
        });
    }
    // ===== EMIT EVENTS =====
    // Emit new message to conversation
    emitNewMessage(conversationId, message) {
        this.io.to(`conversation:${conversationId}`).emit('message:new', message);
        logger_1.logger.info(`New message emitted to conversation ${conversationId}`);
    }
    // Emit message status update
    emitMessageStatusUpdate(conversationId, messageId, status) {
        this.io.to(`conversation:${conversationId}`).emit('message:status', {
            messageId,
            status,
            updatedAt: new Date(),
        });
    }
    // Emit conversation update
    emitConversationUpdate(conversationId, data) {
        this.io.to(`conversation:${conversationId}`).emit('conversation:update', data);
    }
    // Notify specific user
    notifyUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
        logger_1.logger.info(`Notification sent to user ${userId}: ${event}`);
    }
    // Broadcast to all connected clients
    broadcast(event, data) {
        this.io.emit(event, data);
        logger_1.logger.info(`Broadcast sent: ${event}`);
    }
    // Check if user is online
    isUserOnline(userId) {
        const sockets = this.userSockets.get(userId);
        return sockets ? sockets.size > 0 : false;
    }
    // Get online users count
    getOnlineUsersCount() {
        return this.userSockets.size;
    }
    // Get all online user IDs
    getOnlineUserIds() {
        return Array.from(this.userSockets.keys());
    }
}
exports.WebSocketService = WebSocketService;
// Singleton instance (will be initialized in server.ts)
let websocketServiceInstance = null;
const initializeWebSocketService = (io) => {
    websocketServiceInstance = new WebSocketService(io);
    return websocketServiceInstance;
};
exports.initializeWebSocketService = initializeWebSocketService;
const getWebSocketService = () => {
    if (!websocketServiceInstance) {
        throw new Error('WebSocketService not initialized');
    }
    return websocketServiceInstance;
};
exports.getWebSocketService = getWebSocketService;
//# sourceMappingURL=websocket.service.js.map