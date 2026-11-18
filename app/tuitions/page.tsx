"use client"

import React from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
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
  Video,
  Wallet,
  X,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Tuition = {
  id: string
  title: string
  subject: string
  classLevel: string
  mode: string
  location: string
  monthlyFee: number
  daysPerWeek: number
  description: string
  status?: string
  createdAt: string
  tutorName?: string
}

const modeFilters = [
  { value: "all", label: "All" },
  { value: "Online", label: "Online" },
  { value: "Offline", label: "Offline" },
  { value: "Both", label: "Both" },
] as const

const heroHighlights = [
  { icon: BadgeCheck, label: "Verified tutors" },
  { icon: Video, label: "Online & in-person" },
  { icon: Wallet, label: "Clear monthly fees" },
]

const cardClasses =
  "group relative block rounded-[1.5rem] border border-neutral-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-lime-300 hover:shadow-xl hover:shadow-neutral-950/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/30 sm:p-6"

const skeletonCardClasses =
  "rounded-[1.5rem] border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6"

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatFee(value: number) {
  return `৳ ${Number(value || 0).toLocaleString("en-BD")}`
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
          ? "border-lime-200 bg-lime-50 text-lime-700"
          : "border-neutral-200 bg-neutral-100 text-neutral-500"
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
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5">
      <span className="shrink-0 text-neutral-400">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
          {label}
        </span>
        <span className="block truncate text-sm font-medium text-neutral-800">
          {value || "—"}
        </span>
      </span>
    </div>
  )
}

function TuitionSkeleton() {
  return (
    <div className={skeletonCardClasses} aria-hidden="true">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-6 w-28 rounded-full bg-neutral-200" />
        <Skeleton className="h-6 w-16 rounded-full bg-neutral-200" />
      </div>
      <Skeleton className="mt-5 h-5 w-3/4 bg-neutral-200" />
      <Skeleton className="mt-3 h-3 w-full bg-neutral-200" />
      <Skeleton className="mt-2 h-3 w-2/3 bg-neutral-200" />
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-12 rounded-xl bg-neutral-200" />
        ))}
      </div>
      <Skeleton className="mt-4 h-14 rounded-xl bg-neutral-200" />
      <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-9 rounded-full bg-neutral-200" />
          <Skeleton className="h-8 w-24 bg-neutral-200" />
        </div>
        <Skeleton className="size-9 rounded-full bg-neutral-200" />
      </div>
    </div>
  )
}

