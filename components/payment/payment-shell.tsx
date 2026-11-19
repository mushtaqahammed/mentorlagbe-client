import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import type { ReactNode } from "react"

export const paymentCardClasses =
  "rounded-[2rem] border border-white/10 bg-neutral-900/70 p-6 shadow-xl shadow-black/20 sm:p-8"

export function PaymentShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-neutral-950 py-12 text-white sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 left-1/4 size-[30rem] rounded-full bg-lime-400/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 size-[28rem] rounded-full bg-sky-400/5 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </main>
  )
}

export function PaymentBackLink() {
  return (
    <Link
      href="/pricing"
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-lime-400/40 hover:text-white focus-visible:ring-4 focus-visible:ring-lime-400/20 focus-visible:outline-none"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to Pricing
    </Link>
  )
}
