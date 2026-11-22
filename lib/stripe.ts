import "server-only"

import Stripe from "stripe"

const secretKey = process.env.STRIPE_SECRET_KEY?.trim()

if (!secretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable.")
}

/**
 * `rk_` keys are Stripe restricted keys. The subscription flow needs these
 * permissions on the key (or a standard `sk_` secret key):
 *   - Checkout Sessions: Read + Write
 *   - Subscriptions: Read
 *   - Customers: Read + Write (subscription Checkout creates a customer)
 *
 * The key itself is never exported or sent to the client.
 */
export const stripePermissionMessage =
  "Stripe rejected the request because the configured API key is missing permissions. " +
  "Enable Checkout Sessions Read/Write and Subscriptions Read on the restricted key, " +
  "or use a standard secret key, then try again."

export function isStripePermissionError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { type?: unknown }).type === "StripePermissionError"
  )
}

export const stripe = new Stripe(secretKey, {
  appInfo: { name: "MentorLagbe", version: "0.0.1" },
  maxNetworkRetries: 2,
  timeout: 20_000,
})
