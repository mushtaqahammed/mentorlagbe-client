import { jsonAdminError, NO_STORE, requireAdmin } from "@/lib/admin/api-auth"
import {
  ADMIN_TUITION_STATUSES,
  ADMIN_TUITIONS_PAGE_SIZE,
  type AdminTuitionStatus,
  type AdminTuitionStatusFilter,
} from "@/lib/admin/types"
import { getAdminTuitions, parseTuitionSort } from "@/lib/admin/tuitions"

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
    const subject = (url.searchParams.get("subject") ?? "").trim().slice(0, 100)
    const statusParam = url.searchParams.get("status")?.trim().toLowerCase()
    const status: AdminTuitionStatusFilter =
      statusParam &&
      (ADMIN_TUITION_STATUSES as readonly string[]).includes(statusParam)
        ? (statusParam as AdminTuitionStatus)
        : "all"
    const page = parsePositiveInt(url.searchParams.get("page"), 1, 100_000)
    const limit = parsePositiveInt(
      url.searchParams.get("limit"),
      ADMIN_TUITIONS_PAGE_SIZE,
      50
    )

    const result = await getAdminTuitions({
      search,
      subject,
      status,
      sort: parseTuitionSort(url.searchParams.get("sort")),
      page,
      limit,
    })

    return Response.json(result, { headers: NO_STORE })
  } catch (error) {
    console.error("Failed to load admin tuitions:", error)
    return jsonAdminError("Could not load tuition posts.", 500)
  }
}
