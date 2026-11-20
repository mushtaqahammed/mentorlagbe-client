"use client"

import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileSearch,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import {
  StatCard,
  StatSkeleton,
  formatCount,
} from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { notify as uiNotify } from "@/lib/notify"
import {
  deleteStudentApplication,
  getStudentApplications,
  type ApplicantStats,
  type ApplicationStatus,
  type StudentApplication,
} from "@/lib/actions/applications"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const cardClasses =
  "rounded-2xl border border-white/10 bg-neutral-950/60 shadow-lg shadow-black/10"
const inputClasses =
  "h-11 w-full rounded-xl border border-white/10 bg-neutral-950/60 px-3 text-sm text-white shadow-sm transition-all outline-none placeholder:text-neutral-600 hover:border-white/20 focus-visible:border-lime-400/60 focus-visible:ring-4 focus-visible:ring-lime-400/15"
const selectClasses = cn(inputClasses, "appearance-none pr-10")

function notify(
  variant: "success" | "error" | "info",
  title: string,
  description?: string
) {
  const options = description ? { description } : undefined

  if (variant === "success") uiNotify.success(title, options)
  else if (variant === "error") uiNotify.error(title, options)
  else uiNotify.info(title, options)
}

async function assertStudentSession() {
  const { data: session, error } = await authClient.getSession()

  if (error || !session?.user?.id) {
    throw new Error("Please sign in again to view your applications.")
  }

  if (String(session.user.role).toLowerCase() !== "student") {
    throw new Error("Only student accounts can view this page.")
  }
}

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

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const Icon =
    status === "accepted"
      ? CheckCircle2
      : status === "rejected"
        ? XCircle
        : Clock3

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        status === "accepted" &&
          "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
        status === "rejected" &&
          "border-rose-400/30 bg-rose-400/10 text-rose-300",
        status === "pending" &&
          "border-amber-400/30 bg-amber-400/10 text-amber-300"
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </p>
      <p
        className="mt-1.5 truncate text-sm font-medium text-neutral-200"
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

function ApplicationSkeleton() {
  return (
    <div className={cn(cardClasses, "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-48 bg-white/10" />
          <Skeleton className="mt-2 h-3 w-36 bg-white/10" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-12 rounded-xl bg-white/10" />
        ))}
      </div>
      <div className="mt-5 flex justify-end">
        <Skeleton className="h-9 w-32 rounded-xl bg-white/10" />
      </div>
    </div>
  )
}

function SelectChevron() {
  return (
    <ChevronDown
      className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-neutral-500"
      aria-hidden="true"
    />
  )
}

