import { NextResponse } from "next/server"

import { getRequestSession } from "@/lib/session"
import {
  verifyAndGrantProFromCheckoutSession,
  type VerificationErrorCode,
} from "@/lib/subscription"

const STATUS_BY_CODE: Record<VerificationErrorCode, number> = {
  bad_request: 400,
  forbidden: 403,
  not_found: 404,
  failed: 409,
  stripe_permission: 502,
  stripe_error: 502,
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

export async function POST(request: Request) {
  const session = await getRequestSession({ fresh: true })

  if (!session?.user) {
    return json({ error: "Sign in to continue." }, 401)
  }

  const body = (await request.json().catch(() => ({}))) as {
    sessionId?: unknown
  }
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : ""

  try {
    const result = await verifyAndGrantProFromCheckoutSession(
      sessionId,
      session.user.id
    )

    if (!result.ok) {
      return json(
        { error: result.reason, code: result.code },
        STATUS_BY_CODE[result.code]
      )
    }

    return json(result.state)
  } catch (error) {
    console.error("Could not verify Stripe checkout session:", error)
    return json(
      { error: "Could not verify your subscription with Stripe." },
      500
    )
  }
}
