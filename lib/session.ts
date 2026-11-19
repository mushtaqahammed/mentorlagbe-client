import { headers } from "next/headers"

import { auth } from "@/lib/auth"

/**
 * Server-side Better Auth session lookup. Used by pages that must make
 * role-based decisions before rendering any plan-specific UI.
 */
export async function getRequestSession() {
  return auth.api.getSession({ headers: await headers() })
}
