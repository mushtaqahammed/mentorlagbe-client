"use server"

import { authFetch } from "@/lib/core/server"

const BASE_URL = process.env.BACKEND_API_URL || "http://localhost:5000"

export type BookmarkItem = {
  id: string
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

export type BookmarkActionResult<T> =
  { ok: true; data: T } | { ok: false; error: string }

async function describeError(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => "")

  let detail: string | undefined

  try {
    const data = JSON.parse(text) as { error?: unknown; message?: unknown }

    if (typeof data.error === "string" && data.error) {
      detail = data.error
    } else if (typeof data.message === "string" && data.message) {
      detail = data.message
    }
  } catch {
    // Handle non-JSON responses.
  }

  if (res.status === 404) {
    return "Bookmarks API not found. Check your backend URL and bookmark routes."
  }

  return detail || `${fallback} (HTTP ${res.status})`
}

async function request<T>(
  path: string,
  init: RequestInit | undefined,
  fallback: string
): Promise<BookmarkActionResult<T>> {
  try {
    console.log(`[Bookmark API] Request: ${path}`)

    const res = await authFetch(`${BASE_URL}${path}`, init)

    console.log(`[Bookmark API] Status: ${res.status}`)

    if (!res.ok) {
      const error = await describeError(res, fallback)

      console.error("[Bookmark API] Error:", error)

      return { ok: false, error }
    }

    const data = (await res.json()) as T

    console.log("[Bookmark API] Response:", data)

    return { ok: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : fallback

    console.error("[Bookmark API] Request failed:", message)

    return { ok: false, error: message }
  }
}

// Get all bookmarks with complete tuition details.
export const getBookmarks = async (): Promise<
  BookmarkActionResult<BookmarksResponse>
> => {
  const result = await request<BookmarksResponse>(
    "/bookmarks",
    undefined,
    "Could not load your bookmarks."
  )

  if (result.ok) {
    console.log("========== SAVED TUITION DETAILS ==========")

    console.table(
      result.data.bookmarks.map((bookmark) => ({
        tuitionId: bookmark.id,
        title: bookmark.title,
        subject: bookmark.subject,
        classLevel: bookmark.classLevel,
        monthlyFee: bookmark.monthlyFee,
        mode: bookmark.mode,
        location: bookmark.location,
        tutorName: bookmark.tutorName,
        approvalStatus: bookmark.approvalStatus,
        status: bookmark.status,
        available: bookmark.available,
      }))
    )

    console.log("Complete Tuition Data:", result.data.bookmarks)
    console.log("Total Bookmarks:", result.data.count)
    console.log("Current Plan:", result.data.plan)
    console.log("Bookmark Limit:", result.data.limit)
  }

  return result
}

// Add a tuition bookmark.
export const addBookmark = async (
  tuitionId: string
): Promise<BookmarkActionResult<BookmarksResponse>> => {
  if (!tuitionId?.trim()) {
    return { ok: false, error: "Invalid tuition ID." }
  }

  return request<BookmarksResponse>(
    `/bookmarks/${encodeURIComponent(tuitionId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    "Could not save this tuition."
  )
}

// Remove a tuition bookmark.
export const removeBookmark = async (
  tuitionId: string
): Promise<BookmarkActionResult<BookmarksResponse>> => {
  if (!tuitionId?.trim()) {
    return { ok: false, error: "Invalid tuition ID." }
  }

  return request<BookmarksResponse>(
    `/bookmarks/${encodeURIComponent(tuitionId)}`,
    { method: "DELETE" },
    "Could not remove this bookmark."
  )
}
