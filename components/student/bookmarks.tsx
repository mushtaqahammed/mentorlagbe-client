"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Crown,
  GraduationCap,
  Globe2,
  Heart,
  Home,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react"

import { useBookmarks } from "@/components/bookmarks/bookmark-provider"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { TuitionBanner } from "@/components/tuitions/tuition-banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type { BookmarkItem } from "@/lib/actions/bookmarks"
import { cn } from "@/lib/utils"

type SortOption = "recent" | "fee-asc" | "fee-desc"

const cardClasses =
  "group relative flex h-full flex-col rounded-[1.5rem] border border-white/10 bg-neutral-900/70 p-5 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:border-lime-400/30 hover:bg-neutral-900 hover:shadow-xl hover:shadow-black/20 sm:p-6"

function formatFee(value: number) {
  return `৳ ${Number(value || 0).toLocaleString("en-BD")}`
}

function formatSaved(value?: string | null) {
  if (!value) return "Saved bookmark"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Saved bookmark"
  return `Saved ${date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`
}

function ModeIcon({ mode }: { mode: string | null }) {
  if (mode === "Online") return <Globe2 className="size-4" aria-hidden="true" />
  if (mode === "Offline") return <Home className="size-4" aria-hidden="true" />
  return <BookOpen className="size-4" aria-hidden="true" />
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | null | undefined
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

function BookmarkSkeleton() {
  return (
    <div className={cn(cardClasses, "animate-pulse")} aria-hidden="true">
      <Skeleton className="mb-4 aspect-[16/8] w-full rounded-xl bg-white/10" />
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-6 w-28 rounded-full bg-white/10" />
        <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
      </div>
      <Skeleton className="mt-5 h-5 w-3/4 bg-white/10" />
      <Skeleton className="mt-3 h-3 w-full bg-white/10" />
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Skeleton className="h-12 rounded-xl bg-white/10" />
        <Skeleton className="h-12 rounded-xl bg-white/10" />
        <Skeleton className="h-12 rounded-xl bg-white/10" />
        <Skeleton className="h-12 rounded-xl bg-white/10" />
      </div>
      <Skeleton className="mt-5 h-10 w-full rounded-xl bg-white/10" />
    </div>
  )
}

function StatePanel({
  icon,
  title,
  description,
  action,
  onRetry,
  needsSignIn,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  onRetry?: () => void
  needsSignIn?: boolean
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-neutral-950/60 px-6 py-14 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25">
        {icon}
      </span>
      <h3 className="mt-5 text-xl font-bold tracking-tight text-white sm:text-2xl">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {action}
        {onRetry ? (
          <Button
            type="button"
            onClick={onRetry}
            className="h-10 gap-2 rounded-full bg-lime-400 px-5 text-sm font-semibold text-neutral-950 shadow-lg shadow-lime-400/20 hover:bg-lime-300"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        ) : null}
        {needsSignIn ? (
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Sign in again
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </div>
  )
}

function BookmarkCard({ item }: { item: BookmarkItem }) {
  const { toggle, isPending } = useBookmarks()
  const pending = isPending(item.id)
  const unavailable = !item.available

  return (
    <article className={cardClasses}>
      <div className="relative">
        <span
          className={cn(
            "absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur",
            unavailable
              ? "border-rose-400/30 bg-rose-400/15 text-rose-200"
              : "border-lime-400/30 bg-lime-400/15 text-lime-200",
          )}
        >
          {unavailable ? (
            <AlertCircle className="size-3" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="size-3" aria-hidden="true" />
          )}
          {unavailable ? "Unavailable" : "Available"}
        </span>
        <TuitionBanner
          src={item.bannerImage}
          alt={item.title || "Tuition banner"}
          subject={item.subject || undefined}
        />
      </div>

      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-lime-400/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-lime-300 ring-1 ring-lime-400/25">
          <BookOpen className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{item.subject || "Subject not set"}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-neutral-300">
          <Heart className="size-3 fill-current text-lime-400" aria-hidden="true" />
          Saved
        </span>
      </div>

      <h3 className="mt-4 line-clamp-2 text-lg leading-snug font-bold tracking-tight text-white">
        {item.title || "Untitled tuition"}
      </h3>
      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-neutral-400">
        {item.description || "No description provided."}
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        {formatSaved(item.savedAt)}
        {item.daysPerWeek ? ` · ${item.daysPerWeek} days/week` : ""}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <InfoTile
          icon={<GraduationCap className="size-4" aria-hidden="true" />}
          label="Class"
          value={item.classLevel}
        />
        <InfoTile
          icon={<ModeIcon mode={item.mode} />}
          label="Mode"
          value={item.mode}
        />
        <InfoTile
          icon={<MapPin className="size-4" aria-hidden="true" />}
          label="Location"
          value={item.location}
        />
        <InfoTile
          icon={<Wallet className="size-4" aria-hidden="true" />}
          label="Monthly fee"
          value={formatFee(item.monthlyFee)}
        />
      </div>

      <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3.5 py-3 ring-1 ring-white/10">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lime-400/15 text-xs font-bold text-lime-300 ring-1 ring-lime-400/25">
          {(item.tutorName || "T")
            .split(" ")
            .map((part) => part[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            Tutor
          </span>
          <span className="block truncate text-sm font-semibold text-neutral-100">
            {item.tutorName || "Tutor"}
          </span>
        </span>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2.5 border-t border-white/10 pt-5">
        {unavailable ? (
          <button
            type="button"
            disabled
            title="This tuition is no longer available"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-neutral-500"
          >
            View Details
          </button>
        ) : (
          <Link
            href={`/tuitions/${item.id}`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-lime-400 px-3 text-xs font-bold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:bg-lime-300 focus-visible:ring-2 focus-visible:ring-lime-400/60 focus-visible:outline-none"
          >
            View Details
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => void toggle(item.id)}
          className="h-10 gap-1.5 rounded-xl border-rose-400/20 bg-rose-400/5 px-3 text-xs font-semibold text-rose-200 transition-colors hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-100"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="size-3.5" aria-hidden="true" />
          )}
          Remove Bookmark
        </Button>
      </div>
    </article>
  )
}

export function Bookmarks() {
  const {
    bookmarks,
    plan,
    limit,
    loading,
    error,
    refresh,
  } = useBookmarks()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("recent")

  const used = bookmarks.length
  const isPro = plan === "pro"
  const freeLimit = limit ?? 5
  const progress = Math.min(100, (used / freeLimit) * 100)

  const visibleBookmarks = useMemo(() => {
    const query = search.trim().toLowerCase()
    const items = bookmarks.filter((item) => {
      if (!query) return true
      return [item.title, item.subject, item.tutorName, item.location, item.classLevel]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    })

    // The backend already returns newest-first by `createdAt` of the bookmark
    // row, so "Recently Saved" keeps that order.
    if (sort === "fee-asc") items.sort((a, b) => a.monthlyFee - b.monthlyFee)
    if (sort === "fee-desc") items.sort((a, b) => b.monthlyFee - a.monthlyFee)

    return items
  }, [bookmarks, search, sort])

  const needsSignIn = /session|sign in|unauthoriz|token|log in/i.test(error)

  return (
    <DashboardPage
      title="My Bookmarks"
      description="Your saved tuition opportunities."
    >
      <section className="mt-8 rounded-2xl border border-white/10 bg-neutral-950/60 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25">
              <Bookmark className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
                Your collection
              </p>
              <p className="mt-1 text-xl font-bold text-white">
                {used} saved tuition{used === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {isPro ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-xs font-bold text-lime-200">
                <Crown className="size-3.5" aria-hidden="true" />
                Pro Student
              </span>
              <span className="text-xs text-neutral-400">
                Unlimited bookmark access
              </span>
            </div>
          ) : (
            <div className="w-full sm:w-72">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-neutral-300">
                  {used}/{freeLimit} Bookmarks Used
                </span>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 font-semibold text-lime-300 transition-colors hover:text-lime-200"
                >
                  Upgrade to Pro
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={used}
                aria-valuemin={0}
                aria-valuemax={freeLimit}
                aria-label="Free plan bookmark usage"
              >
                <div
                  className="h-full rounded-full bg-lime-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-neutral-500">
                Free students can save up to {freeLimit} tuitions.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-neutral-900/60 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,200px)]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-neutral-500"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bookmarked tuitions..."
              aria-label="Search bookmarked tuitions"
              className="h-11 rounded-xl border-white/10 bg-neutral-950/60 pl-10 text-sm text-white placeholder:text-neutral-600 hover:border-white/20 focus-visible:border-lime-400/60 focus-visible:ring-4 focus-visible:ring-lime-400/15"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-neutral-500 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-lime-400/60 focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            aria-label="Sort bookmarks"
            className="h-11 w-full rounded-xl border border-white/10 bg-neutral-950/60 px-3.5 text-sm text-white outline-none hover:border-white/20 focus-visible:border-lime-400/60 focus-visible:ring-4 focus-visible:ring-lime-400/15"
          >
            <option value="recent">Recently Saved</option>
            <option value="fee-asc">Lowest Fee</option>
            <option value="fee-desc">Highest Fee</option>
          </select>
        </div>

        <p className="mt-3 text-xs font-medium text-neutral-500">
          {loading
            ? "Loading your bookmarks..."
            : `${visibleBookmarks.length} of ${used} bookmark${used === 1 ? "" : "s"} shown`}
        </p>
      </section>

      <div className="mt-6">
        {loading ? (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
            role="status"
            aria-label="Loading bookmarks"
          >
            {[0, 1, 2].map((item) => (
              <BookmarkSkeleton key={item} />
            ))}
          </div>
        ) : error && used === 0 ? (
          <StatePanel
            icon={<AlertCircle className="size-7" aria-hidden="true" />}
            title="Could not load your bookmarks"
            description={error}
            onRetry={() => void refresh()}
            needsSignIn={needsSignIn}
          />
        ) : used === 0 ? (
          <StatePanel
            icon={<Bookmark className="size-7" aria-hidden="true" />}
            title="No Bookmarks Yet"
            description="Save your favorite tuition opportunities to find them easily later."
            action={
              <Link
                href="/tuitions"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-lime-400 px-5 text-sm font-bold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:bg-lime-300"
              >
                Browse Tuitions
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
        ) : visibleBookmarks.length === 0 ? (
          <StatePanel
            icon={<Search className="size-7" aria-hidden="true" />}
            title="No matching bookmarks"
            description="Try a different search term to find a saved tuition."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleBookmarks.map((item) => (
              <BookmarkCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </DashboardPage>
  )
}
