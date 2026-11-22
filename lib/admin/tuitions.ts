import {
  BackendRequestError,
  adminHeaders,
  backendRequest,
} from "@/lib/backend-api"
import { getToken } from "@/lib/core/server"
import {
  type AdminTuition,
  type AdminTuitionStatus,
  type AdminTuitionStatusFilter,
  type AdminTuitionsResponse,
} from "@/lib/admin/types"
import { isValidObjectId } from "@/lib/admin/users"

export type TuitionSort = "latest" | "oldest"

export function parseTuitionSort(value: string | null): TuitionSort {
  return value?.trim().toLowerCase() === "oldest" ? "oldest" : "latest"
}

export async function getAdminTuitions({
  search,
  subject,
  status,
  sort,
  page,
  limit,
  adminId,
}: {
  search: string
  subject: string
  status: AdminTuitionStatusFilter
  sort: TuitionSort
  page: number
  limit: number
  adminId: string
}): Promise<AdminTuitionsResponse> {
  const params = new URLSearchParams({
    search,
    subject,
    status,
    sort,
    page: String(page),
    limit: String(limit),
  })

  return backendRequest<AdminTuitionsResponse>(`/admin/tuitions?${params}`, {
    headers: adminHeaders(adminId, await getToken()),
  })
}

/** Returns null when the tuition does not exist. */
export async function updateTuitionApprovalStatus(
  tuitionId: string,
  status: AdminTuitionStatus,
  adminId: string
): Promise<AdminTuition | null> {
  if (!isValidObjectId(tuitionId)) return null

  try {
    const data = await backendRequest<{ tuition: AdminTuition }>(
      `/admin/tuitions/${encodeURIComponent(tuitionId)}/approval`,
      {
        method: "PATCH",
        headers: adminHeaders(adminId, await getToken()),
        body: JSON.stringify({ status }),
      }
    )
    return data.tuition
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 404) {
      return null
    }
    throw error
  }
}
