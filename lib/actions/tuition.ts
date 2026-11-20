"use server"

import { authFetch, getSession } from "@/lib/core/server"
import type {
  TuitionInput,
  TuitionRecord,
  TutorStats,
} from "@/lib/tuitions/options"

import type { ApplicationDetails } from "./applications"

const BASE_URL = process.env.BACKEND_API_URL || "http://localhost:5000"

async function parseError(res: Response, fallback: string) {
  const data = await res.json().catch(() => null)
  throw new Error(data?.error || fallback)
}

function jsonHeaders() {
  return { "Content-Type": "application/json" }
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

export const createTuition = async (tuitionData: TuitionInput) => {
  const res = await authFetch(`${BASE_URL}/tuitions`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(tuitionData),
  })

  if (!res.ok) await parseError(res, "Could not post this tuition.")
  return res.json()
}

export const createTuitionCount = async (): Promise<{ count: number }> => {
  // The backend derives the tutor from the verified token, so no query is
  // needed (and a client-supplied tutorId must not be trusted).
  const res = await authFetch(`${BASE_URL}/tuitions/count`)

  if (!res.ok) await parseError(res, "Could not check your tuition post limit.")
  return res.json()
}

export const getMyTuitions = async (): Promise<TuitionRecord[]> => {
  const res = await authFetch(`${BASE_URL}/tuitions`)

  if (!res.ok) await parseError(res, "Could not load your tuitions.")

  const session = await getSession()
  const userId = session?.user?.id

  // Defence in depth: never display a post that is not owned by this user.
  return normalizeTuitionRecords(await res.json()).filter(
    (tuition) => !userId || tuition.tutorId === userId
  )
}

export const updateTuition = async (id: string, tuitionData: TuitionInput) => {
  const res = await authFetch(`${BASE_URL}/tuitions/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(tuitionData),
  })

  if (!res.ok) await parseError(res, "Could not update this tuition.")
  return res.json()
}

export const updateTuitionStatus = async (
  id: string,
  status: "Active" | "Closed"
) => {
  const res = await authFetch(
    `${BASE_URL}/tuitions/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ status }),
    }
  )

  if (!res.ok) await parseError(res, "Could not change this tuition status.")
  return res.json()
}

export const deleteTuition = async (id: string) => {
  const res = await authFetch(`${BASE_URL}/tuitions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })

  if (!res.ok) await parseError(res, "Could not delete this tuition.")
  return res.json()
}

export const getTutorStats = async (): Promise<TutorStats> => {
  const res = await authFetch(`${BASE_URL}/tutor-stats`)

  if (!res.ok) await parseError(res, "Could not load your dashboard statistics.")
  return res.json()
}

export const applyForTuition = async (
  id: string,
  details?: ApplicationDetails
) => {
  const res = await authFetch(
    `${BASE_URL}/tuitions/${encodeURIComponent(id)}/apply`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(details ?? {}),
    }
  )

  if (!res.ok) await parseError(res, "Could not submit your application.")
  return res.json()
}
