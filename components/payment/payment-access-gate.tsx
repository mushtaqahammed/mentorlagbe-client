import Link from "next/link"
import { LockKeyhole, ShieldAlert } from "lucide-react"

import {
  PaymentBackLink,
  PaymentShell,
  paymentCardClasses,
} from "@/components/payment/payment-shell"

export function PaymentAccessGate({ reason }: { reason: "sign-in" | "role" }) {
  const needsSignIn = reason === "sign-in"

  return (
    <PaymentShell>
      <PaymentBackLink />

      <div className="mx-auto mt-10 max-w-xl">
        <section className={`${paymentCardClasses} text-center`}>
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25">
            {needsSignIn ? (
              <LockKeyhole className="size-6" aria-hidden="true" />
            ) : (
              <ShieldAlert className="size-6" aria-hidden="true" />
            )}
          </span>

          <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
            {needsSignIn
              ? "Sign in to continue"
              : "Plan unavailable for your role"}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
            {needsSignIn
              ? "You need to be signed in before you can review a Pro plan and continue to payment."
              : "Only Tutor and Student accounts can purchase a Pro plan. Please contact support if your role looks incorrect."}
          </p>

          {needsSignIn ? (
            <Link
              href="/sign-in"
              className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-lime-400 px-6 text-sm font-bold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5 hover:bg-lime-300 focus-visible:ring-4 focus-visible:ring-lime-400/40 focus-visible:outline-none"
            >
              Go to Sign In
            </Link>
          ) : null}
        </section>
      </div>
    </PaymentShell>
  )
}
