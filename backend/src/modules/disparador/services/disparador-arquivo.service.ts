import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class DisparadorArquivoService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    // Configurar cliente S3 (IDrive E2)
    this.s3Client = new S3Client({
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
  async uploadArquivo(file: Express.Multer.File, tenantId: string): Promise<string> {
    try {
      // Gerar nome único para o arquivo
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const fileKey = `disparador/${tenantId}/${fileName}`;

      // Ler arquivo
      const fileBuffer = fs.readFileSync(file.path);

      // Upload para S3
      const command = new PutObjectCommand({
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
    } catch (error: any) {
      console.error('[DisparadorArquivoService] Erro ao fazer upload:', error);
      throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`);
    }
  }

  /**
   * Obter URL pública do arquivo
   */
  private getPublicUrl(key: string): string {
    const endpoint = process.env.AWS_ENDPOINT || '';
    const bucket = this.bucketName;

    if (endpoint) {
      // IDrive E2 ou outro S3 compatível
      return `${endpoint}/${bucket}/${key}`;
    } else {
      // AWS S3 padrão
      const region = process.env.AWS_REGION || 'us-east-1';
      return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }
  }

  /**
   * Validar tipo de arquivo
   */
  validateFileType(mimetype: string, category: 'image' | 'video' | 'audio' | 'document'): boolean {
    const allowedTypes: Record<string, string[]> = {
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
