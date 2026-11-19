import { headers } from "next/headers"
import type Stripe from "stripe"

import { stripe } from "@/lib/stripe"
import {
  syncStripeSubscription,
  verifyAndGrantProFromCheckoutSession,
} from "@/lib/subscription"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured.")
    return Response.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 }
    )
  }

  const signature = (await headers()).get("stripe-signature")
  if (!signature) {
    return Response.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    )
  }

  const payload = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch {
    return Response.json(
      { error: "Invalid Stripe signature." },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session

        if (checkoutSession.mode === "subscription") {
          const result = await verifyAndGrantProFromCheckoutSession(
            checkoutSession.id
          )

          if (!result.ok) {
            console.warn("Stripe checkout could not grant Pro:", result.reason)
          }
        }
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncStripeSubscription(event.data.object as Stripe.Subscription)
        break
      }

      default:
        break
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook handler failed:", error)
    return Response.json({ error: "Webhook handler failed." }, { status: 500 })
  }
}
