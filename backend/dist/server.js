"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const data_source_1 = require("@/database/data-source");
const error_handler_1 = require("@/shared/middleware/error-handler");
const rate_limiter_1 = require("@/shared/middleware/rate-limiter");
const logger_1 = require("@/shared/utils/logger");
const routes_1 = __importDefault(require("@/routes"));
const websocket_service_1 = require("@/modules/chat/websocket.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        credentials: true
    }
});
exports.io = io;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use((0, morgan_1.default)('combined', { stream: { write: (message) => logger_1.logger.info(message.trim()) } }));
// Rate limiting
// Aplicado em todos os ambientes (limites ajustados: 1000 req/15min)
app.use(rate_limiter_1.rateLimiter);
// Make io accessible to routes
app.set('io', io);
// Routes
app.use('/api', routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Error handler (must be last)
app.use(error_handler_1.errorHandler);
// Initialize WebSocket service for Chat module
(0, websocket_service_1.initializeWebSocketService)(io);
// ============================================
// POLLING SERVICE - SOLUÇÃO TEMPORÁRIA
// Remove quando webhooks WAHA funcionarem
// Para desativar: ENABLE_WHATSAPP_POLLING=false
// ============================================
const WhatsAppSyncService_1 = __importDefault(require("@/services/WhatsAppSyncService"));
let whatsappSyncService = null;
const PORT = process.env.API_PORT || 3001;
// Initialize database and start server
data_source_1.AppDataSource.initialize()
    .then(() => {
    logger_1.logger.info('Database connected successfully');
    // ============================================
    // Inicializar WhatsApp Polling Service
    // ============================================
    whatsappSyncService = new WhatsAppSyncService_1.default(io);
    whatsappSyncService.start();
    httpServer.listen(PORT, () => {
        logger_1.logger.info(`🚀 Server running on port ${PORT}`);
        logger_1.logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
        logger_1.logger.info(`🔗 API URL: ${process.env.BACKEND_URL}`);
    });
})
    .catch((error) => {
    logger_1.logger.error('Database connection failed:', error);
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM signal received: closing HTTP server');
    // Parar serviço de polling
    if (whatsappSyncService) {
        whatsappSyncService.stop();
    }
    httpServer.close(() => {
        logger_1.logger.info('HTTP server closed');
        data_source_1.AppDataSource.destroy().then(() => {
            logger_1.logger.info('Database connection closed');
            process.exit(0);
        });
    });
});
//# sourceMappingURL=server.js.map