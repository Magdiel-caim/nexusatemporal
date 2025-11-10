"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryService = void 0;
const Sentry = __importStar(require("@sentry/node"));
const profiling_node_1 = require("@sentry/profiling-node");
const logger_1 = require("@/shared/utils/logger");
/**
 * Sentry Service
 * Inicializa e configura monitoramento de erros e performance
 */
class SentryService {
    static initialized = false;
    /**
     * Inicializa Sentry
     */
    static init(app) {
        const dsn = process.env.SENTRY_DSN;
        if (!dsn) {
            logger_1.logger.warn('⚠️  SENTRY_DSN not configured. Error tracking disabled.');
            return;
        }
        if (this.initialized) {
            logger_1.logger.warn('⚠️  Sentry already initialized');
            return;
        }
        try {
            Sentry.init({
                dsn,
                environment: process.env.NODE_ENV || 'development',
                release: process.env.npm_package_version || '1.0.0',
                // Integrations
                integrations: [
                    // Performance profiling
                    (0, profiling_node_1.nodeProfilingIntegration)(),
                ],
                // Performance Monitoring
                tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'), // 10% das transações
                profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'), // 10% dos traces
                // Filtering
                beforeSend(event, hint) {
                    // Não enviar erros de desenvolvimento
                    if (process.env.NODE_ENV === 'development') {
                        return null;
                    }
                    // Filtrar informações sensíveis
                    if (event.request) {
                        delete event.request.cookies;
                        if (event.request.headers) {
                            delete event.request.headers.authorization;
                            delete event.request.headers.cookie;
                        }
                    }
                    return event;
                },
                // Ignora erros específicos
                ignoreErrors: [
                    // Erros de rede/cliente
                    'Network request failed',
                    'NetworkError',
                    'Failed to fetch',
                    // Erros de cancelamento
                    'AbortError',
                    'CancelledError',
                    // Erros conhecidos/esperados
                    'Invalid token',
                    'Unauthorized',
                ],
            });
            this.initialized = true;
            logger_1.logger.info('✅ Sentry initialized successfully');
            logger_1.logger.info(`   Environment: ${process.env.NODE_ENV}`);
            logger_1.logger.info(`   Traces Sample Rate: ${parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1') * 100}%`);
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to initialize Sentry:', error.message);
        }
    }
    /**
     * Request Handler Middleware
     * Deve ser o primeiro middleware após body parsers
     */
    static requestHandler() {
        return Sentry.setupExpressErrorHandler;
    }
    /**
     * Tracing Handler Middleware
     * Captura performance de requests
     */
    static tracingHandler() {
        // Na nova versão do Sentry, não é mais necessário um middleware separado
        return (req, res, next) => next();
    }
    /**
     * Error Handler Middleware
     * Deve ser ANTES do error handler da aplicação
     */
    static errorHandler() {
        return Sentry.setupExpressErrorHandler;
    }
    /**
     * Captura erro manual
     */
    static captureException(error, context) {
        if (!this.initialized) {
            logger_1.logger.warn('⚠️  Sentry not initialized, cannot capture exception');
            return;
        }
        if (typeof error === 'string') {
            error = new Error(error);
        }
        Sentry.withScope((scope) => {
            if (context) {
                Object.keys(context).forEach((key) => {
                    scope.setExtra(key, context[key]);
                });
            }
            Sentry.captureException(error);
        });
    }
    /**
     * Captura mensagem manual
     */
    static captureMessage(message, level = 'info', context) {
        if (!this.initialized) {
            logger_1.logger.warn('⚠️  Sentry not initialized, cannot capture message');
            return;
        }
        Sentry.withScope((scope) => {
            scope.setLevel(level);
            if (context) {
                Object.keys(context).forEach((key) => {
                    scope.setExtra(key, context[key]);
                });
            }
            Sentry.captureMessage(message);
        });
    }
    /**
     * Adiciona breadcrumb (rastro de navegação)
     */
    static addBreadcrumb(breadcrumb) {
        if (!this.initialized) {
            return;
        }
        Sentry.addBreadcrumb(breadcrumb);
    }
    /**
     * Define usuário atual
     */
    static setUser(user) {
        if (!this.initialized) {
            return;
        }
        Sentry.setUser(user);
    }
    /**
     * Define contexto adicional
     */
    static setContext(name, context) {
        if (!this.initialized) {
            return;
        }
        Sentry.setContext(name, context);
    }
    /**
     * Define tag
     */
    static setTag(key, value) {
        if (!this.initialized) {
            return;
        }
        Sentry.setTag(key, value);
    }
    /**
     * Inicia transação manual de performance
     */
    static startTransaction(context) {
        if (!this.initialized) {
            return undefined;
        }
        // Na nova API, use Sentry.startSpan() ao invés de startTransaction
        return Sentry.startSpan(context, () => { });
    }
    /**
     * Flush events (útil antes de shutdown)
     */
    static async flush(timeout = 2000) {
        if (!this.initialized) {
            return true;
        }
        return await Sentry.flush(timeout);
    }
    /**
     * Close Sentry connection
     */
    static async close(timeout = 2000) {
        if (!this.initialized) {
            return true;
        }
        const result = await Sentry.close(timeout);
        this.initialized = false;
        logger_1.logger.info('🔌 Sentry closed');
        return result;
    }
    /**
     * Verifica se Sentry está inicializado
     */
    static isInitialized() {
        return this.initialized;
    }
}
exports.SentryService = SentryService;
exports.default = SentryService;
//# sourceMappingURL=sentry.service.js.map