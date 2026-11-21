import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Check,
  Crown,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { formatPlanPrice, planList, type PlanId, type ProPlan } from "@/lib/plans"
import { cn } from "@/lib/utils"

/**
 * Home-page summary of the two existing plans. All plan data comes from
 * `lib/plans.ts` and the CTA goes through the existing /payment flow - there
 * is no separate checkout or subscription logic here.
 */
const freeHighlights: Record<PlanId, string[]> = {
  "pro-tutor": [
    "Post up to 2 tuition listings",
    "Appear in public browse results",
    "Receive and review applications",
  ],
  "pro-student": [
    "Browse all approved tuitions",
    "Apply to tuition posts",
    "Save up to 5 tuitions",
  ],
}

const planIcons: Record<PlanId, LucideIcon> = {
  "pro-tutor": GraduationCap,
  "pro-student": BookOpen,
}

const accents: Record<
  ProPlan["accent"],
  { card: string; badge: string; icon: string; pro: string; cta: string }
> = {
  lime: {
    card: "border-lime-400/25 bg-lime-400/[0.03]",
    badge: "border-lime-400/25 bg-lime-400/10 text-lime-200",
    icon: "bg-lime-400/10 text-lime-300 ring-lime-400/25",
    pro: "border-lime-400/30 bg-lime-400/[0.06]",
    cta: "bg-lime-400 text-neutral-950 shadow-lime-400/20 hover:bg-lime-300 hover:shadow-lime-400/30",
  },
  sky: {
    card: "border-sky-400/25 bg-sky-400/[0.03]",
    badge: "border-sky-400/25 bg-sky-400/10 text-sky-200",
    icon: "bg-sky-400/10 text-sky-300 ring-sky-400/25",
    pro: "border-sky-400/30 bg-sky-400/[0.06]",
    cta: "bg-sky-400 text-neutral-950 shadow-sky-400/20 hover:bg-sky-300 hover:shadow-sky-400/30",
  },
}

function PlanColumn({
  title,
  price,
  description,
  items,
  highlighted,
}: {
  title: string
  price: string
  description: string
  items: string[]
  highlighted?: boolean
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5",
        highlighted && "ring-1",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-lg font-black tracking-tight text-white tabular-nums">
          {price}
        </p>
      </div>
      <p className="mt-1 text-[11px] text-neutral-500">{description}</p>

      <ul className="mt-5 flex flex-1 flex-col gap-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-neutral-300"
          >
            <span
              className={cn(
                "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full ring-1",
                highlighted
                  ? "bg-lime-400/15 text-lime-300 ring-lime-400/25"
                  : "bg-white/10 text-neutral-300 ring-white/15",
              )}
            >
              <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Pricing() {
  return (
    <section
      aria-labelledby="home-pricing-heading"
      className="relative isolate overflow-hidden border-t border-white/10 bg-neutral-950 py-16 text-white sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 left-1/4 size-[30rem] rounded-full bg-lime-400/5 blur-[130px]" />
        <div className="absolute -right-40 -bottom-40 size-[28rem] rounded-full bg-sky-400/5 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm">
            <Sparkles className="size-3.5 shrink-0 text-lime-400" aria-hidden="true" />
            Free &amp; Pro plans
          </span>
          <h2
            id="home-pricing-heading"
            className="mt-6 text-3xl leading-[1.15] font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]"
          >
            Start free, upgrade when you need <span className="text-lime-400">more</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
            Tutors and students both get a free plan. Pro adds more posts,
            more applications and priority visibility.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {planList.map((plan) => {
            const Icon = planIcons[plan.id]
            const style = accents[plan.accent]

            return (
              <article
                key={plan.id}
                className={cn(
                  "flex h-full flex-col rounded-[2rem] border p-6 shadow-xl shadow-black/10 sm:p-8",
                  style.card,
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-xl ring-1",
                        style.icon,
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-400">
                        {plan.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                      style.badge,
                    )}
                  >
                    {plan.audience}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <PlanColumn
                    title="Free"
                    price="$0"
                    description="No payment required"
                    items={freeHighlights[plan.id]}
                  />
                  <div className={cn("rounded-2xl p-1", style.pro)}>
                    <PlanColumn
                      highlighted
                      title="Pro"
                      price={`${formatPlanPrice(plan.price)}/mo`}
                      description={plan.billingPeriod}
                      items={plan.benefits}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
                  <Link
                    href="/payment"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "group/button inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5",
                      style.cta,
                    )}
                  >
                    <Crown className="size-4" aria-hidden="true" />
                    Subscribe with Stripe
                    <ArrowRight
                      className="size-4 transition-transform group-hover/button:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Compare plans
                  </Link>
                </div>
                <p className="mt-3 text-center text-[11px] text-neutral-500">
                  Your plan is derived from your account role at checkout.
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
