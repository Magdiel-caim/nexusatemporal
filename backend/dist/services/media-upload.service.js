"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaUploadService = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const s3_client_1 = require("../integrations/idrive/s3-client");
const logger_1 = require("../shared/utils/logger");
/**
 * MediaUploadService
 *
 * Service para fazer upload de mídias recebidas via WhatsApp
 * para o S3/iDrive E2
 */
class MediaUploadService {
    wahaApiKey;
    constructor() {
        this.wahaApiKey = process.env.WAHA_API_KEY || 'bd0c416348b2f04d198ff8971b608a87';
    }
    /**
     * Faz upload de mídia a partir de uma URL do WAHA
     *
     * @param mediaUrl - URL da mídia no WAHA
     * @param mimeType - Tipo MIME do arquivo (ex: 'image/jpeg')
     * @returns Informações do arquivo uploadado
     */
    async uploadMediaFromUrl(mediaUrl, mimeType) {
        try {
            logger_1.logger.info(`[MediaUpload] Iniciando upload de mídia: ${mediaUrl}`);
            // 1. Baixar arquivo da URL do WAHA
            const response = await axios_1.default.get(mediaUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'X-Api-Key': this.wahaApiKey,
                },
                timeout: 30000, // 30 segundos timeout
            });
            const buffer = Buffer.from(response.data);
            const fileSize = buffer.length;
            const contentType = mimeType || response.headers['content-type'] || 'application/octet-stream';
            logger_1.logger.info(`[MediaUpload] Arquivo baixado: ${fileSize} bytes, tipo: ${contentType}`);
            // 2. Gerar nome único do arquivo
            const ext = this.getExtensionFromMimeType(contentType);
            const fileName = `chat-media/${(0, uuid_1.v4)()}.${ext}`;
            // 3. Upload para S3 usando função existente
            const fileUrl = await (0, s3_client_1.uploadFile)(fileName, buffer, contentType, {
                source: 'whatsapp',
                originalUrl: mediaUrl,
                uploadedAt: new Date().toISOString(),
            });
            logger_1.logger.info(`[MediaUpload] Upload concluído: ${fileUrl}`);
            return {
                fileUrl,
                fileName,
                fileSize,
                mimeType: contentType,
            };
        }
        catch (error) {
            logger_1.logger.error('[MediaUpload] Erro ao fazer upload:', error.message || error);
            throw new Error(`Failed to upload media: ${error.message}`);
        }
    }
    /**
     * Determina a extensão do arquivo baseado no MIME type
     *
     * @param mimeType - Tipo MIME (ex: 'image/jpeg')
     * @returns Extensão do arquivo (ex: 'jpg')
     */
    getExtensionFromMimeType(mimeType) {
        const mimeMap = {
            // Imagens
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/svg+xml': 'svg',
            'image/bmp': 'bmp',
            'image/tiff': 'tiff',
            // Vídeos
            'video/mp4': 'mp4',
            'video/mpeg': 'mpeg',
            'video/webm': 'webm',
            'video/quicktime': 'mov',
            'video/x-msvideo': 'avi',
            'video/3gpp': '3gp',
            // Áudios
            'audio/ogg': 'ogg',
            'audio/mpeg': 'mp3',
            'audio/mp4': 'm4a',
            'audio/wav': 'wav',
            'audio/webm': 'webm',
            'audio/aac': 'aac',
            'audio/opus': 'opus',
            // Documentos
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-powerpoint': 'ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            'text/plain': 'txt',
            'text/csv': 'csv',
            'application/zip': 'zip',
            'application/x-rar-compressed': 'rar',
            'application/x-7z-compressed': '7z',
        };
        const extension = mimeMap[mimeType.toLowerCase()];
        if (extension) {
            return extension;
        }
        // Fallback: tentar extrair da segunda parte do mime type
        // Ex: 'application/vnd.something' -> 'something'
        const parts = mimeType.split('/');
        if (parts.length > 1) {
            const ext = parts[1].split('.').pop();
            if (ext && ext.length <= 5) {
                return ext;
            }
        }
        // Default
        return 'bin';
    }
    /**
     * Determina o tipo de attachment baseado no MIME type
     *
     * @param mimeType - Tipo MIME
     * @returns Tipo do attachment ('image', 'video', 'audio', 'document')
     */
    getAttachmentType(mimeType) {
        const type = mimeType.toLowerCase();
        if (type.startsWith('image/')) {
            return 'image';
        }
        if (type.startsWith('video/')) {
            return 'video';
        }
        if (type.startsWith('audio/')) {
            return 'audio';
        }
        return 'document';
    }
    /**
     * Valida se o arquivo é permitido (tamanho máximo, tipo permitido)
     *
     * @param fileSize - Tamanho do arquivo em bytes
     * @param mimeType - Tipo MIME
     * @throws Error se arquivo não for permitido
     */
    validateFile(fileSize, mimeType) {
        const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
        if (fileSize > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds maximum allowed (${MAX_FILE_SIZE / 1024 / 1024}MB)`);
        }
        // Lista de tipos permitidos (pode expandir conforme necessário)
        const allowedTypes = [
            'image/', 'video/', 'audio/',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats',
            'application/vnd.ms-',
            'text/plain',
            'text/csv',
        ];
        const isAllowed = allowedTypes.some(allowed => mimeType.toLowerCase().startsWith(allowed));
        if (!isAllowed) {
            throw new Error(`File type not allowed: ${mimeType}`);
        }
    }
}
exports.MediaUploadService = MediaUploadService;
//# sourceMappingURL=media-upload.service.js.map