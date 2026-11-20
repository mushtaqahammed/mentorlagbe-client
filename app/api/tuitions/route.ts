import { isPubliclyVisibleTuition } from "@/lib/tuitions/public"

export const runtime = "nodejs"

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export async function GET() {
  try {
    const baseUrl = process.env.BACKEND_API_URL || "http://localhost:5000"

    const response = await fetch(`${baseUrl}/all-tuitions`, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(
        `Backend /all-tuitions responded with status ${response.status}`
      )
      return errorResponse("Could not load tuition posts.", 502)
    }

    const data = await response.json()

    // Defence in depth: regardless of what the upstream returns, pending,
    // rejected and closed posts must never reach public listings.
    if (Array.isArray(data)) {
      return Response.json(data.filter(isPubliclyVisibleTuition))
    }

    if (data && typeof data === "object" && Array.isArray(data.tuitions)) {
      return Response.json({
        ...data,
        tuitions: data.tuitions.filter(isPubliclyVisibleTuition),
      })
    }

    return Response.json(data)
  } catch (error) {
    console.error("Error fetching tuitions from backend:", error)
    return errorResponse("Could not load tuition posts.", 502)
  }
}
