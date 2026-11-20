import { getPlatformStats } from "@/lib/platform/stats"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" } as const

export async function GET() {
  try {
    const stats = await getPlatformStats()
    return Response.json(stats, { headers: NO_STORE })
  } catch (error) {
    console.error("Failed to load public platform statistics:", error)
    return Response.json(
      { error: "Could not load platform statistics." },
      { status: 500, headers: NO_STORE }
    )
  }
}
