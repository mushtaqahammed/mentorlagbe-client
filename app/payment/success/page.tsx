import Link from "next/link"
import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react"

import { PaymentAccessGate } from "@/components/payment/payment-access-gate"
import { PaymentConfirmation } from "@/components/payment/payment-confirmation"
import {
  PaymentBackLink,
  PaymentShell,
  paymentCardClasses,
} from "@/components/payment/payment-shell"
import { buttonVariants } from "@/components/ui/button"
import { formatPlanPrice, getPlanForRole } from "@/lib/plans"
import { getRequestSession } from "@/lib/session"
import { getSubscriptionState } from "@/lib/subscription"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Payment Successful | MentorLagbe",
  description: "Your MentorLagbe Pro subscription checkout is complete.",
}

type PaymentSuccessPageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const { session_id: sessionIdParam } = await searchParams
  const sessionId = Array.isArray(sessionIdParam)
    ? sessionIdParam[0]
    : sessionIdParam

  const session = await getRequestSession({ fresh: true })
  const user = session?.user

  if (!user) {
    return <PaymentAccessGate reason="sign-in" />
  }

  const plan = getPlanForRole(user.role)

  if (!plan) {
    return <PaymentAccessGate reason="role" />
  }

  const subscription = await getSubscriptionState(user.id)
  const isPro = subscription.isPro
  const isTutor = (user.role ?? "").trim().toLowerCase() === "tutor"
  const statusLabel = isPro
    ? "Subscription active"
    : sessionId
      ? "Confirming payment"
      : "Verification needed"
  const heading = isPro
    ? "You're all set!"
    : sessionId
      ? "Almost there!"
      : "Payment not verified"
  const description = isPro
    ? `Your ${plan.name} subscription is active.`
    : sessionId
      ? `Your ${plan.name} checkout is complete. We're confirming it with Stripe now.`
      : `We couldn't find a payment reference for this page. If you were charged, contact support.`
  const renewalDate =
    isPro && subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null

  return (
    <PaymentShell>
      <PaymentBackLink />

      <div className="mx-auto mt-10 max-w-2xl">
        <section className={`${paymentCardClasses} text-center`}>
          <span
            className={cn(
              "mx-auto flex size-14 items-center justify-center rounded-2xl ring-1",
              isPro || sessionId
                ? "bg-lime-400/10 text-lime-300 ring-lime-400/25"
                : "bg-rose-400/10 text-rose-300 ring-rose-400/25"
            )}
          >
            {isPro || sessionId ? (
              <CheckCircle2 className="size-7" aria-hidden="true" />
            ) : (
              <AlertCircle className="size-7" aria-hidden="true" />
            )}
          </span>

          <span
            className={cn(
              "mt-6 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide uppercase",
              isPro || sessionId
                ? "border-lime-400/25 bg-lime-400/10 text-lime-200"
                : "border-rose-400/25 bg-rose-400/10 text-rose-200"
            )}
          >
            {statusLabel}
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            {heading}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-400">
            {description}
          </p>

          <PaymentConfirmation
            sessionId={sessionId}
            initialIsPro={isPro}
            isTutor={isTutor}
          />

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25">
                <CreditCard className="size-5" aria-hidden="true" />
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                  Subscription
                </p>
                <p className="mt-1 truncate text-base font-bold text-white">
                  {plan.name}
                </p>
              </div>

              <span className="ml-auto shrink-0 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-[11px] font-semibold text-lime-200">
                {plan.billingPeriod}
              </span>
            </div>

            <dl className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="shrink-0 text-neutral-400">Billed to</dt>
                <dd
                  className="truncate text-right font-medium text-neutral-100"
                  title={user.email}
                >
                  {user.email}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="shrink-0 text-neutral-400">Total</dt>
                <dd className="text-right font-bold text-lime-400 tabular-nums">
                  {formatPlanPrice(plan.price)} /{" "}
                  {plan.billingPeriod.toLowerCase()}
                </dd>
              </div>
              {renewalDate ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="shrink-0 text-neutral-400">Renews on</dt>
                  <dd className="text-right font-medium text-neutral-100">
                    {renewalDate}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-full bg-lime-400 px-6 text-sm font-bold text-neutral-950 shadow-lg shadow-lime-400/20 hover:bg-lime-300"
              )}
            >
              Go to Dashboard
            </Link>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-11 rounded-full border-white/10 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10"
              )}
            >
              View Pricing
            </Link>
          </div>
        </section>
      </div>
    </PaymentShell>
  )
}
