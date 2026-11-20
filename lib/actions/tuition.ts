import type { ApplicationDetails } from "./applications"

export const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Bangla",
  "ICT",
  "Accounting",
  "General Science",
  "Other",
]

export const CLASS_LEVEL_OPTIONS = [
  "Play",
  "Nursery",
  "KG",
  "Class 1–10",
  "SSC",
  "HSC",
  "Admission",
  "University",
]

export const TUITION_MODES = ["Offline", "Online", "Both"]

export const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6, 7]

export type TuitionInput = {
  title: string
  subject: string
  classLevel: string
  mode: string
  location: string
  monthlyFee: number
  daysPerWeek: number
  description: string
  bannerImage: string
}

export type TuitionRecord = TuitionInput & {
  id: string
  tutorId: string
  approvalStatus: "Pending" | "Approved" | "Rejected"
  status: "Active" | "Closed"
  createdAt: string
  updatedAt?: string | null
}

export type PlanUsage = {
  plan: "free" | "pro"
  used: number
  limit: number | null
  remaining: number | null
  unlimited: boolean
}

// These helpers also run inside client components, where only NEXT_PUBLIC_*
// variables are inlined into the bundle. Without the public variant the browser
// would silently fall back to localhost instead of the deployed backend.
const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.BACKEND_API_URL ||
  "http://localhost:5000"

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

function asString(value: unknown, fallback = "") {
  if (value == null) return fallback
  return typeof value === "string" ? value : String(value)
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeApprovalStatus(
  value: unknown
): TuitionRecord["approvalStatus"] {
  const normalized = asString(value).trim().toLowerCase()
  if (normalized === "approved") return "Approved"
  if (normalized === "rejected") return "Rejected"
  return "Pending"
}

function normalizeTuitionStatus(value: unknown): TuitionRecord["status"] {
  return asString(value).trim().toLowerCase() === "closed" ? "Closed" : "Active"
}

function objectIdToIso(value: unknown) {
  const id = asString(value)
  if (/^[a-f\d]{24}$/i.test(id)) {
    const timestamp = Number.parseInt(id.slice(0, 8), 16) * 1000
    if (Number.isFinite(timestamp)) return new Date(timestamp).toISOString()
  }
  return new Date().toISOString()
}

function toIsoString(value: unknown, fallbackId: unknown) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? objectIdToIso(fallbackId)
      : value.toISOString()
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString()
  }

  return objectIdToIso(fallbackId)
}

function normalizeTuitionRecord(value: unknown): TuitionRecord | null {
  if (!value || typeof value !== "object") return null

  const raw = value as Record<string, unknown>
  const id = asString(raw.id ?? raw._id).trim()
  if (!id) return null

  const dateFallback = raw._id ?? raw.id

  return {
    id,
    tutorId: asString(raw.tutorId),
    title: asString(raw.title),
    subject: asString(raw.subject),
    classLevel: asString(raw.classLevel),
    mode: asString(raw.mode, "Online"),
    location: asString(raw.location),
    monthlyFee: asNumber(raw.monthlyFee),
    daysPerWeek: asNumber(raw.daysPerWeek),
    description: asString(raw.description),
    bannerImage: asString(raw.bannerImage),
    approvalStatus: normalizeApprovalStatus(raw.approvalStatus),
    status: normalizeTuitionStatus(raw.status),
    createdAt: toIsoString(raw.createdAt, dateFallback),
    updatedAt:
      raw.updatedAt == null ? null : toIsoString(raw.updatedAt, dateFallback),
  }
}

function normalizeTuitionRecords(value: unknown): TuitionRecord[] {
  const wrapped = value as { tuitions?: unknown } | null
  const items = Array.isArray(value)
    ? value
    : wrapped && Array.isArray(wrapped.tuitions)
      ? wrapped.tuitions
      : []

  const byId = new Map<string, TuitionRecord>()
  for (const item of items) {
    const record = normalizeTuitionRecord(item)
    if (record && !byId.has(record.id)) byId.set(record.id, record)
  }

  return [...byId.values()]
}

export const createTuition = async (
  tuitionData: TuitionInput,
  token: string
) => {
  const res = await fetch(`${BASE_URL}/tuitions`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(tuitionData),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error || "Could not post this tuition.")
  }

  return res.json()
}

export const createTuitionCount = async (
  query = ""
): Promise<{ count: number }> => {
  const res = await fetch(`${BASE_URL}/tuitions/count?${query}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Could not check your tuition post limit.")
  }

  return res.json()
}

export const getMyTuitions = async (
  userId: string,
  token: string
): Promise<TuitionRecord[]> => {
  const res = await fetch(
    `${BASE_URL}/tuitions?tutorId=${encodeURIComponent(userId)}`,
    {
      headers: authHeaders(token),
      cache: "no-store",
    }
  )

  if (!res.ok) throw new Error("Could not load your tuitions.")

  const data: unknown = await res.json()

  // Defence in depth: older backend versions ignore the tutorId query and
  // return every tuition, so never trust the response to be scoped.
  return normalizeTuitionRecords(data).filter(
    (tuition) => tuition.tutorId === userId
  )
}

export const updateTuition = async (
  id: string,
  tuitionData: TuitionInput,
  token: string
) => {
  const res = await fetch(`${BASE_URL}/tuitions/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(tuitionData),
  })

  if (!res.ok) throw new Error("Could not update this tuition.")
  return res.json()
}

export const updateTuitionStatus = async (
  id: string,
  status: "Active" | "Closed",
  token: string
) => {
  const res = await fetch(`${BASE_URL}/tuitions/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  })

  if (!res.ok) throw new Error("Could not change this tuition status.")
  return res.json()
}

export const deleteTuition = async (id: string, token: string) => {
  const res = await fetch(`${BASE_URL}/tuitions/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  })

  if (!res.ok) throw new Error("Could not delete this tuition.")
  return res.json()
}

export type TutorStats = {
  totalTuitions: number
  activeApprovedTuitions: number
  totalApplicants: number
  plan: string
}

export const getTutorStats = async (token: string): Promise<TutorStats> => {
  const res = await fetch(`${BASE_URL}/tutor-stats`, {
    headers: authHeaders(token),
    cache: "no-store",
  })

  if (!res.ok) throw new Error("Could not load your dashboard statistics.")
  return res.json()
}

export const applyForTuition = async (
  id: string,
  token: string,
  details?: ApplicationDetails
) => {
  const res = await fetch(
    `${BASE_URL}/tuitions/${encodeURIComponent(id)}/apply`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(details ?? {}),
    }
  )

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error || "Could not submit your application.")
  }

  return res.json()
}
