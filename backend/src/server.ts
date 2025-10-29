import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { AppDataSource, CrmDataSource } from '@/database/data-source';
import { PatientDataSource } from '@/modules/pacientes/database/patient.datasource';
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

// Trust proxy - necessário quando atrás do Traefik
app.set('trust proxy', true);

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

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

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

// ============================================
// BULK MESSAGE WORKER - BullMQ
// ============================================
import '@/modules/marketing/workers/bulk-message.worker';

const PORT = process.env.API_PORT || 3001;

// Initialize databases and start server
Promise.all([
  AppDataSource.initialize(),
  CrmDataSource.initialize(),
  PatientDataSource.initialize()
])
  .then(([chatDb, crmDb, patientDb]) => {
    logger.info('✅ Chat Database connected successfully (chat_messages, whatsapp_sessions)');
    logger.info('✅ CRM Database connected successfully (leads, users, pipelines, etc)');
    logger.info(`   CRM DB Host: ${(crmDb.options as any).host}`);
    logger.info('✅ Patient Database connected successfully (patients, medical_records, images)');
    logger.info(`   Patient DB Host: ${(patientDb.options as any).host}`);

    // ============================================
    // Inicializar WhatsApp Polling Service
    // ============================================
    whatsappSyncService = new WhatsAppSyncService(io);
    whatsappSyncService.start();

    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API URL: ${process.env.BACKEND_URL}`);
      logger.info(`⚙️  Bulk message worker started and listening for jobs`);
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
    Promise.all([
      AppDataSource.destroy(),
      CrmDataSource.destroy(),
      PatientDataSource.destroy()
    ]).then(() => {
      logger.info('All database connections closed');
      process.exit(0);
    });
  });
});

export { app, io };
