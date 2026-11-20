import { jsonAdminError, NO_STORE, requireAdmin } from "@/lib/admin/api-auth"
import { updateTestimonialStatus } from "@/lib/testimonials/store"
import type { TestimonialStatus } from "@/lib/testimonials/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const REVIEW_STATUSES = new Set<TestimonialStatus>(["approved", "rejected"])

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return jsonAdminError(guard.error, guard.status)

  const { id } = await context.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonAdminError("Invalid JSON body.", 400)
  }

  const status = (body as { status?: unknown } | null)?.status
  if (
    typeof status !== "string" ||
    !REVIEW_STATUSES.has(status as TestimonialStatus)
  ) {
    return jsonAdminError("Status must be 'approved' or 'rejected'.", 400)
  }

  try {
    const updated = await updateTestimonialStatus(
      id,
      status as TestimonialStatus,
      guard.userId
    )

    if (!updated) {
      return jsonAdminError("Testimonial not found.", 404)
    }

    return Response.json(updated, { headers: NO_STORE })
  } catch (error) {
    console.error("Failed to review testimonial:", error)
    return jsonAdminError("Could not update testimonial.", 500)
  }
}
