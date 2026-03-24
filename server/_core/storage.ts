import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./env";

/**
 * Cloudflare R2 storage service for photo uploads.
 * R2 is S3-compatible, so we use the AWS SDK with a custom endpoint.
 *
 * Setup:
 * 1. Create R2 bucket in Cloudflare Dashboard
 * 2. Create API token with R2 read/write permissions
 * 3. Set env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
 */

let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (!ENV.r2Configured) {
    console.warn("[R2] Storage not configured (set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${ENV.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ENV.r2AccessKeyId,
        secretAccessKey: ENV.r2SecretAccessKey,
      },
    });
  }

  return s3Client;
}

/**
 * Generate a presigned URL for direct client-side upload.
 * The client uploads directly to R2, bypassing our server for large files.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 600 // 10 minutes
): Promise<{ uploadUrl: string; publicUrl: string } | null> {
  const client = getS3Client();
  if (!client) return null;

  const command = new PutObjectCommand({
    Bucket: ENV.r2BucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  const publicUrl = ENV.r2PublicUrl
    ? `${ENV.r2PublicUrl}/${key}`
    : `https://${ENV.r2BucketName}.${ENV.r2AccountId}.r2.cloudflarestorage.com/${key}`;

  return { uploadUrl, publicUrl };
}

/**
 * Generate a storage key for agent photos.
 * Format: agents/{slug}/photos/{timestamp}-{filename}
 */
export function generatePhotoKey(agentSlug: string, filename: string): string {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `agents/${agentSlug}/photos/${timestamp}-${sanitized}`;
}
