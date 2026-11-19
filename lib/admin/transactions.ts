import { ObjectId, type Document, type WithId } from "mongodb"

import {
  ADMIN_TRANSACTION_PLANS,
  ADMIN_TRANSACTION_ROLES,
  type AdminTransaction,
  type AdminTransactionCounts,
  type AdminTransactionPlanFilter,
  type AdminTransactionPlanId,
  type AdminTransactionRole,
  type AdminTransactionRoleFilter,
  type AdminTransactionsResponse,
  type StripeRevenueStats,
} from "@/lib/admin/types"
import { database } from "@/lib/auth"
import { getPlanById, getPlanForRole, proPlans } from "@/lib/plans"

const PAYMENTS_COLLECTION = "payments"
const USERS_COLLECTION = "user"

const DEFAULT_CURRENCY = "USD"
const CURRENCY_LOCALE = "en-US"
const SEARCH_USER_LIMIT = 500

// `payments` documents are written by the Stripe verification flow, but older
// records can use different field names. Accept the common variants while
// still requiring an explicit successful status and a Stripe provider.
const SUCCESSFUL_PAYMENT_STATUS =
  /^(succeeded|success|paid|completed|complete)$/i
const UNSUCCESSFUL_PAYMENT_STATUS =
  /^(failed|failure|pending|incomplete|incomplete_expired|canceled|cancelled|refunded|reversed)$/i
const STRIPE_PROVIDER = /^stripe$/i
const ONE_TIME_PAYMENT_MODE = /^(payment|one[_-]?time)$/i

const SUCCESS_STATUS_FIELDS = [
  "status",
  "paymentStatus",
  "payment_status",
] as const
const PROVIDER_FIELDS = [
  "provider",
  "paymentProvider",
  "payment_provider",
  "gateway",
  "processor",
] as const

let paymentsSetupPromise: Promise<void> | null = null

/**
 * Idempotently guarantees the existing `payments` collection is available.
 * This reuses the canonical collection and its current schema — it never
 * creates a second collection or modifies any stored payment document.
 * The unique partial index is the same one the Stripe writer relies on.
 */
function ensurePaymentsCollection() {
  if (!paymentsSetupPromise) {
    paymentsSetupPromise = (async () => {
      const existing = await database
        .listCollections({ name: PAYMENTS_COLLECTION }, { nameOnly: true })
        .toArray()

      if (existing.length === 0) {
        try {
          await database.createCollection(PAYMENTS_COLLECTION)
        } catch (error) {
          // A concurrent request may have created it first.
          if ((error as { code?: number }).code !== 48) throw error
        }
      }

      await database.collection(PAYMENTS_COLLECTION).createIndex(
        { stripeSessionId: 1 },
        {
          name: "stripeSessionId_unique",
          unique: true,
          partialFilterExpression: { stripeSessionId: { $type: "string" } },
        }
      )
    })().catch((error) => {
      // Allow the next request to retry instead of caching a failed setup.
      paymentsSetupPromise = null
      console.error("Could not prepare the payments collection:", error)
    })
  }

  return paymentsSetupPromise
}

type TransactionUser = {
  name: string
  email: string
  role: string
  planId: string
}

type RevenueAggregate = {
  total: number
  currencies: string[]
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function toIsoString(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }

  return null
}

function normalizeRole(value: unknown): AdminTransactionRole | null {
  const normalized = asString(value).toLowerCase()
  return (ADMIN_TRANSACTION_ROLES as readonly string[]).includes(normalized)
    ? (normalized as AdminTransactionRole)
    : null
}

function resolvePlan(
  payment: Document,
  user: TransactionUser | undefined,
  role: AdminTransactionRole | null
) {
  const storedPlan = getPlanById(asString(payment.planId))
  if (storedPlan) return storedPlan

  // Legacy records may only carry the display name.
  const storedName = asString(payment.planName)
  if (/tutor/i.test(storedName)) return proPlans["pro-tutor"]
  if (/student/i.test(storedName)) return proPlans["pro-student"]

  const userPlan = getPlanById(user?.planId)
  if (userPlan) return userPlan

  return getPlanForRole(role) ?? proPlans["pro-student"]
}

