"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ProfileDropdown } from "@/components/dashboard/profile-dropdown"
import { RoleBadge } from "@/components/dashboard/role-badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"
import {
  getDashboardPageTitle,
  normalizeDashboardRole,
} from "@/lib/dashboard-menu"

export function DashboardNavbar() {
  const pathname = usePathname()
  const { data: session, isPending } = useSession()

  const role = normalizeDashboardRole(session?.user?.role)
  const pageTitle = getDashboardPageTitle(role, pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-neutral-900/95 px-4 text-white backdrop-blur sm:px-6 lg:px-8">
      <SidebarTrigger className="text-neutral-300 hover:bg-white/5 hover:text-white" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-neutral-400">
          <span className="hidden sm:inline">Dashboard / </span>
          <span className="font-semibold text-white">{pageTitle}</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {isPending ? (
          <div className="flex items-center gap-2">
            <span className="size-8 animate-pulse rounded-full bg-neutral-700" />
            <span className="hidden h-4 w-20 animate-pulse rounded bg-neutral-700 sm:block" />
          </div>
        ) : session?.user ? (
          <>
            <div className="hidden md:block">
              <RoleBadge role={session.user.role} />
            </div>
            <ProfileDropdown user={session.user} />
          </>
        ) : (
          <Link
            href="/sign-in"
            className="rounded-full bg-lime-400 px-4 py-1.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-lime-300"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
