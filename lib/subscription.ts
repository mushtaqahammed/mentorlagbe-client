import type Stripe from "stripe"

import { backendRequest, userHeaders } from "@/lib/backend-api"
import { getPlanById, getPlanForRole, type PlanId } from "@/lib/plans"
import {
  isStripePermissionError,
  stripe,
  stripePermissionMessage,
} from "@/lib/stripe"

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"])
const PAID_CHECKOUT_STATUSES = new Set(["paid", "no_payment_required"])

export type SubscriptionState = {
  plan: "free" | "pro"
  isPro: boolean
  status: string
  planId: PlanId | null
  stripeSubscriptionId: string | null
  stripeCustomerId: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
}

export type VerificationErrorCode =
  | "bad_request"
  | "forbidden"
  | "not_found"
  | "failed"
  | "stripe_permission"
  | "stripe_error"

export type VerificationResult =
  | { ok: true; state: SubscriptionState }
  | {
      ok: false
      reason: string
      code: VerificationErrorCode
    }

const FREE_STATE: SubscriptionState = {
  plan: "free",
  isPro: false,
  status: "none",
  planId: null,
  stripeSubscriptionId: null,
  stripeCustomerId: null,
  currentPeriodStart: null,
  currentPeriodEnd: null,
}

type InternalUser = {
  id: string
  role: string
  name: string
  email: string
}

type ExistingSubscription = {
  userId: string
  isPro: boolean
  status: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
}

type GrantInput = {
  userId: string
  planId: PlanId
  status: string
  stripeSessionId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
}

function asString(value: unknown, fallback = "") {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return fallback
}

function extractId(value: unknown) {
  if (typeof value === "string") return value
  if (value && typeof value === "object" && "id" in value) {
    return asString((value as { id: unknown }).id)
  }
  return ""
}

function dateFromApi(value: unknown) {
  if (typeof value !== "string" && !(value instanceof Date)) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function isActiveStatus(status: string) {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status.toLowerCase())
}

async function findUser(userId: string): Promise<InternalUser | null> {
  return backendRequest<InternalUser | null>(
    `/internal/users/${encodeURIComponent(userId)}`
  )
}

function subscriptionMatchesPlan(
  subscription: Stripe.Subscription,
  planId: PlanId
) {
  const plan = getPlanById(planId)
  if (!plan) return false

  const price = subscription.items?.data?.[0]?.price
  return (
    price?.unit_amount === plan.price * 100 &&
    price?.currency?.toLowerCase() === "usd" &&
    price?.recurring?.interval === "month"
  )
}

function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items?.data?.[0]
  const start = item?.current_period_start ?? subscription.start_date
  const end = item?.current_period_end

  return {
    currentPeriodStart: start ? new Date(start * 1000) : null,
    currentPeriodEnd: end ? new Date(end * 1000) : null,
  }
}

function stripeErrorResult(
  error: unknown,
  resource: "Checkout Session" | "subscription"
): VerificationResult {
  if (isStripePermissionError(error)) {
    console.error(
      `[stripe] Permission denied while reading the ${resource}. ` +
        "The restricted API key needs 'Checkout Sessions Read' and " +
        "'Subscriptions Read'. Enable those permissions in the Stripe " +
        "Dashboard or use a standard secret key.",
      error
    )

    return {
      ok: false,
      code: "stripe_permission",
      reason: `${stripePermissionMessage} (Missing permission while reading the ${resource}.)`,
    }
  }

  if ((error as { code?: unknown } | null)?.code === "resource_missing") {
    return {
      ok: false,
      code: "not_found",
      reason: "This payment could not be found in Stripe.",
    }
  }

  console.error(`[stripe] Could not read the ${resource}:`, error)
  return {
    ok: false,
    code: "stripe_error",
    reason: "Stripe could not verify this payment right now. Please try again.",
  }
}

/**
 * Records the paid Checkout Session once through the backend. The backend's
 * unique index on `stripeSessionId` makes retries idempotent.
 */
async function recordSubscriptionPayment({
  userId,
  userEmail,
  userRole,
  planId,
  planName,
  amountMinor,
  currency,
  paymentStatus,
  stripeSessionId,
  stripeSubscriptionId,
  stripeCustomerId,
  currentPeriodStart,
  currentPeriodEnd,
}: {
  userId: string
  userEmail: string
  userRole: string
  planId: PlanId
  planName: string
  amountMinor: number
  currency: string
  paymentStatus: string
  stripeSessionId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
}) {
  if (!stripeSessionId) return

  try {
    await backendRequest("/internal/payments", {
      method: "POST",
      body: JSON.stringify({
        userId,
        userEmail,
        userRole,
        planId,
        planName,
        amountMinor,
        currency,
        paymentStatus,
        stripeSessionId,
        stripeSubscriptionId,
        stripeCustomerId,
        currentPeriodStart: currentPeriodStart?.toISOString() ?? null,
        currentPeriodEnd: currentPeriodEnd?.toISOString() ?? null,
      }),
    })
  } catch (error) {
    // Payment bookkeeping must not revoke an already verified subscription.
    console.error("Could not record the Stripe payment:", error)
  }
}

