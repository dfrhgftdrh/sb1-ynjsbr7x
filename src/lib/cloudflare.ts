import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = import.meta.env.VITE_CLOUDFLARE_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = import.meta.env.VITE_CLOUDFLARE_BUCKET_NAME;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  throw new Error('Missing Cloudflare R2 environment variables');
}

// Initialize S3 client for Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Generate a unique storage key
export const generateStorageKey = (folder: string, fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const timestamp = Date.now();
  const uniqueId = crypto.randomUUID();
  return `${folder}/${timestamp}-${uniqueId}.${ext}`;
};

// Get presigned URL for upload
export const getUploadUrl = async (key: string, contentType: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 3600 });
};

// Get public URL for download
export const getDownloadUrl = async (key: string): Promise<string> => {
  return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
};