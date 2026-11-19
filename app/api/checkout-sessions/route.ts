import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { getPlanForRole } from "@/lib/plans"
import { getRequestSession } from "@/lib/session"
import {
  isStripePermissionError,
  stripe,
  stripePermissionMessage,
} from "@/lib/stripe"

function getAppOrigin(headersList: Pick<Headers, "get">) {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "")
  }

  const host = headersList.get("x-forwarded-host") ?? headersList.get("host")
  const isLocalHost = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host ?? "")
  const protocol =
    headersList.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    (isLocalHost ? "http" : "https")

  return host ? `${protocol}://${host}` : "http://localhost:3000"
}

export async function POST() {
  try {
    const session = await getRequestSession()
    const user = session?.user

    if (!user) {
      return NextResponse.json(
        { error: "Sign in to continue." },
        { status: 401 }
      )
    }

    // The plan comes from the authenticated role, never from the request body.
    const plan = getPlanForRole(user.role)

    if (!plan) {
      return NextResponse.json(
        { error: "This plan is not available for your role." },
        { status: 403 }
      )
    }

    const origin = getAppOrigin(await headers())

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: plan.price * 100,
            recurring: { interval: "month" },
            product_data: {
              name: plan.name,
              description: plan.description,
            },
          },
        },
      ],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        userRole: user.role,
        planId: plan.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          userRole: user.role,
          planId: plan.id,
        },
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment`,
    })

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a Checkout URL.")
    }

    return NextResponse.redirect(checkoutSession.url, 303)
  } catch (err) {
    if (isStripePermissionError(err)) {
      console.error(
        "Stripe denied the Checkout Session request. The configured API key " +
          "needs Checkout Sessions Write, Subscriptions Read and Customers " +
          "Write permissions (or a standard secret key).",
        err
      )

      return NextResponse.json(
        { error: stripePermissionMessage },
        { status: 502 }
      )
    }

    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
