import type { AdminStats } from "@/lib/admin/types"
import { adminHeaders, backendRequest } from "@/lib/backend-api"

/** Statistics are computed by the Express backend from the shared database. */
export async function getAdminStats(adminId: string): Promise<AdminStats> {
  return backendRequest<AdminStats>("/admin/stats", {
    headers: adminHeaders(adminId),
  })
}
