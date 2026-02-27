import AWS from 'aws-sdk';
import crypto from 'crypto';
import type { UploadedFile } from '../middleware/upload';

const DEFAULT_SIGNED_URL_SECONDS = 15 * 60;
const bucketName = process.env.INSTRUCTOR_DOCUMENTS_BUCKET || '';
const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-west-1';

const s3Client = new AWS.S3({
  region,
  signatureVersion: 'v4',
});

const sanitizeFileName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);
};

const ensureConfigured = () => {
  if (!bucketName) {
    throw new Error('INSTRUCTOR_DOCUMENTS_BUCKET is not configured');
  }
};

export interface StoredInstructorDocument {
  s3Key: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export const storageService = {
  isConfigured(): boolean {
    return bucketName.length > 0;
  },

  async uploadInstructorVerificationDocument(
    userId: string,
    file: UploadedFile
  ): Promise<StoredInstructorDocument> {
    ensureConfigured();
    const safeFileName = sanitizeFileName(file.originalname || 'document');
    const key = `instructor-review/${userId}/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;

    await s3Client
      .putObject({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype || 'application/octet-stream',
      })
      .promise();

    return {
      s3Key: key,
      fileName: file.originalname || safeFileName,
      contentType: file.mimetype || 'application/octet-stream',
      sizeBytes: file.size,
    };
  },

  async deleteDocument(key: string): Promise<void> {
    if (!key || !bucketName) {
      return;
    }

    await s3Client
      .deleteObject({
        Bucket: bucketName,
        Key: key,
      })
      .promise();
  },

  async getSignedDownloadUrl(key: string, expiresIn = DEFAULT_SIGNED_URL_SECONDS): Promise<string | null> {
    if (!key || !bucketName) {
      return null;
    }

    return s3Client.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn,
    });
  },
};
