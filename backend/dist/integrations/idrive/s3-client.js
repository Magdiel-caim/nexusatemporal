"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = void 0;
exports.uploadFile = uploadFile;
exports.downloadFile = downloadFile;
exports.deleteFile = deleteFile;
exports.getPresignedUrl = getPresignedUrl;
exports.listFiles = listFiles;
exports.uploadTenantFile = uploadTenantFile;
exports.downloadTenantFile = downloadTenantFile;
exports.deleteTenantFile = deleteTenantFile;
exports.listTenantFiles = listTenantFiles;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const logger_1 = require("../../shared/utils/logger");
// Initialize S3 Client for iDrive E2
const s3Client = new client_s3_1.S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
});
exports.s3Client = s3Client;
const BUCKET_NAME = process.env.S3_BUCKET || 'nexus-storage';
/**
 * Upload a file to iDrive E2 (S3)
 */
async function uploadFile(key, body, contentType, metadata) {
    try {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: contentType,
            Metadata: metadata,
            ACL: 'public-read', // Permitir acesso público para leitura
        });
        await s3Client.send(command);
        logger_1.logger.info(`File uploaded successfully: ${key}`);
        return `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;
    }
    catch (error) {
        logger_1.logger.error('Error uploading file to S3:', error.message || error);
        throw error;
    }
}
/**
 * Download a file from iDrive E2 (S3)
 */
async function downloadFile(key) {
    try {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        const response = await s3Client.send(command);
        return response.Body;
    }
    catch (error) {
        logger_1.logger.error('Error downloading file from S3:', error.message || error);
        throw error;
    }
}
/**
 * Delete a file from iDrive E2 (S3)
 */
async function deleteFile(key) {
    try {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        await s3Client.send(command);
        logger_1.logger.info(`File deleted successfully: ${key}`);
    }
    catch (error) {
        logger_1.logger.error('Error deleting file from S3:', error.message || error);
        throw error;
    }
}
/**
 * Get a presigned URL for temporary file access
 */
async function getPresignedUrl(key, expiresIn = 3600) {
    try {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn });
        return url;
    }
    catch (error) {
        logger_1.logger.error('Error generating presigned URL:', error.message || error);
        throw error;
    }
}
/**
 * List files in a directory (prefix)
 */
async function listFiles(prefix = '') {
    try {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: prefix,
        });
        const response = await s3Client.send(command);
        return response.Contents || [];
    }
    catch (error) {
        logger_1.logger.error('Error listing files from S3:', error.message || error);
        throw error;
    }
}
/**
 * Upload file with tenant isolation
 */
async function uploadTenantFile(tenantId, fileName, body, contentType) {
    const key = `tenants/${tenantId}/${fileName}`;
    return uploadFile(key, body, contentType, { tenantId });
}
/**
 * Download tenant file
 */
async function downloadTenantFile(tenantId, fileName) {
    const key = `tenants/${tenantId}/${fileName}`;
    return downloadFile(key);
}
/**
 * Delete tenant file
 */
async function deleteTenantFile(tenantId, fileName) {
    const key = `tenants/${tenantId}/${fileName}`;
    return deleteFile(key);
}
/**
 * List tenant files
 */
async function listTenantFiles(tenantId) {
    const prefix = `tenants/${tenantId}/`;
    return listFiles(prefix);
}
//# sourceMappingURL=s3-client.js.map