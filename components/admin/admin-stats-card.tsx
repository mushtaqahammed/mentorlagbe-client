import type { LucideIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type AdminStatsCardAccent = "sky" | "lime" | "violet" | "amber"

export type AdminStatsCardDetail = {
  label: string
  value: string
  tone?: "amber" | "lime"
}

const accentStyles: Record<AdminStatsCardAccent, string> = {
  sky: "bg-sky-400/10 text-sky-300 ring-sky-400/25",
  lime: "bg-lime-400/10 text-lime-300 ring-lime-400/25",
  violet: "bg-violet-400/10 text-violet-300 ring-violet-400/25",
  amber: "bg-amber-400/10 text-amber-300 ring-amber-400/25",
}

const detailStyles = {
  amber: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
  lime: "bg-lime-400/10 text-lime-300 ring-lime-400/20",
} as const

export function AdminStatsCard({
  title,
  value,
  icon: Icon,
  description,
  accent = "lime",
  details = [],
  loading = false,
}: {
  title: string
  value: string
  icon: LucideIcon
  description?: string
  accent?: AdminStatsCardAccent
  details?: AdminStatsCardDetail[]
  loading?: boolean
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/70 p-5 shadow-lg shadow-black/10 transition-all duration-300 focus-within:border-lime-400/40 hover:-translate-y-0.5 hover:border-lime-400/30 hover:shadow-xl hover:shadow-lime-400/5">
      <span
        aria-hidden="true"
        className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
            {title}
          </p>
          {loading ? (
            <Skeleton className="mt-4 h-9 w-20 rounded-lg bg-white/10" />
          ) : (
            <p
              className="mt-4 truncate text-3xl font-bold tracking-tight text-white tabular-nums sm:text-[2rem]"
              title={value}
            >
              {value}
            </p>
          )}
        </div>

        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105",
            accentStyles[accent]
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>

      {loading ? (
        <div className="mt-5 flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
          <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
        </div>
      ) : details.length > 0 ? (
        <dl className="mt-5 flex flex-wrap gap-2">
          {details.map((detail) => (
            <div
              key={detail.label}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1",
                detail.tone
                  ? detailStyles[detail.tone]
                  : "bg-white/5 text-neutral-300 ring-white/10"
              )}
            >
              <dt className="text-neutral-400">{detail.label}</dt>
              <dd className="font-semibold tabular-nums">{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-auto pt-5">
        {loading ? (
          <Skeleton className="h-3 w-36 bg-white/10" />
        ) : description ? (
          <p className="text-xs leading-relaxed text-neutral-500">
            {description}
          </p>
        ) : null}
      </div>
    </article>
  )
}
