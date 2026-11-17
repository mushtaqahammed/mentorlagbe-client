import Link from "next/link"

import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      className={cn("text-lime-400", className)}
      aria-hidden="true"
    >
      <path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        transform="rotate(-25 12 12)"
      />
      <path
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        transform="rotate(-25 12 12)"
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <LogoMark className="size-7 shrink-0 -rotate-6" />
      <span className="text-lg font-bold tracking-tight text-white">
        MentorLagbe
      </span>
    </Link>
  )
}
