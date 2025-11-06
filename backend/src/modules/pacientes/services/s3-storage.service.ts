import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CrmDataSource } from '@/database/data-source';
import { TenantS3Config } from '../entities/tenant-s3-config.entity';
import crypto from 'crypto';

interface S3UploadResult {
  url: string;
  s3Key: string;
  signedUrl: string;
}

export class S3StorageService {
  private clients = new Map<string, S3Client>();

  /**
   * Obtém o repository de forma lazy (só quando necessário)
   */
  private getConfigRepository() {
    console.log('[DEBUG S3] getConfigRepository chamado');
    console.log('[DEBUG S3] CrmDataSource.isInitialized:', CrmDataSource.isInitialized);

    if (!CrmDataSource.isInitialized) {
      console.log('[DEBUG S3] ERRO: CrmDataSource não está inicializado!');
      throw new Error('CrmDataSource não está inicializado');
    }

    console.log('[DEBUG S3] Obtendo repository para TenantS3Config...');
    const repo = CrmDataSource.getRepository(TenantS3Config);
    console.log('[DEBUG S3] Repository obtido:', !!repo);
    return repo;
  }

  /**
   * Obtém cliente S3 para um tenant específico
   */
  private async getClient(tenantId: string): Promise<S3Client> {
    console.log('[DEBUG S3] === INÍCIO getClient ===');
    console.log('[DEBUG S3] Tenant ID:', tenantId);
    console.log('[DEBUG S3] CrmDataSource exists:', !!CrmDataSource);
    console.log('[DEBUG S3] CrmDataSource.isInitialized:', CrmDataSource.isInitialized);

    // Verificar cache
    if (this.clients.has(tenantId)) {
      console.log('[DEBUG S3] Retornando cliente do cache');
      return this.clients.get(tenantId)!;
    }

    console.log('[DEBUG S3] Cliente não está no cache, buscando config...');

    // Tentar buscar via query RAW primeiro para debug
    // Buscar especificamente o bucket "imagensdepaciente" para imagens de pacientes
    const rawResult = await CrmDataSource.query(
      'SELECT * FROM tenant_s3_configs WHERE tenant_id = $1 AND bucket_name = $2 AND is_active = true LIMIT 1',
      [tenantId, 'imagensdepaciente']
    );
    console.log('[DEBUG S3] Raw query result:', rawResult.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (rawResult.length > 0) {
      console.log('[DEBUG S3] Raw config:', rawResult[0]);
    }

    const configRepository = this.getConfigRepository();
    console.log('[DEBUG S3] Repository table:', configRepository.metadata.tableName);

    // Buscar configuração do banco
    // Buscar especificamente o bucket "imagensdepaciente" para imagens de pacientes
    const config = await configRepository.findOne({
      where: { tenantId, bucketName: 'imagensdepaciente', isActive: true },
    });

    console.log('[DEBUG S3] Config encontrada:', config ? 'SIM' : 'NÃO');
    if (config) {
      console.log('[DEBUG S3] Config details:', { id: config.id, tenantId: config.tenantId, bucket: config.bucketName });
    }

    if (!config) {
      // Tentar buscar todas as configs para debug
      const allConfigs = await configRepository.find();
      console.log('[DEBUG S3] Total configs no banco:', allConfigs.length);
      console.log('[DEBUG S3] Configs disponíveis:', allConfigs.map(c => ({ tenant: c.tenantId, active: c.isActive })));

      // Se temos resultado raw mas não pelo repository, usar o raw
      if (rawResult.length > 0) {
        console.log('[DEBUG S3] Usando resultado RAW pois repository falhou');
        const raw = rawResult[0];
        // Criar objeto TenantS3Config manualmente
        const manualConfig = {
          id: raw.id,
          tenantId: raw.tenant_id,
          endpoint: raw.endpoint,
          accessKeyId: raw.access_key_id,
          secretAccessKey: raw.secret_access_key,
          bucketName: raw.bucket_name,
          region: raw.region,
          isActive: raw.is_active,
          createdAt: raw.created_at,
          updatedAt: raw.updated_at,
        } as TenantS3Config;

        // Descriptografar credenciais
        const accessKeyId = this.decrypt(manualConfig.accessKeyId);
        const secretAccessKey = this.decrypt(manualConfig.secretAccessKey);

        // Criar cliente S3
        const client = new S3Client({
          endpoint: `https://${manualConfig.endpoint}`,
          region: manualConfig.region,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
          forcePathStyle: true,
        });

        this.clients.set(tenantId, client);
        return client;
      }

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
    const configRepository = this.getConfigRepository();
    // Buscar especificamente o bucket "imagensdepaciente" para imagens de pacientes
    const config = await configRepository.findOne({
      where: { tenantId, bucketName: 'imagensdepaciente', isActive: true },
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
