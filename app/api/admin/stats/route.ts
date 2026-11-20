import { headers } from "next/headers"

import { getAdminStats } from "@/lib/admin/stats"
import { auth } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" } as const

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: NO_STORE })
}

export async function GET() {
  try {
    // Verify the Better Auth session on the server; never trust a frontend
    // role check for an endpoint that exposes platform-wide data.
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return jsonError("Authentication required.", 401)
    }

    // Roles are stored as "Admin" / "Tutor" / "Student" in MongoDB.
    if (String(session.user.role).trim().toLowerCase() !== "admin") {
      return jsonError("Admin access required.", 403)
    }

    const stats = await getAdminStats(String(session.user.id))

    return Response.json(stats, { headers: NO_STORE })
  } catch (error) {
    console.error("Failed to load admin statistics:", error)
    return jsonError("Could not load platform statistics.", 500)
  }
}
