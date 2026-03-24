'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

interface ImageCropperProps {
  imageSrc: string
  aspect?: number
  onCropComplete: (blob: Blob) => void
  onCancel: () => void
}

/**
 * Crop + compress an image before upload.
 * Outputs a WebP blob at max 800×1000 and ~80% quality.
 */
export function ImageCropper({
  imageSrc,
  aspect = 3 / 4,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropChange = useCallback((_: unknown, area: Area) => {
    setCroppedArea(area)
  }, [])

  async function handleSave() {
    if (!croppedArea) return
    setProcessing(true)

    try {
      const blob = await getCroppedImg(imageSrc, croppedArea)
      onCropComplete(blob)
    } catch {
      // fallback: send original
      const resp = await fetch(imageSrc)
      const original = await resp.blob()
      onCropComplete(original)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      {/* Crop area */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropChange}
          cropShape="rect"
          showGrid={false}
          style={{
            containerStyle: { background: 'transparent' },
            cropAreaStyle: {
              border: '2px solid rgba(255,255,255,0.6)',
              borderRadius: 12,
            },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center justify-center gap-3 px-6 py-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
        </svg>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="h-1 w-48 appearance-none rounded-full bg-white/20 accent-white"
          aria-label="Zoom"
        />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /><line x1="11" y1="8" x2="11" y2="14" />
        </svg>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 px-6 pb-8 pt-2">
        <button
          onClick={onCancel}
          className="rounded-full border border-white/20 px-6 py-2.5 text-[14px] font-medium text-white/80 transition-colors hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={processing}
          className="rounded-full bg-blue-600 px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {processing ? 'Processing...' : 'Save Photo'}
        </button>
      </div>
    </div>
  )
}

/**
 * Crop, resize, and compress an image using canvas.
 * Output: WebP blob, max 800×1000, 80% quality.
 */
async function getCroppedImg(src: string, crop: Area): Promise<Blob> {
  const image = await loadImage(src)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  // Max output dimensions
  const MAX_W = 800
  const MAX_H = 1000

  let outW = crop.width
  let outH = crop.height

  // Scale down if needed
  if (outW > MAX_W || outH > MAX_H) {
    const scale = Math.min(MAX_W / outW, MAX_H / outH)
    outW = Math.round(outW * scale)
    outH = Math.round(outH * scale)
  }

  canvas.width = outW
  canvas.height = outH

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outW,
    outH,
  )

  // Try WebP first, fall back to JPEG
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else {
          // Fallback to JPEG
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) resolve(jpegBlob)
              else reject(new Error('Failed to create image blob'))
            },
            'image/jpeg',
            0.85,
          )
        }
      },
      'image/webp',
      0.8,
    )
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.crossOrigin = 'anonymous'
    img.src = src
  })
}
