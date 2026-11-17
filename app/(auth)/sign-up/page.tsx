"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  AuthInput,
  AuthShell,
  Divider,
  GoogleButton,
  SubmitButton,
} from "@/components/auth/auth-form"

import { authClient } from "@/lib/auth-client"

type SignUpData = {
  name: string
  email: string
  password: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignUpPage() {
  const router = useRouter()

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSignUp(data: SignUpData) {
    setPending(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: signUpError } = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,

        // Callback URL
        callbackURL: "/",
      })

      if (signUpError) {
        setError(signUpError.message ?? "Sign up failed.")
        return
      }

      setSuccess("Account created successfully! Redirecting...")

      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 1500)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError(null)
    setSuccess(null)

    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData) as Record<string, string>

    if (!data.name?.trim()) {
      setError("Full name is required.")
      return
    }

    if (!data.email?.trim()) {
      setError("Email is required.")
      return
    }

    if (!EMAIL_PATTERN.test(data.email.trim())) {
      setError("Please enter a valid email address.")
      return
    }

    if (!data.password || data.password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    console.log("Sign-up form data:", {
      name: data.name.trim(),
      email: data.email.trim(),
      password: "[REDACTED]",
    })

    await handleSignUp({
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
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

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm font-medium text-lime-400" role="status">
            {success}
          </p>
        )}

        <SubmitButton disabled={pending}>
          {pending ? "Creating account..." : "Sign Up"}
        </SubmitButton>
      </form>

      <Divider />

      <GoogleButton onClick={() => console.log("Google sign-up clicked")} />
    </AuthShell>
  )
}
