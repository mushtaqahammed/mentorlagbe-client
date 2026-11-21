"use client"

import { Heart, Loader2 } from "lucide-react"

import { useBookmarks } from "@/components/bookmarks/bookmark-provider"
import { cn } from "@/lib/utils"

const SIGN_IN_HINT = "Sign in as a student to save bookmarks"

/**
 * Heart toggle for tuition cards and the detail page. Disabled (with a hint)
 * for tutors/admins and signed-out visitors because the backend only serves
 * students.
 */
export function BookmarkButton({
  tuitionId,
  className,
  size = "md",
}: {
  tuitionId: string
  className?: string
  size?: "sm" | "md"
}) {
  const { enabled, isBookmarked, isPending, toggle } = useBookmarks()
  const bookmarked = isBookmarked(tuitionId)
  const pending = isPending(tuitionId)

  const label = !enabled
    ? SIGN_IN_HINT
    : bookmarked
      ? "Remove bookmark"
      : "Save bookmark"

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={bookmarked}
      title={label}
      disabled={!enabled || pending}
      onClick={(event) => {
        // Cards are wrapped in a Link; never let the toggle navigate away.
        event.preventDefault()
        event.stopPropagation()
        if (enabled) void toggle(tuitionId)
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-neutral-950/80 text-white shadow-lg shadow-black/20 backdrop-blur transition-all hover:border-lime-400/50 hover:bg-lime-400/15 hover:text-lime-300 focus-visible:ring-4 focus-visible:ring-lime-400/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "size-8" : "size-9",
        bookmarked && "border-lime-400/40 bg-lime-400/20 text-lime-300",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Heart
          className={size === "sm" ? "size-3.5" : "size-4"}
          fill={bookmarked ? "currentColor" : "none"}
          aria-hidden="true"
        />
      )}
    </button>
  )
}
