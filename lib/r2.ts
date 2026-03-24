import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME ?? 'poli-images'
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? ''

export async function uploadImage(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
  return `${PUBLIC_URL}/${key}`
}

export async function deleteImage(key: string): Promise<void> {
  await R2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  )
}

export function imageKeyFromUrl(url: string): string | null {
  if (!url.startsWith(PUBLIC_URL)) return null
  return url.replace(`${PUBLIC_URL}/`, '')
}
