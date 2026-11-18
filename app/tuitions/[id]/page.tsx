"use client"

import React, {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  GraduationCap,
  Home,
  Laptop,
  Loader2,
  MapPin,
  RefreshCw,
  UserRound,
  Wallet,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ToastViewport, type ToastItem } from "@/components/ui/toast"
import { applyForTuition } from "@/lib/actions/tuition"
import { authClient } from "@/lib/auth-client"
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
  approvalStatus?: string
  status?: string
  createdAt: string
  tutorName?: string
}

type SetToasts = Dispatch<SetStateAction<ToastItem[]>>

const cardClasses =
  "rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"

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

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatFee(value: number) {
  return `৳ ${Number(value || 0).toLocaleString("en-BD")}`
}

function ApprovalBadge({ value }: { value?: string }) {
  const approved = value?.toLowerCase() === "approved"
  const rejected = value?.toLowerCase() === "rejected"
  const Icon = approved ? CheckCircle2 : rejected ? XCircle : Clock3

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        approved && "border-emerald-200 bg-emerald-50 text-emerald-700",
        rejected && "border-rose-200 bg-rose-50 text-rose-700",
        !approved && !rejected && "border-amber-200 bg-amber-50 text-amber-700"
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {approved ? "Approved" : rejected ? "Rejected" : "Pending"}
    </span>
  )
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

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-3">
      <span className="mt-0.5 shrink-0 text-neutral-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-wide text-neutral-400 uppercase">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-neutral-800">
          {value || "—"}
        </p>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 w-full rounded-2xl bg-neutral-200" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl bg-neutral-200" />
          <Skeleton className="h-64 w-full rounded-2xl bg-neutral-200" />
        </div>
        <Skeleton className="h-56 w-full rounded-2xl bg-neutral-200" />
      </div>
    </div>
  )
}

