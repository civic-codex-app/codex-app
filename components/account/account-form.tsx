'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ImageCropper } from '@/components/ui/image-cropper'
import { fieldClass, labelClass } from '@/lib/utils'
import { US_STATES } from '@/lib/constants/us-states'
import { StanceAvatar } from '@/components/community/stance-avatar'
import { stanceBucket } from '@/lib/utils/stances'
import { loadQuizAnswers } from '@/lib/utils/quiz-storage'
import Image from 'next/image'

interface Profile {
  id: string
  display_name: string | null
  email: string | null
  role: string
  bio: string | null
  state: string | null
  zip_code: string | null
  avatar_url: string | null
  notifications_enabled: boolean
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function AccountForm({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stanceCounts, setStanceCounts] = useState<{ supports: number; opposes: number; neutral: number; total: number } | null>(null)

  useEffect(() => {
    // Try user-keyed answers first, then fall back to guest (unkeyed) answers
    let answers = loadQuizAnswers(profile?.id)
    if (Object.keys(answers).length === 0) {
      answers = loadQuizAnswers()
    }
    const entries = Object.values(answers)
    if (entries.length > 0) {
      let supports = 0, opposes = 0, neutral = 0
      for (const stance of entries) {
        const bucket = stanceBucket(stance)
        if (bucket === 'supports') supports++
        else if (bucket === 'opposes') opposes++
        else neutral++
      }
      setStanceCounts({ supports, opposes, neutral, total: entries.length })
    }
  }, [profile?.id])

  const userInitial = (profile?.display_name ?? profile?.email ?? 'U').charAt(0).toUpperCase()

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please use JPEG, PNG, or WebP.')
      return
    }

    // No size check here — cropper will compress it down
    setError('')
    const url = URL.createObjectURL(file)
    setCropSrc(url)
  }

  async function handleCropComplete(blob: Blob) {
    setCropSrc(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', new File([blob], 'avatar.webp', { type: blob.type }))

      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Upload failed')
        return
      }

      setAvatarUrl(`${data.url}?t=${Date.now()}`)
      setSuccess(true)
      router.refresh()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleCropCancel() {
    setCropSrc(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const zipCode = (form.get('zip_code') as string) || null

    // Auto-lookup city from zip code
    let city: string | null = null
    if (zipCode && zipCode.length === 5) {
      try {
        const res = await fetch(`https://api.zippopotam.us/us/${zipCode}`)
        if (res.ok) {
          const data = await res.json()
          city = data.places?.[0]?.['place name'] ?? null
        }
      } catch {
        // silently fail — city is optional
      }
    }

    const updates: Record<string, any> = {
      display_name: (form.get('display_name') as string) || null,
      bio: (form.get('bio') as string) || null,
      state: (form.get('state') as string) || null,
      zip_code: zipCode,
      notifications_enabled: form.get('notifications') === 'on',
    }
    if (city) updates.city = city

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile!.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
    {cropSrc && (
      <ImageCropper
        imageSrc={cropSrc}
        aspect={1}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    )}
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-[var(--poli-border)] p-6">
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400" role="alert">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400" role="status">
          Profile updated
        </div>
      )}

      {/* Avatar upload */}
      <div className="flex flex-col items-center gap-3 pb-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="group relative h-20 w-20 overflow-hidden rounded-full border-2 border-[var(--poli-border)] transition-colors hover:border-[var(--poli-text)] focus:outline-none focus:ring-2 focus:ring-[var(--poli-text)] focus:ring-offset-2 focus:ring-offset-[var(--poli-bg)] disabled:opacity-50"
          aria-label="Change profile photo"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={profile?.display_name ?? 'Avatar'}
              width={80}
              height={80}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : stanceCounts && stanceCounts.total > 0 ? (
            <StanceAvatar
              supports={stanceCounts.supports}
              opposes={stanceCounts.opposes}
              neutral={stanceCounts.neutral}
              total={stanceCounts.total}
              size={80}
              seed={profile?.id ?? ''}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--poli-badge-bg)]">
              <span className="text-2xl font-bold text-[var(--poli-sub)]">{userInitial}</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            {uploading ? (
              <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </div>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-[var(--poli-sub)] transition-colors hover:text-[var(--poli-text)] disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Change Photo'}
        </button>
      </div>

      <div>
        <label htmlFor="acct-email" className={labelClass}>Email</label>
        <input id="acct-email" disabled value={profile?.email ?? ''} className={`${fieldClass} opacity-50`} />
      </div>

      <div>
        <label htmlFor="acct-display-name" className={labelClass}>Display Name</label>
        <input id="acct-display-name" name="display_name" defaultValue={profile?.display_name ?? ''} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="acct-state" className={labelClass}>State</label>
        <select id="acct-state" name="state" defaultValue={profile?.state ?? ''} className={fieldClass}>
          <option value="">Not specified</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="acct-zip" className={labelClass}>Zip Code</label>
        <input
          id="acct-zip"
          name="zip_code"
          defaultValue={profile?.zip_code ?? ''}
          placeholder="e.g. 78701"
          maxLength={10}
          pattern="[0-9]{5}(-[0-9]{4})?"
          className={fieldClass}
        />
        <p className="mt-1 text-[11px] text-[var(--poli-faint)]">
          Used to find your congressional district representative
        </p>
      </div>

      <div>
        <label htmlFor="acct-bio" className={labelClass}>Bio</label>
        <textarea id="acct-bio" name="bio" rows={3} defaultValue={profile?.bio ?? ''} className={fieldClass} />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="notifications"
          id="notifications"
          defaultChecked={profile?.notifications_enabled ?? true}
          className="h-4 w-4 rounded border-[var(--poli-border)] bg-[var(--poli-input-bg)]"
        />
        <label htmlFor="notifications" className="text-sm text-[var(--poli-sub)]">
          Enable notifications
        </label>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
        <span className="text-[11px] uppercase tracking-wider text-[var(--poli-faint)]">
          Role: {profile?.role ?? 'user'}
        </span>
      </div>
    </form>
    </>
  )
}