/** Reads the locally stored, Stripe-verified subscription state. */
export async function getSubscriptionState(
  userId: string
): Promise<SubscriptionState> {
  return backendRequest<SubscriptionState>("/internal/subscription-state", {
    headers: userHeaders(userId),
  })
}

async function persistProGrant(input: GrantInput): Promise<SubscriptionState> {
  return backendRequest<SubscriptionState>("/internal/subscriptions/apply", {
    method: "POST",
    headers: userHeaders(input.userId),
    body: JSON.stringify({
      mode: "grant",
      userId: input.userId,
      planId: input.planId,
      status: input.status,
      stripeSessionId: input.stripeSessionId,
      stripeSubscriptionId: input.stripeSubscriptionId,
      stripeCustomerId: input.stripeCustomerId,
      currentPeriodStart: input.currentPeriodStart?.toISOString() ?? null,
      currentPeriodEnd: input.currentPeriodEnd?.toISOString() ?? null,
    }),
  })
}

async function markSubscriptionInactive(
  userId: string,
  status: string,
  stripeSubscriptionId = ""
) {
  return backendRequest<SubscriptionState>("/internal/subscriptions/apply", {
    method: "POST",
    headers: userHeaders(userId),
    body: JSON.stringify({
      mode: "inactive",
      userId,
      status,
      stripeSubscriptionId,
    }),
  })
}

/**
 * Verifies a completed Stripe Checkout Session directly with Stripe, then
 * asks the backend to grant Pro access. This is the single write path used by
 * both the success page and the webhook.
 */
