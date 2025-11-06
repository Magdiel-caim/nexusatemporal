"use strict";
/**
 * API Key Authentication Middleware
 *
 * Middleware para autenticação de chamadas externas via API Key
 * Usado para integração entre Site de Checkout e Sistema Principal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateApiKey = void 0;
const error_handler_1 = require("./error-handler");
/**
 * Middleware para validar API Key em requisições externas
 *
 * A API Key deve ser enviada no header Authorization como Bearer token
 * Exemplo: Authorization: Bearer <API_KEY>
 */
const authenticateApiKey = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new error_handler_1.AppError('No API key provided', 401);
        }
        const apiKey = authHeader.substring(7); // Remove "Bearer " prefix
        // Validar API key
        const validApiKey = process.env.EXTERNAL_API_KEY;
        if (!validApiKey) {
            console.error('EXTERNAL_API_KEY not configured in environment');
            throw new error_handler_1.AppError('API authentication not configured', 500);
        }
        if (apiKey !== validApiKey) {
            throw new error_handler_1.AppError('Invalid API key', 401);
        }
        // Log da requisição externa para auditoria
        console.log('[API Key Auth] External request authenticated', {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            path: req.path,
            method: req.method,
        });
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticateApiKey = authenticateApiKey;
//# sourceMappingURL=api-key-auth.middleware.js.map