function toMajorAmount(payment: Document) {
  const storedMinor = Number(payment.amountMinor)
  const storedAmount = Number(payment.amount)

  if (payment.amountInMinorUnits === true) {
    if (Number.isFinite(storedMinor)) return storedMinor / 100
    if (Number.isFinite(storedAmount)) return storedAmount
  } else {
    if (Number.isFinite(storedAmount)) return storedAmount
    if (Number.isFinite(storedMinor)) return storedMinor / 100
  }

  return 0
}

function normalizeCurrency(value: unknown) {
  const currency = asString(value).toUpperCase()
  return /^[A-Z]{3}$/.test(currency) ? currency : DEFAULT_CURRENCY
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALE, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return new Intl.NumberFormat(CURRENCY_LOCALE, {
      style: "currency",
      currency: DEFAULT_CURRENCY,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }
}

/**
 * Conditions that only verified Stripe subscription payments satisfy:
 * successful status, a Stripe provider, a Checkout Session reference and no
 * one-time charge markers. Failed, pending and refunded records can never be
 * returned by the admin API.
 */
function verifiedPaymentConditions(): Document[] {
  return [
    { stripeSessionId: { $type: "string" } },
    {
      $or: SUCCESS_STATUS_FIELDS.map((field) => ({
        [field]: SUCCESSFUL_PAYMENT_STATUS,
      })),
    },
    {
      $nor: SUCCESS_STATUS_FIELDS.map((field) => ({
        [field]: UNSUCCESSFUL_PAYMENT_STATUS,
      })),
    },
    {
      $nor: [{ mode: ONE_TIME_PAYMENT_MODE }, { type: ONE_TIME_PAYMENT_MODE }],
    },
    {
      $or: [
        ...PROVIDER_FIELDS.map((field) => ({ [field]: STRIPE_PROVIDER })),
        {
          // Records without a provider field are accepted only when they
          // clearly come from a Stripe subscription.
          $and: [
            ...PROVIDER_FIELDS.map((field) => ({
              [field]: { $exists: false },
            })),
            { stripeSubscriptionId: { $type: "string" } },
          ],
        },
      ],
    },
  ]
}

async function getUserIdsMatching(search: string) {
  const term = search.trim().slice(0, 100)
  if (!term) return []

  const pattern = new RegExp(escapeRegExp(term), "i")
  const users = await database
    .collection(USERS_COLLECTION)
    .find(
      { $or: [{ name: pattern }, { email: pattern }] },
      { projection: { _id: 1 } }
    )
    .limit(SEARCH_USER_LIMIT)
    .toArray()

  return users.map((user) => String(user._id))
}

async function buildSearchConditions(search: string): Promise<Document[]> {
  const term = search.trim().slice(0, 100)
  if (!term) return []

  const pattern = new RegExp(escapeRegExp(term), "i")
  const userIds = await getUserIdsMatching(term)

  const matches: Document[] = [
    { userEmail: pattern },
    { stripeSessionId: pattern },
    { stripeSubscriptionId: pattern },
    { stripeCustomerId: pattern },
  ]

  if (userIds.length > 0) {
    matches.push({ userId: { $in: userIds } })
  }

  return [{ $or: matches }]
}

function buildPlanConditions(plan: AdminTransactionPlanFilter): Document[] {
  if (plan === "all") return []

  const config = getPlanById(plan)
  const matches: Document[] = [
    { planId: new RegExp(`^${escapeRegExp(plan)}$`, "i") },
  ]

  if (config) {
    matches.push({
      planName: new RegExp(`^${escapeRegExp(config.name)}$`, "i"),
    })
  }

  return [{ $or: matches }]
}

function buildRoleConditions(role: AdminTransactionRoleFilter): Document[] {
  if (role === "all") return []

  return [{ userRole: new RegExp(`^${escapeRegExp(role)}$`, "i") }]
}

function combine(conditions: Document[]): Document {
  return { $and: conditions }
}

async function getTransactionUsers(
  userIds: string[]
): Promise<Map<string, TransactionUser>> {
  const ids = [...new Set(userIds.filter(Boolean))]
  if (ids.length === 0) return new Map()

  const users = await database
    .collection(USERS_COLLECTION)
    .find({ _id: { $in: ids.map((id) => toUserObjectId(id)) } } as Document, {
      projection: { name: 1, email: 1, role: 1, proPlanId: 1 },
    })
    .toArray()

  return new Map(
    users.map((user) => [
      String(user._id),
      {
        name: asString(user.name),
        email: asString(user.email),
        role: asString(user.role),
        planId: asString(user.proPlanId),
      },
    ])
  )
}

function toUserObjectId(value: string) {
  // Better Auth stores user ids as ObjectIds. Fall back to the raw value so
  // legacy string ids still match instead of throwing.
  return /^[a-f\d]{24}$/i.test(value) && ObjectId.isValid(value)
    ? new ObjectId(value)
    : value
}

function serializeTransaction(
  payment: WithId<Document>,
  users: Map<string, TransactionUser>
): AdminTransaction {
  const userId = asString(payment.userId)
  const user = users.get(userId)

  const storedRole =
    normalizeRole(payment.userRole) ?? normalizeRole(user?.role)
  const plan = resolvePlan(payment, user, storedRole)
  const role: AdminTransactionRole =
    storedRole ?? (plan.id === "pro-tutor" ? "tutor" : "student")

  const email = asString(payment.userEmail) || user?.email || ""
  const amount = toMajorAmount(payment)
  const currency = normalizeCurrency(payment.currency)
  const stripeSessionId = asString(payment.stripeSessionId)
  const stripeSubscriptionId = asString(payment.stripeSubscriptionId) || null

  return {
    id: String(payment._id),
    userId,
    userName: user?.name || email || "Unnamed user",
    email,
    role,
    planId: plan.id,
    planName: asString(payment.planName) || plan.name,
    amount,
    currency,
    amountFormatted: formatMoney(amount, currency),
    transactionId:
      stripeSessionId ||
      stripeSubscriptionId ||
      asString(payment.stripeCustomerId) ||
      String(payment._id),
    stripeSessionId,
    stripeSubscriptionId,
    paymentDate:
      toIsoString(payment.paidAt) ??
      toIsoString(payment.createdAt) ??
      toIsoString(payment.currentPeriodStart),
  }
}

function buildRevenuePipeline(): Document[] {
  const amountFromMajor = {
    $convert: {
      input: "$amount",
      to: "double",
      onError: null,
      onNull: null,
    },
  }
  const amountFromMinor = {
    $divide: [
      {
        $convert: {
          input: "$amountMinor",
          to: "double",
          onError: null,
          onNull: 0,
        },
      },
      100,
    ],
  }

  return [
    { $match: combine(verifiedPaymentConditions()) },
    {
      $addFields: {
        _amount: {
          $cond: [
            { $eq: ["$amountInMinorUnits", true] },
            amountFromMinor,
            { $ifNull: [amountFromMajor, amountFromMinor] },
          ],
        },
        _currency: {
          $toUpper: {
            $ifNull: ["$currency", DEFAULT_CURRENCY],
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$_amount" },
        currencies: { $addToSet: "$_currency" },
      },
    },
  ]
}

async function getSummary(): Promise<AdminTransactionsResponse["summary"]> {
  const payments = database.collection(PAYMENTS_COLLECTION)
  const verified = combine(verifiedPaymentConditions())

  const [total, tutorCount, studentCount, revenueResult] = await Promise.all([
    payments.countDocuments(verified),
    payments.countDocuments(
      combine([...verifiedPaymentConditions(), ...buildRoleConditions("tutor")])
    ),
    payments.countDocuments(
      combine([
        ...verifiedPaymentConditions(),
        ...buildRoleConditions("student"),
      ])
    ),
    payments.aggregate<RevenueAggregate>(buildRevenuePipeline()).toArray(),
  ])

  const summary = revenueResult[0]
  const amount = Number.isFinite(summary?.total) ? summary.total : 0
  const currency =
    summary?.currencies.find((code) => /^[A-Z]{3}$/.test(code)) ??
    DEFAULT_CURRENCY

  const revenue: StripeRevenueStats = {
    amount,
    currency,
    formatted: formatMoney(amount, currency),
  }

  return { total, tutorCount, studentCount, revenue }
}

/**
 * Reads verified Stripe subscription payments from the shared `payments`
 * collection. Search, filtering and pagination happen in MongoDB so the admin
 * page stays responsive. The user name is joined from the Better Auth `user`
 * collection because payment records only store the email.
 */
export async function getAdminTransactions({
  search,
  role,
  plan,
  page,
  limit,
}: {
  search: string
  role: AdminTransactionRoleFilter
  plan: AdminTransactionPlanFilter
  page: number
  limit: number
}): Promise<AdminTransactionsResponse> {
  await ensurePaymentsCollection()

  const payments = database.collection(PAYMENTS_COLLECTION)

  const searchConditions = await buildSearchConditions(search)
  const planConditions = buildPlanConditions(plan)
  const baseConditions = [
    ...verifiedPaymentConditions(),
    ...searchConditions,
    ...planConditions,
  ]
  const filter = combine([...baseConditions, ...buildRoleConditions(role)])
  const [total, ...roleCounts] = await Promise.all([
    payments.countDocuments(filter),
    ...(
      ["all", ...ADMIN_TRANSACTION_ROLES] as AdminTransactionRoleFilter[]
    ).map((value) =>
      payments.countDocuments(
        combine([...baseConditions, ...buildRoleConditions(value)])
      )
    ),
  ])

  const counts = Object.fromEntries(
    (["all", ...ADMIN_TRANSACTION_ROLES] as AdminTransactionRoleFilter[]).map(
      (value, index) => [value, roleCounts[index] ?? 0]
    )
  ) as AdminTransactionCounts

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(Math.max(1, page), totalPages)

  const documents =
    total === 0
      ? []
      : await payments
          .find(filter, {
            projection: {
              userId: 1,
              userEmail: 1,
              userRole: 1,
              planId: 1,
              planName: 1,
              amount: 1,
              amountMinor: 1,
              amountInMinorUnits: 1,
              currency: 1,
              stripeSessionId: 1,
              stripeSubscriptionId: 1,
              stripeCustomerId: 1,
              paidAt: 1,
              createdAt: 1,
              currentPeriodStart: 1,
            },
          })
          .sort({ paidAt: -1, createdAt: -1, _id: -1 })
          .skip((safePage - 1) * limit)
          .limit(limit)
          .toArray()

  const users = await getTransactionUsers(
    documents.map((payment) => asString(payment.userId))
  )

  return {
    transactions: documents.map((payment) =>
      serializeTransaction(payment, users)
    ),
    total,
    counts,
    summary: await getSummary(),
    page: safePage,
    totalPages,
    limit,
    updatedAt: new Date().toISOString(),
  }
}

export function isAdminTransactionRole(
  value: unknown
): value is AdminTransactionRole {
  return normalizeRole(value) !== null
}

export function isAdminTransactionPlan(
  value: unknown
): value is AdminTransactionPlanId {
  return (
    typeof value === "string" &&
    (ADMIN_TRANSACTION_PLANS as readonly string[]).includes(value)
  )
}
