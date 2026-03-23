/**
 * Validate image files by checking magic bytes (file signatures).
 * Prevents spoofed MIME types (e.g., renaming .exe to .jpg).
 */

type ImageType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif'

interface ValidationResult {
  valid: boolean
  detectedType: ImageType | null
}

export function validateImageMagicBytes(buffer: ArrayBuffer): ValidationResult {
  const bytes = new Uint8Array(buffer)

  if (bytes.length < 12) {
    return { valid: false, detectedType: null }
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { valid: true, detectedType: 'image/jpeg' }
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
    bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A
  ) {
    return { valid: true, detectedType: 'image/png' }
  }

  // WebP: RIFF....WEBP
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { valid: true, detectedType: 'image/webp' }
  }

  // AVIF: ....ftypavif or ....ftypavis (ISO BMFF container)
  if (
    bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70
  ) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11])
    if (brand === 'avif' || brand === 'avis') {
      return { valid: true, detectedType: 'image/avif' }
    }
  }

  return { valid: false, detectedType: null }
}
