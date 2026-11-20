"use client"

import {
  useCallback,
  useRef,
  useState,
  type FormEvent,
} from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Camera,
  Check,
  Loader2,
  Pencil,
  X,
} from "lucide-react"

import { RoleBadge } from "@/components/dashboard/role-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import {
  ProfileImageField,
  type ProfileImageFieldHandle,
} from "@/components/profile/profile-image-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { notify, userMessage } from "@/lib/notify"
import type { ProfileUser } from "@/lib/profile"

type FormState = {
  name: string
  phone: string
}

type FormErrors = {
  name?: string
  phone?: string
}

const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{5,19}$/

const labelClass =
  "block text-xs font-semibold tracking-wide text-neutral-400 uppercase"
const fieldClass =
  "mt-2 h-11 rounded-xl border-white/10 bg-white/[0.04] px-3.5 text-sm text-white placeholder:text-neutral-600 focus-visible:border-lime-400/40 focus-visible:ring-3 focus-visible:ring-lime-400/15"

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
  const [form, setForm] = useState<FormState>({
    name: initialUser.name,
    phone: initialUser.phone,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const imageFieldRef = useRef<ProfileImageFieldHandle>(null)

  const resetForm = useCallback((user: ProfileUser) => {
    setForm({ name: user.name, phone: user.phone })
    setErrors({})
    imageFieldRef.current?.reset()
  }, [])

  const startEditing = () => {
    resetForm(profile)
    setEditing(true)
  }

  const cancelEditing = () => {
    resetForm(profile)
    setEditing(false)
  }

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

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return
    if (!validate()) return
    if (imageFieldRef.current?.validate()) return

    setSaving(true)

    try {
      const image = imageFieldRef.current?.getImage()

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          ...(image?.changed ? { image: image.image } : {}),
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
      setSaving(false)
    }
  }

  const busy = saving

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

          <ProfileImageField
            ref={imageFieldRef}
            currentImage={profile.image}
            name={form.name}
            allowCurrent
            disabled={busy}
          />

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
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
