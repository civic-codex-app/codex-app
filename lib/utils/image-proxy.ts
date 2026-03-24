import { uploadImage } from '@/lib/r2'
import { validateImageMagicBytes } from '@/lib/utils/file-validation'

const R2_PUBLIC = process.env.R2_PUBLIC_URL ?? ''
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Downloads an external image, validates it, uploads to R2,
 * and returns the R2 public URL (or null on failure).
 */
export async function proxyImageToR2(
  externalUrl: string,
  key: string
): Promise<string | null> {
  // Already on R2
  if (externalUrl.startsWith(R2_PUBLIC)) return externalUrl

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const resp = await fetch(externalUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'PoliApp/1.0 (civic-engagement-tool)' },
    })
    clearTimeout(timeout)

    if (!resp.ok) return null

    const ct = resp.headers.get('content-type') || ''
    if (ct.includes('svg') || ct.includes('html') || ct.includes('text')) return null

    const arrayBuffer = await resp.arrayBuffer()
    if (arrayBuffer.byteLength > MAX_SIZE || arrayBuffer.byteLength < 100) return null

    // Validate magic bytes
    const { valid, detectedType } = validateImageMagicBytes(arrayBuffer)
    if (!valid || !detectedType) return null

    const buf = Buffer.from(arrayBuffer)
    return await uploadImage(buf, key, detectedType)
  } catch {
    return null
  }
}
