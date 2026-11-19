export type StripeRevenueStats = {
  /** Numeric total in major currency units. */
  amount: number
  /** ISO 4217 currency code (defaults to BDT). */
  currency: string
  /** Locale-formatted amount, ready to render. */
  formatted: string
}

export type AdminStats = {
  totalUsers: number
  totalTutors: number
  pendingTuitions: number
  approvedTuitions: number
  stripeRevenue: StripeRevenueStats
  updatedAt: string
}

export type AdminStatsError = {
  error: string
}

export const ADMIN_USER_ROLES = ["student", "tutor", "admin"] as const

export const ADMIN_USERS_PAGE_SIZE = 8

export type AdminUserRole = (typeof ADMIN_USER_ROLES)[number]

export type AdminUser = {
  id: string
  name: string
  email: string
  image: string | null
  role: AdminUserRole
  createdAt: string | null
}

export type AdminUsersResponse = {
  users: AdminUser[]
  /** Users matching the current search/role filter. */
  total: number
  /** All registered users, regardless of filters. */
  totalUsers: number
  page: number
  totalPages: number
  limit: number
  updatedAt: string
}

export type AdminUserRoleUpdateResponse = {
  user: AdminUser
}

export type AdminApiError = {
  error: string
}
