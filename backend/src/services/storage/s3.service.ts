import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { env } from '../../config/env';
import { BadRequestError } from '../../utils/errors';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 5 * 1024 * 1024;

function requireS3Config() {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.S3_BUCKET || !env.S3_PUBLIC_BASE_URL) {
    throw new BadRequestError('S3 is not configured. Set AWS and S3_* environment variables.');
  }
  return {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
    bucket: env.S3_BUCKET,
    publicBaseUrl: env.S3_PUBLIC_BASE_URL.replace(/\/$/, '')
  };
}

function extFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'bin';
  }
}

function sanitizeFolder(folder: string): string {
  const cleaned = folder.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/^\/+|\/+$/g, '');
  return cleaned || 'misc';
}

export class S3Service {
  private client: S3Client | null = null;

  private getClient() {
    const cfg = requireS3Config();
    if (!this.client) {
      this.client = new S3Client({
        region: cfg.region,
        credentials: {
          accessKeyId: cfg.accessKeyId,
          secretAccessKey: cfg.secretAccessKey
        }
      });
    }
    return { client: this.client, cfg };
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestError('File is required');
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestError('Only JPEG, PNG, WebP, and GIF images are allowed');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestError('Image must be 5MB or smaller');
    }
  }

  private buildKey(folder: string, mime: string) {
    return `admin/${sanitizeFolder(folder)}/${randomUUID()}.${extFromMime(mime)}`;
  }

  private toUrl(key: string, publicBaseUrl: string) {
    return `${publicBaseUrl}/${key}`;
  }

  async upload(file: Express.Multer.File, folder = 'misc') {
    this.validateFile(file);
    const { client, cfg } = this.getClient();
    const key = this.buildKey(folder, file.mimetype);

    await client.send(
      new PutObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000'
      })
    );

    return { key, url: this.toUrl(key, cfg.publicBaseUrl) };
  }

  async replace(file: Express.Multer.File, oldKey: string | undefined, folder = 'misc') {
    const uploaded = await this.upload(file, folder);
    if (oldKey) {
      await this.delete(oldKey).catch(() => undefined);
    }
    return uploaded;
  }

  async delete(key: string) {
    if (!key?.trim()) {
      throw new BadRequestError('key is required');
    }
    const { client, cfg } = this.getClient();
    await client.send(
      new DeleteObjectCommand({
        Bucket: cfg.bucket,
        Key: key
      })
    );
    return { deleted: true, key };
  }
}

export const s3Service = new S3Service();
