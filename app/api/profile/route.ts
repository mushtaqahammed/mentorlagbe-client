import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import type { ProfileUser } from "@/lib/profile"
import { getRequestSession } from "@/lib/session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }

const MAX_NAME_LENGTH = 80
const MAX_IMAGE_URL_LENGTH = 2048
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{5,19}$/

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: NO_STORE })
}

function publicUser(user: {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  phone?: string | null
  role?: string | null
  createdAt?: Date | string | null
}): ProfileUser {
  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? null,
    phone: user.phone ?? "",
    role: user.role ?? "Student",
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : (user.createdAt ?? null),
  }
}

function validateImageUrl(value: string): boolean {
  if (!value || value.length > MAX_IMAGE_URL_LENGTH) return false
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

/** GET the authenticated user's own profile. */
export async function GET() {
  const session = await getRequestSession({ fresh: true })

  if (!session?.user) {
    return errorResponse("Sign in to view your profile.", 401)
  }

  return Response.json(
    { user: publicUser(session.user) },
    { headers: NO_STORE }
  )
}

/**
 * PATCH the authenticated user's own profile.
 *
 * Only name, phone and image may be changed. The request body is never spread:
 * `role` is an input-enabled Better Auth field, so passing it through would
 * allow privilege escalation. Subscription fields are server-owned as well.
 */
export async function PATCH(request: Request) {
  const session = await getRequestSession()

  if (!session?.user?.id) {
    return errorResponse("Sign in to update your profile.", 401)
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return errorResponse("Invalid request body.", 400)
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse("Invalid request body.", 400)
  }

  const update: { name?: string; phone?: string; image?: string | null } = {}

  if (body.name !== undefined) {
    if (typeof body.name !== "string") {
      return errorResponse("Please enter a valid name.", 400)
    }
    const name = body.name.trim()
    if (name.length < 2 || name.length > MAX_NAME_LENGTH) {
      return errorResponse("Name must be between 2 and 80 characters.", 400)
    }
    update.name = name
  }

  if (body.phone !== undefined) {
    if (typeof body.phone !== "string") {
      return errorResponse("Please enter a valid phone number.", 400)
    }
    const phone = body.phone.trim()
    if (phone && !PHONE_PATTERN.test(phone)) {
      return errorResponse("Please enter a valid phone number.", 400)
    }
    update.phone = phone
  }

  if (body.image !== undefined) {
    if (body.image === null || body.image === "") {
      update.image = null
    } else if (
      typeof body.image === "string" &&
      validateImageUrl(body.image.trim())
    ) {
      update.image = body.image.trim()
    } else {
      return errorResponse("Please enter a valid image URL.", 400)
    }
  }

  if (Object.keys(update).length === 0) {
    return errorResponse("No changes to save.", 400)
  }

  try {
    await auth.api.updateUser({
      body: update,
      headers: await headers(),
    })

    const refreshed = await getRequestSession({ fresh: true })

    return Response.json(
      {
        status: true,
        user: publicUser({
          ...session.user,
          ...update,
          ...(refreshed?.user ?? {}),
        }),
      },
      { headers: NO_STORE }
    )
  } catch (error) {
    console.error("Could not update profile:", error)
    return errorResponse("Could not update your profile.", 500)
  }
}
