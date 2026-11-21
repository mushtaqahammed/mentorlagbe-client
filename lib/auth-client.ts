import type { auth } from "@/lib/auth"
import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

// Single shared auth client — the navbar and every auth page must use this
// same instance, otherwise they each get their own session store and stop
// seeing each other's changes (e.g. sign-out not updating the navbar).
//
// `inferAdditionalFields` copies the server's additional user fields (the
// `role` field from lib/auth.ts) onto the client's types. The `auth` import
// is type-only, so no server code ends up in the client bundle.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
})

export const { signIn, signUp, signOut, useSession } = authClient

/**
 * Ask every `useSession()` subscriber to refetch once through Better Auth's
 * shared store. Direct `authClient.getSession()` calls are raw requests: they
 * do not update the store that powers the Navbar.
 */
export function refreshSession() {
  authClient.$store.notify("$sessionSignal")
}
