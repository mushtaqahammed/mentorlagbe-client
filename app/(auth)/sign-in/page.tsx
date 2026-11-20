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
import { notify } from "@/lib/notify"

type SignInData = {
  email: string
  password: string
}

export default function SignInPage() {
  const router = useRouter()

  const [pending, setPending] = useState(false)

  const handleSignIn = async (data: SignInData) => {
    setPending(true)

    try {
      const { error: signInError } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/",
      })

      if (signInError) {
        notify.error(
          "Sign in failed",
          signInError.message ?? "Invalid email or password."
        )
        return
      }

      // Refresh the shared session so the navbar immediately uses the
      // authenticated user's picture (not a stale cached session).
      await authClient
        .getSession({ query: { disableCookieCache: true } })
        .catch(() => null)

      notify.success("Welcome back!")
      router.push("/")
      router.refresh()
    } catch {
      notify.error("Sign in failed", "Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    const email = formData.get("email")?.toString().trim() ?? ""
    const password = formData.get("password")?.toString() ?? ""

    if (!email || !password) {
      notify.warning("Missing details", "Please enter your email and password.")
      return
    }

    await handleSignIn({ email, password })
  }

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      })
    } catch {
      notify.error("Sign in failed", "Something went wrong. Please try again.")
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your MentorLagbe account."
      footer={
        <p className="text-center text-sm text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-lime-400 transition-colors hover:text-lime-300 hover:underline hover:underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <SubmitButton disabled={pending}>
          {pending ? "Signing in..." : "Sign In"}
        </SubmitButton>
      </form>

      <Divider />

      <GoogleButton onClick={handleGoogleSignIn} />
    </AuthShell>
  )
}
