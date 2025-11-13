import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Application } from 'express';
import { logger } from '@/shared/utils/logger';

/**
 * Sentry Service
 * Inicializa e configura monitoramento de erros e performance
 */
export class SentryService {
  private static initialized = false;

  /**
   * Inicializa Sentry
   */
  static init(app: Application): void {
    const dsn = process.env.SENTRY_DSN;

    if (!dsn) {
      logger.warn('⚠️  SENTRY_DSN not configured. Error tracking disabled.');
      return;
    }

    if (this.initialized) {
      logger.warn('⚠️  Sentry already initialized');
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
          nodeProfilingIntegration(),
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
      logger.info('✅ Sentry initialized successfully');
      logger.info(`   Environment: ${process.env.NODE_ENV}`);
      logger.info(`   Traces Sample Rate: ${parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1') * 100}%`);
    } catch (error: any) {
      logger.error('❌ Failed to initialize Sentry:', error.message);
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
    return (req: any, res: any, next: any) => next();
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
  static captureException(error: Error | string, context?: Record<string, any>): void {
    if (!this.initialized) {
      logger.warn('⚠️  Sentry not initialized, cannot capture exception');
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
  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>): void {
    if (!this.initialized) {
      logger.warn('⚠️  Sentry not initialized, cannot capture message');
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
  static addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    if (!this.initialized) {
      return;
    }

    Sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Define usuário atual
   */
  static setUser(user: { id: string; email?: string; role?: string; tenantId?: string } | null): void {
    if (!this.initialized) {
      return;
    }

    Sentry.setUser(user);
  }

  /**
   * Define contexto adicional
   */
  static setContext(name: string, context: Record<string, any>): void {
    if (!this.initialized) {
      return;
    }

    Sentry.setContext(name, context);
  }

  /**
   * Define tag
   */
  static setTag(key: string, value: string): void {
    if (!this.initialized) {
      return;
    }

    Sentry.setTag(key, value);
  }

  /**
   * Inicia transação manual de performance
   */
  static startTransaction(context: any): any {
    if (!this.initialized) {
      return undefined;
    }

    // Na nova API, use Sentry.startSpan() ao invés de startTransaction
    return Sentry.startSpan(context, () => {});
  }

  /**
   * Flush events (útil antes de shutdown)
   */
  static async flush(timeout = 2000): Promise<boolean> {
    if (!this.initialized) {
      return true;
    }

    return await Sentry.flush(timeout);
  }

  /**
   * Close Sentry connection
   */
  static async close(timeout = 2000): Promise<boolean> {
    if (!this.initialized) {
      return true;
    }

    const result = await Sentry.close(timeout);
    this.initialized = false;
    logger.info('🔌 Sentry closed');
    return result;
  }

  /**
   * Verifica se Sentry está inicializado
   */
  static isInitialized(): boolean {
    return this.initialized;
  }
}

export default SentryService;
