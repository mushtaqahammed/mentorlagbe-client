"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { useSession } from "@/lib/auth-client"
import {
  dashboardHomeByRole,
  getRouteOwnerRole,
  normalizeDashboardRole,
} from "@/lib/dashboard-menu"

function GuardLoading({ message }: { message: string }) {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col items-center justify-center gap-3 bg-neutral-950 text-white">
      <span className="size-8 animate-spin rounded-full border-2 border-white/15 border-t-lime-400" />
      <p className="text-sm text-neutral-400">{message}</p>
    </div>
  )
}

/**
 * Client-side route guard built on the shared Better Auth session hook.
 * It re-runs on navigation, so a user who opens another role's dashboard is
 * sent back to their own overview page.
 */
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const userId = session?.user?.id
  const role = normalizeDashboardRole(session?.user?.role)
  const home = dashboardHomeByRole[role]

  const isDashboardIndex =
    pathname === "/dashboard" || pathname === "/dashboard/"
  const routeOwner = getRouteOwnerRole(pathname)
  const isWrongRoleRoute = routeOwner !== null && routeOwner !== role
  const shouldRedirect =
    !isPending &&
    (isDashboardIndex || isWrongRoleRoute || (!userId && !isPending))

  useEffect(() => {
    if (!shouldRedirect) return

    if (!userId) {
      router.replace("/sign-in")
      return
    }

    router.replace(home)
  }, [shouldRedirect, userId, home, router])

  if (isPending) {
    return <GuardLoading message="Loading your dashboard..." />
  }

  if (!userId || shouldRedirect) {
    return <GuardLoading message="Redirecting..." />
  }

  return <>{children}</>
}
