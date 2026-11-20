import { getSession } from "@/lib/core/server"

/**
 * Server-side Better Auth session lookup used by pages and route handlers.
 * Delegates to core/server so session retrieval has one implementation.
 *
 * Pass `fresh: true` after a subscription/profile change so the user document
 * is read from the database instead of the signed-cookie cache.
 */
export async function getRequestSession(options?: { fresh?: boolean }) {
  return getSession(options)
}
