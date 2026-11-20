"use client"

import { forwardRef, useImperativeHandle, useState } from "react"
import {
  AlertCircle,
  Check,
  Image as ImageIcon,
  Link2,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import { UserAvatar } from "@/components/dashboard/user-avatar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ImageMode = "keep" | "none" | "url" | "remove"

export type ProfileImageFieldHandle = {
  /** Validate the URL and surface any inline error. */
  validate: () => string | undefined
  /** The selected image value, ready to save with the form. */
  getImage: () => { changed: boolean; image: string | null }
  /** Restore the initial state (used when editing is cancelled). */
  reset: () => void
}

const fieldClass =
  "mt-2 h-11 rounded-xl border-white/10 bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-neutral-600 focus-visible:border-lime-400/40 focus-visible:ring-3 focus-visible:ring-lime-400/15"

function isValidHttpUrl(value: string) {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Shared profile-picture URL field used by the registration form and the
 * dashboard profile editor. It owns its preview/validation state; callers only
 * need `validate()` and `getImage()` when their form is submitted.
 */
export const ProfileImageField = forwardRef<
  ProfileImageFieldHandle,
  {
    /** Existing image on the Update Profile page. */
    currentImage?: string | null
    /** Used for the initials fallback avatar. */
    name?: string
    /** Show "Current"/"Remove" modes instead of "None". */
    allowCurrent?: boolean
    disabled?: boolean
  }
>(function ProfileImageField(
  { currentImage = null, name = "User", allowCurrent = false, disabled = false },
  ref
) {
  const initialMode: ImageMode = allowCurrent ? "keep" : "none"
  const [mode, setMode] = useState<ImageMode>(initialMode)
  const [url, setUrl] = useState("")
  const [previewFailed, setPreviewFailed] = useState(false)
  const [error, setError] = useState<string>()

  // Registration has no existing picture to switch between, so it just shows
  // a single, always-visible URL input.
  const modes: { value: ImageMode; label: string; icon: LucideIcon }[] =
    allowCurrent
      ? [
          { value: "keep", label: "Current", icon: Check },
          { value: "url", label: "Image URL", icon: Link2 },
          { value: "remove", label: "Remove", icon: Trash2 },
        ]
      : []

  useImperativeHandle(ref, () => ({
    validate() {
      const shouldValidate = allowCurrent ? mode === "url" : Boolean(url.trim())
      const message =
        shouldValidate && !isValidHttpUrl(url.trim())
          ? "Enter a valid http:// or https:// image URL."
          : undefined

      setError(message)
      return message
    },

    getImage() {
      if (!allowCurrent) {
        return isValidHttpUrl(url.trim())
          ? { changed: true, image: url.trim() }
          : { changed: false, image: null }
      }

      if (mode === "url") return { changed: true, image: url.trim() }
      if (mode === "remove") return { changed: true, image: null }
      return { changed: false, image: null }
    },

    reset() {
      setMode(initialMode)
      setUrl("")
      setPreviewFailed(false)
      setError(undefined)
    },
  }))

  const changeMode = (next: ImageMode) => {
    setMode(next)
    setPreviewFailed(false)
    setError(undefined)
  }

  const urlPreview = isValidHttpUrl(url.trim()) ? url.trim() : null
  const previewSource =
    !allowCurrent || mode === "url"
      ? (urlPreview ?? currentImage)
      : mode === "keep"
        ? currentImage
        : null

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="size-4 text-lime-300" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-white">Profile picture</h3>
        <span className="text-xs text-neutral-500">(optional)</span>
      </div>

      {allowCurrent ? (
        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Profile picture method"
        >
          {modes.map((item) => {
            const Icon = item.icon
            const active = mode === item.value
            return (
              <button
                key={item.value}
                type="button"
                disabled={disabled}
                onClick={() => changeMode(item.value)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors disabled:opacity-50",
                  active
                    ? "border-lime-400/40 bg-lime-400/15 text-lime-200"
                    : "border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-white"
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {item.label}
              </button>
            )
          })}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {previewSource && !previewFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewSource}
            alt="Profile picture preview"
            onError={() => setPreviewFailed(true)}
            className="size-20 shrink-0 rounded-full border border-white/10 object-cover"
          />
        ) : (
          <UserAvatar
            user={{ name, image: null }}
            className="size-20 text-lg"
          />
        )}

        <div className="min-w-0 flex-1 space-y-2">
          {!allowCurrent || mode === "url" ? (
            <>
              <Input
                type="url"
                value={url}
                disabled={disabled}
                aria-label="Profile image URL"
                aria-invalid={Boolean(error)}
                onChange={(event) => {
                  setUrl(event.target.value)
                  setPreviewFailed(false)
                  setError(undefined)
                }}
                className={fieldClass}
                placeholder="https://example.com/photo.jpg"
              />
              <p className="text-xs text-neutral-500">
                Paste a direct link to an image.
              </p>
            </>
          ) : mode === "remove" ? (
            <p className="text-xs text-neutral-400">
              Your current picture will be removed and the default avatar will
              be shown.
            </p>
          ) : (
            <p className="text-xs text-neutral-400">
              Keep your current profile picture unchanged.
            </p>
          )}
        </div>
      </div>

      {error ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-rose-300">
          <AlertCircle className="size-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : null}
      {previewFailed ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-rose-300">
          <AlertCircle className="size-3.5" aria-hidden="true" />
          The image could not be loaded. Check the link or use the default avatar.
        </p>
      ) : null}
    </div>
  )
})
