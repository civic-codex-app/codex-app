import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadImage, deleteImage, imageKeyFromUrl } from '@/lib/r2'
import { rateLimit, WRITE_OP } from '@/lib/utils/rate-limit'
import { validateImageMagicBytes } from '@/lib/utils/file-validation'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, WRITE_OP)
  if (!limited.success) return limited.response

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 })
    }

    // Delete old avatar if it exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (profile?.avatar_url) {
      const oldKey = imageKeyFromUrl(profile.avatar_url)
      if (oldKey) {
        try {
          await deleteImage(oldKey)
        } catch {
          // Ignore delete errors for old avatars
        }
      }
    }

    const arrayBuf = await file.arrayBuffer()
    const { valid } = validateImageMagicBytes(arrayBuf)
    if (!valid) {
      return NextResponse.json({ error: 'File content does not match an allowed image type' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const key = `avatars/${user.id}.${ext}`
    const buffer = Buffer.from(arrayBuf)

    const url = await uploadImage(buffer, key, file.type)

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (err: unknown) {
    console.error('Avatar upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
