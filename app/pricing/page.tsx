import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Check,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  formatPlanPrice,
  getPlanForRole,
  planList,
  type PlanId,
  type ProPlan,
} from "@/lib/plans"
import { getRequestSession } from "@/lib/session"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Pricing | MentorLagbe",
  description: "Choose a MentorLagbe Pro plan for tutors and students.",
}

const planIcons: Record<PlanId, LucideIcon> = {
  "pro-tutor": GraduationCap,
  "pro-student": BookOpen,
}

const accentStyles: Record<
  ProPlan["accent"],
  {
    card: string
    icon: string
    badge: string
    check: string
    cta: string
  }
> = {
  lime: {
    card: "border-lime-400/30 bg-lime-400/[0.04] shadow-lime-400/5",
    icon: "bg-lime-400/10 text-lime-300 ring-lime-400/25",
    badge: "border-lime-400/25 bg-lime-400/10 text-lime-200",
    check: "bg-lime-400/15 text-lime-300 ring-lime-400/25",
    cta: "bg-lime-400 text-neutral-950 shadow-lime-400/20 hover:bg-lime-300 hover:shadow-lime-400/30",
  },
  sky: {
    card: "border-sky-400/30 bg-sky-400/[0.04] shadow-sky-400/5",
    icon: "bg-sky-400/10 text-sky-300 ring-sky-400/25",
    badge: "border-sky-400/25 bg-sky-400/10 text-sky-200",
    check: "bg-sky-400/15 text-sky-300 ring-sky-400/25",
    cta: "bg-sky-400 text-neutral-950 shadow-sky-400/20 hover:bg-sky-300 hover:shadow-sky-400/30",
  },
}

export default async function PricingPage() {
  const session = await getRequestSession()
  const rolePlan = session ? getPlanForRole(session.user.role) : null

  return (
    <main className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-neutral-950 py-16 text-white sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 left-1/4 size-[30rem] rounded-full bg-lime-400/10 blur-[130px]" />
        <div className="absolute -right-40 -bottom-40 size-[28rem] rounded-full bg-sky-400/5 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3.5 py-1.5 text-xs font-medium text-lime-200">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Simple monthly pricing
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Choose the Pro plan that fits you
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400 sm:text-base">
            Upgrade to unlock more of MentorLagbe, whether you teach or learn.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {planList.map((plan) => {
            const Icon = planIcons[plan.id]
            const styles = accentStyles[plan.accent]
            const canContinue = !session?.user || rolePlan?.id === plan.id

            return (
              <article
                key={plan.id}
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-6 shadow-xl shadow-black/20 sm:p-8",
                  styles.card
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl ring-1",
                      styles.icon
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold",
                      styles.badge
                    )}
                  >
                    {plan.audience}
                  </span>
                </div>

                <h2 className="mt-6 text-2xl font-bold tracking-tight">
                  {plan.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {plan.description}
                </p>

                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-black tracking-tight text-white tabular-nums">
                    {formatPlanPrice(plan.price)}
                  </span>
                  <span className="text-sm text-neutral-400">
                    / {plan.billingPeriod.toLowerCase()}
                  </span>
                </p>

                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {plan.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2.5 text-sm text-neutral-300"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full ring-1",
                          styles.check
                        )}
                      >
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

                {canContinue ? (
                  <Link
                    href="/payment"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "group/button mt-8 h-11 w-full rounded-full text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5",
                      styles.cta
                    )}
                  >
                    Continue to payment
                    <ArrowRight
                      className="size-4 transition-transform group-hover/button:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                ) : (
                  <div className="mt-8 flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-medium text-neutral-500">
                    {plan.id === "pro-tutor"
                      ? "Tutor accounts only"
                      : "Student accounts only"}
                  </div>
                )}
              </article>
            )
          })}
        </div>

        <p className="mt-8 text-center text-xs text-neutral-500">
          Payments will be securely processed through Stripe.
        </p>
      </div>
    </main>
  )
}
