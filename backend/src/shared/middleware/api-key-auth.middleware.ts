/**
 * API Key Authentication Middleware
 *
 * Middleware para autenticação de chamadas externas via API Key
 * Usado para integração entre Site de Checkout e Sistema Principal
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';

/**
 * Middleware para validar API Key em requisições externas
 *
 * A API Key deve ser enviada no header Authorization como Bearer token
 * Exemplo: Authorization: Bearer <API_KEY>
 */
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No API key provided', 401);
    }

    const apiKey = authHeader.substring(7); // Remove "Bearer " prefix

    // Validar API key
    const validApiKey = process.env.EXTERNAL_API_KEY;

    if (!validApiKey) {
      console.error('EXTERNAL_API_KEY not configured in environment');
      throw new AppError('API authentication not configured', 500);
    }

    if (apiKey !== validApiKey) {
      throw new AppError('Invalid API key', 401);
    }

    // Log da requisição externa para auditoria
    console.log('[API Key Auth] External request authenticated', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    next();
  } catch (error) {
    next(error);
  }
};
