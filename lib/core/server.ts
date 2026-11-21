import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export const getSession = async (options?: { fresh?: boolean }) => {
  "use server"
  const session = await auth.api.getSession({
    headers: await headers(),
    query: options?.fresh ? { disableCookieCache: true } : undefined,
  })
  return session
}

export const getToken = async () => {
  const session = await getSession()
  if (!session || !session.session?.token) {
    throw new Error("No token available")
  }
  
  return session.session.token
}

export const authFetch = async (api: string, init: RequestInit = {}) => {
  const token = await getToken()
  const headers = new Headers(init.headers)
  headers.set("authorization", `Bearer ${token}`)

  return fetch(api, {
    cache: "no-store",
    ...init,
    headers,
  })
}
