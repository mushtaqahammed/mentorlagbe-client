import { ObjectId, type Document, type Filter } from "mongodb"
import type Stripe from "stripe"

import { database } from "@/lib/auth"
import { getPlanById, getPlanForRole, type PlanId } from "@/lib/plans"
import {
  isStripePermissionError,
  stripe,
  stripePermissionMessage,
} from "@/lib/stripe"

const USERS_COLLECTION = "user"
const SUBSCRIPTIONS_COLLECTION = "subscriptions"
const PAYMENTS_COLLECTION = "payments"

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

function toObjectId(userId: string) {
  return /^[a-f\d]{24}$/i.test(userId) && ObjectId.isValid(userId)
    ? new ObjectId(userId)
    : null
}

function userFilter(userId: string): Filter<Document> {
  const id = toObjectId(userId)
  return { _id: id ?? userId } as Filter<Document>
}

function isActiveStatus(status: string) {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status.toLowerCase())
}

function toIsoDate(value: unknown) {
  return value instanceof Date ? value.toISOString() : null
}

async function findUser(userId: string) {
  return database.collection(USERS_COLLECTION).findOne(userFilter(userId), {
    projection: { role: 1, name: 1, email: 1 },
  })
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
  // Stripe moved the billing period onto subscription items. Fall back to the
  // subscription start date for the start of the first period.
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
 * Records the paid Checkout Session once. The unique index on
 * `stripeSessionId` makes retries (success page + webhook) idempotent.
 */
let paymentsIndexPromise: Promise<void> | null = null

function ensurePaymentsIndex() {
  if (!paymentsIndexPromise) {
    paymentsIndexPromise = database
      .collection(PAYMENTS_COLLECTION)
      .createIndex(
        { stripeSessionId: 1 },
        {
          name: "stripeSessionId_unique",
          unique: true,
          partialFilterExpression: { stripeSessionId: { $type: "string" } },
        }
      )
      .then(() => undefined)
      .catch((error) => {
        console.error("Could not create the payments unique index:", error)
      })
  }

  return paymentsIndexPromise
}

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

  await ensurePaymentsIndex()

  const now = new Date()
  const fallbackAmountMinor = (getPlanById(planId)?.price ?? 0) * 100
  const safeAmountMinor =
    Number.isFinite(amountMinor) && amountMinor >= 0
      ? Math.round(amountMinor)
      : fallbackAmountMinor

  try {
    await database.collection(PAYMENTS_COLLECTION).updateOne(
      { stripeSessionId },
      {
        $setOnInsert: {
          userId,
          userEmail,
          userRole,
          planId,
          planName,
          // The admin revenue aggregation reads `amount` in major units unless
          // `amountInMinorUnits` is true, so both forms are stored explicitly.
          amount: safeAmountMinor / 100,
          amountMinor: safeAmountMinor,
          amountInMinorUnits: false,
          currency: currency.toUpperCase(),
          status: paymentStatus,
          paymentStatus,
          provider: "stripe",
          mode: "subscription",
          type: "subscription",
          stripeSessionId,
          stripeSubscriptionId,
          stripeCustomerId,
          currentPeriodStart,
          currentPeriodEnd,
          paidAt: now,
          createdAt: now,
        },
      },
      { upsert: true }
    )
  } catch (error) {
    // A concurrent confirm/webhook request may have inserted the same session
    // first; that is the expected idempotent outcome.
    if ((error as { code?: unknown } | null)?.code === 11000) return

    // The payment record is bookkeeping. A failed insert must not revoke an
    // already verified Stripe subscription.
    console.error("Could not record the Stripe payment:", error)
  }
}

/** Reads the locally stored, Stripe-verified subscription state. */
export async function getSubscriptionState(
  userId: string
): Promise<SubscriptionState> {
  const record = await database
    .collection(SUBSCRIPTIONS_COLLECTION)
    .findOne({ userId }, { sort: { updatedAt: -1 } })

  if (!record) return FREE_STATE

  const status = asString(record.status, "none")
  const isPro = record.isPro === true && isActiveStatus(status)
  const planId = getPlanById(asString(record.planId))?.id ?? null

  if (!isPro) return { ...FREE_STATE, status }

  return {
    plan: "pro",
    isPro: true,
    status,
    planId,
    stripeSubscriptionId: asString(record.stripeSubscriptionId) || null,
    stripeCustomerId: asString(record.stripeCustomerId) || null,
    currentPeriodStart: toIsoDate(record.currentPeriodStart),
    currentPeriodEnd: toIsoDate(record.currentPeriodEnd),
  }
}

