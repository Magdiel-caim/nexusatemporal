"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const patient_datasource_1 = require("../database/patient.datasource");
const tenant_s3_config_entity_1 = require("../entities/tenant-s3-config.entity");
const crypto_1 = __importDefault(require("crypto"));
class S3StorageService {
    clients = new Map();
    configRepository = patient_datasource_1.PatientDataSource.getRepository(tenant_s3_config_entity_1.TenantS3Config);
    /**
     * Obtém cliente S3 para um tenant específico
     */
    async getClient(tenantId) {
        // Verificar cache
        if (this.clients.has(tenantId)) {
            return this.clients.get(tenantId);
        }
        // Buscar configuração do banco
        const config = await this.configRepository.findOne({
            where: { tenantId, isActive: true },
        });
        if (!config) {
            throw new Error(`Configuração S3 não encontrada para tenant: ${tenantId}`);
        }
        // Descriptografar credenciais (se necessário)
        const accessKeyId = this.decrypt(config.accessKeyId);
        const secretAccessKey = this.decrypt(config.secretAccessKey);
        // Criar cliente S3
        const client = new client_s3_1.S3Client({
            endpoint: `https://${config.endpoint}`,
            region: config.region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            forcePathStyle: true, // IDrive requer path-style
        });
        // Cachear cliente
        this.clients.set(tenantId, client);
        return client;
    }
    /**
     * Faz upload de uma imagem do paciente
     */
    async uploadPatientImage(tenantId, patientId, file, filename, type) {
        const client = await this.getClient(tenantId);
        const config = await this.getConfig(tenantId);
        const s3Key = this.generateKey(patientId, filename, type);
        const contentType = this.getContentType(filename);
        await client.send(new client_s3_1.PutObjectCommand({
            Bucket: config.bucketName,
            Key: s3Key,
            Body: file,
            ContentType: contentType,
            ACL: 'private',
            Metadata: {
                patientId,
                type,
                uploadedAt: new Date().toISOString(),
            },
        }));
        // Gerar URL assinada (válida por 1 hora)
        const signedUrl = await this.getSignedUrl(tenantId, s3Key, 3600);
        return {
            url: `https://${config.endpoint}/${config.bucketName}/${s3Key}`,
            s3Key,
            signedUrl,
        };
    }
    /**
     * Obtém URL assinada temporária para acesso à imagem
     */
    async getSignedUrl(tenantId, s3Key, expiresIn = 3600) {
        const client = await this.getClient(tenantId);
        const config = await this.getConfig(tenantId);
        const command = new client_s3_1.GetObjectCommand({
            Bucket: config.bucketName,
            Key: s3Key,
        });
        return await (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn });
    }
    /**
     * Deleta uma imagem do S3
     */
    async deleteImage(tenantId, s3Key) {
        const client = await this.getClient(tenantId);
        const config = await this.getConfig(tenantId);
        await client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: config.bucketName,
            Key: s3Key,
        }));
    }
    /**
     * Gera chave única para o arquivo no S3
     */
    generateKey(patientId, filename, type) {
        const timestamp = Date.now();
        const randomStr = crypto_1.default.randomBytes(8).toString('hex');
        const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
        switch (type) {
            case 'profile':
                return `patients/${patientId}/profile/${timestamp}-${randomStr}.${ext}`;
            case 'before':
                return `patients/${patientId}/images/before/${timestamp}-${randomStr}.${ext}`;
            case 'after':
                return `patients/${patientId}/images/after/${timestamp}-${randomStr}.${ext}`;
            case 'document':
                return `patients/${patientId}/documents/${timestamp}-${randomStr}.${ext}`;
            case 'procedure':
                return `patients/${patientId}/procedures/${timestamp}-${randomStr}.${ext}`;
            default:
                return `patients/${patientId}/misc/${timestamp}-${randomStr}.${ext}`;
        }
    }
    /**
     * Determina Content-Type baseado na extensão do arquivo
     */
    getContentType(filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        const mimeTypes = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
        return mimeTypes[ext || ''] || 'application/octet-stream';
    }
    /**
     * Obtém configuração S3 do tenant
     */
    async getConfig(tenantId) {
        const config = await this.configRepository.findOne({
            where: { tenantId, isActive: true },
        });
        if (!config) {
            throw new Error(`Configuração S3 não encontrada para tenant: ${tenantId}`);
        }
        return config;
    }
    /**
     * Descriptografa credenciais (placeholder - implementar com crypto real)
     */
    decrypt(encrypted) {
        // Por enquanto, retornar direto (implementar AES-256 depois)
        // TODO: Implementar descriptografia real
        return encrypted;
    }
    /**
     * Criptografa credenciais para salvar no banco
     */
    static encrypt(plaintext) {
        // Por enquanto, retornar direto (implementar AES-256 depois)
        // TODO: Implementar criptografia real
        return plaintext;
    }
    /**
     * Limpa cache de clientes S3
     */
    clearCache() {
        this.clients.clear();
    }
}
exports.S3StorageService = S3StorageService;
//# sourceMappingURL=s3-storage.service.js.map