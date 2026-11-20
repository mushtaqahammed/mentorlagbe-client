import { jsonAdminError, NO_STORE, requireAdmin } from "@/lib/admin/api-auth"
import { listTestimonials } from "@/lib/testimonials/store"
import type {
  AdminTestimonial,
  AdminTestimonialsResponse,
  TestimonialStatus,
} from "@/lib/testimonials/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const STATUSES = new Set<TestimonialStatus | "all">([
  "all",
  "pending",
  "approved",
  "rejected",
])

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export async function GET(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return jsonAdminError(guard.error, guard.status)

  const params = new URL(request.url).searchParams
  const rawStatus = params.get("status") || "all"

  if (!STATUSES.has(rawStatus as TestimonialStatus | "all")) {
    return jsonAdminError("Invalid status filter.", 400)
  }

  try {
    const limit = Math.min(parsePositiveInteger(params.get("limit"), 20), 100)
    const page = Math.max(parsePositiveInteger(params.get("page"), 1), 1)

    const { testimonials, total } = await listTestimonials({
      status: rawStatus as TestimonialStatus | "all",
      limit,
      skip: (page - 1) * limit,
      adminId: guard.userId,
    })

    const response: AdminTestimonialsResponse = {
      testimonials: testimonials as AdminTestimonial[],
      total,
      updatedAt: new Date().toISOString(),
    }

    return Response.json(response, { headers: NO_STORE })
  } catch (error) {
    console.error("Failed to list testimonials:", error)
    return jsonAdminError("Could not load testimonials.", 500)
  }
}
