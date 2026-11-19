"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react"
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileSearch,
  Globe2,
  GraduationCap,
  Home,
  ImageIcon,
  Laptop,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
  XCircle,
} from "lucide-react"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ToastViewport, type ToastItem } from "@/components/ui/toast"
import {
  ADMIN_TUITIONS_PAGE_SIZE,
  type AdminApiError,
  type AdminTuition,
  type AdminTuitionApprovalResponse,
  type AdminTuitionStatusFilter,
  type AdminTuitionsResponse,
} from "@/lib/admin/types"
import { SUBJECT_OPTIONS } from "@/lib/actions/tuition"
import { cn } from "@/lib/utils"

type ApprovalDecision = "approved" | "rejected"
type SortOption = "latest" | "oldest"

type PendingAction = {
  tuition: AdminTuition
  decision: ApprovalDecision
}

type SetToasts = Dispatch<SetStateAction<ToastItem[]>>

const numberFormatter = new Intl.NumberFormat("en-BD")

const STATUS_TABS: {
  value: AdminTuitionStatusFilter
  label: string
}[] = [
  { value: "all", label: "All Tuitions" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

function notify(
  setToasts: SetToasts,
  variant: ToastItem["variant"],
  title: string,
  description?: string
) {
  const id = Date.now() + Math.random()
  setToasts((current) => [...current, { id, variant, title, description }])
  window.setTimeout(() => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, 4000)
}

function errorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data) {
    const value = (data as { error?: unknown }).error
    if (typeof value === "string" && value.trim()) return value
  }
  return fallback
}

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

function ApprovalBadge({ status }: { status: AdminTuition["approvalStatus"] }) {
  const config = {
    pending: {
      label: "Pending",
      icon: Clock3,
      className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    },
    approved: {
      label: "Approved",
      icon: CheckCircle2,
      className: "border-lime-400/30 bg-lime-400/10 text-lime-300",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      className: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    },
  }[status]

  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        config.className
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {config.label}
    </span>
  )
}

function ModeIcon({ mode }: { mode: string }) {
  const normalized = mode.trim().toLowerCase()
  if (normalized === "online")
    return <Laptop className="size-4" aria-hidden="true" />
  if (normalized === "offline")
    return <Home className="size-4" aria-hidden="true" />
  return <Globe2 className="size-4" aria-hidden="true" />
}

function TuitionBanner({ tuition }: { tuition: AdminTuition }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const failed = Boolean(
    tuition.bannerImage && failedSrc === tuition.bannerImage
  )

  if (!tuition.bannerImage || failed) {
    return (
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/5 text-neutral-500 ring-1 ring-white/10">
        <ImageIcon className="size-5" aria-hidden="true" />
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tuition.bannerImage}
      alt=""
      loading="lazy"
      onError={() => setFailedSrc(tuition.bannerImage)}
      className="size-14 shrink-0 rounded-xl border border-white/10 bg-neutral-950 object-cover"
    />
  )
}

type ActionControls = {
  updating: boolean
  onRequest: (tuition: AdminTuition, decision: ApprovalDecision) => void
}

function ApprovalActions({
  tuition,
  updating,
  onRequest,
  compact = false,
}: { tuition: AdminTuition; compact?: boolean } & ActionControls) {
  return (
    <div className={cn("flex items-center gap-2", compact && "flex-1")}>
      <Button
        type="button"
        size="sm"
        onClick={() => onRequest(tuition, "approved")}
        disabled={updating || tuition.approvalStatus === "approved"}
        aria-label={`Approve ${tuition.title}`}
        className={cn(
          "h-8 gap-1.5 rounded-lg px-2.5 text-xs font-bold text-neutral-950",
          compact && "flex-1",
          tuition.approvalStatus === "approved"
            ? "bg-lime-400/30 text-lime-200/70"
            : "bg-lime-400 hover:bg-lime-300"
        )}
      >
        <Check className="size-3.5" aria-hidden="true" />
        Approve
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onRequest(tuition, "rejected")}
        disabled={updating || tuition.approvalStatus === "rejected"}
        aria-label={`Reject ${tuition.title}`}
        className={cn(
          "h-8 gap-1.5 rounded-lg border-rose-400/25 bg-rose-400/5 px-2.5 text-xs font-bold text-rose-300 hover:border-rose-400/50 hover:bg-rose-400/15 hover:text-rose-200",
          compact && "flex-1",
          tuition.approvalStatus === "rejected" && "opacity-50"
        )}
      >
        <X className="size-3.5" aria-hidden="true" />
        Reject
      </Button>
    </div>
  )
}