export async function verifyAndGrantProFromCheckoutSession(
  sessionId: string,
  expectedUserId?: string
): Promise<VerificationResult> {
  const trimmedSessionId = sessionId.trim()

  if (!trimmedSessionId) {
    return { ok: false, code: "bad_request", reason: "Missing session id." }
  }

  if (!/^cs_[A-Za-z0-9_]+$/.test(trimmedSessionId)) {
    return {
      ok: false,
      code: "bad_request",
      reason: "Invalid Checkout Session id.",
    }
  }

  let checkoutSession: Stripe.Checkout.Session
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(trimmedSessionId)
  } catch (error) {
    return stripeErrorResult(error, "Checkout Session")
  }

  if (
    checkoutSession.mode !== "subscription" ||
    checkoutSession.status !== "complete" ||
    !checkoutSession.payment_status ||
    !PAID_CHECKOUT_STATUSES.has(checkoutSession.payment_status)
  ) {
    return {
      ok: false,
      code: "failed",
      reason: "This Checkout Session is not a completed subscription payment.",
    }
  }

  const referenceUserId = asString(checkoutSession.client_reference_id)
  const metadataUserId = asString(checkoutSession.metadata?.userId)

  if (referenceUserId && metadataUserId && referenceUserId !== metadataUserId) {
    return {
      ok: false,
      code: "forbidden",
      reason: "This payment contains conflicting account details.",
    }
  }

  const userId = referenceUserId || metadataUserId
  if (!userId) {
    return {
      ok: false,
      code: "bad_request",
      reason: "No account linked to this payment.",
    }
  }

  if (expectedUserId && userId !== expectedUserId) {
    return {
      ok: false,
      code: "forbidden",
      reason: "This payment belongs to another account.",
    }
  }

  const sessionParams = new URLSearchParams({
    stripeSessionId: checkoutSession.id,
  })
  const [user, existingRecord] = await Promise.all([
    findUser(userId),
    backendRequest<ExistingSubscription | null>(
      `/internal/subscription-by-session?${sessionParams}`
    ),
  ])

  if (!user) {
    return { ok: false, code: "not_found", reason: "Account not found." }
  }

  const userRole = asString(user.role)
  const expectedPlan = getPlanForRole(userRole)
  if (!expectedPlan) {
    return {
      ok: false,
      code: "forbidden",
      reason: "This account cannot purchase Pro.",
    }
  }

  const checkoutRole = asString(checkoutSession.metadata?.userRole)
  if (
    checkoutRole &&
    checkoutRole.trim().toLowerCase() !== userRole.trim().toLowerCase()
  ) {
    return {
      ok: false,
      code: "forbidden",
      reason: "This payment does not match your account role.",
    }
  }

  const amountMinor = checkoutSession.amount_total ?? expectedPlan.price * 100
  const currency = (checkoutSession.currency ?? "usd").toUpperCase()
  const customerId = extractId(checkoutSession.customer)
  const userEmail = asString(user.email)

  if (existingRecord) {
    if (asString(existingRecord.userId) !== userId) {
      return {
        ok: false,
        code: "forbidden",
        reason: "This payment is already linked to another account.",
      }
    }

    if (
      existingRecord.isPro === true &&
      isActiveStatus(asString(existingRecord.status))
    ) {
      const state = await getSubscriptionState(userId)
      if (state.isPro) {
        await recordSubscriptionPayment({
          userId,
          userEmail,
          userRole,
          planId: expectedPlan.id,
          planName: expectedPlan.name,
          amountMinor,
          currency,
          paymentStatus: asString(checkoutSession.payment_status, "paid"),
          stripeSessionId: checkoutSession.id,
          stripeSubscriptionId:
            asString(existingRecord.stripeSubscriptionId) ||
            extractId(checkoutSession.subscription),
          stripeCustomerId:
            asString(existingRecord.stripeCustomerId) || customerId,
          currentPeriodStart: dateFromApi(existingRecord.currentPeriodStart),
          currentPeriodEnd: dateFromApi(existingRecord.currentPeriodEnd),
        })

        return { ok: true, state }
      }
    }
  }

  const subscriptionValue = checkoutSession.subscription
  if (!subscriptionValue) {
    return {
      ok: false,
      code: "failed",
      reason: "No subscription was created for this payment.",
    }
  }

  let subscription: Stripe.Subscription
  try {
    subscription =
      typeof subscriptionValue === "string"
        ? await stripe.subscriptions.retrieve(subscriptionValue)
        : subscriptionValue
  } catch (error) {
    return stripeErrorResult(error, "subscription")
  }

  if ("deleted" in subscription && subscription.deleted) {
    return {
      ok: false,
      code: "failed",
      reason: "The subscription no longer exists.",
    }
  }

  const status = subscription.status

  if (!isActiveStatus(status)) {
    await markSubscriptionInactive(userId, status, subscription.id)
    return {
      ok: false,
      code: "failed",
      reason: "The subscription is not active.",
    }
  }

  const checkoutPlanId = asString(checkoutSession.metadata?.planId)
  const subscriptionPlanId = asString(subscription.metadata?.planId)
  const subscriptionUserId = asString(subscription.metadata?.userId)

  if (
    (checkoutPlanId && checkoutPlanId !== expectedPlan.id) ||
    (subscriptionPlanId && subscriptionPlanId !== expectedPlan.id) ||
    (subscriptionUserId && subscriptionUserId !== userId)
  ) {
    return {
      ok: false,
      code: "forbidden",
      reason: "Subscription details do not match this account.",
    }
  }

  if (!subscriptionMatchesPlan(subscription, expectedPlan.id)) {
    return {
      ok: false,
      code: "failed",
      reason: "Subscription price does not match the selected plan.",
    }
  }

  const { currentPeriodStart, currentPeriodEnd } =
    getSubscriptionPeriod(subscription)

  const resolvedCustomerId = extractId(subscription.customer) || customerId

  await recordSubscriptionPayment({
    userId,
    userEmail,
    userRole,
    planId: expectedPlan.id,
    planName: expectedPlan.name,
    amountMinor,
    currency,
    paymentStatus: asString(checkoutSession.payment_status, "paid"),
    stripeSessionId: checkoutSession.id,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: resolvedCustomerId,
    currentPeriodStart,
    currentPeriodEnd,
  })

  const state = await persistProGrant({
    userId,
    planId: expectedPlan.id,
    status,
    stripeSessionId: checkoutSession.id,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: resolvedCustomerId,
    currentPeriodStart,
    currentPeriodEnd,
  })

  return { ok: true, state }
}

/** Keeps the stored Pro state in sync with Stripe subscription lifecycle events. */
export async function syncStripeSubscription(
  subscription: Stripe.Subscription
): Promise<SubscriptionState> {
  const userId = asString(subscription.metadata?.userId)
  const status = subscription.status

  if (!userId) return FREE_STATE

  const user = await findUser(userId)
  if (!user) return FREE_STATE

  if (!isActiveStatus(status)) {
    return markSubscriptionInactive(userId, status, subscription.id)
  }

  const expectedPlan = getPlanForRole(asString(user.role))
  const planId =
    getPlanById(asString(subscription.metadata?.planId))?.id ??
    expectedPlan?.id ??
    null

  if (!planId || !subscriptionMatchesPlan(subscription, planId)) {
    return markSubscriptionInactive(userId, "invalid_plan", subscription.id)
  }

  const { currentPeriodStart, currentPeriodEnd } =
    getSubscriptionPeriod(subscription)

  return persistProGrant({
    userId,
    planId,
    status,
    stripeSessionId: "",
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: extractId(subscription.customer),
    currentPeriodStart,
    currentPeriodEnd,
  })
}
