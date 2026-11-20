import { NO_STORE } from "@/lib/admin/api-auth"
import { getSession } from "@/lib/core/server"
import {
  getApprovedTestimonials,
  createTestimonial,
  TestimonialConflictError,
} from "@/lib/testimonials/store"
import {
  TESTIMONIAL_MAX_LENGTH,
  TESTIMONIAL_MIN_LENGTH,
  TESTIMONIALS_LIMIT,
  type TestimonialsResponse,
} from "@/lib/testimonials/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: NO_STORE })
}

type ValidationResult =
  { ok: true; rating: number; message: string } | { ok: false; error: string }

function validateSubmission(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." }
  }

  const { rating, message } = body as {
    rating?: unknown
    message?: unknown
  }

  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return {
      ok: false,
      error: "Rating must be a whole number between 1 and 5.",
    }
  }

  if (typeof message !== "string") {
    return { ok: false, error: "Feedback message is required." }
  }

  const cleanMessage = message.trim()
  if (
    cleanMessage.length < TESTIMONIAL_MIN_LENGTH ||
    cleanMessage.length > TESTIMONIAL_MAX_LENGTH
  ) {
    return {
      ok: false,
      error: `Feedback must be between ${TESTIMONIAL_MIN_LENGTH} and ${TESTIMONIAL_MAX_LENGTH} characters.`,
    }
  }

  return { ok: true, rating, message: cleanMessage }
}

export async function GET() {
  try {
    const testimonials = await getApprovedTestimonials(TESTIMONIALS_LIMIT)
    const response: TestimonialsResponse = {
      testimonials,
      total: testimonials.length,
      updatedAt: new Date().toISOString(),
    }

    return Response.json(response, { headers: NO_STORE })
  } catch (error) {
    console.error("Failed to load testimonials:", error)
    return jsonError("Could not load testimonials.", 500)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return jsonError("Authentication required.", 401)
    }

    const role = String(session.user.role ?? "")
      .trim()
      .toLowerCase()

    if (role !== "student" && role !== "tutor") {
      return jsonError("Only students and tutors can share feedback.", 403)
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return jsonError("Invalid JSON body.", 400)
    }

    const submission = validateSubmission(body)
    if (!submission.ok) {
      return jsonError(submission.error, 400)
    }

    await createTestimonial({
      userId: String(session.user.id),
      name: session.user.name?.trim() || "MentorLagbe member",
      role,
      image: session.user.image || null,
      rating: submission.rating,
      message: submission.message,
    })

    return Response.json(
      {
        status: "pending",
        message: "Thank you! Your feedback will appear after admin approval.",
      },
      { status: 201, headers: NO_STORE }
    )
  } catch (error) {
    if (error instanceof TestimonialConflictError) {
      return jsonError(error.message, 409)
    }

    console.error("Failed to submit testimonial:", error)
    return jsonError("Could not submit your feedback.", 500)
  }
}
