"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import {
  addBookmark,
  getBookmarks,
  removeBookmark,
  type BookmarkActionResult,
  type BookmarkItem,
  type BookmarksResponse,
} from "@/lib/actions/bookmarks"
import { useSession } from "@/lib/auth-client"
import { notify, userMessage } from "@/lib/notify"

type BookmarkContextValue = {
  /** True only for authenticated students (the only role allowed by the API). */
  enabled: boolean
  bookmarks: BookmarkItem[]
  ids: Set<string>
  plan: "free" | "pro"
  limit: number | null
  loading: boolean
  error: string
  isBookmarked: (tuitionId: string) => boolean
  isPending: (tuitionId: string) => boolean
  toggle: (tuitionId: string) => Promise<boolean>
  refresh: () => Promise<void>
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null)

const EMPTY_STATE: BookmarksResponse = {
  bookmarks: [],
  count: 0,
  plan: "free",
  limit: 5,
}

/** Convert an action result into a local error the catch blocks can handle. */
function unwrap<T>(result: BookmarkActionResult<T>): T {
  if (!result.ok) throw new Error(result.error)
  return result.data
}

/**
 * One shared bookmark store for the whole app: public cards, tuition detail
 * and the dashboard page all read the same state, so an add/remove is visible
 * everywhere without refetching each component. The Express backend remains
 * the source of truth; every optimistic change is reconciled with its response
 * and rolled back on failure.
 */
export function BookmarkProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: sessionPending } = useSession()
  const userId = session?.user?.id
  const role = String(session?.user?.role ?? "").trim().toLowerCase()
  const sessionPlan = String(session?.user?.plan ?? "").trim().toLowerCase()
  const enabled = !sessionPending && Boolean(userId) && role === "student"

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [plan, setPlan] = useState<"free" | "pro">("free")
  const [limit, setLimit] = useState<number | null>(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const idsRef = useRef(ids)
  const bookmarksRef = useRef(bookmarks)
  const pendingRef = useRef(pendingIds)

  const apply = useCallback((state: BookmarksResponse) => {
    const list = Array.isArray(state.bookmarks) ? state.bookmarks : []
    const nextIds = new Set(list.map((item) => item.id))

    bookmarksRef.current = list
    idsRef.current = nextIds
    setBookmarks(list)
    setIds(nextIds)
    setPlan(state.plan === "pro" ? "pro" : "free")
    setLimit(state.limit ?? null)
    setError("")
  }, [])

  const refresh = useCallback(async () => {
    try {
      const state = unwrap(await getBookmarks())
      apply(state)
    } catch (loadError: unknown) {
      setError(
        userMessage(loadError, "Could not refresh your bookmarks. Please retry."),
      )
    }
  }, [apply])

  // A free student upgraded to Pro (or whose role changed) must see the new
  // plan immediately; plan data comes from the backend response on refetch.
  useEffect(() => {
    if (sessionPending) return

    let active = true

    async function load() {
      if (!enabled) {
        // A tutor/admin or signed-out user never keeps a student's data.
        bookmarksRef.current = EMPTY_STATE.bookmarks
        idsRef.current = new Set()
        setBookmarks(EMPTY_STATE.bookmarks)
        setIds(new Set())
        setPlan(EMPTY_STATE.plan)
        setLimit(EMPTY_STATE.limit)
        setError("")
        setLoading(false)
        return
      }

      setLoading(true)
      setError("")

      try {
        const state = unwrap(await getBookmarks())
        if (active) apply(state)
      } catch (loadError: unknown) {
        if (!active) return
        // Expired/invalid sessions simply have no bookmarks; the dashboard
        // guard and auth UI handle the redirect. Never show stale ids.
        idsRef.current = new Set()
        setIds(new Set())
        setBookmarks([])
        setError(
          userMessage(loadError, "Could not load your bookmarks. Please retry."),
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [apply, enabled, sessionPending, sessionPlan, userId])

  const toggle = useCallback(
    async (tuitionId: string) => {
      if (!enabled || !tuitionId) return false
      if (pendingRef.current.has(tuitionId)) return false

      const wasBookmarked = idsRef.current.has(tuitionId)
      const previousIds = idsRef.current
      const previousBookmarks = bookmarksRef.current

      const nextIds = new Set(previousIds)
      if (wasBookmarked) nextIds.delete(tuitionId)
      else nextIds.add(tuitionId)
      idsRef.current = nextIds
      setIds(nextIds)

      if (wasBookmarked) {
        const nextBookmarks = previousBookmarks.filter(
          (item) => item.id !== tuitionId,
        )
        bookmarksRef.current = nextBookmarks
        setBookmarks(nextBookmarks)
      }

      pendingRef.current.add(tuitionId)
      setPendingIds(new Set(pendingRef.current))

      try {
        const state = unwrap(
          wasBookmarked
            ? await removeBookmark(tuitionId)
            : await addBookmark(tuitionId),
        )
        apply(state)
        notify.success(
          wasBookmarked ? "Bookmark removed" : "Bookmark saved",
          wasBookmarked
            ? "Removed from My Bookmarks."
            : "Saved to My Bookmarks.",
        )
        return true
      } catch (mutationError) {
        idsRef.current = previousIds
        bookmarksRef.current = previousBookmarks
        setIds(new Set(previousIds))
        setBookmarks(previousBookmarks)
        const message = userMessage(
          mutationError,
          wasBookmarked
            ? "Could not remove this bookmark. Please try again."
            : "Could not save this tuition. Please try again.",
        )
        setError(message)
        notify.error("Bookmark update failed", message)
        return false
      } finally {
        pendingRef.current.delete(tuitionId)
        setPendingIds(new Set(pendingRef.current))
      }
    },
    [apply, enabled],
  )

  const value = useMemo<BookmarkContextValue>(
    () => ({
      enabled,
      bookmarks,
      ids,
      plan,
      limit,
      loading,
      error,
      isBookmarked: (tuitionId: string) => ids.has(tuitionId),
      isPending: (tuitionId: string) => pendingIds.has(tuitionId),
      toggle,
      refresh,
    }),
    [enabled, bookmarks, ids, plan, limit, loading, error, pendingIds, toggle, refresh],
  )

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>
}

export function useBookmarks(): BookmarkContextValue {
  const context = useContext(BookmarkContext)
  if (!context) {
    throw new Error("useBookmarks must be used inside a BookmarkProvider.")
  }
  return context
}
