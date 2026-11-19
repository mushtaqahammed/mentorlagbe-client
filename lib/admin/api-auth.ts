import { headers } from "next/headers"

import { auth } from "@/lib/auth"

export const NO_STORE = { "Cache-Control": "no-store" } as const

type AdminGuardResult =
  { ok: true; userId: string } | { ok: false; status: number; error: string }

export function jsonAdminError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: NO_STORE })
}

/**
 * Server-side guard for admin API routes. This reuses the same Better Auth
 * session lookup as the rest of the app; client-side role checks are never
 * trusted for protected data or mutations.
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return { ok: false, status: 401, error: "Authentication required." }
  }

  if (String(session.user.role).trim().toLowerCase() !== "admin") {
    return { ok: false, status: 403, error: "Admin access required." }
  }

  return { ok: true, userId: String(session.user.id) }
}
