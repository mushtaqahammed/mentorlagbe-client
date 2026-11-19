import { headers } from "next/headers"

import { auth } from "@/lib/auth"

/**
 * Server-side Better Auth session lookup. Used by pages that must make
 * role-based decisions before rendering any plan-specific UI.
 *
 * Pass `fresh: true` after a subscription change so the user document is read
 * from the database instead of the signed-cookie cache.
 */
export async function getRequestSession(options?: { fresh?: boolean }) {
  return auth.api.getSession({
    headers: await headers(),
    query: options?.fresh ? { disableCookieCache: true } : undefined,
  })
}
