"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Globe2,
  GraduationCap,
  Home,
  Laptop,
  MapPin,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from "lucide-react"

import { TuitionBanner } from "@/components/tuitions/tuition-banner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FEATURED_TUITIONS_LIMIT,
  type FeaturedTuition,
  type FeaturedTuitionsResponse,
} from "@/lib/tuitions/featured-types"
import { notify, userMessage } from "@/lib/notify"
import { cn } from "@/lib/utils"

const numberFormatter = new Intl.NumberFormat("en-BD")

// Kept identical to the tuition cards on /tuitions so both pages share the
// same visual language.
const cardClasses =
  "group relative block rounded-[1.5rem] border border-white/10 bg-neutral-900/70 p-5 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:border-lime-400/40 hover:bg-neutral-900 hover:shadow-xl hover:shadow-black/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/30 sm:p-6"

const skeletonCardClasses =
  "rounded-[1.5rem] border border-white/10 bg-neutral-900/70 p-5 shadow-lg shadow-black/10 sm:p-6"

function formatDate(value: string | null) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatFee(value: number) {
  return `৳ ${numberFormatter.format(Number(value || 0))}`
}

function getInitials(name?: string) {
  return (name || "T")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function StatusBadge({ value }: { value?: string }) {
  const active = value?.toLowerCase() === "active"
  const Icon = active ? CheckCircle2 : XCircle

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        active
          ? "border-lime-400/30 bg-lime-400/10 text-lime-300"
          : "border-white/10 bg-white/5 text-neutral-400"
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {active ? "Active" : "Closed"}
    </span>
  )
}

function ModeIcon({ mode }: { mode: string }) {
  if (mode === "Online") return <Laptop className="size-4" aria-hidden="true" />
  if (mode === "Offline") return <Home className="size-4" aria-hidden="true" />
  return <Globe2 className="size-4" aria-hidden="true" />
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
      <span className="shrink-0 text-neutral-500">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
          {label}
        </span>
        <span className="block truncate text-sm font-medium text-neutral-200">
          {value || "—"}
        </span>
      </span>
    </div>
  )
}

/** Reusable card used for every item in the featured grid. */
export function FeaturedTuitionCard({
  tuition,
  index = 0,
}: {
  tuition: FeaturedTuition
  index?: number
}) {
  return (
    <Link
      href={`/tuitions/${tuition.id}`}
      className={cn(
        cardClasses,
        "animate-[hero-fade-up_0.55s_ease-out_both] motion-reduce:animate-none"
      )}
      style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
      aria-label={`View details for ${tuition.title || "tuition"}`}
    >
      <article className="flex h-full flex-col">
        <TuitionBanner
          src={tuition.bannerImage}
          alt={tuition.title || "Tuition banner"}
          subject={tuition.subject}
        />

        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-lime-400/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-lime-300 ring-1 ring-lime-400/25">
            <BookOpen className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {tuition.subject || "Subject not set"}
            </span>
          </span>
          <StatusBadge value={tuition.status} />
        </div>

        <h3 className="mt-4 line-clamp-2 text-lg leading-snug font-bold tracking-tight text-white transition-colors group-hover:text-lime-300">
          {tuition.title || "Untitled tuition"}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-400">
          {tuition.description || "No description provided."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <InfoTile
            icon={<GraduationCap className="size-4" aria-hidden="true" />}
            label="Class"
            value={tuition.classLevel}
          />
          <InfoTile
            icon={<ModeIcon mode={tuition.mode} />}
            label="Mode"
            value={tuition.mode}
          />
          <InfoTile
            icon={<MapPin className="size-4" aria-hidden="true" />}
            label="Location"
            value={tuition.location}
          />
          <InfoTile
            icon={<CalendarDays className="size-4" aria-hidden="true" />}
            label="Schedule"
            value={`${tuition.daysPerWeek || 0} days/week`}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3.5 py-3 ring-1 ring-white/10">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-lime-400/15 text-lime-300">
              <Wallet className="size-4" aria-hidden="true" />
            </span>
            <span className="text-xs font-medium text-neutral-400">
              Monthly fee
            </span>
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            {formatFee(tuition.monthlyFee)}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lime-400/15 text-xs font-bold text-lime-300 ring-1 ring-lime-400/25">
              {getInitials(tuition.tutorName)}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold text-neutral-100">
                {tuition.tutorName || "Tutor"}
              </span>
              <span className="mt-0.5 block text-[11px] text-neutral-500">
                Posted {formatDate(tuition.createdAt)}
              </span>
            </span>
          </div>

          <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-lime-400 px-3.5 text-xs font-bold text-neutral-950 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-lime-300 group-hover:shadow-lg group-hover:shadow-lime-400/30">
            View Details
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </article>
    </Link>
  )
}

function FeaturedCardSkeleton() {
  return (
    <div className={skeletonCardClasses} aria-hidden="true">
      <Skeleton className="mb-4 aspect-[16/8] w-full rounded-xl bg-white/10" />
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-6 w-28 rounded-full bg-white/10" />
        <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
      </div>
      <Skeleton className="mt-5 h-5 w-3/4 bg-white/10" />
      <Skeleton className="mt-3 h-3 w-full bg-white/10" />
      <Skeleton className="mt-2 h-3 w-2/3 bg-white/10" />
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-12 rounded-xl bg-white/10" />
        ))}
      </div>
      <Skeleton className="mt-4 h-14 rounded-xl bg-white/10" />
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-9 rounded-full bg-white/10" />
          <Skeleton className="h-8 w-24 bg-white/10" />
        </div>
        <Skeleton className="h-9 w-28 rounded-full bg-white/10" />
      </div>
    </div>
  )
}

