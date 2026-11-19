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

export const ADMIN_TUITION_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const

export type AdminTuitionStatus = (typeof ADMIN_TUITION_STATUSES)[number]

export type AdminTuitionStatusFilter = AdminTuitionStatus | "all"

export const ADMIN_TUITIONS_PAGE_SIZE = 6

export type AdminTuitionCounts = Record<AdminTuitionStatusFilter, number>

export type AdminTuition = {
  id: string
  tutorId: string
  tutorName: string
  tutorEmail: string
  title: string
  subject: string
  classLevel: string
  mode: string
  location: string
  monthlyFee: number
  daysPerWeek: number
  description: string
  bannerImage: string | null
  /** Normalised to lowercase for API consumers. */
  approvalStatus: AdminTuitionStatus
  /** Existing tuition lifecycle status, normalised to lowercase. */
  status: "active" | "closed"
  createdAt: string | null
  updatedAt: string | null
}

export type AdminTuitionsResponse = {
  tuitions: AdminTuition[]
  /** Tuitions matching search, subject and status filters. */
  total: number
  /** Status counts for the current search/subject filter (ignores status tab). */
  counts: AdminTuitionCounts
  /** Every tuition in the collection, regardless of filters. */
  totalTuitions: number
  page: number
  totalPages: number
  limit: number
  updatedAt: string
}

export type AdminTuitionApprovalResponse = {
  tuition: AdminTuition
}
