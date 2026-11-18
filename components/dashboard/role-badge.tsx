import { cn } from "@/lib/utils"
import { normalizeDashboardRole } from "@/lib/dashboard-menu"

const roleBadgeStyles: Record<string, string> = {
  student: "bg-sky-400/15 text-sky-300 ring-sky-400/30",
  tutor: "bg-lime-400/15 text-lime-300 ring-lime-400/30",
  admin: "bg-rose-400/15 text-rose-300 ring-rose-400/30",
}

export function RoleBadge({
  role,
  className,
}: {
  role?: string | null
  className?: string
}) {
  const normalized = normalizeDashboardRole(role)
  const label = normalized[0].toUpperCase() + normalized.slice(1)

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ring-1",
        roleBadgeStyles[normalized],
        className
      )}
    >
      {label}
    </span>
  )
}
