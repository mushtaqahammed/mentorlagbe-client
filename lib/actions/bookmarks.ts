"use server"

import { authFetch } from "@/lib/core/server"

const BASE_URL = process.env.BACKEND_API_URL || "http://localhost:5000"

export type BookmarkItem = {
  /** Tuition id - kept as `id` so cards and detail links stay unchanged. */
  id: string
  /** The id of the row in the `bookmarks` collection. */
  bookmarkId?: string
  savedAt?: string | null
  available: boolean
  title: string | null
  subject: string | null
  classLevel: string | null
  monthlyFee: number
  daysPerWeek: number
  description: string | null
  mode: string | null
  location: string | null
  bannerImage: string | null
  tutorId: string | null
  tutorName: string | null
  tutorEmail: string | null
  /** Original stored values, e.g. "Approved" / "Active". */
  approvalStatus: string | null
  status: string | null
  createdAt: string | null
}

export type BookmarksResponse = {
  bookmarks: BookmarkItem[]
  count: number
  plan: "free" | "pro"
  limit: number | null
}

/** Actions return errors as data so a failed backend call is not logged as a
 * 500 by Next.js and callers can show the real reason in the UI. */
export type BookmarkActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

async function describeError(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => "")

  let detail: string | undefined
  try {
    const data = JSON.parse(text) as { error?: unknown; message?: unknown }
    if (typeof data.error === "string" && data.error) detail = data.error
    else if (typeof data.message === "string" && data.message) detail = data.message
  } catch {
    // Non-JSON bodies (for example a 404 HTML page) are handled below.
  }

  if (res.status === 404) {
    return (
      "The bookmarks API is not available on the configured backend (404). " +
      "Deploy the latest server code or set BACKEND_API_URL to a server that " +
      "includes the bookmark routes."
    )
  }

  return detail || `${fallback} (HTTP ${res.status})`
}

async function request<T>(
  path: string,
  init: RequestInit | undefined,
  fallback: string
): Promise<BookmarkActionResult<T>> {
  try {
    const res = await authFetch(`${BASE_URL}${path}`, init)
    if (!res.ok) return { ok: false, error: await describeError(res, fallback) }
    return { ok: true, data: (await res.json()) as T }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : fallback,
    }
  }
}

export const getBookmarks = async (): Promise<
  BookmarkActionResult<BookmarksResponse>
> =>
  request<BookmarksResponse>(
    "/bookmarks",
    undefined,
    "Could not load your bookmarks."
  )

export const addBookmark = async (
  tuitionId: string
): Promise<BookmarkActionResult<BookmarksResponse>> => {
  if (!tuitionId?.trim()) return { ok: false, error: "Invalid tuition ID." }

  return request<BookmarksResponse>(
    `/bookmarks/${encodeURIComponent(tuitionId)}`,
    { method: "POST", headers: { "Content-Type": "application/json" } },
    "Could not save this tuition."
  )
}

export const removeBookmark = async (
  tuitionId: string
): Promise<BookmarkActionResult<BookmarksResponse>> => {
  if (!tuitionId?.trim()) return { ok: false, error: "Invalid tuition ID." }

  return request<BookmarksResponse>(
    `/bookmarks/${encodeURIComponent(tuitionId)}`,
    { method: "DELETE" },
    "Could not remove this bookmark."
  )
}
