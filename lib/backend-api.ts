/** Shared server-side client for the Express backend. */
function baseUrl() {
  return process.env.BACKEND_API_URL || "http://localhost:5000"
}

export function internalHeaders(
  extra: Record<string, string> = {},
  token?: string
) {
  return {
    "Content-Type": "application/json",
    "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

export function adminHeaders(adminId: string, token?: string) {
  return internalHeaders({ "x-admin-id": adminId }, token)
}

export function userHeaders(userId: string, token?: string) {
  return internalHeaders({ "x-user-id": userId }, token)
}

export class BackendRequestError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "BackendRequestError"
    this.status = status
  }
}

export async function backendRequest<T>(
  path: string,
  init: RequestInit & { headers?: Record<string, string> } = {}
): Promise<T> {
  const response = await fetch(`${baseUrl()}${path}`, {
    cache: "no-store",
    ...init,
    headers: internalHeaders(init.headers),
  })

  if (!response.ok) {
    let message = `Backend request failed with status ${response.status}`

    try {
      const data = (await response.json()) as { error?: unknown }
      if (typeof data.error === "string" && data.error) message = data.error
    } catch {
      // Keep the generic message when the backend did not return JSON.
    }

    throw new BackendRequestError(`${message} (${response.status})`, response.status)
  }

  return (await response.json()) as T
}
