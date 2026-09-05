import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { Documents } from '@/collections/Documents'
import { Dogs } from '@/collections/Dogs'
import { Litters } from '@/collections/Litters'
import { Puppies } from '@/collections/Puppies'
import { Applications } from '@/collections/Applications'
import { ContactMessages } from '@/collections/ContactMessages'
import { Testimonials } from '@/collections/Testimonials'
import { FAQs } from '@/collections/FAQs'
import { Pages } from '@/collections/Pages'
import { Deposits } from '@/collections/Deposits'
import { SiteSettings } from '@/globals/SiteSettings'
import { migrations } from '@/migrations'
import { isEmailConfigured, isS3Configured, payloadSecret, s3 as s3env, serverUrl, smtp } from '@/lib/env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const plugins = []

if (isS3Configured) {
  plugins.push(
    s3Storage({
      collections: { media: true, documents: true },
      bucket: s3env.bucket,
      config: {
        region: s3env.region || 'us-east-1',
        endpoint: s3env.endpoint || undefined,
        forcePathStyle: s3env.forcePathStyle,
        credentials: {
          accessKeyId: s3env.accessKeyId,
          secretAccessKey: s3env.secretAccessKey,
        },
      },
    }),
  )
}

export default buildConfig({
  serverURL: serverUrl,
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Celestial English Golden Retrievers',
    },
  },
  editor: lexicalEditor(),
  collections: [
    Users,
    Media,
    Documents,
    Dogs,
    Litters,
    Puppies,
    Applications,
    ContactMessages,
    Testimonials,
    FAQs,
    Pages,
    Deposits,
  ],
  globals: [SiteSettings],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    // In development the schema is auto-pushed for fast iteration. In production
    // these migrations run automatically on first boot, so `docker compose up`
    // provisions the database with no extra steps.
    prodMigrations: migrations,
  }),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  sharp,
  // Restrict cross-origin + CSRF to the configured site URL.
  cors: [serverUrl],
  csrf: [serverUrl],
  upload: {
    limits: {
      fileSize: 15 * 1024 * 1024, // 15 MB hard ceiling
    },
  },
  // First-boot provisioning: when AUTO_SEED=true (set in docker-compose), an
    // Empty databases receive the admin user and launch-safe settings on startup.
  // The seeder is idempotent and never overwrites existing data.
  onInit: async (payload) => {
    if (process.env.AUTO_SEED === 'true') {
      try {
        const { seed } = await import('@/seed/seed')
        await seed(payload)
      } catch (err) {
        payload.logger.error(`Auto-seed failed: ${err instanceof Error ? err.message : err}`)
      }
    }
  },
  email: isEmailConfigured
    ? nodemailerAdapter({
        defaultFromAddress: smtp.from.replace(/.*<(.+)>.*/, '$1'),
        defaultFromName: 'Celestial English Golden Retrievers',
        transportOptions: {
          host: smtp.host,
          port: smtp.port,
          secure: smtp.port === 465,
          auth: { user: smtp.user, pass: smtp.password },
        },
      })
    : undefined,
  plugins,
})
