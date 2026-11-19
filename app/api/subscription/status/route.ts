import { NextResponse } from "next/server"

import { getRequestSession } from "@/lib/session"
import { getSubscriptionState } from "@/lib/subscription"

export async function GET() {
  const session = await getRequestSession({ fresh: true })

  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 })
  }

  const state = await getSubscriptionState(session.user.id)

  return NextResponse.json(state, {
    headers: { "Cache-Control": "no-store" },
  })
}
