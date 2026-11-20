"use client"

import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileSearch,
  Globe2,
  GraduationCap,
  Home,
  Laptop,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { notify as uiNotify, userMessage } from "@/lib/notify"
import {
  CLASS_LEVEL_OPTIONS,
  DAYS_PER_WEEK_OPTIONS,
  SUBJECT_OPTIONS,
  TUITION_MODES,
  deleteTuition,
  getMyTuitions,
  updateTuition,
  updateTuitionStatus,
  type TuitionInput,
  type TuitionRecord,
} from "@/lib/actions/tuition"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

// The edit form keeps the numeric fields as strings while the user types;
// they are parsed back to numbers on submit.
type EditForm = Omit<TuitionInput, "monthlyFee" | "daysPerWeek"> & {
  monthlyFee: string
  daysPerWeek: string
}

const cardClasses =
  "rounded-2xl border border-white/10 bg-neutral-900/70 shadow-lg shadow-black/10"
const inputClasses =
  "h-11 w-full rounded-xl border border-white/10 bg-neutral-950/60 px-3 text-sm text-white shadow-sm transition-all outline-none placeholder:text-neutral-600 hover:border-white/20 focus-visible:border-lime-400/60 focus-visible:ring-4 focus-visible:ring-lime-400/15"
const selectClasses = cn(inputClasses, "appearance-none pr-10")
const labelClasses = "text-sm font-medium text-neutral-200"

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

async function getAuth() {
  const { data: session, error } = await authClient.getSession()

  if (error || !session?.user?.id || !session.session.token) {
    throw new Error("Please sign in again to manage your tuitions.")
  }

  return {
    userId: session.user.id,
    token: session.session.token,
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

/** The fee field is free text, so strip currency symbols before parsing. */
function parseAmount(value: string) {
  const numeric = Number(value.replace(/[^0-9.]/g, ""))
  return Number.isFinite(numeric) ? numeric : NaN
}

function SelectChevron() {
  return (
    <ChevronDown
      className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-neutral-500"
      aria-hidden="true"
    />
  )
}

function ApprovalBadge({ value }: { value: string }) {
  const normalized = value?.toLowerCase()
  const approved = normalized === "approved"
  const rejected = normalized === "rejected"
  const Icon = approved ? CheckCircle2 : rejected ? XCircle : Clock3

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        approved && "border-lime-400/30 bg-lime-400/10 text-lime-300",
        rejected && "border-rose-400/30 bg-rose-400/10 text-rose-300",
        !approved &&
          !rejected &&
          "border-amber-400/30 bg-amber-400/10 text-amber-300"
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {approved ? "Approved" : rejected ? "Rejected" : "Pending"}
    </span>
  )
}

function StatusBadge({ value }: { value: string }) {
  const active = value?.toLowerCase() === "active"
  const Icon = active ? CheckCircle2 : XCircle

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        active
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-white/10 bg-white/5 text-neutral-400"
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {active ? "Active" : "Closed"}
    </span>
  )
}

