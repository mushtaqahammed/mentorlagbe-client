import { isPubliclyVisibleTuition } from "@/lib/tuitions/public"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const baseUrl = process.env.BACKEND_API_URL || "http://localhost:5000"

    const response = await fetch(
      `${baseUrl}/all-tuitions/${encodeURIComponent(id)}`,
      { cache: "no-store" }
    )

    if (!response.ok) {
      const message =
        response.status === 404 ? "Tuition not found" : "Could not load tuition"
      return Response.json({ error: message }, { status: response.status })
    }

    const data = await response.json()

    if (!isPubliclyVisibleTuition(data)) {
      return Response.json({ error: "Tuition not found" }, { status: 404 })
    }

    return Response.json(data)
  } catch (error) {
    console.error("Error fetching tuition:", error)
    return Response.json({ error: "Could not load tuition" }, { status: 502 })
  }
}
