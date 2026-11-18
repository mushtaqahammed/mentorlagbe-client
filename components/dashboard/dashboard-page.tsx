import type { ReactNode } from "react"

export function DashboardPage({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-xl shadow-black/10 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-neutral-400 sm:text-base">
            {description}
          </p>
        )}
        {children}
      </section>
    </div>
  )
}
