import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export const runtime = "nodejs"

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

async function getTutor() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user || session.user.role !== "tutor") {
    return null
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  }
}

async function sendToBackend(path: string, body: unknown) {
  const baseUrl = process.env.BACKEND_API_URL || "http://localhost:5000"

  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })
}

export async function GET() {
  try {
    const baseUrl = process.env.BACKEND_API_URL || "http://localhost:5000"

    const response = await fetch(`${baseUrl}/all-tuitions`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return errorResponse("Server error", 500)
    }

    const data = await response.json()

    return Response.json(data)
  } catch {
    return errorResponse("Server error", 500)
  }
}

export async function POST(request: Request) {
  const tutor = await getTutor()

  if (!tutor) {
    return errorResponse("Unauthorized", 401)
  }

  const tuition = await request.json()

  try {
    const response = await sendToBackend("/api/tuitions", {
      tutor,
      tuition,
    })

    const data = await response.json()

    return Response.json(data, { status: response.status })
  } catch {
    return errorResponse("Server error", 500)
  }
}