export function MyApplications() {
  const [applications, setApplications] = useState<StudentApplication[]>([])
  const [stats, setStats] = useState<ApplicantStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [deleteTarget, setDeleteTarget] = useState<StudentApplication | null>(
    null
  )
  const [busyId, setBusyId] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const showErrorStateRef = useRef(true)

  useEffect(() => {
    let active = true

    async function loadApplications() {
      const showErrorState = showErrorStateRef.current

      try {
        await assertStudentSession()
        const data = await getStudentApplications()
        if (!active) return

        setApplications(data.applications)
        setStats(data.stats)
        if (showErrorState) setLoadError("")
      } catch (loadFailure) {
        const message =
          loadFailure instanceof Error
            ? loadFailure.message
            : "Could not load your applications."

        if (active && showErrorState) setLoadError(message)
        if (active) {
          notify("error", "Could not load applications", message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadApplications()

    return () => {
      active = false
    }
  }, [reloadKey])

  function refresh() {
    showErrorStateRef.current = true
    setLoading(true)
    setReloadKey((current) => current + 1)
  }

  function refreshSilently() {
    showErrorStateRef.current = false
    setReloadKey((current) => current + 1)
  }

  const visibleApplications = useMemo(() => {
    const query = search.trim().toLowerCase()

    return applications
      .filter((application) => {
        const matchesSearch =
          !query ||
          application.tuitionTitle.toLowerCase().includes(query) ||
          application.tutorName.toLowerCase().includes(query)
        const matchesStatus =
          statusFilter === "all" || application.status === statusFilter

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        const aTime = new Date(a.applicationDate).getTime()
        const bTime = new Date(b.applicationDate).getTime()
        return sortOrder === "newest" ? bTime - aTime : aTime - bTime
      })
  }, [applications, search, sortOrder, statusFilter])

  function clearFilters() {
    setSearch("")
    setStatusFilter("all")
    setSortOrder("newest")
  }

  async function confirmDelete() {
    if (!deleteTarget || busyId) return

    setBusyId(deleteTarget.id)

    try {
      await assertStudentSession()
      await deleteStudentApplication(deleteTarget.id)

      notify(
        "success",
        "Application cancelled",
        `Your application for ${deleteTarget.tuitionTitle} has been removed.`
      )

      setDeleteTarget(null)
      refreshSilently()
    } catch (deleteFailure) {
      notify(
        "error",
        "Cancellation failed",
        deleteFailure instanceof Error
          ? deleteFailure.message
          : "Please try again."
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardPage
      title="My Applications"
      description="Track your tuition applications and stay updated on your application status."
    >
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Application overview
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Live numbers from the applications you submitted.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={refresh}
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

      {loading ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <StatSkeleton key={item} />
          ))}
        </div>
      ) : stats ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Applications"
            value={formatCount(stats.total)}
            hint="Tuitions you applied to"
            icon={FileText}
            accent="bg-sky-400/10 text-sky-300 ring-sky-400/25"
          />
          <StatCard
            label="Pending"
            value={formatCount(stats.pending)}
            hint="Waiting for tutor review"
            icon={Clock3}
            accent="bg-amber-400/10 text-amber-300 ring-amber-400/25"
          />
          <StatCard
            label="Accepted"
            value={formatCount(stats.accepted)}
            hint="Applications tutors accepted"
            icon={CheckCircle2}
            accent="bg-emerald-400/10 text-emerald-300 ring-emerald-400/25"
          />
          <StatCard
            label="Rejected"
            value={formatCount(stats.rejected)}
            hint="Applications tutors declined"
            icon={XCircle}
            accent="bg-rose-400/10 text-rose-300 ring-rose-400/25"
          />
        </div>
      ) : null}

      <section className={cn(cardClasses, "mt-6 p-4 sm:p-5")}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,180px)_minmax(0,180px)]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-500"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by tuition title or tutor name..."
              aria-label="Search applications"
              className={cn(inputClasses, "pl-10")}
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by application status"
              className={selectClasses}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <SelectChevron />
          </div>

          <div className="relative">
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              aria-label="Sort applications by date"
              className={selectClasses}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <SelectChevron />
          </div>
        </div>

        <p className="mt-3 text-xs text-neutral-500">
          {loading
            ? "Loading your applications..."
            : `${visibleApplications.length} of ${applications.length} application${applications.length === 1 ? "" : "s"} shown`}
        </p>
      </section>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {[0, 1, 2].map((item) => (
              <ApplicationSkeleton key={item} />
            ))}
          </div>
        ) : loadError ? (
          <div className={cn(cardClasses, "p-8 text-center")}>
            <AlertTriangle
              className="mx-auto size-8 text-rose-400"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-lg font-semibold text-white">
              Could not load your applications
            </h3>
            <p className="mt-2 text-sm text-neutral-400">{loadError}</p>
            <Button
              type="button"
              onClick={refresh}
              className="mt-5 h-9 gap-2 rounded-xl bg-lime-400 px-4 text-xs font-bold text-neutral-950 hover:bg-lime-300"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : applications.length === 0 ? (
          <div className={cn(cardClasses, "p-10 text-center")}>
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25">
              <FileSearch className="size-7" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-xl font-semibold text-white">
              No applications yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
              You have not applied to any tuitions yet. Browse available posts
              to start connecting with tutors.
            </p>
            <Link
              href="/tuitions"
              className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 text-sm font-bold text-neutral-950 transition-colors hover:bg-lime-300"
            >
              <BookOpen className="size-4" aria-hidden="true" />
              Browse tuitions
            </Link>
          </div>
        ) : visibleApplications.length === 0 ? (
          <div className={cn(cardClasses, "p-8 text-center")}>
            <Search
              className="mx-auto size-8 text-neutral-500"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-lg font-semibold text-white">
              No matching applications
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              Try a different search term or clear your filters.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="mt-5 h-9 rounded-xl border-white/15 bg-white/5 px-4 text-xs font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {visibleApplications.map((application) => {
              const busy = busyId === application.id

              return (
                <article
                  key={application.id}
                  className={cn(
                    cardClasses,
                    "flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-lime-400/30 hover:shadow-xl hover:shadow-black/20"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lime-300 ring-1 ring-white/10">
                        <BookOpen className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-white">
                          {application.tuitionTitle}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-neutral-400">
                          <Mail
                            className="size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          {application.tutorEmail || "Tutor email unavailable"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoItem
                      icon={BookOpen}
                      label="Tutor name"
                      value={application.tutorName}
                    />
                    <InfoItem
                      icon={Wallet}
                      label="Monthly fee"
                      value={formatFee(application.monthlyFee)}
                    />
                    <InfoItem
                      icon={CalendarDays}
                      label="Applied date"
                      value={formatDate(application.applicationDate)}
                    />
                    <InfoItem
                      icon={Clock3}
                      label="Status"
                      value={
                        application.status.charAt(0).toUpperCase() +
                        application.status.slice(1)
                      }
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    {application.status === "pending" ? (
                      <>
                        <p className="text-xs text-neutral-500">
                          You can cancel this application while it is pending.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busy}
                          onClick={() => setDeleteTarget(application)}
                          className="h-9 gap-1.5 rounded-xl border-rose-400/30 bg-rose-400/5 px-3 text-xs font-semibold text-rose-300 hover:bg-rose-400/10 hover:text-rose-200"
                        >
                          {busy ? (
                            <Loader2
                              className="size-3.5 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <Trash2 className="size-3.5" aria-hidden="true" />
                          )}
                          Cancel Application
                        </Button>
                      </>
                    ) : (
                      <p className="flex items-center gap-2 text-xs text-neutral-500">
                        {application.status === "accepted" ? (
                          <CheckCircle2
                            className="size-4 text-emerald-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <XCircle
                            className="size-4 text-rose-400"
                            aria-hidden="true"
                          />
                        )}
                        This application can no longer be cancelled.
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!busyId) setDeleteTarget(null)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-application-title"
            onClick={(event: MouseEvent) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl shadow-black/50"
          >
            <span className="flex size-12 items-center justify-center rounded-xl bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/25">
              <Trash2 className="size-6" aria-hidden="true" />
            </span>
            <h2
              id="delete-application-title"
              className="mt-4 text-lg font-bold text-white"
            >
              Cancel this application?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              Your application for{" "}
              <span className="font-semibold text-neutral-200">
                {deleteTarget.tuitionTitle}
              </span>{" "}
              will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={Boolean(busyId)}
                onClick={() => setDeleteTarget(null)}
                className="h-10 rounded-xl border-white/15 bg-white/5 px-4 text-sm font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
              >
                Keep application
              </Button>
              <Button
                type="button"
                disabled={Boolean(busyId)}
                onClick={confirmDelete}
                className="h-10 gap-2 rounded-xl bg-rose-400 px-4 text-sm font-bold text-neutral-950 hover:bg-rose-300"
              >
                {busyId ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="size-4" aria-hidden="true" />
                )}
                {busyId ? "Cancelling..." : "Cancel Application"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <Link
          href="/tuitions"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-neutral-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          Browse more tuitions
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </DashboardPage>
  )
}