function Modal({
  children,
  onClose,
  labelledBy,
  className,
}: {
  children: ReactNode
  onClose: () => void
  labelledBy: string
  className?: string
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl shadow-black/50 sm:p-6",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

function TuitionSkeleton() {
  return (
    <div className={cn(cardClasses, "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-40 bg-white/10" />
        <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
      </div>
      <Skeleton className="mt-3 h-4 w-24 bg-white/10" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-9 rounded-xl bg-white/10" />
        ))}
      </div>
      <Skeleton className="mt-5 h-14 w-full rounded-xl bg-white/10" />
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl bg-white/10" />
        <Skeleton className="h-9 flex-1 rounded-xl bg-white/10" />
        <Skeleton className="h-9 flex-1 rounded-xl bg-white/10" />
      </div>
    </div>
  )
}

export function MyTuitions() {
  const [tuitions, setTuitions] = useState<TuitionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loadError, setLoadError] = useState("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [approvalFilter, setApprovalFilter] = useState("all")

  const [editing, setEditing] = useState<TuitionRecord | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [tuitionToDelete, setTuitionToDelete] = useState<TuitionRecord | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    async function loadTuitions() {
      setLoading(true)

      try {
        const { userId, token } = await getAuth()
        const data = await getMyTuitions(userId, token)
        setTuitions(data)
        setLoadError("")
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not load your tuitions."
        setLoadError(message)
        notify("error", "Could not load tuitions", message)
      } finally {
        setLoading(false)
      }
    }

    loadTuitions()
  }, [refreshKey])

  function refresh() {
    setRefreshKey((current) => current + 1)
  }

  function clearFilters() {
    setSearch("")
    setStatusFilter("all")
    setApprovalFilter("all")
  }

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
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)

    const matchesStatus =
      statusFilter === "all" || tuition.status.toLowerCase() === statusFilter
    const matchesApproval =
      approvalFilter === "all" ||
      tuition.approvalStatus.toLowerCase() === approvalFilter

    return matchesSearch && matchesStatus && matchesApproval
  })

  function openEdit(tuition: TuitionRecord) {
    setEditing(tuition)
    setEditForm({
      title: tuition.title,
      subject: tuition.subject,
      classLevel: tuition.classLevel,
      mode: tuition.mode,
      location: tuition.location,
      monthlyFee: String(tuition.monthlyFee ?? ""),
      daysPerWeek: String(tuition.daysPerWeek ?? ""),
      description: tuition.description,
      bannerImage: tuition.bannerImage,
    })
  }

  function updateEditField<K extends keyof EditForm>(
    field: K,
    value: EditForm[K]
  ) {
    setEditForm((current) =>
      current ? { ...current, [field]: value } : current
    )
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing || !editForm) return

    setSaving(true)

    try {
      const monthlyFee = parseAmount(editForm.monthlyFee)
      const daysPerWeek = Number(editForm.daysPerWeek)

      if (!Number.isFinite(monthlyFee) || monthlyFee <= 0) {
        notify(
          "error",
          "Invalid monthly fee",
          "Enter a valid amount, for example 5000."
        )
        return
      }

      if (!Number.isFinite(daysPerWeek) || daysPerWeek < 1) {
        notify(
          "error",
          "Invalid days per week",
          "Select how many days per week you can teach."
        )
        return
      }

      const { token } = await getAuth()
      await updateTuition(
        editing.id,
        {
          ...editForm,
          monthlyFee,
          daysPerWeek,
        },
        token
      )

      notify(
        "success",
        "Updated successfully!",
        "Your changes have been saved."
      )
      setEditing(null)
      setEditForm(null)
      refresh()
    } catch (error) {
      notify("error", "Update failed", userMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function handleStatus(tuition: TuitionRecord) {
    setBusyId(tuition.id)

    try {
      const { token } = await getAuth()
      const nextStatus = tuition.status === "Active" ? "Closed" : "Active"
      await updateTuitionStatus(tuition.id, nextStatus, token)

      notify(
        "success",
        "Updated successfully!",
        `This tuition is now ${nextStatus.toLowerCase()}.`
      )
      refresh()
    } catch (error) {
      notify("error", "Status update failed", userMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!tuitionToDelete) return

    setDeleting(true)

    try {
      const { token } = await getAuth()
      await deleteTuition(tuitionToDelete.id, token)

      notify(
        "success",
        "Deleted successfully!",
        "The post has been removed from your list."
      )
      setTuitionToDelete(null)
      refresh()
    } catch (error) {
      notify("error", "Delete failed", userMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-lime-300 uppercase">
            <BookOpen className="size-3.5" aria-hidden="true" />
            Tutor tools
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            My Tuitions
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400 sm:text-base">
            Review, edit, and manage every tuition post you have created.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={refresh}
            disabled={loading}
            className="h-10 gap-2 rounded-xl border-white/15 bg-white/5 px-4 text-sm font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw
              className={cn("size-4", loading && "animate-spin")}
              aria-hidden="true"
            />
            Refresh
          </Button>
          <Link
            href="/dashboard/tutor/post-tuition"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-transparent bg-lime-400 px-4 text-sm font-bold text-neutral-950 shadow-lg shadow-lime-400/20 transition-all hover:bg-lime-300 hover:shadow-xl hover:shadow-lime-400/30"
          >
            <Plus className="size-4" aria-hidden="true" />
            Post a Tuition
          </Link>
        </div>
      </header>

      <section className={cn(cardClasses, "p-4 sm:p-5")}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-500"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, subject, or location..."
              aria-label="Search tuitions"
              className={cn(inputClasses, "pl-10")}
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by active status"
              className={selectClasses}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
            <SelectChevron />
          </div>

          <div className="relative">
            <select
              value={approvalFilter}
              onChange={(event) => setApprovalFilter(event.target.value)}
              aria-label="Filter by admin approval"
              className={selectClasses}
            >
              <option value="all">All approvals</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <SelectChevron />
          </div>
        </div>

        <p className="mt-3 text-xs text-neutral-500">
          {loading
            ? "Loading your tuitions..."
            : `${filteredTuitions.length} of ${tuitions.length} tuition${tuitions.length === 1 ? "" : "s"} shown`}
        </p>
      </section>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <TuitionSkeleton key={item} />
            ))}
          </div>
        ) : loadError ? (
          <div className={cn(cardClasses, "p-8 text-center")}>
            <AlertTriangle
              className="mx-auto size-8 text-rose-400"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold text-white">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-neutral-400">{loadError}</p>
            <Button
              type="button"
              onClick={refresh}
              className="mt-5 h-10 gap-2 rounded-xl bg-lime-400 px-4 text-sm font-bold text-neutral-950 hover:bg-lime-300"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : tuitions.length === 0 ? (
          <div className={cn(cardClasses, "p-10 text-center")}>
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25">
              <FileSearch className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-white">
              No tuitions yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
              You have not posted any tuition requirements. Create your first
              post to start connecting with students.
            </p>
            <Link
              href="/dashboard/tutor/post-tuition"
              className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 text-sm font-bold text-neutral-950 transition-all hover:bg-lime-300"
            >
              <Plus className="size-4" aria-hidden="true" />
              Post your first tuition
            </Link>
          </div>
        ) : filteredTuitions.length === 0 ? (
          <div className={cn(cardClasses, "p-8 text-center")}>
            <Search
              className="mx-auto size-8 text-neutral-500"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold text-white">
              No matching tuitions
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Try a different search term or clear your filters.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="mt-5 h-9 rounded-xl border-white/15 bg-white/5 px-4 text-sm font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTuitions.map((tuition) => {
              const busy = busyId === tuition.id

              return (
                <article
                  key={tuition.id}
                  className={cn(
                    cardClasses,
                    "flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-lime-400/30 hover:shadow-xl hover:shadow-black/20"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-white">
                        {tuition.title || "Untitled tuition"}
                      </h2>
                      <p className="mt-1 text-xs font-medium text-lime-300">
                        {tuition.subject || "Subject not set"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <ApprovalBadge value={tuition.approvalStatus} />
                      <StatusBadge value={tuition.status} />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-neutral-950/40 px-3 py-2">
                      <GraduationCap
                        className="size-4 shrink-0 text-neutral-500"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate text-xs text-neutral-300">
                        {tuition.classLevel || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-neutral-950/40 px-3 py-2">
                      {tuition.mode === "Online" ? (
                        <Laptop
                          className="size-4 shrink-0 text-neutral-500"
                          aria-hidden="true"
                        />
                      ) : tuition.mode === "Offline" ? (
                        <Home
                          className="size-4 shrink-0 text-neutral-500"
                          aria-hidden="true"
                        />
                      ) : (
                        <Globe2
                          className="size-4 shrink-0 text-neutral-500"
                          aria-hidden="true"
                        />
                      )}
                      <span className="min-w-0 truncate text-xs text-neutral-300">
                        {tuition.mode || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-neutral-950/40 px-3 py-2">
                      <MapPin
                        className="size-4 shrink-0 text-neutral-500"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate text-xs text-neutral-300">
                        {tuition.location || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-neutral-950/40 px-3 py-2">
                      <Wallet
                        className="size-4 shrink-0 text-neutral-500"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate text-xs text-neutral-300">
                        {formatFee(tuition.monthlyFee)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-neutral-950/40 px-3 py-2">
                      <CalendarDays
                        className="size-4 shrink-0 text-neutral-500"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate text-xs text-neutral-300">
                        {tuition.daysPerWeek || 0} days/week
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-neutral-950/40 px-3 py-2">
                      <Clock3
                        className="size-4 shrink-0 text-neutral-500"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate text-xs text-neutral-300">
                        {formatDate(tuition.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                    {tuition.description || "No description provided."}
                  </p>

                  <div className="mt-auto grid grid-cols-3 gap-2 pt-5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openEdit(tuition)}
                      disabled={busy}
                      className="h-9 gap-1.5 rounded-xl border-white/10 bg-white/5 px-2 text-xs font-semibold text-neutral-200 hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-200"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleStatus(tuition)}
                      disabled={busy}
                      className="h-9 gap-1.5 rounded-xl border-white/10 bg-white/5 px-2 text-xs font-semibold text-neutral-200 hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-200"
                    >
                      {busy ? (
                        <Loader2
                          className="size-3.5 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Power className="size-3.5" aria-hidden="true" />
                      )}
                      {tuition.status === "Active" ? "Close" : "Activate"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTuitionToDelete(tuition)}
                      disabled={busy}
                      className="h-9 gap-1.5 rounded-xl border-rose-400/20 bg-rose-400/5 px-2 text-xs font-semibold text-rose-300 hover:bg-rose-400/15 hover:text-rose-200"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {editing && editForm ? (
        <Modal
          labelledBy="edit-tuition-title"
          onClose={() => {
            setEditing(null)
            setEditForm(null)
          }}
          className="max-w-2xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="edit-tuition-title"
                className="text-lg font-semibold text-white"
              >
                Edit tuition
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Update the details students will see.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setEditForm(null)
              }}
              aria-label="Close edit dialog"
              className="rounded-lg p-1.5 text-neutral-500 hover:bg-white/5 hover:text-white"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleUpdate} noValidate className="mt-5 space-y-4">
            <div>
              <label htmlFor="edit-title" className={labelClasses}>
                Tuition Title
              </label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(event) =>
                  updateEditField("title", event.target.value)
                }
                className={cn(inputClasses, "mt-2")}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-subject" className={labelClasses}>
                  Subject
                </label>
                <div className="relative mt-2">
                  <select
                    id="edit-subject"
                    value={editForm.subject}
                    onChange={(event) =>
                      updateEditField("subject", event.target.value)
                    }
                    className={selectClasses}
                  >
                    {SUBJECT_OPTIONS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </div>

              <div>
                <label htmlFor="edit-class-level" className={labelClasses}>
                  Class Level
                </label>
                <div className="relative mt-2">
                  <select
                    id="edit-class-level"
                    value={editForm.classLevel}
                    onChange={(event) =>
                      updateEditField("classLevel", event.target.value)
                    }
                    className={selectClasses}
                  >
                    {CLASS_LEVEL_OPTIONS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </div>

              <div>
                <label htmlFor="edit-mode" className={labelClasses}>
                  Tuition Mode
                </label>
                <div className="relative mt-2">
                  <select
                    id="edit-mode"
                    value={editForm.mode}
                    onChange={(event) =>
                      updateEditField("mode", event.target.value)
                    }
                    className={selectClasses}
                  >
                    {TUITION_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </div>

              <div>
                <label htmlFor="edit-location" className={labelClasses}>
                  Location
                </label>
                <Input
                  id="edit-location"
                  value={editForm.location}
                  onChange={(event) =>
                    updateEditField("location", event.target.value)
                  }
                  className={cn(inputClasses, "mt-2")}
                />
              </div>

              <div>
                <label htmlFor="edit-fee" className={labelClasses}>
                  Monthly Fee
                </label>
                <Input
                  id="edit-fee"
                  value={editForm.monthlyFee}
                  onChange={(event) =>
                    updateEditField("monthlyFee", event.target.value)
                  }
                  className={cn(inputClasses, "mt-2")}
                />
              </div>

              <div>
                <label htmlFor="edit-days" className={labelClasses}>
                  Days Per Week
                </label>
                <div className="relative mt-2">
                  <select
                    id="edit-days"
                    value={editForm.daysPerWeek}
                    onChange={(event) =>
                      updateEditField("daysPerWeek", event.target.value)
                    }
                    className={selectClasses}
                  >
                    {DAYS_PER_WEEK_OPTIONS.map((day) => (
                      <option key={day} value={day}>
                        {day} days per week
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="edit-description" className={labelClasses}>
                Description
              </label>
              <textarea
                id="edit-description"
                value={editForm.description}
                onChange={(event) =>
                  updateEditField("description", event.target.value)
                }
                rows={4}
                className={cn(inputClasses, "mt-2 h-auto min-h-28 py-3")}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(null)
                  setEditForm(null)
                }}
                className="h-10 rounded-xl border-white/15 bg-white/5 px-4 text-sm font-semibold text-neutral-300 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-10 gap-2 rounded-xl bg-lime-400 px-5 text-sm font-bold text-neutral-950 hover:bg-lime-300"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                )}
                Save changes
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {tuitionToDelete ? (
        <Modal
          labelledBy="delete-tuition-title"
          onClose={() => setTuitionToDelete(null)}
          className="max-w-md"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/25">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <h2
            id="delete-tuition-title"
            className="mt-4 text-lg font-semibold text-white"
          >
            Delete this tuition?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-400">
            <span className="font-semibold text-neutral-200">
              {tuitionToDelete.title || "This tuition"}
            </span>{" "}
            will be permanently removed. This action cannot be undone.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTuitionToDelete(null)}
              className="h-10 rounded-xl border-white/15 bg-white/5 px-4 text-sm font-semibold text-neutral-300 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="h-10 gap-2 rounded-xl bg-rose-500 px-4 text-sm font-bold text-white hover:bg-rose-400"
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-4" aria-hidden="true" />
              )}
              Delete tuition
            </Button>
          </div>
        </Modal>
      ) : null}
    </main>
  )
}
