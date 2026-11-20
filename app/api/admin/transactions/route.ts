import { jsonAdminError, NO_STORE, requireAdmin } from "@/lib/admin/api-auth"
import {
  ADMIN_TRANSACTIONS_PAGE_SIZE,
  type AdminTransactionPlanFilter,
  type AdminTransactionRoleFilter,
} from "@/lib/admin/types"
import {
  getAdminTransactions,
  isAdminTransactionPlan,
  isAdminTransactionRole,
} from "@/lib/admin/transactions"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function parsePositiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.min(parsed, max)
}

export async function GET(request: Request) {
  try {
    // Role verification happens on the server; the client is never trusted.
    const admin = await requireAdmin()
    if (!admin.ok) return jsonAdminError(admin.error, admin.status)

    const url = new URL(request.url)
    const search = (url.searchParams.get("search") ?? "").trim().slice(0, 100)
    const roleParam = url.searchParams.get("role")?.trim().toLowerCase()
    const role: AdminTransactionRoleFilter = isAdminTransactionRole(roleParam)
      ? roleParam
      : "all"
    const planParam = url.searchParams.get("plan")?.trim().toLowerCase()
    const plan: AdminTransactionPlanFilter = isAdminTransactionPlan(planParam)
      ? planParam
      : "all"
    const page = parsePositiveInt(url.searchParams.get("page"), 1, 100_000)
    const limit = parsePositiveInt(
      url.searchParams.get("limit"),
      ADMIN_TRANSACTIONS_PAGE_SIZE,
      50
    )

    const result = await getAdminTransactions({
      search,
      role,
      plan,
      page,
      limit,
      adminId: admin.userId,
    })
    return Response.json(result, { headers: NO_STORE })
  } catch (error) {
    console.error("Failed to load admin transactions:", error)
    return jsonAdminError("Could not load transactions.", 500)
  }
}
