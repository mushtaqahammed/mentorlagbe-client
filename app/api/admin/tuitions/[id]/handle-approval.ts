import { jsonAdminError, NO_STORE, requireAdmin } from "@/lib/admin/api-auth"
import type {
  AdminTuitionApprovalResponse,
  AdminTuitionStatus,
} from "@/lib/admin/types"
import { isValidObjectId } from "@/lib/admin/users"
import { updateTuitionApprovalStatus } from "@/lib/admin/tuitions"

const ACTION_LABEL: Record<AdminTuitionStatus, string> = {
  approved: "approve",
  rejected: "reject",
  pending: "review",
}

/**
 * Shared PATCH implementation for the approve/reject routes. The decision is
 * fixed by the route itself — request bodies are never trusted for the new
 * approval status.
 */
export async function handleApproval(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
  decision: Exclude<AdminTuitionStatus, "pending">
) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return jsonAdminError(admin.error, admin.status)

    const { id } = await params
    if (!isValidObjectId(id)) {
      return jsonAdminError("Invalid tuition ID.", 400)
    }

    const tuition = await updateTuitionApprovalStatus(id, decision)
    if (!tuition) {
      return jsonAdminError("Tuition not found.", 404)
    }

    const body: AdminTuitionApprovalResponse = { tuition }
    return Response.json(body, { headers: NO_STORE })
  } catch (error) {
    console.error(`Failed to ${ACTION_LABEL[decision]} tuition:`, error)
    return jsonAdminError(`Could not ${ACTION_LABEL[decision]} tuition.`, 500)
  }
}
