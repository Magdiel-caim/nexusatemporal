"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatwootProxy = void 0;
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const router = (0, express_1.Router)();
/**
 * Proxy Reverso para Chatwoot
 *
 * Permite acesso ao Chatwoot através do mesmo domínio do sistema Nexus,
 * resolvendo problemas de cookies de terceiros em iframes.
 *
 * URL: https://one.nexusatemporal.com.br/api/chatwoot/*
 * Target: https://chat.nexusatemporal.com/*
 */
const CHATWOOT_URL = process.env.CHATWOOT_URL || 'https://chat.nexusatemporal.com';
// Configuração do proxy com suporte a WebSocket
const chatwootProxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: CHATWOOT_URL,
    changeOrigin: true,
    ws: true, // Habilita WebSocket
    pathRewrite: {
        '^/api/chatwoot': '', // Remove /api/chatwoot do caminho
    },
    // Configurações adicionais para estabilidade
    followRedirects: true,
    secure: false, // Desabilita verificação SSL estrita
});
exports.chatwootProxy = chatwootProxy;
// Aplica o proxy em todas as rotas /api/chatwoot/*
router.use('/', chatwootProxy);
exports.default = router;
//# sourceMappingURL=chatwoot-proxy.routes.js.map