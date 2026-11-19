"use client"

import type { ReactNode } from "react"
import {
  ArrowRight,
  Check,
  CreditCard,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import {
  PaymentBackLink,
  PaymentShell,
  paymentCardClasses,
} from "@/components/payment/payment-shell"

import { Button } from "@/components/ui/button"
import { formatPlanPrice, type ProPlan } from "@/lib/plans"
import { cn } from "@/lib/utils"

type CheckoutUser = {
  name: string
  email: string
}

function CardHeader({
  icon: Icon,
  eyebrow,
  title,
  headingId,
  aside,
}: {
  icon: LucideIcon
  eyebrow: string
  title: string
  headingId?: string
  aside?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25">
          <Icon className="size-5" aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
            {eyebrow}
          </p>

          <h2
            id={headingId}
            className="mt-1 truncate text-lg font-bold tracking-tight text-white sm:text-xl"
          >
            {title}
          </h2>
        </div>
      </div>

      {aside}
    </div>
  )
}

function ReadOnlyField({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-neutral-400 ring-1 ring-white/10">
        <Icon className="size-4" aria-hidden="true" />
      </span>

      <span className="min-w-0">
        <span className="block text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
          {label}
        </span>

        <span
          className="block truncate text-sm font-medium text-neutral-100"
          title={value}
        >
          {value}
        </span>
      </span>
    </div>
  )
}

function UserCard({ user }: { user: CheckoutUser }) {
  return (
    <section
      aria-labelledby="payment-user-heading"
      className={paymentCardClasses}
    >
      <CardHeader
        icon={UserRound}
        eyebrow="Billed to"
        title="Your information"
        headingId="payment-user-heading"
        aside={
          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-neutral-400">
            Read only
          </span>
        }
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ReadOnlyField
          icon={UserRound}
          label="Full name"
          value={user.name.trim() || "—"}
        />

        <ReadOnlyField
          icon={Mail}
          label="Email address"
          value={user.email.trim() || "—"}
        />
      </div>
    </section>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <dt className="shrink-0 text-neutral-400">{label}</dt>
      <dd
        className="truncate text-right font-medium text-neutral-100"
        title={value}
      >
        {value}
      </dd>
    </div>
  )
}

export function PaymentCheckout({
  plan,
  user,
}: {
  plan: ProPlan
  user: CheckoutUser
}) {
  return (
    <PaymentShell>
      <PaymentBackLink />

      <div className="mt-8 max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3.5 py-1.5 text-xs font-medium text-lime-200">
          <LockKeyhole className="size-3.5" aria-hidden="true" />
          Secure checkout
        </span>

        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          Review your payment
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-neutral-400 sm:text-base">
          Confirm your {plan.name} details before you continue.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        {/* Plan and User Information */}
        <div className="flex flex-col gap-6">
          <section
            aria-labelledby="payment-plan-heading"
            className={paymentCardClasses}
          >
            <CardHeader
              icon={CreditCard}
              eyebrow="Selected plan"
              title={plan.name}
              headingId="payment-plan-heading"
              aside={
                <span className="shrink-0 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-[11px] font-semibold text-lime-200">
                  {plan.billingPeriod}
                </span>
              }
            />

            <p className="mt-5 text-sm leading-relaxed text-neutral-400">
              {plan.description}
            </p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {plan.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2.5 text-sm text-neutral-300"
                >
                  <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-lime-400/15 text-lime-300 ring-1 ring-lime-400/25">
                    <Check
                      className="size-3"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  </span>

                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          <UserCard user={user} />
        </div>

        {/* Payment Summary */}
        <section
          aria-labelledby="payment-summary-heading"
          className={cn(paymentCardClasses, "lg:sticky lg:top-24")}
        >
          <CardHeader
            icon={Sparkles}
            eyebrow="Payment summary"
            title="Order details"
            headingId="payment-summary-heading"
          />

          <dl className="mt-6 space-y-3 border-b border-white/10 pb-6">
            <SummaryRow label="Plan" value={plan.name} />

            <SummaryRow label="Billing period" value={plan.billingPeriod} />

            <SummaryRow
              label="Plan price"
              value={`${formatPlanPrice(plan.price)} / ${plan.billingPeriod.toLowerCase()}`}
            />
          </dl>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-200">
                Total due today
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                USD · {plan.billingPeriod}
              </p>
            </div>

            <p className="text-3xl font-black tracking-tight text-lime-400 tabular-nums sm:text-4xl">
              {formatPlanPrice(plan.price)}
            </p>
          </div>

          {/* Stripe Checkout Form */}
          <form action="/api/checkout-sessions" method="POST" className="mt-6">
            <Button
              type="submit"
              className="h-12 w-full gap-2 rounded-full bg-lime-400 text-sm font-bold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-xl hover:shadow-lime-400/30 focus-visible:ring-4 focus-visible:ring-lime-400/40"
            >
              Pay Now
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </form>

          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-neutral-500">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-lime-400"
              aria-hidden="true"
            />
            Payments will be securely processed through Stripe.
          </p>
        </section>
      </div>
    </PaymentShell>
  )
}