export default function TuitionDetailPage() {
  const params = useParams<{ id: string }>()
  const id = typeof params.id === "string" ? params.id : ""

  const [tuition, setTuition] = React.useState<Tuition | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const [submitting, setSubmitting] = React.useState(false)
  const [applied, setApplied] = React.useState(false)
  const [showApplyForm, setShowApplyForm] = React.useState(false)
  const [applicationDetails, setApplicationDetails] = React.useState({
    phone: "",
    preferredSchedule: "",
    note: "",
  })

  React.useEffect(() => {
    async function loadTuition() {
      setLoading(true)
      setError("")

      try {
        const response = await fetch(
          `/api/tuitions/${encodeURIComponent(id)}`,
          {
            cache: "no-store",
          }
        )

        if (!response.ok) {
          const details = await response.json().catch(() => null)
          throw new Error(
            details?.error || `Request failed with status ${response.status}`
          )
        }

        setTuition(await response.json())
      } catch (fetchError) {
        console.error("Error fetching tuition:", fetchError)
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Could not load tuition details."
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) loadTuition()
  }, [id, refreshKey])

  function openApplyForm() {
    if (!submitting && !applied) setShowApplyForm(true)
  }

  function updateApplicationField(
    field: keyof typeof applicationDetails,
    value: string
  ) {
    setApplicationDetails((current) => ({ ...current, [field]: value }))
  }

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id || submitting || applied) return

    const phone = applicationDetails.phone.trim()
    const preferredSchedule = applicationDetails.preferredSchedule.trim()

    if (!phone || !preferredSchedule) {
      notify(
        setToasts,
        "error",
        "Missing details",
        "Add your phone number and preferred schedule before applying."
      )
      return
    }

    setSubmitting(true)

    try {
      const { data: session, error: sessionError } =
        await authClient.getSession()

      if (sessionError || !session?.user || !session.session.token) {
        throw new Error("Please sign in as a student to apply.")
      }

      if (String(session.user.role).toLowerCase() !== "student") {
        throw new Error("Only student accounts can apply for tuitions.")
      }

      await applyForTuition(id, session.session.token, {
        phone,
        preferredSchedule,
        note: applicationDetails.note.trim(),
      })

      setApplied(true)
      setShowApplyForm(false)
      notify(
        setToasts,
        "success",
        "Application submitted",
        "The tutor will review your request soon."
      )
    } catch (applyError) {
      const message =
        applyError instanceof Error
          ? applyError.message
          : "Could not submit your application."

      if (message.toLowerCase().includes("already applied")) {
        setApplied(true)
        setShowApplyForm(false)
      }

      notify(setToasts, "error", "Application not submitted", message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-svh bg-neutral-50 text-neutral-900">
      <ToastViewport
        toasts={toasts}
        onDismiss={(toastId) =>
          setToasts((current) =>
            current.filter((toast) => toast.id !== toastId)
          )
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/tuitions"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to all tuitions
        </Link>

        <div className="mt-6">
          {loading ? (
            <DetailSkeleton />
          ) : error || !tuition ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
              <AlertCircle
                className="mx-auto size-9 text-rose-500"
                aria-hidden="true"
              />
              <h1 className="mt-4 text-lg font-semibold text-neutral-900">
                {error || "Tuition not found"}
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                The tuition may have been removed or is unavailable.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRefreshKey((current) => current + 1)}
                  className="h-10 gap-2 rounded-xl border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Try again
                </Button>
                <Link
                  href="/tuitions"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-lime-400 px-4 text-sm font-bold text-neutral-950 transition-colors hover:bg-lime-300"
                >
                  Browse tuitions
                </Link>
              </div>
            </div>
          ) : (
            <>
              <section className="rounded-2xl bg-neutral-900 p-6 text-white shadow-lg shadow-black/10 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-300">
                    <BookOpen className="size-3.5" aria-hidden="true" />
                    {tuition.subject || "Subject not set"}
                  </span>
                  <ApprovalBadge value={tuition.approvalStatus} />
                  <StatusBadge value={tuition.status} />
                </div>

                <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
                  {tuition.title || "Untitled tuition"}
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-neutral-300">
                  Posted on {formatDate(tuition.createdAt)} by{" "}
                  <span className="font-semibold text-white">
                    {tuition.tutorName || "Tutor"}
                  </span>
                </p>
              </section>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                  <section className={cardClasses}>
                    <h2 className="text-lg font-semibold text-neutral-900">
                      Tuition details
                    </h2>
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <DetailItem
                        icon={<GraduationCap className="size-4" />}
                        label="Class level"
                        value={tuition.classLevel}
                      />
                      <DetailItem
                        icon={<ModeIcon mode={tuition.mode} />}
                        label="Tuition mode"
                        value={tuition.mode}
                      />
                      <DetailItem
                        icon={<MapPin className="size-4" />}
                        label="Location"
                        value={tuition.location}
                      />
                      <DetailItem
                        icon={<Wallet className="size-4" />}
                        label="Monthly fee"
                        value={formatFee(tuition.monthlyFee)}
                      />
                      <DetailItem
                        icon={<CalendarDays className="size-4" />}
                        label="Days per week"
                        value={`${tuition.daysPerWeek || 0} days/week`}
                      />
                      <DetailItem
                        icon={<Clock3 className="size-4" />}
                        label="Posted on"
                        value={formatDate(tuition.createdAt)}
                      />
                    </div>
                  </section>

                  <section className={cardClasses}>
                    <h2 className="text-lg font-semibold text-neutral-900">
                      Description
                    </h2>
                    <p className="mt-4 text-sm leading-7 whitespace-pre-line text-neutral-600">
                      {tuition.description || "No description provided."}
                    </p>
                  </section>

                  <section className={cardClasses}>
                    <h2 className="text-lg font-semibold text-neutral-900">
                      About the tutor
                    </h2>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-full bg-neutral-900 text-white">
                        <UserRound className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {tuition.tutorName || "Tutor"}
                        </p>
                        <p className="text-xs text-neutral-500">
                          MentorLagbe tutor
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                <aside className="lg:sticky lg:top-6 lg:self-start">
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                      Monthly fee
                    </p>
                    <p className="mt-2 text-3xl font-bold text-neutral-900">
                      {formatFee(tuition.monthlyFee)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {tuition.daysPerWeek || 0} days per week
                    </p>

                    <Button
                      type="button"
                      onClick={openApplyForm}
                      disabled={submitting || applied}
                      className={cn(
                        "mt-6 h-12 w-full gap-2 rounded-xl bg-lime-400 text-sm font-bold text-neutral-950 transition-colors hover:bg-lime-300",
                        applied && "bg-emerald-500 hover:bg-emerald-500"
                      )}
                    >
                      {submitting ? (
                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : applied ? (
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                      ) : (
                        <BookOpen className="size-4" aria-hidden="true" />
                      )}
                      {applied
                        ? "Application Submitted"
                        : submitting
                          ? "Submitting..."
                          : "I Want This Tuition"}
                    </Button>

                    <p className="mt-3 text-center text-xs leading-relaxed text-neutral-500">
                      {applied
                        ? "Your application is pending review."
                        : "Sign in as a student to send your application to the tutor."}
                    </p>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>

      {showApplyForm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!submitting) setShowApplyForm(false)
          }}
        >
          <form
            onSubmit={handleApply}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-dialog-title"
            className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl"
          >
            <h2
              id="apply-dialog-title"
              className="text-lg font-bold text-neutral-900"
            >
              Apply for this tuition
            </h2>
            <p className="mt-1.5 text-sm text-neutral-500">
              Share a few details so the tutor can review your request.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="apply-phone"
                  className="text-xs font-semibold text-neutral-700"
                >
                  Phone number
                </label>
                <Input
                  id="apply-phone"
                  value={applicationDetails.phone}
                  onChange={(event) =>
                    updateApplicationField("phone", event.target.value)
                  }
                  placeholder="e.g. 01712345678"
                  maxLength={40}
                  required
                  className="mt-2 h-11 w-full rounded-xl border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:border-lime-500 focus-visible:ring-lime-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="apply-schedule"
                  className="text-xs font-semibold text-neutral-700"
                >
                  Preferred schedule
                </label>
                <Input
                  id="apply-schedule"
                  value={applicationDetails.preferredSchedule}
                  onChange={(event) =>
                    updateApplicationField(
                      "preferredSchedule",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Weekdays, 5:00 PM - 6:00 PM"
                  maxLength={120}
                  required
                  className="mt-2 h-11 w-full rounded-xl border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:border-lime-500 focus-visible:ring-lime-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="apply-note"
                  className="text-xs font-semibold text-neutral-700"
                >
                  Application note{" "}
                  <span className="font-normal text-neutral-400">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="apply-note"
                  value={applicationDetails.note}
                  onChange={(event) =>
                    updateApplicationField("note", event.target.value)
                  }
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell the tutor why you are interested..."
                  className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400 focus-visible:border-lime-500 focus-visible:ring-4 focus-visible:ring-lime-500/20"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApplyForm(false)}
                disabled={submitting}
                className="h-10 rounded-xl border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-10 gap-2 rounded-xl bg-lime-400 px-4 text-sm font-bold text-neutral-950 hover:bg-lime-300"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {submitting ? "Submitting..." : "Submit application"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  )
}
