import { BackendRequestError, adminHeaders, backendRequest } from "@/lib/backend-api"
import { getToken } from "@/lib/core/server"
import {
  ADMIN_USER_ROLES,
  type AdminUser,
  type AdminUserRole,
  type AdminUsersResponse,
} from "@/lib/admin/types"

export type AdminUserFilterRole = AdminUserRole | "all"

export function isAdminUserRole(value: unknown): value is AdminUserRole {
  if (typeof value !== "string") return false

  const normalized = value.trim().toLowerCase()
  return (ADMIN_USER_ROLES as readonly string[]).includes(normalized)
}

export function normalizeAdminUserRole(value: unknown): AdminUserRole {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""
  return isAdminUserRole(normalized) ? normalized : "student"
}

export function isValidObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value)
}

export async function getAdminUsers({
  search,
  role,
  page,
  limit,
  adminId,
}: {
  search: string
  role: AdminUserFilterRole
  page: number
  limit: number
  adminId: string
}): Promise<AdminUsersResponse> {
  const params = new URLSearchParams({
    search,
    role,
    page: String(page),
    limit: String(limit),
  })

  return backendRequest<AdminUsersResponse>(`/admin/users?${params}`, {
    headers: adminHeaders(adminId, await getToken()),
  })
}

/** Returns null when the user does not exist. */
export async function updateAdminUserRole(
  userId: string,
  role: AdminUserRole,
  adminId: string
): Promise<AdminUser | null> {
  try {
    const data = await backendRequest<{ user: AdminUser }>(
      `/admin/users/${encodeURIComponent(userId)}/role`,
      {
        method: "PATCH",
        headers: adminHeaders(adminId, await getToken()),
        body: JSON.stringify({ role }),
      }
    )
    return data.user
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 404) {
      return null
    }
    throw error
  }
}
