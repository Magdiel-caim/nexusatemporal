"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireApiKeyScope = exports.authenticateApiKey = void 0;
const data_source_1 = require("../database/data-source");
const api_key_entity_1 = require("../modules/integrations/entities/api-key.entity");
const api_key_service_1 = require("../modules/integrations/services/api-key.service");
/**
 * Middleware para autenticação via API Key
 * Permite que sistemas externos (como N8N) façam requisições usando API Keys
 *
 * A API Key deve ser enviada no header: Authorization: Bearer nxs_xxxxx
 * ou via query param: ?api_key=nxs_xxxxx
 */
const authenticateApiKey = async (req, res, next) => {
    try {
        // Extrai a API Key do header ou query param
        let apiKeyValue;
        // 1. Tentar pegar do header Authorization
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            apiKeyValue = authHeader.substring(7);
        }
        // 2. Tentar pegar do query param
        if (!apiKeyValue && req.query.api_key) {
            apiKeyValue = req.query.api_key;
        }
        // 3. Tentar pegar do header X-API-Key (padrão alternativo)
        if (!apiKeyValue && req.headers['x-api-key']) {
            apiKeyValue = req.headers['x-api-key'];
        }
        if (!apiKeyValue) {
            return res.status(401).json({
                error: 'API Key não fornecida',
                message: 'Envie a API Key no header Authorization: Bearer <key> ou query param ?api_key=<key>',
            });
        }
        // Valida a API Key
        const apiKeyRepository = data_source_1.CrmDataSource.getRepository(api_key_entity_1.ApiKey);
        const apiKeyService = new api_key_service_1.ApiKeyService(apiKeyRepository);
        const apiKey = await apiKeyService.validate(apiKeyValue);
        if (!apiKey) {
            return res.status(401).json({
                error: 'API Key inválida ou expirada',
            });
        }
        // Verifica IP permitido (se configurado)
        if (apiKey.allowedIps && apiKey.allowedIps.length > 0) {
            const clientIp = getClientIp(req);
            const isIpAllowed = apiKey.allowedIps.some((ip) => clientIp.includes(ip));
            if (!isIpAllowed) {
                return res.status(403).json({
                    error: 'IP não autorizado',
                    message: `Seu IP (${clientIp}) não está na lista de IPs permitidos`,
                });
            }
        }
        // Verifica origem permitida (se configurado)
        if (apiKey.allowedOrigins && apiKey.allowedOrigins.length > 0) {
            const origin = req.headers.origin || req.headers.referer;
            if (origin) {
                const isOriginAllowed = apiKey.allowedOrigins.some((allowedOrigin) => origin.includes(allowedOrigin));
                if (!isOriginAllowed) {
                    return res.status(403).json({
                        error: 'Origem não autorizada',
                    });
                }
            }
        }
        // Verifica rate limit
        const rateLimitOk = await apiKeyService.checkRateLimit(apiKey);
        if (!rateLimitOk) {
            return res.status(429).json({
                error: 'Rate limit excedido',
                message: `Limite de ${apiKey.rateLimit} requisições por hora atingido`,
            });
        }
        // Injeta informações da API Key no request
        req.apiKey = {
            id: apiKey.id,
            name: apiKey.name,
            scopes: apiKey.scopes,
            tenantId: apiKey.tenantId,
        };
        // Injeta user simulado para compatibilidade com middleware existente
        req.user = {
            id: apiKey.createdById,
            tenantId: apiKey.tenantId,
            isApiKey: true, // Flag para identificar que é autenticação via API Key
        };
        next();
    }
    catch (error) {
        console.error('Error in API Key authentication:', error);
        return res.status(500).json({
            error: 'Erro na autenticação',
        });
    }
};
exports.authenticateApiKey = authenticateApiKey;
/**
 * Middleware para verificar escopos da API Key
 */
const requireApiKeyScope = (requiredScopes) => {
    return (req, res, next) => {
        const apiKey = req.apiKey;
        if (!apiKey) {
            return res.status(401).json({
                error: 'Autenticação via API Key necessária',
            });
        }
        // Se a API Key tem escopo 'full', permite tudo
        if (apiKey.scopes.includes('full')) {
            return next();
        }
        // Verifica se tem pelo menos um dos escopos necessários
        const hasRequiredScope = requiredScopes.some((scope) => apiKey.scopes.includes(scope));
        if (!hasRequiredScope) {
            return res.status(403).json({
                error: 'Escopo insuficiente',
                message: `Esta operação requer um dos seguintes escopos: ${requiredScopes.join(', ')}`,
                currentScopes: apiKey.scopes,
            });
        }
        next();
    };
};
exports.requireApiKeyScope = requireApiKeyScope;
/**
 * Extrai o IP real do cliente, considerando proxies
 */
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const ips = forwarded.split(',');
        return ips[0].trim();
    }
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
        return realIp;
    }
    return req.socket.remoteAddress || '';
}
//# sourceMappingURL=api-key-auth.middleware.js.map