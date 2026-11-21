import {
  BookOpen,
  Bookmark,
  CreditCard,
  FileText,
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"

/**
 * Roles are stored in Better Auth as "Student" | "Tutor" | "Admin".
 * Everything in the dashboard works with the lowercase form.
 */
export type DashboardRole = "student" | "tutor" | "admin"

export type DashboardMenuItem = {
  id: string
  label: string
  href: string
  icon: LucideIcon
}

export const dashboardHomeByRole: Record<DashboardRole, string> = {
  student: "/dashboard/student",
  tutor: "/dashboard/tutor",
  admin: "/dashboard/admin",
}

export const dashboardMenuByRole: Record<DashboardRole, DashboardMenuItem[]> = {
  student: [
    {
      id: "overview",
      label: "Overview",
      href: "/dashboard/student",
      icon: LayoutDashboard,
    },
    {
      id: "my-applications",
      label: "My Applications",
      href: "/dashboard/student/my-applications",
      icon: FileText,
    },
    {
      id: "bookmarks",
      label: "My Bookmarks",
      href: "/dashboard/bookmarks",
      icon: Bookmark,
    },
 
    {
      id: "profile",
      label: "My Profile",
      href: "/dashboard/profile",
      icon: UserRound,
    },
  ],
  tutor: [
    {
      id: "overview",
      label: "Overview",
      href: "/dashboard/tutor",
      icon: LayoutDashboard,
    },
    {
      id: "post-tuition",
      label: "Post a Tuition",
      href: "/dashboard/tutor/post-tuition",
      icon: PlusCircle,
    },
    {
      id: "my-tuitions",
      label: "My Tuitions",
      href: "/dashboard/tutor/my-tuitions",
      icon: BookOpen,
    },
    {
      id: "applicants",
      label: "Manage Applicants",
      href: "/dashboard/tutor/applicants",
      icon: Users,
    },
   
    {
      id: "profile",
      label: "My Profile",
      href: "/dashboard/profile",
      icon: UserRound,
    },
  ],
  admin: [
    {
      id: "overview",
      label: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      id: "users",
      label: "Manage Users",
      href: "/dashboard/admin/users",
      icon: UserCog,
    },
    {
      id: "tuitions",
      label: "Tuition Approvals",
      href: "/dashboard/admin/tuitions",
      icon: ShieldCheck,
    },
    {
      id: "transactions",
      label: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: CreditCard,
    },
    {
      id: "profile",
      label: "My Profile",
      href: "/dashboard/profile",
      icon: UserRound,
    },
  ],
}

export function normalizeDashboardRole(role?: string | null): DashboardRole {
  const normalized = role?.trim().toLowerCase()

  if (normalized === "student" || normalized === "tutor" || normalized === "admin") {
    return normalized
  }

  // Better Auth's default value is "Student", which also covers accounts
  // created through providers that don't send a custom role.
  return "student"
}

export function getDashboardMenu(role: DashboardRole) {
  return dashboardMenuByRole[role]
}

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1)
  }
  return pathname
}

export function isDashboardMenuItemActive(
  item: DashboardMenuItem,
  pathname: string
) {
  const current = normalizePathname(pathname)
  const target = normalizePathname(item.href)

  // "My Subscription" and "My Profile" intentionally share the profile
  // route. Highlight only the profile entry for an exact path match.
  if (item.id === "subscription" && current === target) {
    return false
  }

  if (item.id === "overview") {
    return current === target
  }

  return current === target || current.startsWith(`${target}/`)
}

export function getDashboardPageTitle(role: DashboardRole, pathname: string) {
  const current = normalizePathname(pathname)
  const menu = getDashboardMenu(role)

  const activeItem = menu.find((item) => isDashboardMenuItemActive(item, current))
  if (activeItem) {
    return activeItem.label
  }

  if (current === "/dashboard") {
    return "Dashboard"
  }

  return "Dashboard"
}

export function isRoleDashboardPath(pathname: string) {
  const current = normalizePathname(pathname)
  return (
    current === "/dashboard/student" ||
    current.startsWith("/dashboard/student/") ||
    current === "/dashboard/tutor" ||
    current.startsWith("/dashboard/tutor/") ||
    current === "/dashboard/admin" ||
    current.startsWith("/dashboard/admin/")
  )
}

export function getRouteOwnerRole(pathname: string): DashboardRole | null {
  const current = normalizePathname(pathname)

  if (
    current === "/dashboard/bookmarks" ||
    current.startsWith("/dashboard/bookmarks/")
  ) {
    return "student"
  }
  if (current === "/dashboard/student" || current.startsWith("/dashboard/student/")) {
    return "student"
  }
  if (current === "/dashboard/tutor" || current.startsWith("/dashboard/tutor/")) {
    return "tutor"
  }
  if (current === "/dashboard/admin" || current.startsWith("/dashboard/admin/")) {
    return "admin"
  }

  return null
}