function StateCard({
  icon,
  title,
  description,
  action,
  tone = "lime",
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  tone?: "lime" | "rose"
}) {
  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white px-6 py-14 text-center shadow-sm">
      <span
        className={cn(
          "mx-auto flex size-16 items-center justify-center rounded-2xl ring-1",
          tone === "rose"
            ? "bg-rose-50 text-rose-500 ring-rose-200"
            : "bg-lime-50 text-lime-600 ring-lime-200"
        )}
      >
        {icon}
      </span>
      <h2 className="mt-5 text-xl font-bold tracking-tight text-neutral-950 sm:text-2xl">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

export default function TuitionsPage() {
  const [tuitions, setTuitions] = React.useState<Tuition[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [mode, setMode] = React.useState("all")
  const [refreshKey, setRefreshKey] = React.useState(0)

  React.useEffect(() => {
    async function loadTuitions() {
      setLoading(true)
      setError("")

      try {
        const response = await fetch("/api/tuitions", { cache: "no-store" })

        if (!response.ok) {
          const details = await response.json().catch(() => null)
          throw new Error(
            details?.error || `Request failed with status ${response.status}`
          )
        }

        const data = await response.json()
        setTuitions(Array.isArray(data) ? data : data.tuitions || [])
      } catch (fetchError) {
        console.error("Error fetching tuitions:", fetchError)
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Could not load tuition posts. Please try again."
        )
      } finally {
        setLoading(false)
      }
    }

    loadTuitions()
  }, [refreshKey])

  const filteredTuitions = tuitions.filter((tuition) => {
    const query = search.trim().toLowerCase()
    const matchesSearch =
      !query ||
      [
        tuition.title,
        tuition.subject,
        tuition.classLevel,
        tuition.location,
        tuition.description,
        tuition.tutorName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)

    const matchesMode = mode === "all" || tuition.mode === mode

    return matchesSearch && matchesMode
  })

  const hasFilters = search.trim().length > 0 || mode !== "all"

  function clearFilters() {
    setSearch("")
    setMode("all")
  }

  return (
    <main className="min-h-svh bg-neutral-50 text-neutral-900">
      <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -top-48 left-1/4 size-[34rem] rounded-full bg-lime-400/10 blur-[140px]" />
          <div className="absolute -right-40 -bottom-44 size-[30rem] rounded-full bg-sky-400/10 blur-[130px]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/25 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="animate-[hero-fade-up_0.7s_ease-out_both] motion-reduce:animate-none">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm">
              <BookOpen className="size-3.5 shrink-0 text-lime-400" />
              Explore tuitions
            </span>
          </div>

          <h1 className="mt-6 animate-[hero-fade-up_0.7s_ease-out_90ms_both] text-4xl leading-[1.08] font-bold tracking-tight text-balance motion-reduce:animate-none sm:text-5xl lg:text-[3.5rem]">
            Browse <span className="text-lime-400">Tuitions</span>
          </h1>

          <p className="mt-5 max-w-2xl animate-[hero-fade-up_0.7s_ease-out_180ms_both] text-base leading-relaxed text-neutral-300 motion-reduce:animate-none">
            Discover tuition posts from MentorLagbe tutors. Compare subjects,
            class levels, modes, and monthly fees to find the right fit for your
            learning goals.
          </p>

          <ul className="mt-8 flex animate-[hero-fade-up_0.7s_ease-out_270ms_both] flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-400 motion-reduce:animate-none">
            {heroHighlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon
                  className="size-4 shrink-0 text-lime-400"
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg shadow-neutral-950/5 sm:rounded-[1.5rem] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <label htmlFor="tuition-search" className="sr-only">
                Search tuitions
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              <Input
                id="tuition-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, subject, location, or tutor..."
                className="h-12 rounded-xl border-neutral-200 bg-neutral-50 pr-11 pl-11 text-sm text-neutral-900 shadow-none outline-none placeholder:text-neutral-400 focus-visible:border-lime-400 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-lime-400/15"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:ring-2 focus-visible:ring-lime-400/60 focus-visible:outline-none"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <div
                role="group"
                aria-label="Filter by tuition mode"
                className="flex flex-1 gap-1.5 sm:flex-none"
              >
                {modeFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    aria-pressed={mode === filter.value}
                    onClick={() => setMode(filter.value)}
                    className={cn(
                      "h-10 flex-1 rounded-full px-3.5 text-xs font-semibold whitespace-nowrap transition-all focus-visible:ring-4 focus-visible:ring-lime-400/30 focus-visible:outline-none sm:flex-none sm:text-sm",
                      mode === filter.value
                        ? "bg-lime-400 text-neutral-950 shadow-sm shadow-lime-400/30"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setRefreshKey((current) => current + 1)}
                disabled={loading}
                aria-label="Refresh tuitions"
                title="Refresh tuitions"
                className="size-10 shrink-0 rounded-full border-neutral-200 bg-white p-0 text-neutral-500 shadow-sm transition-colors hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700"
              >
                <RefreshCw
                  className={cn("size-4", loading && "animate-spin")}
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
            <p className="flex items-center gap-2 text-xs font-medium text-neutral-500">
              <span className="size-1.5 rounded-full bg-lime-500" />
              {loading
                ? "Loading tuition posts..."
                : `${filteredTuitions.length} of ${tuitions.length} tuition${tuitions.length === 1 ? "" : "s"} shown`}
            </p>
            {hasFilters && !loading ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-lime-700 transition-colors hover:bg-lime-50 focus-visible:ring-2 focus-visible:ring-lime-400/60 focus-visible:outline-none"
              >
                <X className="size-3.5" aria-hidden="true" />
                Clear filters
              </button>
            ) : null}
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 lg:px-8 lg:pt-14">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest text-lime-700 uppercase">
            Available opportunities
          </p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
            Tuition posts
          </h2>
        </div>

        {loading ? (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
            role="status"
            aria-label="Loading tuition posts"
          >
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <TuitionSkeleton key={item} />
            ))}
          </div>
        ) : error ? (
          <StateCard
            tone="rose"
            icon={<AlertCircle className="size-7" aria-hidden="true" />}
            title="Something went wrong"
            description={error}
            action={
              <Button
                type="button"
                onClick={() => setRefreshKey((current) => current + 1)}
                className="h-11 gap-2 rounded-full bg-lime-400 px-6 text-sm font-semibold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5 hover:bg-lime-300"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Try again
              </Button>
            }
          />
        ) : tuitions.length === 0 ? (
          <StateCard
            icon={<BookOpen className="size-7" aria-hidden="true" />}
            title="No tuition posts yet"
            description="Tutors have not posted any tuition requirements yet. Check back soon for new opportunities."
          />
        ) : filteredTuitions.length === 0 ? (
          <StateCard
            icon={<Search className="size-7" aria-hidden="true" />}
            title="No matching tuitions"
            description="Try a different search term or switch the tuition mode to see more results."
            action={
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="h-11 rounded-full border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-700 transition-colors hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700"
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTuitions.map((tuition, index) => (
              <Link
                key={tuition.id}
                href={`/tuitions/${tuition.id}`}
                className={cn(
                  cardClasses,
                  "animate-[hero-fade-up_0.55s_ease-out_both] motion-reduce:animate-none"
                )}
                style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
              >
                <article className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-lime-50 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-lime-700 ring-1 ring-lime-200/70">
                      <BookOpen
                        className="size-3 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">
                        {tuition.subject || "Subject not set"}
                      </span>
                    </span>
                    <StatusBadge value={tuition.status} />
                  </div>

                  <h3 className="mt-4 line-clamp-2 text-lg leading-snug font-bold tracking-tight text-neutral-950 transition-colors group-hover:text-lime-800">
                    {tuition.title || "Untitled tuition"}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-500">
                    {tuition.description || "No description provided."}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2.5">
                    <InfoTile
                      icon={
                        <GraduationCap className="size-4" aria-hidden="true" />
                      }
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
                      icon={
                        <CalendarDays className="size-4" aria-hidden="true" />
                      }
                      label="Schedule"
                      value={`${tuition.daysPerWeek || 0} days/week`}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3.5 py-3 ring-1 ring-neutral-100">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-lime-400/15 text-lime-700">
                        <Wallet className="size-4" aria-hidden="true" />
                      </span>
                      <span className="text-xs font-medium text-neutral-500">
                        Monthly fee
                      </span>
                    </div>
                    <span className="text-base font-bold tracking-tight text-neutral-950">
                      {formatFee(tuition.monthlyFee)}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                        {getInitials(tuition.tutorName)}
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="block truncate text-sm font-semibold text-neutral-800">
                          {tuition.tutorName || "Tutor"}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-neutral-400">
                          Posted {formatDate(tuition.createdAt)}
                        </span>
                      </span>
                    </div>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lime-400 text-neutral-950 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-lime-300 group-hover:shadow-lg group-hover:shadow-lime-400/30">
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                </article>
                <span className="sr-only">View tuition details</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
