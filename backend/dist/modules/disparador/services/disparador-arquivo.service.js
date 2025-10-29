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
exports.DisparadorArquivoService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
class DisparadorArquivoService {
    s3Client;
    bucketName;
    constructor() {
        // Configurar cliente S3 (IDrive E2)
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            endpoint: process.env.AWS_ENDPOINT || undefined,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
        this.bucketName = process.env.AWS_BUCKET_NAME || 'nexus-disparador';
    }
    /**
     * Upload de arquivo para S3
     */
    async uploadArquivo(file, tenantId) {
        try {
            // Gerar nome único para o arquivo
            const fileExtension = path.extname(file.originalname);
            const fileName = `${(0, uuid_1.v4)()}${fileExtension}`;
            const fileKey = `disparador/${tenantId}/${fileName}`;
            // Ler arquivo
            const fileBuffer = fs.readFileSync(file.path);
            // Upload para S3
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                Body: fileBuffer,
                ContentType: file.mimetype,
                ACL: 'public-read', // Torna o arquivo público
            });
            await this.s3Client.send(command);
            // Construir URL pública
            const url = this.getPublicUrl(fileKey);
            console.log(`[DisparadorArquivoService] Arquivo enviado com sucesso: ${url}`);
            return url;
        }
        catch (error) {
            console.error('[DisparadorArquivoService] Erro ao fazer upload:', error);
            throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`);
        }
    }
    /**
     * Obter URL pública do arquivo
     */
    getPublicUrl(key) {
        const endpoint = process.env.AWS_ENDPOINT || '';
        const bucket = this.bucketName;
        if (endpoint) {
            // IDrive E2 ou outro S3 compatível
            return `${endpoint}/${bucket}/${key}`;
        }
        else {
            // AWS S3 padrão
            const region = process.env.AWS_REGION || 'us-east-1';
            return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
        }
    }
    /**
     * Validar tipo de arquivo
     */
    validateFileType(mimetype, category) {
        const allowedTypes = {
            image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
            video: ['video/mp4', 'video/avi', 'video/x-msvideo', 'video/quicktime', 'video/x-ms-wmv', 'video/x-matroska'],
            audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/x-m4a'],
            document: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain',
                'application/zip',
                'application/x-zip-compressed'
            ]
        };
        return allowedTypes[category]?.includes(mimetype) || false;
    }
}
exports.DisparadorArquivoService = DisparadorArquivoService;
//# sourceMappingURL=disparador-arquivo.service.js.map