import {
  ADMIN_TRANSACTION_PLANS,
  ADMIN_TRANSACTION_ROLES,
  type AdminTransactionPlanFilter,
  type AdminTransactionPlanId,
  type AdminTransactionRole,
  type AdminTransactionRoleFilter,
  type AdminTransactionsResponse,
} from "@/lib/admin/types"
import { adminHeaders, backendRequest } from "@/lib/backend-api"

export function isAdminTransactionRole(
  value: unknown
): value is AdminTransactionRole {
  return (
    typeof value === "string" &&
    (ADMIN_TRANSACTION_ROLES as readonly string[]).includes(
      value.trim().toLowerCase()
    )
  )
}

export function isAdminTransactionPlan(
  value: unknown
): value is AdminTransactionPlanId {
  return (
    typeof value === "string" &&
    (ADMIN_TRANSACTION_PLANS as readonly string[]).includes(value)
  )
}

export async function getAdminTransactions({
  search,
  role,
  plan,
  page,
  limit,
  adminId,
}: {
  search: string
  role: AdminTransactionRoleFilter
  plan: AdminTransactionPlanFilter
  page: number
  limit: number
  adminId: string
}): Promise<AdminTransactionsResponse> {
  const params = new URLSearchParams({
    search,
    role,
    plan,
    page: String(page),
    limit: String(limit),
  })

  return backendRequest<AdminTransactionsResponse>(
    `/admin/transactions?${params}`,
    { headers: adminHeaders(adminId) }
  )
}