function TuitionTableRow({
  tuition,
  updating,
  onRequest,
}: { tuition: AdminTuition } & ActionControls) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-white/[0.02]",
        updating && "opacity-60"
      )}
    >
      <td className="px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <TuitionBanner tuition={tuition} />
          <div className="min-w-0">
            <p
              className="max-w-64 truncate text-sm font-semibold text-white"
              title={tuition.title}
            >
              {tuition.title || "Untitled tuition"}
            </p>
            <p className="mt-1 text-[11px] text-neutral-500">
              {tuition.subject || "Subject not set"} ·{" "}
              {tuition.classLevel || "Class not set"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="max-w-44 truncate text-sm font-medium text-neutral-200">
          {tuition.tutorName}
        </p>
        <p
          className="mt-0.5 max-w-44 truncate text-[11px] text-neutral-500"
          title={tuition.tutorEmail}
        >
          {tuition.tutorEmail || "—"}
        </p>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-neutral-300">
          <ModeIcon mode={tuition.mode} />
          <span>{tuition.mode || "—"}</span>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-500">
          <MapPin className="size-3" aria-hidden="true" />
          <span className="max-w-36 truncate" title={tuition.location}>
            {tuition.location || "—"}
          </span>
        </p>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <p className="text-sm font-bold text-white">
          {formatFee(tuition.monthlyFee)}
        </p>
        <p className="mt-1 text-[11px] text-neutral-500">
          {tuition.daysPerWeek || 0} days/week
        </p>
      </td>
      <td className="px-5 py-4 text-sm whitespace-nowrap text-neutral-400">
        {formatDate(tuition.createdAt)}
      </td>
      <td className="px-5 py-4">
        <ApprovalBadge status={tuition.approvalStatus} />
      </td>
      <td className="px-5 py-4 text-right">
        <ApprovalActions
          tuition={tuition}
          updating={updating}
          onRequest={onRequest}
        />
      </td>
    </tr>
  )
}

function TuitionMobileCard({
  tuition,
  updating,
  onRequest,
}: { tuition: AdminTuition } & ActionControls) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-white/10 bg-neutral-950/60 p-4 shadow-lg shadow-black/10",
        updating && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <TuitionBanner tuition={tuition} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold text-white">
            {tuition.title || "Untitled tuition"}
          </p>
          <p className="mt-1 truncate text-[11px] text-neutral-400">
            {tuition.subject || "Subject not set"} ·{" "}
            {tuition.classLevel || "Class not set"}
          </p>
        </div>
        <ApprovalBadge status={tuition.approvalStatus} />
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lime-400/15 text-[11px] font-bold text-lime-300 ring-1 ring-lime-400/25">
          {(tuition.tutorName || "T").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-neutral-200">
            {tuition.tutorName}
          </p>
          <p className="truncate text-[11px] text-neutral-500">
            {tuition.tutorEmail || "No email available"}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
          <dt className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            Mode
          </dt>
          <dd className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-neutral-200">
            <ModeIcon mode={tuition.mode} />
            {tuition.mode || "—"}
          </dd>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
          <dt className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            Location
          </dt>
          <dd className="mt-0.5 truncate text-xs font-medium text-neutral-200">
            {tuition.location || "—"}
          </dd>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
          <dt className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            Monthly fee
          </dt>
          <dd className="mt-0.5 text-xs font-bold text-white">
            {formatFee(tuition.monthlyFee)}
          </dd>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
          <dt className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            Days / week
          </dt>
          <dd className="mt-0.5 text-xs font-medium text-neutral-200">
            {tuition.daysPerWeek || 0}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
        <CalendarDays className="size-3.5" aria-hidden="true" />
        Posted {formatDate(tuition.createdAt)}
        <span className="mx-1 text-neutral-700">•</span>
        <GraduationCap className="size-3.5" aria-hidden="true" />
        {tuition.classLevel || "Class not set"}
      </div>

      <div className="mt-4 border-t border-white/5 pt-3">
        <ApprovalActions
          tuition={tuition}
          updating={updating}
          onRequest={onRequest}
          compact
        />
      </div>
    </article>
  )
}

