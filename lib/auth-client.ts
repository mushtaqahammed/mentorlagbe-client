import { createAuthClient } from "better-auth/react"

// Single shared auth client — the navbar and every auth page must use this
// same instance, otherwise they each get their own session store and stop
// seeing each other's changes (e.g. sign-out not updating the navbar).
export const authClient = createAuthClient()

export const { signIn, signUp, signOut, useSession } = authClient
