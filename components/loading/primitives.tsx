import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export { Skeleton }

export function SkeletonAvatar({ className }: { className?: string }) {
  return <Skeleton className={cn("size-10 rounded-full bg-white/10", className)} />
}

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn("h-10 w-28 rounded-full bg-white/10", className)}
    />
  )
}

export function SkeletonBadge({ className }: { className?: string }) {
  return (
    <Skeleton className={cn("h-6 w-20 rounded-full bg-white/10", className)} />
  )
}

/**
 * Generic content card used by the route loaders. Slots keep each skeleton
 * flexible while sharing the same border, surface, radius and shadow.
 */
export function CardSkeleton({
  className,
  header,
  children,
  footer,
  padded = true,
}: {
  className?: string
  header?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  padded?: boolean
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-[1.5rem] border border-white/10 bg-neutral-900/70 shadow-lg shadow-black/10",
        padded && "p-5 sm:p-6",
        className
      )}
    >
      {header}
      {children}
      {footer ? (
        <div className="mt-5 border-t border-white/10 pt-4">{footer}</div>
      ) : null}
    </div>
  )
}

/** Table-shaped skeleton with a stable width so loading does not shift layout. */
export function TableSkeleton({
  columns,
  rows = 5,
  minWidth = "min-w-[820px]",
  columnWidths,
  className,
}: {
  columns: number
  rows?: number
  minWidth?: string
  columnWidths?: string[]
  className?: string
}) {
  const columnArray = Array.from({ length: columns }, (_, index) => index)

  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/60 shadow-lg shadow-black/10",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className={cn("w-full border-collapse text-left text-sm", minWidth)}>
          <thead className="bg-white/[0.03] text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            <tr>
              {columnArray.map((column) => (
                <th key={column} className="px-5 py-4">
                  <Skeleton
                    className={cn(
                      "h-3 w-full bg-white/10",
                      columnWidths?.[column] ?? "max-w-[6rem]"
                    )}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {Array.from({ length: rows }, (_, row) => (
              <tr key={row}>
                {columnArray.map((column) => (
                  <td key={column} className="px-5 py-4">
                    <Skeleton
                      className={cn(
                        "h-4 w-full bg-white/10",
                        columnWidths?.[column] ?? "max-w-[7rem]"
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SectionHeadingSkeleton({
  align = "left",
  className,
}: {
  align?: "left" | "center"
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <Skeleton
        className={cn(
          "h-7 w-40 rounded-full bg-white/10",
          align === "center" && "mx-auto"
        )}
      />
      <Skeleton
        className={cn(
          "mt-6 h-10 w-3/4 max-w-xl bg-white/10",
          align === "center" && "mx-auto"
        )}
      />
      <Skeleton
        className={cn(
          "mt-4 h-3 w-full bg-white/10",
          align === "center" && "mx-auto"
        )}
      />
      <Skeleton
        className={cn(
          "mt-2 h-3 w-2/3 bg-white/10",
          align === "center" && "mx-auto"
        )}
      />
    </div>
  )
}

export function LoaderSection({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-t border-white/10 bg-neutral-950 py-16 text-white sm:py-20 lg:py-24",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 left-1/4 size-[30rem] rounded-full bg-lime-400/5 blur-[130px]" />
        <div className="absolute -right-40 -bottom-40 size-[28rem] rounded-full bg-sky-400/5 blur-[130px]" />
      </div>
      <div
        className={cn(
          "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
          contentClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}

/** Global fallback for public routes without a more specific skeleton. */
export function PageLoader({
  label = "Loading page",
  className,
  contentClassName,
  children,
}: {
  label?: string
  className?: string
  contentClassName?: string
  children?: ReactNode
}) {
  return (
    <main
      role="status"
      aria-label={label}
      aria-busy="true"
      className={cn(
        "relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-neutral-950 text-white",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 left-1/4 size-[30rem] rounded-full bg-lime-400/10 blur-[130px]" />
        <div className="absolute -right-40 -bottom-40 size-[28rem] rounded-full bg-sky-400/5 blur-[130px]" />
      </div>

      <div
        className={cn(
          "relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8",
          contentClassName
        )}
      >
        {children ?? (
          <div aria-hidden="true">
            <Skeleton className="h-7 w-40 rounded-full bg-white/10" />
            <Skeleton className="mt-6 h-12 w-2/3 max-w-xl bg-white/10" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-3 w-full max-w-2xl bg-white/10" />
              <Skeleton className="h-3 w-3/4 max-w-xl bg-white/10" />
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <CardSkeleton
                  key={item}
                  header={<Skeleton className="size-11 rounded-2xl bg-white/10" />}
                >
                  <Skeleton className="mt-5 h-5 w-3/4 bg-white/10" />
                  <Skeleton className="mt-3 h-3 w-full bg-white/10" />
                  <Skeleton className="mt-2 h-3 w-2/3 bg-white/10" />
                </CardSkeleton>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

/**
 * Dashboard fallback. It intentionally renders inside the existing dashboard
 * layout so the sidebar, navbar and role navigation stay visible.
 */
export function DashboardLoader({
  label = "Loading dashboard content",
  children,
  className,
  bare = false,
}: {
  label?: string
  children?: ReactNode
  className?: string
  bare?: boolean
}) {
  const content = (
    <div aria-hidden="true">
      <Skeleton className="h-8 w-48 max-w-full bg-white/10" />
      <Skeleton className="mt-3 h-3 w-80 max-w-full bg-white/10" />
      <div className="mt-8">
        {children ?? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <CardSkeleton
                key={item}
                className="bg-neutral-950/60"
                padded={false}
              >
                <div className="p-5">
                  <Skeleton className="h-3 w-28 bg-white/10" />
                  <Skeleton className="mt-4 h-8 w-20 bg-white/10" />
                  <Skeleton className="mt-4 h-3 w-32 bg-white/10" />
                </div>
              </CardSkeleton>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (bare) {
    return (
      <div
        role="status"
        aria-label={label}
        aria-busy="true"
        className={cn(
          "mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8",
          className
        )}
      >
        {content}
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className={cn(
        "mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8",
        className
      )}
    >
      <section className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-xl shadow-black/10 sm:p-8">
        {content}
      </section>
    </div>
  )
}
