import { Request, Response } from 'express';
import { AppDataSource } from '@/database/data-source';
import { getPresignedUrl } from '@/integrations/idrive/s3-client';
import { logger } from '@/shared/utils/logger';

/**
 * Controller para gerar URLs assinadas de mídias do chat
 */
export class MediaProxyController {
  /**
   * Gera signed URL para uma mídia de mensagem
   * GET /api/chat/media/:messageId
   */
  async getMediaUrl(req: Request, res: Response) {
    try {
      const { messageId } = req.params;

      // Buscar mensagem no banco
      const result = await AppDataSource.query(
        `SELECT media_url FROM chat_messages WHERE id = $1 AND media_url IS NOT NULL`,
        [messageId]
      );

      if (!result || result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Message not found or has no media',
        });
      }

      const mediaUrl = result[0].media_url;

      // Se for base64, retornar diretamente
      if (mediaUrl.startsWith('data:')) {
        return res.json({
          success: true,
          url: mediaUrl,
          type: 'base64',
        });
      }

      // Se for URL HTTP, extrair o key (path) do S3
      if (mediaUrl.startsWith('http')) {
        try {
          const url = new URL(mediaUrl);
          // Extrair path: /bucket-name/path/to/file.jpg -> path/to/file.jpg
          const pathParts = url.pathname.split('/');
          // Remove primeira parte vazia e bucket name
          pathParts.shift(); // Remove ''
          pathParts.shift(); // Remove 'backupsistemaonenexus'
          const key = pathParts.join('/');

          logger.info(`[MediaProxy] Generating signed URL for key: ${key}`);

          // Gerar signed URL (válida por 1 hora)
          const signedUrl = await getPresignedUrl(key, 3600);

          return res.json({
            success: true,
            url: signedUrl,
            type: 'signed',
            expiresIn: 3600,
          });
        } catch (error: any) {
          logger.error(`[MediaProxy] Error generating signed URL:`, error);
          // Se falhar ao gerar signed URL, retornar URL original
          return res.json({
            success: true,
            url: mediaUrl,
            type: 'direct',
          });
        }
      }

      // Fallback: retornar URL original
      return res.json({
        success: true,
        url: mediaUrl,
        type: 'unknown',
      });
    } catch (error: any) {
      logger.error('[MediaProxy] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Proxy para streaming de mídia (alternativa)
   * GET /api/chat/media/:messageId/stream
   */
  async streamMedia(req: Request, res: Response) {
    try {
      const { messageId } = req.params;

      // Buscar mensagem no banco
      const result = await AppDataSource.query(
        `SELECT media_url, message_type FROM chat_messages WHERE id = $1 AND media_url IS NOT NULL`,
        [messageId]
      );

      if (!result || result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Message not found or has no media',
        });
      }

      const { media_url: mediaUrl, message_type: messageType } = result[0];

      // Se for base64, decodificar e retornar
      if (mediaUrl.startsWith('data:')) {
        const matches = mediaUrl.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');

          res.setHeader('Content-Type', mimeType);
          res.setHeader('Content-Length', buffer.length);
          res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h cache
          return res.send(buffer);
        }
      }

      // Se for URL HTTP, fazer download do S3 e fazer stream
      if (mediaUrl.startsWith('http')) {
        const { downloadFile } = await import('@/integrations/idrive/s3-client');

        try {
          const url = new URL(mediaUrl);
          const pathParts = url.pathname.split('/');
          pathParts.shift();
          pathParts.shift();
          const key = pathParts.join('/');

          logger.info(`[MediaProxy] Streaming file: ${key}`);

          const s3Object = await downloadFile(key);

          // Determinar Content-Type baseado no tipo de mensagem
          let contentType = 'application/octet-stream';
          if (messageType === 'image') contentType = 'image/jpeg';
          else if (messageType === 'video') contentType = 'video/mp4';
          else if (messageType === 'audio' || messageType === 'ptt') contentType = 'audio/ogg';
          else if (messageType === 'document') contentType = 'application/pdf';

          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=86400');

          // Stream do S3 para response
          s3Object.pipe(res);
        } catch (error: any) {
          logger.error(`[MediaProxy] Error streaming file:`, error);
          return res.status(500).json({
            success: false,
            error: 'Failed to stream media',
          });
        }
      }
    } catch (error: any) {
      logger.error('[MediaProxy] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
