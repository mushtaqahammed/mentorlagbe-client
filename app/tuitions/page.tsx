"use client"

import React from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Globe2,
  GraduationCap,
  Home,
  Laptop,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  Wallet,
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

const cardClasses =
  "rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-lime-400/60 hover:shadow-lg"
const inputClasses =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400 focus-visible:border-lime-500 focus-visible:ring-4 focus-visible:ring-lime-400/15"

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

function StatusBadge({ value }: { value?: string }) {
  const active = value?.toLowerCase() === "active"
  const Icon = active ? CheckCircle2 : XCircle

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        active
          ? "border-lime-200 bg-lime-50 text-lime-700"
          : "border-neutral-200 bg-neutral-100 text-neutral-600"
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {active ? "Active" : "Closed"}
    </span>
  )
}

function ModeIcon({ mode }: { mode: string }) {
  if (mode === "Online") return <Laptop className="size-4" aria-hidden="true" />
  if (mode === "Offline") return <Home className="size-4" aria-hidden="true" />
  return <Globe2 className="size-4" aria-hidden="true" />
}

function TuitionSkeleton() {
  return (
    <div className={cardClasses}>
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-40 bg-neutral-200" />
        <Skeleton className="h-6 w-20 rounded-full bg-neutral-200" />
      </div>
      <Skeleton className="mt-3 h-4 w-24 bg-neutral-200" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-9 rounded-xl bg-neutral-200" />
        ))}
      </div>
      <Skeleton className="mt-5 h-12 w-full rounded-xl bg-neutral-200" />
      <Skeleton className="mt-5 h-4 w-32 bg-neutral-200" />
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

  return (
    <main className="min-h-svh bg-neutral-50 text-neutral-900">
      <section className="bg-neutral-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-lime-300 uppercase">
            <BookOpen className="size-3.5" aria-hidden="true" />
            Explore tuitions
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Browse Tuitions
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-neutral-300 sm:text-base">
            Discover tuition posts from MentorLagbe tutors. Compare subjects,
            class levels, modes, and monthly fees to find the right fit.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, subject, location, or tutor..."
                aria-label="Search tuitions"
                className={cn(inputClasses, "pl-10")}
              />
            </div>

            <div className="relative">
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                aria-label="Filter by tuition mode"
                className={cn(inputClasses, "appearance-none pr-10")}
              >
                <option value="all">All modes</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Both">Both</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-neutral-500">
              {loading
                ? "Loading tuition posts..."
                : `${filteredTuitions.length} of ${tuitions.length} tuition${tuitions.length === 1 ? "" : "s"} shown`}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRefreshKey((current) => current + 1)}
              disabled={loading}
              className="h-8 gap-2 rounded-lg border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <RefreshCw
                className={cn("size-3.5", loading && "animate-spin")}
                aria-hidden="true"
              />
              Refresh
            </Button>
          </div>
        </section>

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <TuitionSkeleton key={item} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
              <AlertCircle
                className="mx-auto size-9 text-rose-500"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-semibold text-neutral-900">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-neutral-500">{error}</p>
              <Button
                type="button"
                onClick={() => setRefreshKey((current) => current + 1)}
                className="mt-5 h-10 gap-2 rounded-xl bg-lime-400 px-4 text-sm font-bold text-neutral-950 hover:bg-lime-300"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : tuitions.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
              <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-lime-50 text-lime-600 ring-1 ring-lime-200">
                <BookOpen className="size-7" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-xl font-semibold text-neutral-900">
                No tuition posts yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
                Tutors have not posted any tuition requirements. Check back soon
                for new opportunities.
              </p>
            </div>
          ) : filteredTuitions.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
              <Search
                className="mx-auto size-9 text-neutral-400"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-semibold text-neutral-900">
                No matching tuitions
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Try a different search term or mode.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch("")
                  setMode("all")
                }}
                className="mt-5 h-9 rounded-xl border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredTuitions.map((tuition) => (
                <Link
                  key={tuition.id}
                  href={`/tuitions/${tuition.id}`}
                  className={cn(cardClasses, "block")}
                >
                  <article>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-neutral-900">
                          {tuition.title || "Untitled tuition"}
                        </h2>
                        <p className="mt-1 text-xs font-semibold text-lime-700">
                          {tuition.subject || "Subject not set"}
                        </p>
                      </div>
                      <StatusBadge value={tuition.status} />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2">
                        <GraduationCap
                          className="size-4 shrink-0 text-neutral-400"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 truncate text-xs text-neutral-700">
                          {tuition.classLevel || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2">
                        <span className="shrink-0 text-neutral-400">
                          <ModeIcon mode={tuition.mode} />
                        </span>
                        <span className="min-w-0 truncate text-xs text-neutral-700">
                          {tuition.mode || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2">
                        <MapPin
                          className="size-4 shrink-0 text-neutral-400"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 truncate text-xs text-neutral-700">
                          {tuition.location || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2">
                        <Wallet
                          className="size-4 shrink-0 text-neutral-400"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 truncate text-xs text-neutral-700">
                          {formatFee(tuition.monthlyFee)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2">
                        <CalendarDays
                          className="size-4 shrink-0 text-neutral-400"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 truncate text-xs text-neutral-700">
                          {tuition.daysPerWeek || 0} days/week
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2">
                        <Clock3
                          className="size-4 shrink-0 text-neutral-400"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 truncate text-xs text-neutral-700">
                          {formatDate(tuition.createdAt)}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                      {tuition.description || "No description provided."}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
                          <UserRound className="size-3.5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 truncate text-xs font-medium text-neutral-700">
                          {tuition.tutorName || "Tutor"}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-[11px] text-neutral-400">
                          Posted {formatDate(tuition.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-lime-700">
                          View details
                          <ArrowRight className="size-3.5" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
