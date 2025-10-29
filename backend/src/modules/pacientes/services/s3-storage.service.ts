import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PatientDataSource } from '../database/patient.datasource';
import { TenantS3Config } from '../entities/tenant-s3-config.entity';
import crypto from 'crypto';

interface S3UploadResult {
  url: string;
  s3Key: string;
  signedUrl: string;
}

export class S3StorageService {
  private clients = new Map<string, S3Client>();
  private configRepository = PatientDataSource.getRepository(TenantS3Config);

  /**
   * Obtém cliente S3 para um tenant específico
   */
  private async getClient(tenantId: string): Promise<S3Client> {
    // Verificar cache
    if (this.clients.has(tenantId)) {
      return this.clients.get(tenantId)!;
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
    const client = new S3Client({
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
  async uploadPatientImage(
    tenantId: string,
    patientId: string,
    file: Buffer,
    filename: string,
    type: 'profile' | 'before' | 'after' | 'document' | 'procedure'
  ): Promise<S3UploadResult> {
    const client = await this.getClient(tenantId);
    const config = await this.getConfig(tenantId);

    const s3Key = this.generateKey(patientId, filename, type);
    const contentType = this.getContentType(filename);

    await client.send(
      new PutObjectCommand({
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
      })
    );

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
  async getSignedUrl(
    tenantId: string,
    s3Key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const client = await this.getClient(tenantId);
    const config = await this.getConfig(tenantId);

    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: s3Key,
    });

    return await getSignedUrl(client, command, { expiresIn });
  }

  /**
   * Deleta uma imagem do S3
   */
  async deleteImage(tenantId: string, s3Key: string): Promise<void> {
    const client = await this.getClient(tenantId);
    const config = await this.getConfig(tenantId);

    await client.send(
      new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: s3Key,
      })
    );
  }

  /**
   * Gera chave única para o arquivo no S3
   */
  private generateKey(patientId: string, filename: string, type: string): string {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(8).toString('hex');
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
  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
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
  private async getConfig(tenantId: string): Promise<TenantS3Config> {
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
  private decrypt(encrypted: string): string {
    // Por enquanto, retornar direto (implementar AES-256 depois)
    // TODO: Implementar descriptografia real
    return encrypted;
  }

  /**
   * Criptografa credenciais para salvar no banco
   */
  static encrypt(plaintext: string): string {
    // Por enquanto, retornar direto (implementar AES-256 depois)
    // TODO: Implementar criptografia real
    return plaintext;
  }

  /**
   * Limpa cache de clientes S3
   */
  clearCache(): void {
    this.clients.clear();
  }
}
