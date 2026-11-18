"use client"

import React from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Crown,
  FileText,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import {
  StatCard,
  StatSkeleton,
  formatCount,
  formatPlan,
} from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import { getTutorStats, type TutorStats } from "@/lib/actions/tuition"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export function TutorDashboard() {
  const [stats, setStats] = React.useState<TutorStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [refreshKey, setRefreshKey] = React.useState(0)

  React.useEffect(() => {
    async function loadStats() {
      setLoading(true)
      setError("")

      try {
        const { data: session, error: sessionError } =
          await authClient.getSession()

        if (sessionError || !session?.session.token) {
          throw new Error("Please sign in again to view your dashboard.")
        }

        setStats(await getTutorStats(session.session.token))
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load your dashboard statistics."
        )
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [refreshKey])

  return (
    <DashboardPage
      title="Tutor Overview"
      description="Manage your tuition posts, review applicants, and keep your profile up to date."
    >
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Your snapshot</h2>
          <p className="mt-1 text-xs text-neutral-400">
            Live numbers from your tuition posts and applications.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setRefreshKey((current) => current + 1)}
          disabled={loading}
          className="h-9 gap-2 rounded-xl border-white/15 bg-white/5 px-3 text-xs font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
        >
          <RefreshCw
            className={cn("size-3.5", loading && "animate-spin")}
            aria-hidden="true"
          />
          Refresh
        </Button>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <StatSkeleton key={item} />
            ))}
          </div>
        ) : error || !stats ? (
          <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-8 text-center">
            <AlertCircle
              className="mx-auto size-8 text-rose-400"
              aria-hidden="true"
            />
            <p className="mt-4 text-sm font-semibold text-white">
              Could not load your statistics
            </p>
            <p className="mt-2 text-xs text-neutral-400">
              {error || "Please try again in a moment."}
            </p>
            <Button
              type="button"
              onClick={() => setRefreshKey((current) => current + 1)}
              className="mt-5 h-9 gap-2 rounded-xl bg-lime-400 px-4 text-xs font-bold text-neutral-950 hover:bg-lime-300"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : (
          <>
            {stats.totalTuitions === 0 ? (
              <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-white/10 bg-neutral-950/60 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    No tuition posts yet
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Post your first tuition to start receiving applications from
                    students.
                  </p>
                </div>
                <Link
                  href="/dashboard/tutor/post-tuition"
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 text-xs font-bold text-neutral-950 transition-colors hover:bg-lime-300"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  Post a Tuition
                </Link>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Tuitions Posted"
                value={formatCount(stats.totalTuitions)}
                hint="All tuition posts you created"
                icon={FileText}
                accent="bg-sky-400/10 text-sky-300 ring-sky-400/25"
              />
              <StatCard
                label="Active / Approved Tuitions"
                value={formatCount(stats.activeApprovedTuitions)}
                hint="Live and approved posts"
                icon={CheckCircle2}
                accent="bg-lime-400/10 text-lime-300 ring-lime-400/25"
              />
              <StatCard
                label="Total Applicants Received"
                value={formatCount(stats.totalApplicants)}
                hint="Students who applied to you"
                icon={Users}
                accent="bg-violet-400/10 text-violet-300 ring-violet-400/25"
              />
              <StatCard
                label="Current Plan"
                value={formatPlan(stats.plan)}
                hint="Your subscription plan"
                icon={Crown}
                accent="bg-amber-400/10 text-amber-300 ring-amber-400/25"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/tutor/my-tuitions"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-neutral-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                Manage my tuitions
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard/tutor/applicants"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-neutral-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                Review applicants
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardPage>
  )
}