async function persistProGrant({
  userId,
  planId,
  status,
  stripeSessionId,
  stripeSubscriptionId,
  stripeCustomerId,
  currentPeriodStart,
  currentPeriodEnd,
}: {
  userId: string
  planId: PlanId
  status: string
  stripeSessionId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
}) {
  const now = new Date()
  const nowIso = now.toISOString()

  const subscriptionSet: Document = {
    userId,
    planId,
    isPro: true,
    status,
    stripeSubscriptionId,
    currentPeriodStart,
    currentPeriodEnd,
    updatedAt: now,
  }
  if (stripeSessionId) subscriptionSet.stripeSessionId = stripeSessionId
  if (stripeCustomerId) subscriptionSet.stripeCustomerId = stripeCustomerId

  const userSet: Document = {
    plan: "pro",
    subscriptionStatus: status,
    proPlanId: planId,
    stripeSubscriptionId,
    subscriptionStartDate: currentPeriodStart?.toISOString() ?? null,
    subscriptionEndDate: currentPeriodEnd?.toISOString() ?? null,
    // Preserve the original activation date across retries. Cancellation
    // clears it, so a later re-subscription gets a fresh date.
    proActivatedAt: { $ifNull: ["$proActivatedAt", nowIso] },
  }
  if (stripeCustomerId) userSet.stripeCustomerId = stripeCustomerId

  await Promise.all([
    database.collection(SUBSCRIPTIONS_COLLECTION).updateOne(
      { userId },
      [
        {
          $set: {
            ...subscriptionSet,
            createdAt: { $ifNull: ["$createdAt", now] },
            activatedAt: { $ifNull: ["$activatedAt", now] },
          },
        },
      ],
      { upsert: true }
    ),
    database
      .collection(USERS_COLLECTION)
      .updateOne(userFilter(userId), [{ $set: userSet }]),
  ])

  return getSubscriptionState(userId)
}

async function markSubscriptionInactive(
  userId: string,
  status: string,
  stripeSubscriptionId = ""
) {
  const now = new Date()

  const subscriptionSet: Document = {
    isPro: false,
    status,
    updatedAt: now,
  }
  if (stripeSubscriptionId) {
    subscriptionSet.stripeSubscriptionId = stripeSubscriptionId
  }

  const userSet: Document = {
    plan: "free",
    subscriptionStatus: status,
  }
  if (stripeSubscriptionId) {
    userSet.stripeSubscriptionId = stripeSubscriptionId
  }

  await Promise.all([
    database
      .collection(SUBSCRIPTIONS_COLLECTION)
      .updateOne(
        { userId },
        [{ $set: subscriptionSet }, { $unset: ["activatedAt"] }],
        { upsert: true }
      ),
    database.collection(USERS_COLLECTION).updateOne(userFilter(userId), [
      { $set: userSet },
      {
        $unset: [
          "proPlanId",
          "proActivatedAt",
          "subscriptionStartDate",
          "subscriptionEndDate",
        ],
      },
    ]),
  ])

  return getSubscriptionState(userId)
}

/**
 * Verifies a completed Stripe Checkout Session directly with Stripe, then
 * grants Pro access. This is the single write path used by both the success
 * page and the webhook, so no UI can grant access on its own.
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
    // Do not expand the subscription here. Expanding requires the same
    // Subscriptions Read permission as retrieving it separately, but it makes
    // the whole Checkout Session request fail. Reading them separately lets us
    // report the missing permission precisely.
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

  // Only the signed-in account that started this Checkout Session may use it.
  if (expectedUserId && userId !== expectedUserId) {
    return {
      ok: false,
      code: "forbidden",
      reason: "This payment belongs to another account.",
    }
  }

  const [user, existingRecord] = await Promise.all([
    findUser(userId),
    database
      .collection(SUBSCRIPTIONS_COLLECTION)
      .findOne({ stripeSessionId: checkoutSession.id }),
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

  // Retrying the success page (or the webhook arriving twice) must not create
  // another payment record or re-activate an already active subscription.
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
        // Heal a missing payment record without activating anything again.
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
          currentPeriodStart: existingRecord.currentPeriodStart ?? null,
          currentPeriodEnd: existingRecord.currentPeriodEnd ?? null,
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
    stripeCustomerId: extractId(subscription.customer) || customerId,
    currentPeriodStart,
    currentPeriodEnd,
  })

  const state = await persistProGrant({
    userId,
    planId: expectedPlan.id,
    status,
    stripeSessionId: checkoutSession.id,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: extractId(subscription.customer) || customerId,
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
