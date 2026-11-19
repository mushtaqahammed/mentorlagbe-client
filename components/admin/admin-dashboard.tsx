"use client"

import React from "react"
import {
  AlertCircle,
  ClipboardList,
  GraduationCap,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react"

import { AdminStatsCard } from "@/components/admin/admin-stats-card"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { Button } from "@/components/ui/button"
import type { AdminStats, AdminStatsError } from "@/lib/admin/types"
import { cn } from "@/lib/utils"

const numberFormatter = new Intl.NumberFormat("en-BD")

const CARD_SKELETONS = [
  { title: "Total Users", icon: Users, accent: "sky" },
  { title: "Total Tutors", icon: GraduationCap, accent: "lime" },
  { title: "Pending / Approved", icon: ClipboardList, accent: "violet" },
  { title: "Total Stripe Revenue", icon: Wallet, accent: "amber" },
] as const

export function AdminDashboard() {
  const [stats, setStats] = React.useState<AdminStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [refreshKey, setRefreshKey] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false

    async function loadStats() {
      setLoading(true)
      setError("")

      try {
        const response = await fetch("/api/admin/stats", {
          cache: "no-store",
        })
        const data: AdminStats | AdminStatsError = await response.json()

        if (!response.ok) {
          throw new Error(
            "error" in data ? data.error : "Could not load platform statistics."
          )
        }

        if (!cancelled) setStats(data as AdminStats)
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load platform statistics."
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadStats()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const refresh = () => setRefreshKey((current) => current + 1)

  const pending = stats?.pendingTuitions ?? 0
  const approved = stats?.approvedTuitions ?? 0
  const revenue = stats?.stripeRevenue

  return (
    <DashboardPage
      title="Admin Overview"
      description="Review new tuitions, manage users, and keep an eye on platform transactions."
    >
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Platform snapshot
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Live figures from MongoDB — users, tutors, tuition approvals and
            Stripe revenue.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh platform statistics"
          className="h-9 gap-2 rounded-xl border-white/15 bg-white/5 px-3 text-xs font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
        >
          <RefreshCw
            className={cn("size-3.5", loading && "animate-spin")}
            aria-hidden="true"
          />
          Refresh
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          CARD_SKELETONS.map((card) => (
            <AdminStatsCard
              key={card.title}
              title={card.title}
              value=""
              icon={card.icon}
              accent={card.accent}
              loading
            />
          ))
        ) : error || !stats ? (
          <div className="col-span-full rounded-2xl border border-white/10 bg-neutral-950/60 p-8 text-center">
            <AlertCircle
              className="mx-auto size-8 text-rose-400"
              aria-hidden="true"
            />
            <p className="mt-4 text-sm font-semibold text-white">
              Could not load platform statistics
            </p>
            <p className="mt-2 text-xs text-neutral-400" role="alert">
              {error || "Please try again in a moment."}
            </p>
            <Button
              type="button"
              onClick={refresh}
              className="mt-5 h-9 gap-2 rounded-xl bg-lime-400 px-4 text-xs font-bold text-neutral-950 hover:bg-lime-300"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : (
          <>
            <AdminStatsCard
              title="Total Users"
              value={numberFormatter.format(stats.totalUsers)}
              icon={Users}
              accent="sky"
              description="Registered accounts across all roles"
            />
            <AdminStatsCard
              title="Total Tutors"
              value={numberFormatter.format(stats.totalTutors)}
              icon={GraduationCap}
              accent="lime"
              description="Registered users with the tutor role"
            />
            <AdminStatsCard
              title="Pending / Approved"
              value={`${numberFormatter.format(pending)} / ${numberFormatter.format(approved)}`}
              icon={ClipboardList}
              accent="violet"
              description={
                pending + approved > 0
                  ? "Tuitions awaiting review vs. approved posts"
                  : "No pending or approved tuitions yet"
              }
              details={[
                {
                  label: "Pending",
                  value: numberFormatter.format(pending),
                  tone: "amber",
                },
                {
                  label: "Approved",
                  value: numberFormatter.format(approved),
                  tone: "lime",
                },
              ]}
            />
            <AdminStatsCard
              title="Total Stripe Revenue"
              value={revenue?.formatted ?? "—"}
              icon={Wallet}
              accent="amber"
              description={
                revenue && revenue.amount > 0
                  ? `From successful Stripe subscription payments in ${revenue.currency}`
                  : "No successful subscription payments recorded yet"
              }
            />
          </>
        )}
      </div>
    </DashboardPage>
  )
}
