import { getToken } from "@/lib/core/server"
import type {
  AdminTestimonial,
  Testimonial,
  TestimonialRole,
  TestimonialStatus,
} from "@/lib/testimonials/types"

/**
 * Testimonial data access goes through the Express backend. Public reads are
 * unauthenticated; submissions and admin moderation carry the shared internal
 * secret plus the verified user/admin id, which the backend re-checks.
 */
function backendUrl(path: string) {
  return `${process.env.BACKEND_API_URL || "http://localhost:5000"}${path}`
}

function internalHeaders(extra: Record<string, string> = {}, token = "") {
  return {
    "Content-Type": "application/json",
    "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

async function backendError(response: Response, fallback: string) {
  let message = fallback

  try {
    const data = (await response.json()) as { error?: unknown }
    if (typeof data.error === "string" && data.error) message = data.error
  } catch {
    // Keep the fallback message when the backend did not return JSON.
  }

  return new Error(`${message} (${response.status})`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function normalizeRole(value: unknown): TestimonialRole | null {
  return value === "student" || value === "tutor" ? value : null
}

function normalizeStatus(value: unknown): TestimonialStatus | null {
  return value === "pending" || value === "approved" || value === "rejected"
    ? value
    : null
}

function normalizeTestimonial(value: unknown): Testimonial | null {
  if (!isRecord(value)) return null

  const role = normalizeRole(value.role)
  if (!role) return null

  return {
    id: String(value.id || ""),
    name: String(value.name || "MentorLagbe member"),
    role,
    rating: typeof value.rating === "number" ? value.rating : 0,
    message: String(value.message || ""),
    image:
      typeof value.image === "string" && value.image ? value.image : null,
    verified: value.verified === true,
    createdAt:
      typeof value.createdAt === "string" && value.createdAt
        ? value.createdAt
        : new Date().toISOString(),
  }
}

function normalizeAdminTestimonial(value: unknown): AdminTestimonial | null {
  const testimonial = normalizeTestimonial(value)
  if (!testimonial || !isRecord(value)) return null

  const status = normalizeStatus(value.status)
  if (!status) return null

  return {
    ...testimonial,
    userId: String(value.userId || ""),
    status,
    updatedAt:
      typeof value.updatedAt === "string" && value.updatedAt
        ? value.updatedAt
        : testimonial.createdAt,
  }
}

export class TestimonialConflictError extends Error {}

export async function getApprovedTestimonials(
  limit: number
): Promise<Testimonial[]> {
  const response = await fetch(
    backendUrl(`/testimonials?limit=${encodeURIComponent(limit)}`),
    { cache: "no-store" }
  )

  if (!response.ok) {
    throw await backendError(response, "Could not load testimonials")
  }

  const data = (await response.json()) as { testimonials?: unknown }
  const items = Array.isArray(data.testimonials) ? data.testimonials : []

  return items
    .map(normalizeTestimonial)
    .filter((item): item is Testimonial => item !== null)
}

export async function listTestimonials(options: {
  status?: TestimonialStatus | "all"
  limit: number
  skip: number
  adminId: string
}): Promise<{ testimonials: AdminTestimonial[]; total: number }> {
  const params = new URLSearchParams({
    status: options.status || "all",
    limit: String(options.limit),
    skip: String(Math.max(0, options.skip)),
  })

  const response = await fetch(backendUrl(`/admin/testimonials?${params}`), {
    headers: internalHeaders({ "x-admin-id": options.adminId }, await getToken()),
    cache: "no-store",
  })

  if (!response.ok) {
    throw await backendError(response, "Could not list testimonials")
  }

  const data = (await response.json()) as {
    testimonials?: unknown
    total?: unknown
  }
  const items = Array.isArray(data.testimonials) ? data.testimonials : []
  const testimonials = items
    .map(normalizeAdminTestimonial)
    .filter((item): item is AdminTestimonial => item !== null)

  return {
    testimonials,
    total:
      typeof data.total === "number" && Number.isFinite(data.total)
        ? data.total
        : testimonials.length,
  }
}

export async function createTestimonial(input: {
  userId: string
  name: string
  role: TestimonialRole
  image: string | null
  rating: number
  message: string
}) {
  const response = await fetch(backendUrl("/testimonials"), {
    method: "POST",
    headers: internalHeaders({ "x-user-id": input.userId }, await getToken()),
    // The backend derives name/role/image from the real user record.
    body: JSON.stringify({ rating: input.rating, message: input.message }),
    cache: "no-store",
  })

  if (response.status === 409) {
    throw new TestimonialConflictError(
      "You have already submitted a testimonial."
    )
  }

  if (!response.ok) {
    throw await backendError(response, "Could not submit testimonial")
  }

  const data = (await response.json()) as { id?: unknown }
  return String(data.id || "")
}

export async function updateTestimonialStatus(
  id: string,
  status: TestimonialStatus,
  adminId: string
): Promise<{ id: string; status: TestimonialStatus } | null> {
  const response = await fetch(
    backendUrl(`/admin/testimonials/${encodeURIComponent(id)}`),
    {
      method: "PATCH",
      headers: internalHeaders({ "x-admin-id": adminId }, await getToken()),
      body: JSON.stringify({ status }),
      cache: "no-store",
    }
  )

  if (response.status === 404) return null

  if (!response.ok) {
    throw await backendError(response, "Could not update testimonial")
  }

  const data = (await response.json()) as { id?: unknown; status?: unknown }

  return {
    id: String(data.id || id),
    status: normalizeStatus(data.status) || status,
  }
}
