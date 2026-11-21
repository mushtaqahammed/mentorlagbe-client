"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import {
  AuthInput,
  AuthSelect,
  AuthShell,
  Divider,
  GoogleButton,
  SubmitButton,
} from "@/components/auth/auth-form"
import {
  ProfileImageField,
  type ProfileImageFieldHandle,
} from "@/components/profile/profile-image-field"

import { authClient } from "@/lib/auth-client"
import { notify } from "@/lib/notify"

type SignUpData = {
  name: string
  email: string
  password: string
  role: string
  image?: string
}

const ROLES = ["Student", "Tutor"] as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignUpPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [pending, setPending] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageFieldRef = useRef<ProfileImageFieldHandle>(null)
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  }, [])

  async function handleSignUp(data: SignUpData) {
    setPending(true)

    try {
      const { error: signUpError } = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        // Custom field declared in lib/auth.ts (user.additionalFields).
        role: data.role,
        // Saved with the account itself, so no follow-up request is needed.
        image: data.image,
      })

      if (signUpError) {
        notify.error(
          "Sign up failed",
          signUpError.message ?? "Please try again."
        )
        return
      }

      // Sign-up signals the shared session atom, so the navbar picks up the
      // new user and image without a second session request here.
      notify.success("Account created successfully!", {
        description: "Redirecting you home...",
      })

      redirectTimerRef.current = setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 1500)
    } catch {
      notify.error("Sign up failed", "Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // The profile picture must finish uploading (or be explicitly skipped)
    // before registration is allowed to start.
    if (pending || uploadingImage) return

    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData) as Record<string, string>

    if (!data.name?.trim()) {
      notify.warning("Missing details", "Full name is required.")
      return
    }

    if (!data.email?.trim()) {
      notify.warning("Missing details", "Email is required.")
      return
    }

    if (!EMAIL_PATTERN.test(data.email.trim())) {
      notify.warning("Invalid email", "Please enter a valid email address.")
      return
    }

    if (!data.password || data.password.length < 8) {
      notify.warning(
        "Weak password",
        "Password must be at least 8 characters long."
      )
      return
    }

    if (!data.role || !ROLES.includes(data.role as (typeof ROLES)[number])) {
      notify.warning(
        "Missing details",
        "Please select whether you are a Student or a Tutor."
      )
      return
    }

    if (imageFieldRef.current?.validate()) return

    const image = imageFieldRef.current?.getImage()

    await handleSignUp({
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      role: data.role,
      image: image?.changed && image.image ? image.image : undefined,
    })
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join MentorLagbe as a student or a tutor."
      footer={
        <p className="text-center text-sm text-neutral-400">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-lime-400 transition-colors hover:text-lime-300 hover:underline hover:underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <AuthInput
          label="Full Name"
          id="name"
          name="name"
          type="text"
          icon="user"
          placeholder="Jane Doe"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <AuthInput
          label="Email"
          id="email"
          name="email"
          type="email"
          icon="mail"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <AuthSelect
          label="I am a"
          id="role"
          name="role"
          defaultValue="Student"
          required
        >
          <option value="Student">Student</option>
          <option value="Tutor">Tutor</option>
        </AuthSelect>

        <AuthInput
          label="Password"
          id="password"
          name="password"
          type="password"
          icon="lock"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          minLength={8}
        />

        <ProfileImageField
          ref={imageFieldRef}
          name={name || "User"}
          disabled={pending}
          allowUpload
          onUploadingChange={setUploadingImage}
        />

        <SubmitButton disabled={pending || uploadingImage}>
          {uploadingImage ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Uploading image...
            </>
          ) : pending ? (
            "Creating account..."
          ) : (
            "Sign Up"
          )}
        </SubmitButton>
      </form>

      <Divider />

      <GoogleButton
        onClick={async () => {
          try {
            await authClient.signIn.social({
              provider: "google",
              callbackURL: "/",
            })
          } catch {
            notify.error(
              "Sign in failed",
              "Something went wrong. Please try again."
            )
          }
        }}
      />
    </AuthShell>
  )
}