function StatePanel({
  tone,
  icon,
  title,
  description,
  onRetry,
}: {
  tone: "empty" | "error"
  icon: ReactNode
  title: string
  description: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-neutral-900/70 px-6 py-14 text-center shadow-lg shadow-black/10">
      <span
        className={cn(
          "mx-auto flex size-16 items-center justify-center rounded-2xl ring-1",
          tone === "error"
            ? "bg-rose-400/10 text-rose-300 ring-rose-400/25"
            : "bg-lime-400/10 text-lime-300 ring-lime-400/25"
        )}
      >
        {icon}
      </span>
      <h3 className="mt-5 text-xl font-bold tracking-tight text-white sm:text-2xl">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
        {description}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-lime-400 px-6 text-sm font-semibold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5 hover:bg-lime-300 focus-visible:ring-4 focus-visible:ring-lime-400/40 focus-visible:outline-none"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  )
}

export function FeaturedTuitions() {
  const [tuitions, setTuitions] = useState<FeaturedTuition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadFeatured() {
      setLoading(true)
      setError("")

      try {
        const response = await fetch("/api/featured-tuitions", {
          cache: "no-store",
          signal: controller.signal,
        })
        const data: FeaturedTuitionsResponse | { error?: string } =
          await response.json()

        if (!response.ok) {
          const message =
            data && "error" in data && typeof data.error === "string"
              ? data.error
              : "Could not load featured tuitions."
          throw new Error(message)
        }

        setTuitions(
          Array.isArray((data as FeaturedTuitionsResponse).tuitions)
            ? (data as FeaturedTuitionsResponse).tuitions
            : []
        )
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return
        }
        const message = userMessage(
          fetchError,
          "Could not load featured tuitions."
        )
        setError(message)
        notify.error("Could not load featured tuitions", message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadFeatured()
    return () => controller.abort()
  }, [retryKey])

  return (
    <section className="relative isolate overflow-hidden border-t border-white/10 bg-neutral-950 py-16 text-white sm:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 left-1/4 size-[32rem] rounded-full bg-lime-400/5 blur-[130px]" />
        <div className="absolute -right-40 -bottom-40 size-[30rem] rounded-full bg-sky-400/5 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm">
              <BookOpen
                className="size-3.5 shrink-0 text-lime-400"
                aria-hidden="true"
              />
              Latest opportunities
            </span>
            <h2 className="mt-6 text-3xl leading-[1.15] font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
              Featured <span className="text-lime-400">Tuitions</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base">
              Explore the latest tuition opportunities and find the perfect
              match for your learning journey.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-neutral-300">
            <span className="size-1.5 rounded-full bg-lime-400" />
            {loading
              ? "Loading latest posts"
              : `${tuitions.length} approved tuition${tuitions.length === 1 ? "" : "s"}`}
          </div>
        </div>

        <div className="mt-10">
          {loading ? (
            <div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
              role="status"
              aria-label="Loading featured tuitions"
            >
              {Array.from({ length: FEATURED_TUITIONS_LIMIT }).map(
                (_, index) => (
                  <FeaturedCardSkeleton key={index} />
                )
              )}
            </div>
          ) : error ? (
            <StatePanel
              tone="error"
              icon={<AlertCircle className="size-7" aria-hidden="true" />}
              title="Something went wrong"
              description={error}
              onRetry={() => setRetryKey((current) => current + 1)}
            />
          ) : tuitions.length === 0 ? (
            <StatePanel
              tone="empty"
              icon={<Search className="size-7" aria-hidden="true" />}
              title="No featured tuitions yet"
              description="New approved tuition posts will appear here as soon as tutors publish them. Check back soon."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {tuitions.map((tuition, index) => (
                <FeaturedTuitionCard
                  key={tuition.id}
                  tuition={tuition}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/all-tuitions"
            className="group/button inline-flex h-12 items-center justify-center gap-2 rounded-full bg-lime-400 px-7 text-sm font-semibold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-xl hover:shadow-lime-400/30 focus-visible:ring-4 focus-visible:ring-lime-400/40 focus-visible:outline-none"
          >
            See All Tuitions
            <ArrowRight
              className="size-4 transition-transform group-hover/button:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
