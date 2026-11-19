import { getFeaturedTuitions } from "@/lib/tuitions/featured"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" } as const

export async function GET() {
  try {
    const data = await getFeaturedTuitions()
    return Response.json(data, { headers: NO_STORE })
  } catch (error) {
    console.error("Failed to load featured tuitions:", error)
    return Response.json(
      { error: "Could not load featured tuitions." },
      { status: 500, headers: NO_STORE }
    )
  }
}
