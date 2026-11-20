"use client"

import { useEffect, useState, type ReactNode } from "react"
import {
  AlertCircle,
  BadgeCheck,
  FileCheck,
  Handshake,
  RefreshCw,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { notify, userMessage } from "@/lib/notify"
import type { PlatformStats } from "@/lib/platform/stats"
import { cn } from "@/lib/utils"

const numberFormatter = new Intl.NumberFormat("en-BD")

type StatItem = {
  key: keyof Pick<
    PlatformStats,
    | "verifiedTutors"
    | "activeStudents"
    | "approvedTuitions"
    | "successfulMatches"
  >
  label: string
  description: string
  icon: LucideIcon
  accent: string
}

const statItems: StatItem[] = [
  {
    key: "verifiedTutors",
    label: "Verified Tutors",
    description: "Email-verified mentors on the platform",
    icon: BadgeCheck,
    accent: "bg-lime-400/10 text-lime-300 ring-lime-400/25",
  },
  {
    key: "activeStudents",
    label: "Active Students",
    description: "Students with an active session",
    icon: UsersRound,
    accent: "bg-sky-400/10 text-sky-300 ring-sky-400/25",
  },
  {
    key: "approvedTuitions",
    label: "Approved Tuitions",
    description: "Live listings approved by our team",
    icon: FileCheck,
    accent: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25",
  },
  {
    key: "successfulMatches",
    label: "Successful Matches",
    description: "Applications accepted by tutors",
    icon: Handshake,
    accent: "bg-amber-400/10 text-amber-300 ring-amber-400/25",
  },
]

/** Counts up to the database value once the data has loaded on the client. */
function useCountUp(value: number) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0

    if (reducedMotion) {
      frame = requestAnimationFrame(() => setDisplay(value))
      return () => cancelAnimationFrame(frame)
    }

    const duration = 900
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))

      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return display
}

function StatCard({
  item,
  value,
  index,
}: {
  item: StatItem
  value: number
  index: number
}) {
  const animated = useCountUp(value)
  const Icon = item.icon

  return (
    <article
      className="group relative h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-neutral-900/70 p-5 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:border-lime-400/30 hover:bg-neutral-900 hover:shadow-xl hover:shadow-black/20 sm:p-6"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
          {item.label}
        </p>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105",
            item.accent
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>

      <p
        className="mt-5 text-3xl font-bold tracking-tight text-white tabular-nums sm:text-[2.5rem]"
        aria-label={`${numberFormatter.format(value)} ${item.label}`}
      >
        <span aria-hidden="true">{numberFormatter.format(animated)}</span>
      </p>
      <p className="mt-2 text-xs leading-relaxed text-neutral-500">
        {item.description}
      </p>
    </article>
  )
}

function StatSkeleton() {
  return (
    <div
      className="rounded-[1.5rem] border border-white/10 bg-neutral-900/70 p-5 shadow-lg shadow-black/10 sm:p-6"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-3 w-28 bg-white/10" />
        <Skeleton className="size-11 rounded-xl bg-white/10" />
      </div>
      <Skeleton className="mt-6 h-9 w-24 bg-white/10" />
      <Skeleton className="mt-3 h-3 w-40 bg-white/10" />
    </div>
  )
}

function StatsStatePanel({
  title,
  description,
  onRetry,
}: {
  title: string
  description: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-neutral-900/70 px-6 py-12 text-center shadow-lg shadow-black/10">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/25">
        <AlertCircle className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-xl font-bold tracking-tight text-white">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
        {description}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-lime-400 px-5 text-sm font-semibold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5 hover:bg-lime-300 focus-visible:ring-4 focus-visible:ring-lime-400/40 focus-visible:outline-none"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  )
}

export function PlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadStats() {
      setLoading(true)
      setError("")

      try {
        const response = await fetch("/api/platform/stats", {
          cache: "no-store",
          signal: controller.signal,
        })
        const data: PlatformStats | { error?: string } = await response.json()

        if (!response.ok) {
          throw new Error(
            data && "error" in data && typeof data.error === "string"
              ? data.error
              : "Could not load platform statistics."
          )
        }

        setStats(data as PlatformStats)
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return
        }
        const message = userMessage(
          fetchError,
          "Could not load platform statistics."
        )
        setError(message)
        notify.error("Could not load platform statistics", message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadStats()
    return () => controller.abort()
  }, [retryKey])

  const gridClass = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"

  let content: ReactNode
  if (loading) {
    content = (
      <div
        className={gridClass}
        role="status"
        aria-label="Loading platform statistics"
      >
        {statItems.map((item) => (
          <StatSkeleton key={item.key} />
        ))}
      </div>
    )
  } else if (error || !stats) {
    content = (
      <StatsStatePanel
        title="Statistics unavailable"
        description={
          error || "Platform statistics could not be loaded right now."
        }
        onRetry={() => setRetryKey((current) => current + 1)}
      />
    )
  } else {
    content = (
      <div className={gridClass}>
        {statItems.map((item, index) => (
          <StatCard
            key={item.key}
            item={item}
            index={index}
            value={Number(stats[item.key]) || 0}
          />
        ))}
      </div>
    )
  }

  return (
    <section
      aria-labelledby="platform-stats-heading"
      className="relative isolate overflow-hidden border-t border-white/10 bg-neutral-950 py-16 text-white sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 -left-40 size-[30rem] rounded-full bg-sky-400/5 blur-[130px]" />
        <div className="absolute -right-40 -bottom-40 size-[30rem] rounded-full bg-lime-400/5 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm">
              <BadgeCheck
                className="size-3.5 shrink-0 text-lime-400"
                aria-hidden="true"
              />
              Trusted by the community
            </span>
            <h2
              id="platform-stats-heading"
              className="mt-6 text-3xl leading-[1.15] font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]"
            >
              MentorLagbe in <span className="text-lime-400">numbers</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
              Every number below comes directly from our live platform data.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-neutral-300">
            <span className="size-1.5 rounded-full bg-lime-400" />
            Live platform data
          </div>
        </div>

        <div className="mt-10">{content}</div>
      </div>
    </section>
  )
}
