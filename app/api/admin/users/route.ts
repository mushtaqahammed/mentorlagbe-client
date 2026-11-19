import { jsonAdminError, NO_STORE, requireAdmin } from "@/lib/admin/api-auth"
import { ADMIN_USERS_PAGE_SIZE, type AdminUserRole } from "@/lib/admin/types"
import { getAdminUsers, isAdminUserRole } from "@/lib/admin/users"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function parsePositiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.min(parsed, max)
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return jsonAdminError(admin.error, admin.status)

    const url = new URL(request.url)
    const search = (url.searchParams.get("search") ?? "").trim().slice(0, 100)
    const roleParam = url.searchParams.get("role")?.trim().toLowerCase()
    const role: AdminUserRole | "all" = isAdminUserRole(roleParam)
      ? roleParam
      : "all"
    const page = parsePositiveInt(url.searchParams.get("page"), 1, 100_000)
    const limit = parsePositiveInt(
      url.searchParams.get("limit"),
      ADMIN_USERS_PAGE_SIZE,
      50
    )

    const result = await getAdminUsers({ search, role, page, limit })
    return Response.json(result, { headers: NO_STORE })
  } catch (error) {
    console.error("Failed to load admin users:", error)
    return jsonAdminError("Could not load users.", 500)
  }
}
