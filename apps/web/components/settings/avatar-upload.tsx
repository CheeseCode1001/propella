'use client'

import { useRef, useState } from 'react'
import { Camera, Trash } from 'iconsax-reactjs'
import { Button } from '@/components/ui/button'

const MAX_SOURCE_BYTES = 8 * 1024 * 1024 // reject huge originals before decoding
const OUTPUT_SIZE = 256

/**
 * Shrinks the chosen file to a square WebP data URL.
 *
 * Doing this in the browser keeps the upload small enough to store inline, and
 * means a 5MB phone photo never travels over a slow connection.
 */
async function toSquareDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)

  try {
    // Centre-crop to a square before scaling so faces are not stretched.
    const side = Math.min(bitmap.width, bitmap.height)
    const sx = (bitmap.width - side) / 2
    const sy = (bitmap.height - side) / 2

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not process that image')

    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    // WebP where supported; browsers that do not know it fall back to PNG,
    // which toDataURL signals by returning a data:image/png URL.
    return canvas.toDataURL('image/webp', 0.82)
  } finally {
    bitmap.close()
  }
}

interface AvatarUploadProps {
  /** Current picture, or null when the student is on initials. */
  value: string | null
  /** Fallback letter shown when there is no picture. */
  initial: string
  onChange: (dataUrl: string | null) => Promise<void>
}

export function AvatarUpload({ value, initial, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Shown immediately so the new picture appears before the request finishes.
  const [preview, setPreview] = useState<string | null>(null)

  const shown = preview ?? value

  async function handleFile(file: File) {
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setError('That image is very large. Please choose one under 8MB.')
      return
    }

    setBusy(true)
    try {
      const dataUrl = await toSquareDataUrl(file)
      setPreview(dataUrl)
      await onChange(dataUrl)
    } catch (err) {
      setPreview(null)
      setError(err instanceof Error ? err.message : 'That image could not be used.')
    } finally {
      setBusy(false)
      // Allow re-picking the same file after a failure.
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove() {
    setError(null)
    setBusy(true)
    try {
      setPreview(null)
      await onChange(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that picture.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label="Change profile picture"
        className="group relative shrink-0 cursor-pointer overflow-hidden rounded-full border-none p-0 disabled:cursor-wait"
        style={{ width: 72, height: 72, backgroundColor: 'var(--color-paper-3)' }}
      >
        {shown ? (
          // A data URL cannot be optimised by next/image, and this is a fixed
          // 72px avatar, so a plain img is the right call here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt="Your profile picture"
            width={72}
            height={72}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-[26px] font-semibold text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {initial}
          </span>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">
          <Camera size={20} color="currentColor" variant="Bold" />
        </span>
      </button>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? 'Saving…' : shown ? 'Change picture' : 'Upload picture'}
          </Button>

          {shown && !busy && (
            <Button variant="ghost" size="sm" onClick={() => void handleRemove()}>
              <Trash size={14} color="currentColor" variant="Linear" />
              Remove
            </Button>
          )}
        </div>

        <p className="mt-1.5 text-[12px] text-[var(--color-ink-3)]">
          {error ? (
            <span className="text-[var(--color-danger)]">{error}</span>
          ) : (
            'JPG, PNG or WebP. We crop it to a square for you.'
          )}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />
    </div>
  )
}
