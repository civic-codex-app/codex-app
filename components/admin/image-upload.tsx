'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  currentUrl?: string | null
  folder: string
  onUpload: (url: string) => void
  className?: string
}

export function ImageUpload({ currentUrl, folder, onUpload, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)

    // Preview
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Upload failed')
        setPreview(currentUrl ?? null)
        return
      }

      onUpload(data.url)
    } catch {
      setError('Upload failed')
      setPreview(currentUrl ?? null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        {preview && (
          <div className="h-16 w-16 overflow-hidden rounded-lg bg-[var(--poli-card)] border border-[var(--poli-border)]">
            <Image
              src={preview}
              alt="Preview"
              width={64}
              height={64}
              className="h-full w-full object-cover"
              unoptimized={preview.startsWith('data:')}
            />
          </div>
        )}
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-md border border-[var(--poli-border)] bg-[var(--poli-input-bg)] px-4 py-2 text-sm text-[var(--poli-text)] transition-colors hover:border-[var(--poli-input-border)] disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
          </button>
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  )
}
