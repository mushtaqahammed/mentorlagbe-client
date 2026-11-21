"use client"

import { authClient } from "@/lib/auth-client"

type SessionHydratorProps = {
  session: Parameters<typeof authClient.hydrateSession>[0]
}

/**
 * Seeds Better Auth's shared client session store with the session resolved by
 * the server layout. Without this, every hard navigation starts with
 * `data: null, isPending: true`, which makes auth-dependent UI wait for an
 * extra client request.
 *
 * The client module keeps an internal `hasHydrated` guard, so repeated renders
 * and client-side navigations do not re-hydrate or add requests.
 */
export function SessionHydrator({ session }: SessionHydratorProps) {
  authClient.hydrateSession(session)

  return null
}
