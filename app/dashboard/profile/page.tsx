import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, CheckCircle2, Crown, Sparkles } from "lucide-react"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { ProfileManager } from "@/components/dashboard/profile/profile-manager"
import { getPlanById } from "@/lib/plans"
import type { ProfileUser } from "@/lib/profile"
import { getRequestSession } from "@/lib/session"
import { getSubscriptionState } from "@/lib/subscription"

export default async function ProfilePage() {
  const session = await getRequestSession({ fresh: true })

  if (!session?.user) {
    redirect("/sign-in")
  }

  const user = session.user
  const subscription = await getSubscriptionState(user.id)
  const isPro = subscription?.isPro ?? false
  const proPlan = getPlanById(subscription?.planId ?? null)

  const profile: ProfileUser = {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? null,
    phone: user.phone ?? "",
    role: user.role ?? "Student",
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : (user.createdAt ?? null),
  }
  const renewalDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  return (
    <DashboardPage
      title="My Profile"
      description="Manage your personal details and review your current subscription."
    >
      <div className="mt-8 grid items-start gap-4 md:grid-cols-2">
        <ProfileManager initialUser={profile} />

        <section
          id="subscription"
          className="rounded-xl border border-white/10 bg-neutral-950/60 p-5"
        >
          <div className="flex items-center gap-2">
            {isPro ? (
              <Crown className="size-4.5 text-lime-300" aria-hidden="true" />
            ) : (
              <Sparkles
                className="size-4.5 text-neutral-400"
                aria-hidden="true"
              />
            )}
            <h2 className="text-sm font-semibold text-white">Subscription</h2>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                Current plan
              </p>
              <p className="mt-1 truncate text-lg font-bold text-white">
                {isPro ? (proPlan?.name ?? "Pro Plan") : "Free Plan"}
              </p>
            </div>
            <span
              className={
                isPro
                  ? "shrink-0 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-[11px] font-semibold text-lime-200"
                  : "shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-neutral-400"
              }
            >
              {isPro ? "Active" : "Free"}
            </span>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-neutral-400">
            <li className="flex items-center gap-2">
              <CheckCircle2
                className="size-4 shrink-0 text-lime-400"
                aria-hidden="true"
              />
              {isPro ? "Unlimited tuition posts" : "Up to 2 tuition posts"}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2
                className="size-4 shrink-0 text-lime-400"
                aria-hidden="true"
              />
              {isPro
                ? `Billed ${proPlan?.billingPeriod.toLowerCase() ?? "monthly"} via Stripe`
                : "No payment required"}
            </li>
            {isPro && renewalDate ? (
              <li className="flex items-center gap-2">
                <CheckCircle2
                  className="size-4 shrink-0 text-lime-400"
                  aria-hidden="true"
                />
                Renews on {renewalDate}
              </li>
            ) : null}
          </ul>

          {isPro ? null : (
            <Link
              href="/pricing"
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 text-sm font-bold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5 hover:bg-lime-300"
            >
              Upgrade to Pro
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </section>
      </div>
    </DashboardPage>
  )
}
