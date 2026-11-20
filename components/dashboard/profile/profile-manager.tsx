"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Camera,
  Check,
  Image as ImageIcon,
  Link2,
  Loader2,
  Pencil,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react"

import { RoleBadge } from "@/components/dashboard/role-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { notify, userMessage } from "@/lib/notify"
import type { ProfileUser } from "@/lib/profile"
import { cn } from "@/lib/utils"

type ImageMode = "keep" | "upload" | "url" | "remove"

type FormState = {
  name: string
  phone: string
}

type FormErrors = {
  name?: string
  phone?: string
  image?: string
}

const MAX_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{5,19}$/

const IMAGE_MODES: { value: ImageMode; label: string; icon: typeof Camera }[] = [
  { value: "keep", label: "Current", icon: Check },
  { value: "upload", label: "Upload", icon: UploadCloud },
  { value: "url", label: "Image URL", icon: Link2 },
  { value: "remove", label: "Remove", icon: Trash2 },
]

const labelClass =
  "block text-xs font-semibold tracking-wide text-neutral-400 uppercase"
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

function formatMemberSince(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function ProfileManager({ initialUser }: { initialUser: ProfileUser }) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialUser)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState<FormState>({
    name: initialUser.name,
    phone: initialUser.phone,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [imageMode, setImageMode] = useState<ImageMode>("keep")
  const [imageUrl, setImageUrl] = useState(initialUser.image ?? "")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [previewFailed, setPreviewFailed] = useState(false)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setObjectUrl(null)
    setSelectedFile(null)
  }, [])

  const resetForm = useCallback(
    (user: ProfileUser) => {
      releaseObjectUrl()
      setForm({ name: user.name, phone: user.phone })
      setErrors({})
      setImageMode("keep")
      setImageUrl(user.image ?? "")
      setPreviewFailed(false)
    },
    [releaseObjectUrl]
  )

  const startEditing = () => {
    resetForm(profile)
    setEditing(true)
  }

  const cancelEditing = () => {
    resetForm(profile)
    setEditing(false)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((current) => ({
        ...current,
        image: "Choose a JPG, PNG, WebP or GIF image.",
      }))
      return
    }

    if (file.size > MAX_FILE_BYTES) {
      setErrors((current) => ({
        ...current,
        image: "Images must be 5 MB or smaller.",
      }))
      return
    }

    releaseObjectUrl()
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setObjectUrl(url)
    setSelectedFile(file)
    setImageMode("upload")
    setPreviewFailed(false)
    setErrors((current) => ({ ...current, image: undefined }))
  }

  const previewSource =
    imageMode === "upload"
      ? objectUrl
      : imageMode === "url" && isValidHttpUrl(imageUrl.trim())
        ? imageUrl.trim()
        : imageMode === "keep"
          ? profile.image
          : null

  const validate = () => {
    const nextErrors: FormErrors = {}
    const name = form.name.trim()

    if (name.length < 2 || name.length > 80) {
      nextErrors.name = "Name must be between 2 and 80 characters."
    }

    const phone = form.phone.trim()
    if (phone && !PHONE_PATTERN.test(phone)) {
      nextErrors.phone = "Enter a valid phone number."
    }

    if (imageMode === "upload" && !selectedFile) {
      nextErrors.image = "Choose an image to upload."
    }

    if (imageMode === "url" && !isValidHttpUrl(imageUrl.trim())) {
      nextErrors.image = "Enter a valid http:// or https:// image URL."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving || uploading) return
    if (!validate()) return

    setSaving(true)

    try {
      let imageValue: string | null | undefined

      if (imageMode === "upload" && selectedFile) {
        setUploading(true)
        const uploadBody = new FormData()
        uploadBody.append("image", selectedFile)

        const uploadResponse = await fetch("/api/uploads/imgbb", {
          method: "POST",
          body: uploadBody,
        })
        const uploadData = (await uploadResponse.json().catch(() => null)) as
          | { url?: string; error?: string }
          | null

        if (!uploadResponse.ok || !uploadData?.url) {
          throw new Error(uploadData?.error || "Could not upload the image.")
        }

        imageValue = uploadData.url
        setUploading(false)
      } else if (imageMode === "url") {
        imageValue = imageUrl.trim()
      } else if (imageMode === "remove") {
        imageValue = null
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          ...(imageValue !== undefined ? { image: imageValue } : {}),
        }),
      })

      const data = (await response.json().catch(() => null)) as
        | { user?: ProfileUser; error?: string }
        | null

      if (!response.ok || !data?.user) {
        throw new Error(data?.error || "Could not update your profile.")
      }

      setProfile(data.user)
      resetForm(data.user)
      setEditing(false)

      // Keep the shared auth store and server-rendered dashboard in sync.
      await authClient
        .getSession({ query: { disableCookieCache: true } })
        .catch(() => null)
      router.refresh()

      notify.success("Updated successfully!", "Your profile has been saved.")
    } catch (error) {
      notify.error(
        "Could not update profile",
        userMessage(error, "Please try again.")
      )
    } finally {
      setUploading(false)
      setSaving(false)
    }
  }

  const busy = saving || uploading

  return (
    <section
      id="profile"
      className="rounded-xl border border-white/10 bg-neutral-950/60 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Profile details</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Keep your contact information up to date.
          </p>
        </div>

        {!editing ? (
          <Button
            type="button"
            onClick={startEditing}
            className="h-9 gap-2 rounded-xl border border-lime-400/25 bg-lime-400/10 px-4 text-xs font-semibold text-lime-200 hover:bg-lime-400/20"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Edit Profile
          </Button>
        ) : null}
      </div>

      {!editing ? (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <span className="relative">
              <UserAvatar user={profile} className="size-16 text-base" />
              {profile.image ? (
                <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border border-white/10 bg-neutral-900 text-lime-300">
                  <Camera className="size-3" aria-hidden="true" />
                </span>
              ) : null}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-base font-semibold text-white">
                  {profile.name || "—"}
                </p>
                <RoleBadge role={profile.role} />
              </div>
              <p className="mt-1 truncate text-xs text-neutral-400">
                {profile.email || "—"}
              </p>
            </div>
          </div>

          <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                Full Name
              </dt>
              <dd className="mt-1 text-sm font-medium text-neutral-100">
                {profile.name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                Email Address
              </dt>
              <dd className="mt-1 truncate text-sm font-medium text-neutral-100">
                {profile.email || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                Phone Number
              </dt>
              <dd className="mt-1 text-sm font-medium text-neutral-100">
                {profile.phone || "Not added"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                Profile Image
              </dt>
              <dd className="mt-1 text-sm font-medium text-neutral-100">
                {profile.image ? "Custom image" : "Default avatar"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                Account Role
              </dt>
              <dd className="mt-1">
                <RoleBadge role={profile.role} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                Member Since
              </dt>
              <dd className="mt-1 text-sm font-medium text-neutral-100">
                {formatMemberSince(profile.createdAt)}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="profile-name">
                Full Name
              </label>
              <Input
                id="profile-name"
                name="name"
                value={form.name}
                disabled={busy}
                aria-invalid={Boolean(errors.name)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className={fieldClass}
                placeholder="Your full name"
              />
              {errors.name ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-300">
                  <AlertCircle className="size-3.5" aria-hidden="true" />
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div>
              <label className={labelClass} htmlFor="profile-phone">
                Phone Number <span className="text-neutral-600">(optional)</span>
              </label>
              <Input
                id="profile-phone"
                name="phone"
                type="tel"
                value={form.phone}
                disabled={busy}
                aria-invalid={Boolean(errors.phone)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className={fieldClass}
                placeholder="+880 1700-000000"
              />
              {errors.phone ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-300">
                  <AlertCircle className="size-3.5" aria-hidden="true" />
                  {errors.phone}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-lime-300" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-white">Profile picture</h3>
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Profile picture method">
              {IMAGE_MODES.map((mode) => {
                const Icon = mode.icon
                const active = imageMode === mode.value
                return (
                  <button
                    key={mode.value}
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setImageMode(mode.value)
                      setPreviewFailed(false)
                      setErrors((current) => ({ ...current, image: undefined }))
                    }}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors disabled:opacity-50",
                      active
                        ? "border-lime-400/40 bg-lime-400/15 text-lime-200"
                        : "border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-white"
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {mode.label}
                  </button>
                )
              })}
            </div>

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
                  user={{ ...profile, image: null }}
                  className="size-20 text-lg"
                />
              )}

              <div className="min-w-0 flex-1 space-y-2">
                {imageMode === "upload" ? (
                  <>
                    <input
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(",")}
                      onChange={handleFileChange}
                      disabled={busy}
                      className="block w-full max-w-xs text-xs text-neutral-400 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-white/10 file:bg-white/5 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-neutral-200 hover:file:bg-white/10"
                    />
                    <p className="text-xs text-neutral-500">
                      JPG, PNG, WebP or GIF · up to 5 MB
                    </p>
                  </>
                ) : imageMode === "url" ? (
                  <>
                    <Input
                      type="url"
                      value={imageUrl}
                      disabled={busy}
                      aria-label="Profile image URL"
                      aria-invalid={Boolean(errors.image)}
                      onChange={(event) => {
                        setImageUrl(event.target.value)
                        setPreviewFailed(false)
                        setErrors((current) => ({ ...current, image: undefined }))
                      }}
                      className={fieldClass}
                      placeholder="https://example.com/photo.jpg"
                    />
                    <p className="text-xs text-neutral-500">
                      Paste a direct link to an image.
                    </p>
                  </>
                ) : imageMode === "remove" ? (
                  <p className="text-xs text-neutral-400">
                    Your current picture will be removed and the default avatar
                    will be shown.
                  </p>
                ) : (
                  <p className="text-xs text-neutral-400">
                    Keep your current profile picture unchanged.
                  </p>
                )}
              </div>
            </div>

            {errors.image ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-rose-300">
                <AlertCircle className="size-3.5" aria-hidden="true" />
                {errors.image}
              </p>
            ) : null}
            {previewFailed ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-rose-300">
                <AlertCircle className="size-3.5" aria-hidden="true" />
                The image could not be loaded. Check the link or choose a file.
              </p>
            ) : null}
            {uploading ? (
              <p className="mt-3 flex items-center gap-2 text-xs text-lime-200">
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Uploading image...
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              disabled={busy}
              onClick={cancelEditing}
              className="h-10 gap-2 rounded-xl border border-white/15 bg-transparent px-5 text-sm font-semibold text-neutral-300 hover:bg-white/5 hover:text-white"
            >
              <X className="size-4" aria-hidden="true" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="h-10 gap-2 rounded-xl border-transparent bg-lime-400 px-6 text-sm font-bold text-neutral-950 shadow-lg shadow-lime-400/20 hover:bg-lime-300"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="size-4" aria-hidden="true" />
              )}
              {uploading ? "Uploading..." : saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
