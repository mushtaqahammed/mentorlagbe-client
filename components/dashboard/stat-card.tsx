import type { LucideIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-5 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-lime-400/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-400">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
            accent
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-xs text-neutral-500">{hint}</p>
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="h-3 w-28 bg-white/10" />
          <Skeleton className="mt-4 h-8 w-16 bg-white/10" />
        </div>
        <Skeleton className="size-10 rounded-xl bg-white/10" />
      </div>
      <Skeleton className="mt-4 h-3 w-32 bg-white/10" />
    </div>
  )
}

export function formatCount(value: number) {
  return String(value).padStart(2, "0")
}

export function formatPlan(value: string) {
  const plan = value || "free"
  return plan.charAt(0).toUpperCase() + plan.slice(1)
}
