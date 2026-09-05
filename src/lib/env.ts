/**
 * Centralized, typed access to environment variables.
 * Secrets are read at runtime only; never log their values.
 */
import path from 'path'

/**
 * Base directory for locally-stored uploads (images + PDFs). Mounted as a
 * persistent volume in production. Overridable via UPLOADS_DIR.
 */
export const uploadsDir =
  process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads')

export const serverUrl =
  process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '') || 'http://localhost:3000'

export const payloadSecret =
  process.env.PAYLOAD_SECRET ||
  (process.env.NODE_ENV !== 'production' ? 'celestial-preview-development-secret' : '')

export const databaseUri = process.env.DATABASE_URI || process.env.DATABASE_URL || ''

export const smtp = {
  host: process.env.SMTP_HOST || '',
  port: Number(process.env.SMTP_PORT || 587),
  user: process.env.SMTP_USER || '',
  password: process.env.SMTP_PASSWORD || '',
  from: process.env.EMAIL_FROM || 'no-reply@example.com',
  toBreeder: process.env.EMAIL_TO_BREEDER || '',
}

export const isEmailConfigured = Boolean(smtp.host && smtp.user && smtp.password)

export const stripe = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
}

export const isStripeConfigured = Boolean(stripe.secretKey)

export const s3 = {
  enabled: process.env.S3_ENABLED === 'true',
  bucket: process.env.S3_BUCKET || '',
  region: process.env.S3_REGION || '',
  endpoint: process.env.S3_ENDPOINT || '',
  accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
}

export const isS3Configured =
  s3.enabled && Boolean(s3.bucket && s3.accessKeyId && s3.secretAccessKey)
