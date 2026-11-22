import { jsonAdminError, NO_STORE, requireAdmin } from "@/lib/admin/api-auth"
import { getAdminStats } from "@/lib/admin/stats"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const guard = await requireAdmin()
  if (!guard.ok) return jsonAdminError(guard.error, guard.status)

  try {
    const stats = await getAdminStats(guard.userId)
    return Response.json(stats, { headers: NO_STORE })
  } catch (error) {
    console.error("Failed to load admin statistics:", error)
    return jsonAdminError("Could not load platform statistics.", 500)
  }
}
