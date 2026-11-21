"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
} from "react"
import {
  AlertCircle,
  Check,
  Image as ImageIcon,
  Link2,
  Loader2,
  Trash2,
  UploadCloud,
  type LucideIcon,
} from "lucide-react"

import { UserAvatar } from "@/components/dashboard/user-avatar"
import { Input } from "@/components/ui/input"
import { notify, userMessage } from "@/lib/notify"
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

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]

function isValidHttpUrl(value: string) {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

/** Upload to the signup-safe endpoint; the ImgBB key stays on the server. */
async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("image", file)

  const response = await fetch("/api/uploads/profile-image", {
    method: "POST",
    body: formData,
  })

  const result = (await response.json().catch(() => null)) as
    | { url?: string; error?: string }
    | null

  if (!response.ok || !result?.url) {
    throw new Error(result?.error || "Image upload failed.")
  }

  return result.url
}

/**
 * Shared profile-picture field used by the registration form and the
 * dashboard profile editor. It owns its preview/validation state; callers only
 * need `validate()` and `getImage()` when their form is submitted.
 *
 * `allowUpload` is opt-in so the existing URL-only profile editor is unchanged.
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
    /** Show a file picker that uploads to ImgBB (registration only). */
    allowUpload?: boolean
    /** Notifies the parent form while an upload is in flight. */
    onUploadingChange?: (uploading: boolean) => void
    disabled?: boolean
  }
>(function ProfileImageField(
  {
    currentImage = null,
    name = "User",
    allowCurrent = false,
    allowUpload = false,
    onUploadingChange,
    disabled = false,
  },
  ref
) {
  const initialMode: ImageMode = allowCurrent ? "keep" : "none"
  const [mode, setMode] = useState<ImageMode>(initialMode)
  const [url, setUrl] = useState("")
  const [previewFailed, setPreviewFailed] = useState(false)
  const [error, setError] = useState<string>()

  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<string | null>(null)

  useEffect(() => {
    const preview = previewRef
    return () => {
      if (preview.current) URL.revokeObjectURL(preview.current)
    }
  }, [])

  useEffect(() => {
    onUploadingChange?.(uploading)
  }, [uploading, onUploadingChange])

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
      // Registration must not continue while an upload is running or failed.
      if (allowUpload) {
        if (uploading) {
          const message =
            "Please wait for your profile picture to finish uploading."
          setError(message)
          return message
        }

        if (selectedFile && !uploadedUrl) {
          const message =
            "Your profile picture could not be uploaded. Choose another image."
          setError(message)
          return message
        }
      }

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
      if (allowUpload) {
        if (previewRef.current) {
          URL.revokeObjectURL(previewRef.current)
          previewRef.current = null
        }
        setSelectedFile(null)
        setUploadedUrl(null)
        setLocalPreview(null)
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    },
  }))

  const changeMode = (next: ImageMode) => {
    setMode(next)
    setPreviewFailed(false)
    setError(undefined)
  }

  function clearSelectedFile(keepUrl = false) {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = null
    }
    setLocalPreview(null)
    setSelectedFile(null)
    setUploadedUrl(null)
    if (!keepUrl) setUrl("")
    setPreviewFailed(false)
    setError(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Allow picking the same file again after a failed upload.
    event.target.value = ""
    if (!file || disabled) return

    setError(undefined)
    setPreviewFailed(false)

    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      notify.warning("Invalid image", "Choose a JPG, PNG, WebP or GIF file.")
      return
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      notify.warning("Image too large", "Profile images must be 5 MB or smaller.")
      return
    }

    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const objectUrl = URL.createObjectURL(file)
    previewRef.current = objectUrl
    setLocalPreview(objectUrl)
    setSelectedFile(file)
    setUploadedUrl(null)
    setUrl("")

    setUploading(true)
    const uploadToast = notify.loading("Uploading profile picture...")
    try {
      const uploaded = await uploadProfileImage(file)
      setUploadedUrl(uploaded)
      setUrl(uploaded)
      setPreviewFailed(false)
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
        previewRef.current = null
      }
      setLocalPreview(null)
      notify.dismiss(uploadToast)
      notify.success("Profile picture uploaded", "Your new picture is ready.")
    } catch (uploadError) {
      notify.dismiss(uploadToast)
      const message = userMessage(
        uploadError,
        "Could not upload your profile picture."
      )
      setError(message)
      notify.error("Upload failed", message)
    } finally {
      setUploading(false)
    }
  }

  const urlPreview = isValidHttpUrl(url.trim()) ? url.trim() : null
  const savedPreview =
    !allowCurrent || mode === "url"
      ? (urlPreview ?? currentImage)
      : mode === "keep"
        ? currentImage
        : null
  const previewSource = localPreview ?? savedPreview

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
          {allowUpload ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_UPLOAD_TYPES.join(",")}
                onChange={handleFileChange}
                disabled={disabled || uploading}
                className="sr-only"
                aria-label="Upload profile picture"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-neutral-200 transition-colors hover:border-lime-400/40 hover:text-lime-200 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2
                      className="size-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <UploadCloud className="size-3.5" aria-hidden="true" />
                  )}
                  {uploading
                    ? "Uploading..."
                    : selectedFile
                      ? "Change image"
                      : "Upload image"}
                </button>
                {selectedFile ? (
                  <button
                    type="button"
                    disabled={disabled || uploading}
                    onClick={() => clearSelectedFile()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-neutral-400 transition-colors hover:border-rose-400/30 hover:text-rose-300 disabled:opacity-50"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    Remove
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-neutral-500">
                {uploading
                  ? "Uploading your picture to ImgBB..."
                  : uploadedUrl
                    ? "Uploaded to ImgBB and ready to save."
                    : selectedFile
                      ? selectedFile.name
                      : "JPG, PNG, WebP or GIF, up to 5 MB."}
              </p>
            </>
          ) : null}

          {!allowCurrent || mode === "url" ? (
            <>
              <Input
                type="url"
                value={url}
                disabled={disabled || uploading}
                aria-label="Profile image URL"
                aria-invalid={Boolean(error)}
                onChange={(event) => {
                  setUrl(event.target.value)
                  setPreviewFailed(false)
                  setError(undefined)
                  // A manually entered URL replaces the uploaded picture.
                  if (allowUpload && selectedFile) clearSelectedFile(true)
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
