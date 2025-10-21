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
exports.MediaStorageService = void 0;
const s3_client_1 = require("../integrations/idrive/s3-client");
const crypto = __importStar(require("crypto"));
/**
 * Serviço para processar e armazenar mídias do WhatsApp
 * Baixa mídia de URL temporária e faz upload para S3
 */
class MediaStorageService {
    /**
     * Processa mídia do WhatsApp:
     * 1. Baixa da URL temporária do WhatsApp
     * 2. Faz upload para S3/IDrive
     * 3. Retorna URL pública e permanente do S3
     */
    static async processWhatsAppMedia(mediaUrl, messageType, sessionName) {
        try {
            console.log('📥 Processando mídia do WhatsApp:', {
                urlPrefix: mediaUrl.substring(0, 60) + '...',
                type: messageType,
                session: sessionName,
            });
            // 1. Baixar mídia do WhatsApp
            const response = await fetch(mediaUrl);
            if (!response.ok) {
                console.warn('⚠️ Falha ao baixar mídia do WhatsApp:', response.status);
                return null;
            }
            const buffer = await response.arrayBuffer();
            const bufferSize = buffer.byteLength;
            console.log('✅ Mídia baixada do WhatsApp:', {
                size: bufferSize,
                sizeKB: Math.round(bufferSize / 1024),
            });
            // 2. Determinar content-type e extensão
            let contentType = response.headers.get('content-type') || 'application/octet-stream';
            let extension = 'bin';
            if (contentType === 'application/octet-stream' || !contentType.includes('/')) {
                // WhatsApp às vezes retorna octet-stream, então inferir pelo tipo
                switch (messageType) {
                    case 'image':
                        contentType = 'image/jpeg';
                        extension = 'jpg';
                        break;
                    case 'video':
                        contentType = 'video/mp4';
                        extension = 'mp4';
                        break;
                    case 'audio':
                    case 'ptt':
                        contentType = 'audio/ogg';
                        extension = 'ogg';
                        break;
                    case 'sticker':
                        contentType = 'image/webp';
                        extension = 'webp';
                        break;
                    case 'document':
                        contentType = 'application/pdf';
                        extension = 'pdf';
                        break;
                }
            }
            else {
                // Extrair extensão do content-type
                const typeMatch = contentType.match(/\/([a-z0-9]+)/);
                if (typeMatch) {
                    extension = typeMatch[1];
                }
            }
            // 3. Gerar nome único para o arquivo
            const hash = crypto.createHash('md5').update(mediaUrl).digest('hex').substring(0, 16);
            const timestamp = Date.now();
            const fileName = `whatsapp/${sessionName}/${timestamp}-${hash}.${extension}`;
            // 4. Upload para S3
            const s3Url = await (0, s3_client_1.uploadFile)(fileName, Buffer.from(buffer), contentType, {
                source: 'whatsapp',
                session: sessionName,
                type: messageType,
                originalUrl: mediaUrl.substring(0, 100),
            });
            console.log('✅ Mídia enviada para S3:', {
                fileName,
                contentType,
                size: bufferSize,
                url: s3Url.substring(0, 80) + '...',
            });
            return s3Url;
        }
        catch (error) {
            console.error('❌ Erro ao processar mídia:', {
                error: error.message,
                stack: error.stack?.split('\n')[0],
            });
            // Retornar null ao invés de lançar erro para não quebrar o fluxo
            return null;
        }
    }
    /**
     * Verifica se uma URL é do WhatsApp (temporária) e precisa ser processada
     */
    static isWhatsAppMediaUrl(url) {
        if (!url)
            return false;
        return url.includes('mmg.whatsapp.net') || url.includes('media.fna.whatsapp.net');
    }
}
exports.MediaStorageService = MediaStorageService;
//# sourceMappingURL=media-storage.service.js.map