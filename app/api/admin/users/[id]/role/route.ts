import { jsonAdminError, NO_STORE, requireAdmin } from "@/lib/admin/api-auth"
import type { AdminUserRole } from "@/lib/admin/types"
import {
  isAdminUserRole,
  isValidObjectId,
  updateAdminUserRole,
} from "@/lib/admin/users"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return jsonAdminError(admin.error, admin.status)

    const { id } = await params
    if (!isValidObjectId(id)) {
      return jsonAdminError("Invalid user ID.", 400)
    }

    if (id.toLowerCase() === admin.userId.toLowerCase()) {
      return jsonAdminError("You cannot change your own role.", 403)
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return jsonAdminError("Invalid request body.", 400)
    }

    const requestedRole = (body as { role?: unknown } | null)?.role
    const normalizedRole =
      typeof requestedRole === "string"
        ? requestedRole.trim().toLowerCase()
        : ""

    if (!isAdminUserRole(normalizedRole)) {
      return jsonAdminError("Role must be student, tutor, or admin.", 400)
    }

    const updated = await updateAdminUserRole(
      id,
      normalizedRole as AdminUserRole,
      admin.userId
    )

    if (!updated) {
      return jsonAdminError("User not found.", 404)
    }

    return Response.json({ user: updated }, { headers: NO_STORE })
  } catch (error) {
    console.error("Failed to update admin user role:", error)
    return jsonAdminError("Could not update user role.", 500)
  }
}
