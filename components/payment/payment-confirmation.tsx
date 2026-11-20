"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { notify, userMessage } from "@/lib/notify"
import { cn } from "@/lib/utils"

type ConfirmStatus = "confirming" | "active" | "error"

const MISSING_SESSION_MESSAGE =
  "We couldn't find a payment reference for this page. If you were charged, contact support."

export function PaymentConfirmation({
  sessionId,
  initialIsPro = false,
  isTutor = false,
}: {
  sessionId?: string
  initialIsPro?: boolean
  isTutor?: boolean
}) {
  const router = useRouter()
  const [status, setStatus] = useState<ConfirmStatus>(
    sessionId ? "confirming" : initialIsPro ? "active" : "error"
  )
  const [message, setMessage] = useState(
    sessionId || initialIsPro ? "" : MISSING_SESSION_MESSAGE
  )
  const [attempt, setAttempt] = useState(0)

  const activeMessage = isTutor
    ? "Pro access is active. You can post unlimited tuitions now."
    : "Pro access is active. You now receive priority booking."

  useEffect(() => {
    if (!sessionId) return

    let cancelled = false

    async function confirm() {
      try {
        const response = await fetch("/api/subscription/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })
        const data = (await response.json().catch(() => ({}))) as {
          error?: string
          isPro?: boolean
        }

        if (!response.ok) {
          throw new Error(data.error || "Could not verify your subscription.")
        }

        if (data.isPro !== true) {
          throw new Error(
            "Stripe has not confirmed an active subscription yet. Please retry in a moment."
          )
        }

        // Update Better Auth's shared session store so the navbar, dashboard
        // and tuition form see Pro without a sign-out/sign-in cycle.
        await authClient.getSession({ query: { disableCookieCache: true } })

        if (!cancelled) {
          setStatus("active")
          notify.success("Subscription activated!", activeMessage)
          router.refresh()
        }
      } catch (error) {
        if (!cancelled) {
          const text = userMessage(error, "Could not verify your subscription.")
          setStatus("error")
          setMessage(text)
          notify.error("Verification failed", text)
        }
      }
    }

    confirm()

    return () => {
      cancelled = true
    }
  }, [sessionId, router, attempt, activeMessage])

  const styles =
    status === "active"
      ? "border-lime-400/25 bg-lime-400/10 text-lime-100"
      : status === "error"
        ? "border-rose-400/25 bg-rose-400/10 text-rose-100"
        : "border-white/10 bg-white/5 text-neutral-300"

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 rounded-xl border px-4 py-3 text-xs leading-relaxed",
        styles
      )}
    >
      {status === "confirming" ? (
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : null}
      {status === "active" ? (
        <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
      ) : null}
      {status === "error" ? (
        <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
      ) : null}

      <span>
        {status === "active"
          ? activeMessage
          : status === "error"
            ? message
            : "Verifying your subscription with Stripe…"}
      </span>

      {status === "error" && sessionId ? (
        <button
          type="button"
          onClick={() => {
            setMessage("")
            setStatus("confirming")
            setAttempt((value) => value + 1)
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/30 px-3 py-1 font-semibold text-rose-50 transition-colors hover:bg-rose-300/10 focus-visible:ring-2 focus-visible:ring-rose-300/40 focus-visible:outline-none"
        >
          <RefreshCw className="size-3" aria-hidden="true" />
          Retry
        </button>
      ) : null}
    </div>
  )
}
