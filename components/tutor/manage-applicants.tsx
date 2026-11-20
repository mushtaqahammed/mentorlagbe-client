"use client"

import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileSearch,
  FileText,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Users,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { notify as uiNotify } from "@/lib/notify"
import {
  getTutorApplicants,
  updateApplicationStatus,
  type Applicant,
  type ApplicantStats,
  type ApplicationStatus,
  type ReviewStatus,
} from "@/lib/actions/applications"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

type ReviewTarget = {
  applicant: Applicant
  status: ReviewStatus
}

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

function formatCount(value: number) {
  return String(value).padStart(2, "0")
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

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "S"
  )
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  accent: string
}) {
  return (
    <div
      className={cn(
        cardClasses,
        "p-5 transition-all hover:-translate-y-0.5 hover:border-lime-400/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-400">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
            accent
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-xs text-neutral-500">{hint}</p>
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className={cn(cardClasses, "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="h-3 w-24 bg-white/10" />
          <Skeleton className="mt-4 h-8 w-14 bg-white/10" />
        </div>
        <Skeleton className="size-10 rounded-xl bg-white/10" />
      </div>
      <Skeleton className="mt-4 h-3 w-32 bg-white/10" />
    </div>
  )
}

function ApplicantSkeleton() {
  return (
    <div className={cn(cardClasses, "p-5")}>
      <div className="flex items-start gap-3">
        <Skeleton className="size-11 rounded-xl bg-white/10" />
        <div className="flex-1">
          <Skeleton className="h-4 w-36 bg-white/10" />
          <Skeleton className="mt-2 h-3 w-48 bg-white/10" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-12 rounded-xl bg-white/10" />
        ))}
      </div>
      <Skeleton className="mt-5 h-14 w-full rounded-xl bg-white/10" />
      <div className="mt-5 flex justify-end gap-2">
        <Skeleton className="h-9 w-24 rounded-xl bg-white/10" />
        <Skeleton className="h-9 w-24 rounded-xl bg-white/10" />
      </div>
    </div>
  )
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
          "border-lime-400/30 bg-lime-400/10 text-lime-300",
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

function Detail({
  icon: Icon,
  label,
  value,
  multiline = false,
}: {
  icon: LucideIcon
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-sm font-medium break-words text-neutral-200",
          multiline ? "whitespace-pre-line" : "truncate"
        )}
        title={value}
      >
        {value}
      </p>
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

export function ManageApplicants() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [stats, setStats] = useState<ApplicantStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [search, setSearch] = useState("")
  const [tuitionFilter, setTuitionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const showErrorStateRef = useRef(true)

  useEffect(() => {
    let active = true

    async function loadApplicants() {
      const showErrorState = showErrorStateRef.current

      try {
        const { data: session, error } = await authClient.getSession()

        if (error || !session?.user?.id || !session.session.token) {
          throw new Error("Please sign in again to manage applicants.")
        }

        if (String(session.user.role).toLowerCase() !== "tutor") {
          throw new Error("Only tutor accounts can manage applicants.")
        }

        const data = await getTutorApplicants()
        if (!active) return

        setApplicants(data.applicants)
        setStats(data.stats)
        if (showErrorState) setLoadError("")
      } catch (loadFailure) {
        const message =
          loadFailure instanceof Error
            ? loadFailure.message
            : "Could not load your applicants."

        if (active && showErrorState) setLoadError(message)
        if (active) {
          notify("error", "Could not load applicants", message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadApplicants()

    return () => {
      active = false
    }
  }, [reloadKey])

  useEffect(() => {
    if (!reviewTarget) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busyId) setReviewTarget(null)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [reviewTarget, busyId])

  function refresh() {
    showErrorStateRef.current = true
    setLoading(true)
    setReloadKey((current) => current + 1)
  }

  function refreshSilently() {
    showErrorStateRef.current = false
    setReloadKey((current) => current + 1)
  }

  const tuitionOptions = useMemo(
    () =>
      [...new Set(applicants.map((applicant) => applicant.tuitionTitle))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [applicants]
  )

  const filteredApplicants = useMemo(() => {
    const query = search.trim().toLowerCase()

    return applicants.filter((applicant) => {
      const matchesSearch =
        !query ||
        applicant.studentName.toLowerCase().includes(query) ||
        applicant.studentEmail.toLowerCase().includes(query)
      const matchesTuition =
        tuitionFilter === "all" || applicant.tuitionTitle === tuitionFilter
      const matchesStatus =
        statusFilter === "all" || applicant.status === statusFilter

      return matchesSearch && matchesTuition && matchesStatus
    })
  }, [applicants, search, statusFilter, tuitionFilter])

  function clearFilters() {
    setSearch("")
    setTuitionFilter("all")
    setStatusFilter("all")
  }

  async function confirmReview() {
    if (!reviewTarget || busyId) return

    setBusyId(reviewTarget.applicant.id)

    try {
      const { data: session, error } = await authClient.getSession()

      if (error || !session?.session.token) {
        throw new Error("Please sign in again to review applications.")
      }

      await updateApplicationStatus(
        reviewTarget.applicant.id,
        reviewTarget.status
      )

      notify(
        "success",
        reviewTarget.status === "accepted"
          ? "Application accepted"
          : "Application rejected",
        `${reviewTarget.applicant.studentName}'s application has been updated.`
      )

      setReviewTarget(null)
      refreshSilently()
    } catch (reviewFailure) {
      notify(
        "error",
        "Status update failed",
        reviewFailure instanceof Error
          ? reviewFailure.message
          : "Please try again."
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardPage
      title="Manage Applicants"
      description="Review student applications and shortlist the best matches for your tuitions."
    >
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Application overview
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Live numbers from applications to your tuition posts.
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
            label="Total Applicants"
            value={formatCount(stats.total)}
            hint="Students who applied to you"
            icon={Users}
            accent="bg-sky-400/10 text-sky-300 ring-sky-400/25"
          />
          <StatCard
            label="Pending Applications"
            value={formatCount(stats.pending)}
            hint="Waiting for your review"
            icon={Clock3}
            accent="bg-amber-400/10 text-amber-300 ring-amber-400/25"
          />
          <StatCard
            label="Accepted Applications"
            value={formatCount(stats.accepted)}
            hint="Students you accepted"
            icon={CheckCircle2}
            accent="bg-lime-400/10 text-lime-300 ring-lime-400/25"
          />
          <StatCard
            label="Rejected Applications"
            value={formatCount(stats.rejected)}
            hint="Students you declined"
            icon={XCircle}
            accent="bg-rose-400/10 text-rose-300 ring-rose-400/25"
          />
        </div>
      ) : null}

      <section className={cn(cardClasses, "mt-6 p-4 sm:p-5")}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,200px)_minmax(0,170px)]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-500"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student name or email..."
              aria-label="Search applicants"
              className={cn(inputClasses, "pl-10")}
            />
          </div>

          <div className="relative">
            <select
              value={tuitionFilter}
              onChange={(event) => setTuitionFilter(event.target.value)}
              aria-label="Filter by tuition title"
              className={selectClasses}
            >
              <option value="all">All tuitions</option>
              {tuitionOptions.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
            <SelectChevron />
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
        </div>

        <p className="mt-3 text-xs text-neutral-500">
          {loading
            ? "Loading applicants..."
            : `${filteredApplicants.length} of ${applicants.length} application${applicants.length === 1 ? "" : "s"} shown`}
        </p>
      </section>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {[0, 1, 2].map((item) => (
              <ApplicantSkeleton key={item} />
            ))}
          </div>
        ) : loadError ? (
          <div className={cn(cardClasses, "p-8 text-center")}>
            <AlertTriangle
              className="mx-auto size-8 text-rose-400"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-lg font-semibold text-white">
              Could not load applicants
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
        ) : applicants.length === 0 ? (
          <div className={cn(cardClasses, "p-10 text-center")}>
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25">
              <FileSearch className="size-7" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-xl font-semibold text-white">
              No applicants yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
              When students apply to your tuition posts, their applications will
              appear here for review.
            </p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className={cn(cardClasses, "p-8 text-center")}>
            <Search
              className="mx-auto size-8 text-neutral-500"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-lg font-semibold text-white">
              No matching applicants
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
            {filteredApplicants.map((applicant) => {
              const busy = busyId === applicant.id

              return (
                <article
                  key={applicant.id}
                  className={cn(
                    cardClasses,
                    "flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-lime-400/30 hover:shadow-xl hover:shadow-black/20"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm font-bold text-lime-300 ring-1 ring-white/10">
                        {getInitials(applicant.studentName)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-white">
                          {applicant.studentName || "Unnamed student"}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-neutral-400">
                          <Mail
                            className="size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          {applicant.studentEmail || "No email provided"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={applicant.status} />
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Detail
                      icon={Phone}
                      label="Phone number"
                      value={applicant.phone || "Not provided"}
                    />
                    <Detail
                      icon={BookOpen}
                      label="Tuition title"
                      value={applicant.tuitionTitle}
                    />
                    <Detail
                      icon={CalendarDays}
                      label="Preferred schedule"
                      value={applicant.preferredSchedule || "Not provided"}
                    />
                    <Detail
                      icon={CalendarDays}
                      label="Application date"
                      value={formatDate(applicant.applicationDate)}
                    />
                    <div className="sm:col-span-2">
                      <Detail
                        icon={FileText}
                        label="Application note"
                        value={applicant.note || "No note provided."}
                        multiline
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    {applicant.status === "pending" ? (
                      <>
                        <p className="text-xs text-neutral-500">
                          Review this application to accept or reject the
                          student.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            onClick={() =>
                              setReviewTarget({
                                applicant,
                                status: "rejected",
                              })
                            }
                            className="h-9 gap-1.5 rounded-xl border-rose-400/30 bg-rose-400/5 px-3 text-xs font-semibold text-rose-300 hover:bg-rose-400/10 hover:text-rose-200"
                          >
                            {busy ? (
                              <Loader2
                                className="size-3.5 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <X className="size-3.5" aria-hidden="true" />
                            )}
                            Reject
                          </Button>
                          <Button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setReviewTarget({
                                applicant,
                                status: "accepted",
                              })
                            }
                            className="h-9 gap-1.5 rounded-xl bg-lime-400 px-3 text-xs font-bold text-neutral-950 hover:bg-lime-300"
                          >
                            {busy ? (
                              <Loader2
                                className="size-3.5 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <Check className="size-3.5" aria-hidden="true" />
                            )}
                            Accept
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="flex items-center gap-2 text-xs text-neutral-500">
                        {applicant.status === "accepted" ? (
                          <CheckCircle2
                            className="size-4 text-lime-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <XCircle
                            className="size-4 text-rose-400"
                            aria-hidden="true"
                          />
                        )}
                        This application is {applicant.status}.
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {reviewTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!busyId) setReviewTarget(null)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
            onClick={(event: MouseEvent) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl shadow-black/50"
          >
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-xl ring-1",
                reviewTarget.status === "accepted"
                  ? "bg-lime-400/10 text-lime-300 ring-lime-400/25"
                  : "bg-rose-400/10 text-rose-300 ring-rose-400/25"
              )}
            >
              {reviewTarget.status === "accepted" ? (
                <CheckCircle2 className="size-6" aria-hidden="true" />
              ) : (
                <XCircle className="size-6" aria-hidden="true" />
              )}
            </span>
            <h2
              id="review-dialog-title"
              className="mt-4 text-lg font-bold text-white"
            >
              {reviewTarget.status === "accepted"
                ? "Accept this application?"
                : "Reject this application?"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              {reviewTarget.status === "accepted"
                ? "The student will be marked as accepted for"
                : "The student will be marked as rejected for"}{" "}
              <span className="font-semibold text-neutral-200">
                {reviewTarget.applicant.tuitionTitle}
              </span>
              . This action updates their application status immediately.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={Boolean(busyId)}
                onClick={() => setReviewTarget(null)}
                className="h-10 rounded-xl border-white/15 bg-white/5 px-4 text-sm font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={Boolean(busyId)}
                onClick={confirmReview}
                className={cn(
                  "h-10 gap-2 rounded-xl px-4 text-sm font-bold text-neutral-950",
                  reviewTarget.status === "accepted"
                    ? "bg-lime-400 hover:bg-lime-300"
                    : "bg-rose-400 hover:bg-rose-300"
                )}
              >
                {busyId ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {busyId
                  ? "Updating..."
                  : reviewTarget.status === "accepted"
                    ? "Accept application"
                    : "Reject application"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardPage>
  )
}
