import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadImage } from '@/lib/r2'
import { randomUUID } from 'crypto'
import { rateLimit, WRITE_OP } from '@/lib/utils/rate-limit'
import { validateImageMagicBytes } from '@/lib/utils/file-validation'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, WRITE_OP)
  if (!limited.success) return limited.response

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) ?? 'misc'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, AVIF' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 })
    }

    const arrayBuf = await file.arrayBuffer()
    const { valid } = validateImageMagicBytes(arrayBuf)
    if (!valid) {
      return NextResponse.json({ error: 'File content does not match an allowed image type' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const key = `${folder}/${randomUUID()}.${ext}`
    const buffer = Buffer.from(arrayBuf)

    const url = await uploadImage(buffer, key, file.type)

    return NextResponse.json({ url, key })
  } catch (err: unknown) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