function TuitionSkeletonRow() {
  return (
    <div className="grid grid-cols-6 items-center gap-4 px-5 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-14 rounded-xl bg-white/10" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-white/10" />
          <Skeleton className="h-3 w-24 bg-white/10" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 bg-white/10" />
        <Skeleton className="h-3 w-28 bg-white/10" />
      </div>
      <Skeleton className="h-4 w-20 bg-white/10" />
      <Skeleton className="h-4 w-16 bg-white/10" />
      <Skeleton className="h-4 w-20 bg-white/10" />
      <div className="ml-auto flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg bg-white/10" />
        <Skeleton className="h-8 w-16 rounded-lg bg-white/10" />
      </div>
    </div>
  )
}

export function AdminTuitionApprovals() {
  const [tuitions, setTuitions] = useState<AdminTuition[]>([])
  const [total, setTotal] = useState(0)
  const [totalTuitions, setTotalTuitions] = useState(0)
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [subject, setSubject] = useState("all")
  const [statusFilter, setStatusFilter] =
    useState<AdminTuitionStatusFilter>("all")
  const [sort, setSort] = useState<SortOption>("latest")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const requestIdRef = useRef(0)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [search])

  const loadTuitions = useCallback(
    async (options?: { silent?: boolean; signal?: AbortSignal }) => {
      const requestId = ++requestIdRef.current
      const silent = options?.silent ?? false

      if (silent) setRefreshing(true)
      else setLoading(true)
      setError("")

      const params = new URLSearchParams({
        page: String(page),
        limit: String(ADMIN_TUITIONS_PAGE_SIZE),
        sort,
      })
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim())
      if (subject !== "all") params.set("subject", subject)
      if (statusFilter !== "all") params.set("status", statusFilter)

      try {
        const response = await fetch(
          `/api/admin/tuitions?${params.toString()}`,
          {
            cache: "no-store",
            signal: options?.signal,
          }
        )
        const data: AdminTuitionsResponse | AdminApiError =
          await response.json()

        if (!response.ok) {
          throw new Error(errorMessage(data, "Could not load tuition posts."))
        }

        if (requestId !== requestIdRef.current) return

        const result = data as AdminTuitionsResponse
        setTuitions(result.tuitions)
        setTotal(result.total)
        setTotalTuitions(result.totalTuitions)
        setCounts(result.counts)
        setTotalPages(result.totalPages)
        if (result.page !== page) setPage(result.page)
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError")
          return
        if (requestId !== requestIdRef.current) return
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load tuition posts."
        )
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    },
    [debouncedSearch, page, sort, statusFilter, subject]
  )

  useEffect(() => {
    const controller = new AbortController()

    async function run() {
      await loadTuitions({ signal: controller.signal })
    }

    void run()
    return () => controller.abort()
  }, [loadTuitions])

  useEffect(() => {
    if (!pendingAction) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !updatingId) setPendingAction(null)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [pendingAction, updatingId])

  const requestAction = useCallback(
    (tuition: AdminTuition, decision: ApprovalDecision) => {
      if (tuition.approvalStatus === decision) return
      setPendingAction({ tuition, decision })
    },
    []
  )

  async function confirmAction() {
    if (!pendingAction || updatingId) return

    const { tuition, decision } = pendingAction
    setUpdatingId(tuition.id)

    try {
      const response = await fetch(
        `/api/admin/tuitions/${encodeURIComponent(tuition.id)}/${decision === "approved" ? "approve" : "reject"}`,
        {
          method: "PATCH",
          cache: "no-store",
        }
      )
      const data: AdminTuitionApprovalResponse | AdminApiError =
        await response.json()

      if (!response.ok) {
        throw new Error(errorMessage(data, "Could not update approval status."))
      }

      const updated = (data as AdminTuitionApprovalResponse).tuition
      setTuitions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      )
      setPendingAction(null)

      const actionLabel = decision === "approved" ? "approved" : "rejected"
      notify(
        setToasts,
        "success",
        `Tuition ${actionLabel}`,
        `“${updated.title || "Untitled tuition"}” is now ${actionLabel}.`
      )
      await loadTuitions({ silent: true })
    } catch (actionError) {
      notify(
        setToasts,
        "error",
        "Could not update approval status",
        actionError instanceof Error ? actionError.message : "Please try again."
      )
    } finally {
      setUpdatingId(null)
    }
  }

  function clearFilters() {
    setSearch("")
    setDebouncedSearch("")
    setSubject("all")
    setStatusFilter("all")
    setSort("latest")
    setPage(1)
  }

  const isFiltering =
    Boolean(debouncedSearch.trim()) ||
    subject !== "all" ||
    statusFilter !== "all"
  const start = total === 0 ? 0 : (page - 1) * ADMIN_TUITIONS_PAGE_SIZE + 1
  const end = Math.min(page * ADMIN_TUITIONS_PAGE_SIZE, total)

  return (
    <>
      <DashboardPage
        title="Tuition Approvals"
        description="Review tutor-submitted tuitions and control which posts appear on the public website."
      >
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25">
              <BookOpen className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
                Total submitted tuitions
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-white tabular-nums">
                {numberFormatter.format(totalTuitions)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1.5 text-[11px] font-semibold text-lime-300">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-lime-400" />
              </span>
              Live Data
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() => loadTuitions({ silent: tuitions.length > 0 })}
              disabled={loading || refreshing}
              className="h-8 gap-2 rounded-full border-white/15 bg-white/5 px-3 text-xs font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
            >
              <RefreshCw
                className={cn(
                  "size-3.5",
                  (loading || refreshing) && "animate-spin"
                )}
                aria-hidden="true"
              />
              Refresh
            </Button>
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter tuitions by approval status"
          className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setStatusFilter(tab.value)
                  setPage(1)
                }}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-all focus-visible:ring-4 focus-visible:ring-lime-400/25 focus-visible:outline-none",
                  active
                    ? "border-lime-400/40 bg-lime-400/10 text-lime-200"
                    : "border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <span className="truncate text-xs font-semibold sm:text-sm">
                  {tab.label}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
                    active
                      ? "bg-lime-400/20 text-lime-200"
                      : "bg-white/5 text-neutral-400"
                  )}
                >
                  {numberFormatter.format(counts[tab.value])}
                </span>
              </button>
            )
          })}
        </div>

        <section className="mt-4 rounded-2xl border border-white/10 bg-neutral-950/60 p-4 shadow-lg shadow-black/10">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_150px_auto]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-500"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title or tutor name..."
                aria-label="Search tuitions by title or tutor name"
                className="h-11 rounded-xl border-white/10 bg-neutral-950/60 pr-10 pl-10 text-sm text-white outline-none placeholder:text-neutral-600 hover:border-white/20 focus-visible:border-lime-400/60 focus-visible:ring-4 focus-visible:ring-lime-400/15"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("")
                    setPage(1)
                  }}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-neutral-500 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-lime-400/60 focus-visible:outline-none"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="relative">
              <select
                value={subject}
                onChange={(event) => {
                  setSubject(event.target.value)
                  setPage(1)
                }}
                aria-label="Filter tuitions by subject"
                className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-neutral-950/60 pr-9 pl-3 text-sm font-semibold text-white transition-colors outline-none hover:border-white/20 focus-visible:border-lime-400/60 focus-visible:ring-4 focus-visible:ring-lime-400/15"
              >
                <option value="all">All subjects</option>
                {SUBJECT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neutral-500"
                aria-hidden="true"
              />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as SortOption)
                  setPage(1)
                }}
                aria-label="Sort tuitions"
                className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-neutral-950/60 pr-9 pl-3 text-sm font-semibold text-white transition-colors outline-none hover:border-white/20 focus-visible:border-lime-400/60 focus-visible:ring-4 focus-visible:ring-lime-400/15"
              >
                <option value="latest">Latest posted</option>
                <option value="oldest">Oldest posted</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neutral-500"
                aria-hidden="true"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              disabled={!isFiltering}
              className="h-11 rounded-xl border-white/15 bg-white/5 px-4 text-xs font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
            >
              Clear filters
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <SlidersHorizontal
              className="size-3.5 text-lime-300"
              aria-hidden="true"
            />
            <span>
              {numberFormatter.format(total)} matching tuition
              {total === 1 ? "" : "s"}
              {isFiltering ? " for the current filters" : ""}
            </span>
            {refreshing ? (
              <Loader2
                className="size-3.5 animate-spin text-lime-300"
                aria-label="Refreshing tuitions"
              />
            ) : null}
          </div>
        </section>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-8 text-center">
            <AlertCircle
              className="mx-auto size-8 text-rose-400"
              aria-hidden="true"
            />
            <p className="mt-4 text-sm font-semibold text-white" role="alert">
              Could not load tuitions
            </p>
            <p className="mt-2 text-xs text-neutral-400">{error}</p>
            <Button
              type="button"
              onClick={() => loadTuitions()}
              className="mt-5 h-9 gap-2 rounded-xl bg-lime-400 px-4 text-xs font-bold text-neutral-950 hover:bg-lime-300"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : loading ? (
          <div aria-busy="true" aria-label="Loading tuitions">
            <div className="mt-5 hidden overflow-hidden rounded-2xl border border-white/10 md:block">
              <div className="divide-y divide-white/5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <TuitionSkeletonRow key={index} />
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:hidden">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4"
                >
                  <div className="flex gap-3">
                    <Skeleton className="size-14 rounded-xl bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-white/10" />
                      <Skeleton className="h-3 w-1/2 bg-white/10" />
                    </div>
                  </div>
                  <Skeleton className="mt-4 h-20 w-full rounded-xl bg-white/10" />
                  <Skeleton className="mt-4 h-9 w-full rounded-lg bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        ) : tuitions.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-neutral-950/60 p-10 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/5 text-neutral-400 ring-1 ring-white/10">
              {isFiltering ? (
                <FileSearch className="size-7" aria-hidden="true" />
              ) : (
                <AlertTriangle className="size-7" aria-hidden="true" />
              )}
            </span>
            <h2 className="mt-5 text-xl font-bold tracking-tight text-white">
              {isFiltering
                ? "No matching tuitions"
                : "No tuitions submitted yet"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
              {isFiltering
                ? "Try another title, tutor name, subject, or approval status."
                : "Tutor-submitted tuition posts will appear here for review."}
            </p>
            {isFiltering ? (
              <Button
                type="button"
                onClick={clearFilters}
                className="mt-5 h-9 rounded-xl bg-lime-400 px-4 text-xs font-bold text-neutral-950 hover:bg-lime-300"
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-white/10 md:block">
              <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
                <thead className="bg-white/[0.03] text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Tuition</th>
                    <th className="px-5 py-3">Tutor</th>
                    <th className="px-5 py-3">Mode / Location</th>
                    <th className="px-5 py-3">Fee</th>
                    <th className="px-5 py-3">Posted</th>
                    <th className="px-5 py-3">Approval</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tuitions.map((tuition) => (
                    <TuitionTableRow
                      key={tuition.id}
                      tuition={tuition}
                      updating={updatingId === tuition.id}
                      onRequest={requestAction}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid gap-3 md:hidden">
              {tuitions.map((tuition) => (
                <TuitionMobileCard
                  key={tuition.id}
                  tuition={tuition}
                  updating={updatingId === tuition.id}
                  onRequest={requestAction}
                />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
              <span>
                Showing {numberFormatter.format(start)}–
                {numberFormatter.format(end)} of {numberFormatter.format(total)}
              </span>
              {totalPages > 1 ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    disabled={page <= 1 || refreshing}
                    className="h-8 gap-1 rounded-lg border-white/15 bg-white/5 px-2.5 text-xs font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
                  >
                    <ChevronLeft className="size-3.5" aria-hidden="true" />
                    Previous
                  </Button>
                  <span className="px-2 font-semibold text-white tabular-nums">
                    {page} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    disabled={page >= totalPages || refreshing}
                    className="h-8 gap-1 rounded-lg border-white/15 bg-white/5 px-2.5 text-xs font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
                  >
                    Next
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </DashboardPage>

      <ToastViewport
        toasts={toasts}
        onDismiss={(id) =>
          setToasts((current) => current.filter((toast) => toast.id !== id))
        }
      />

      {pendingAction ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !updatingId) {
              setPendingAction(null)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-dialog-title"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl shadow-black/50"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
                  pendingAction.decision === "approved"
                    ? "bg-lime-400/10 text-lime-300 ring-lime-400/25"
                    : "bg-rose-400/10 text-rose-300 ring-rose-400/25"
                )}
              >
                {pendingAction.decision === "approved" ? (
                  <ShieldCheck className="size-5" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="size-5" aria-hidden="true" />
                )}
              </span>
              <div>
                <h2
                  id="approval-dialog-title"
                  className="text-lg font-bold tracking-tight text-white"
                >
                  {pendingAction.decision === "approved"
                    ? "Approve this tuition?"
                    : "Reject this tuition?"}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                  {pendingAction.decision === "approved"
                    ? "This post will become visible on Browse Tuitions immediately."
                    : "This post will stay in the admin list but be hidden from the public site."}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-neutral-950/60 p-4">
              <TuitionBanner tuition={pendingAction.tuition} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {pendingAction.tuition.title || "Untitled tuition"}
                </p>
                <p className="mt-0.5 truncate text-xs text-neutral-400">
                  {pendingAction.tuition.subject || "Subject not set"} ·{" "}
                  {pendingAction.tuition.tutorName}
                </p>
              </div>
              <div className="ml-auto shrink-0">
                <ApprovalBadge status={pendingAction.tuition.approvalStatus} />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingAction(null)}
                disabled={Boolean(updatingId)}
                className="h-9 rounded-xl border-white/15 bg-white/5 px-4 text-xs font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmAction}
                disabled={Boolean(updatingId)}
                className={cn(
                  "h-9 gap-2 rounded-xl px-4 text-xs font-bold",
                  pendingAction.decision === "approved"
                    ? "bg-lime-400 text-neutral-950 hover:bg-lime-300"
                    : "bg-rose-500 text-white hover:bg-rose-400"
                )}
              >
                {updatingId ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {updatingId
                  ? "Updating..."
                  : pendingAction.decision === "approved"
                    ? "Confirm approval"
                    : "Confirm rejection"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
