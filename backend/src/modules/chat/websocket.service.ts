import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@/shared/utils/logger';

export class WebSocketService {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`WebSocket connected: ${socket.id}`);

      // Handle user authentication
      socket.on('auth', (data: { userId: string; token: string }) => {
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
          logger.info(`User ${userId} authenticated on socket ${socket.id}`);

          socket.emit('auth:success', { userId });
        } catch (error) {
          logger.error('Socket authentication failed:', error);
          socket.emit('auth:failed', { error: 'Authentication failed' });
        }
      });

      // Handle joining conversation room
      socket.on('conversation:join', (data: { conversationId: string }) => {
        const { conversationId } = data;
        socket.join(`conversation:${conversationId}`);
        logger.info(`Socket ${socket.id} joined conversation ${conversationId}`);
      });

      // Handle leaving conversation room
      socket.on('conversation:leave', (data: { conversationId: string }) => {
        const { conversationId } = data;
        socket.leave(`conversation:${conversationId}`);
        logger.info(`Socket ${socket.id} left conversation ${conversationId}`);
      });

      // Handle typing indicators
      socket.on('typing:start', (data: { conversationId: string; userId: string; userName: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
          userId: data.userId,
          userName: data.userName,
          conversationId: data.conversationId,
        });
      });

      socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
          userId: data.userId,
          conversationId: data.conversationId,
        });
      });

      // Handle message read receipts
      socket.on('message:read', (data: { messageId: string; conversationId: string }) => {
        this.io.to(`conversation:${data.conversationId}`).emit('message:read', {
          messageId: data.messageId,
          conversationId: data.conversationId,
          readAt: new Date(),
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`WebSocket disconnected: ${socket.id}`);

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
  emitNewMessage(conversationId: string, message: any) {
    this.io.to(`conversation:${conversationId}`).emit('message:new', message);
    logger.info(`New message emitted to conversation ${conversationId}`);
  }

  // Emit message status update
  emitMessageStatusUpdate(conversationId: string, messageId: string, status: string) {
    this.io.to(`conversation:${conversationId}`).emit('message:status', {
      messageId,
      status,
      updatedAt: new Date(),
    });
  }

  // Emit conversation update
  emitConversationUpdate(conversationId: string, data: any) {
    this.io.to(`conversation:${conversationId}`).emit('conversation:update', data);
  }

  // Notify specific user
  notifyUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
    logger.info(`Notification sent to user ${userId}: ${event}`);
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
    logger.info(`Broadcast sent: ${event}`);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return sockets ? sockets.size > 0 : false;
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Get all online user IDs
  getOnlineUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }
}

// Singleton instance (will be initialized in server.ts)
let websocketServiceInstance: WebSocketService | null = null;

export const initializeWebSocketService = (io: SocketIOServer) => {
  websocketServiceInstance = new WebSocketService(io);
  return websocketServiceInstance;
};

export const getWebSocketService = (): WebSocketService => {
  if (!websocketServiceInstance) {
    throw new Error('WebSocketService not initialized');
  }
  return websocketServiceInstance;
};
