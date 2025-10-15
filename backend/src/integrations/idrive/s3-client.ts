import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@/shared/utils/logger';

// Initialize S3 Client for iDrive E2
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
});

const BUCKET_NAME = process.env.S3_BUCKET || 'nexus-storage';

/**
 * Upload a file to iDrive E2 (S3)
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType?: string,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
      ACL: 'public-read', // Permitir acesso público para leitura
    });

    await s3Client.send(command);

    logger.info(`File uploaded successfully: ${key}`);
    return `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;
  } catch (error: any) {
    logger.error('Error uploading file to S3:', error.message || error);
    throw error;
  }
}

/**
 * Download a file from iDrive E2 (S3)
 */
export async function downloadFile(key: string): Promise<any> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    return response.Body;
  } catch (error: any) {
    logger.error('Error downloading file from S3:', error.message || error);
    throw error;
  }
}

/**
 * Delete a file from iDrive E2 (S3)
 */
export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    logger.info(`File deleted successfully: ${key}`);
  } catch (error: any) {
    logger.error('Error deleting file from S3:', error.message || error);
    throw error;
  }
}

/**
 * Get a presigned URL for temporary file access
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error: any) {
    logger.error('Error generating presigned URL:', error.message || error);
    throw error;
  }
}

/**
 * List files in a directory (prefix)
 */
export async function listFiles(prefix: string = ''): Promise<any[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error: any) {
    logger.error('Error listing files from S3:', error.message || error);
    throw error;
  }
}

/**
 * Upload file with tenant isolation
 */
export async function uploadTenantFile(
  tenantId: string,
  fileName: string,
  body: Buffer | Uint8Array | string,
  contentType?: string
): Promise<string> {
  const key = `tenants/${tenantId}/${fileName}`;
  return uploadFile(key, body, contentType, { tenantId });
}

/**
 * Download tenant file
 */
export async function downloadTenantFile(tenantId: string, fileName: string): Promise<any> {
  const key = `tenants/${tenantId}/${fileName}`;
  return downloadFile(key);
}

/**
 * Delete tenant file
 */
export async function deleteTenantFile(tenantId: string, fileName: string): Promise<void> {
  const key = `tenants/${tenantId}/${fileName}`;
  return deleteFile(key);
}

/**
 * List tenant files
 */
export async function listTenantFiles(tenantId: string): Promise<any[]> {
  const prefix = `tenants/${tenantId}/`;
  return listFiles(prefix);
}

export { s3Client };
