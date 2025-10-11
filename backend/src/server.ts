import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { AppDataSource } from '@/database/data-source';
import { errorHandler } from '@/shared/middleware/error-handler';
import { rateLimiter } from '@/shared/middleware/rate-limiter';
import { logger } from '@/shared/utils/logger';
import routes from '@/routes';
import { initializeWebSocketService } from '@/modules/chat/websocket.service';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate limiting
// TEMPORARIAMENTE DESATIVADO para debug
// if (process.env.NODE_ENV === 'production') {
//   app.use(rateLimiter);
// }

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize WebSocket service for Chat module
initializeWebSocketService(io);

// ============================================
// POLLING SERVICE - SOLUÇÃO TEMPORÁRIA
// Remove quando webhooks WAHA funcionarem
// Para desativar: ENABLE_WHATSAPP_POLLING=false
// ============================================
import WhatsAppSyncService from '@/services/WhatsAppSyncService';
let whatsappSyncService: WhatsAppSyncService | null = null;

const PORT = process.env.API_PORT || 3001;

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    logger.info('Database connected successfully');

    // ============================================
    // Inicializar WhatsApp Polling Service
    // ============================================
    whatsappSyncService = new WhatsAppSyncService(io);
    whatsappSyncService.start();

    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API URL: ${process.env.BACKEND_URL}`);
    });
  })
  .catch((error) => {
    logger.error('Database connection failed:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');

  // Parar serviço de polling
  if (whatsappSyncService) {
    whatsappSyncService.stop();
  }

  httpServer.close(() => {
    logger.info('HTTP server closed');
    AppDataSource.destroy().then(() => {
      logger.info('Database connection closed');
      process.exit(0);
    });
  });
});

export { app, io };
