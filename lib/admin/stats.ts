import type { Db, Document } from "mongodb"

import { database } from "@/lib/auth"
import type { AdminStats, StripeRevenueStats } from "@/lib/admin/types"

const USERS_COLLECTION = "user"
const TUITIONS_COLLECTION = "tuition"
const PAYMENT_COLLECTIONS = ["payments", "payment"] as const

const DEFAULT_CURRENCY = "BDT"
const CURRENCY_LOCALE = "en-BD"

// Better Auth stores roles as "Admin" / "Tutor" / "Student"; older records can
// be lowercase, so every role/approval comparison is case-insensitive.
const TUTOR_ROLE = /^tutor$/i
const PENDING_STATUS = /^pending$/i
const APPROVED_STATUS = /^approved$/i

// Stripe webhooks and hand-written payment records use slightly different
// field names. Accept the common ones while still requiring an explicit
// successful status and a Stripe (or unspecified) provider.
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

type TuitionStatusAggregate = {
  _id: string | null
  count: number
}

type RevenueAggregate = {
  total: number
  currencies: string[]
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
    // Fall back to the default currency if a stored code is not supported.
    return new Intl.NumberFormat(CURRENCY_LOCALE, {
      style: "currency",
      currency: DEFAULT_CURRENCY,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }
}

/**
 * The project stores most collections in the singular ("user", "tuition").
 * Payments are specified as "payments", with "payment" supported as a
 * fallback. A missing collection simply yields zero revenue.
 */
async function getPaymentsCollection(db: Db) {
  // Atlas does not accept an `$in` filter on `listCollections`, so read the
  // names and match them locally instead.
  const existing = await db.listCollections({}, { nameOnly: true }).toArray()

  const name = PAYMENT_COLLECTIONS.find((candidate) =>
    existing.some((collection) => collection.name === candidate)
  )

  return name ? db.collection(name) : null
}

function buildRevenuePipeline(): Document[] {
  return [
    {
      $match: {
        $and: [
          // Only Stripe records. Records without a provider field are assumed
          // to belong to the Stripe payments collection.
          {
            $or: [
              ...PROVIDER_FIELDS.map((field) => ({
                [field]: STRIPE_PROVIDER,
              })),
              {
                $and: PROVIDER_FIELDS.map((field) => ({
                  [field]: { $exists: false },
                })),
              },
            ],
          },
          // Require an explicit successful status so failed, pending and
          // incomplete payments can never be counted.
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
          // One-off Stripe charges are not subscription revenue. Records that
          // do not declare a mode are treated as subscriptions.
          {
            $nor: [
              { mode: ONE_TIME_PAYMENT_MODE },
              { type: ONE_TIME_PAYMENT_MODE },
            ],
          },
        ],
      },
    },
    {
      $project: {
        amount: {
          $let: {
            vars: {
              rawAmount: {
                $ifNull: [
                  "$amount",
                  "$amountMajor",
                  "$amountTotal",
                  "$amount_total",
                  "$amountReceived",
                  "$amount_received",
                  "$total",
                  0,
                ],
              },
              // Set `amountInMinorUnits: true` on records that store Stripe's
              // smallest currency unit (cents/paisa) in `amount`.
              divisor: {
                $cond: [
                  { $eq: [{ $toBool: "$amountInMinorUnits" }, true] },
                  100,
                  1,
                ],
              },
            },
            in: {
              $divide: [
                {
                  $convert: {
                    input: "$$rawAmount",
                    to: "double",
                    onError: 0,
                    onNull: 0,
                  },
                },
                "$$divisor",
              ],
            },
          },
        },
        currency: {
          $toUpper: {
            $toString: { $ifNull: ["$currency", DEFAULT_CURRENCY] },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
        currencies: { $addToSet: "$currency" },
      },
    },
  ]
}

async function getStripeRevenue(): Promise<StripeRevenueStats> {
  const payments = await getPaymentsCollection(database)
  const emptyRevenue: StripeRevenueStats = {
    amount: 0,
    currency: DEFAULT_CURRENCY,
    formatted: formatMoney(0, DEFAULT_CURRENCY),
  }

  if (!payments) return emptyRevenue

  const [summary] = await payments
    .aggregate<RevenueAggregate>(buildRevenuePipeline())
    .toArray()

  const amount = Number.isFinite(summary?.total) ? summary.total : 0
  const currency =
    summary?.currencies.find((code) => /^[A-Z]{3}$/.test(code)) ??
    DEFAULT_CURRENCY

  return {
    amount,
    currency,
    formatted: formatMoney(amount, currency),
  }
}

async function getTuitionCounts() {
  const summary = await database
    .collection(TUITIONS_COLLECTION)
    .aggregate<TuitionStatusAggregate>([
      {
        $match: {
          $or: [
            { approvalStatus: PENDING_STATUS },
            { approvalStatus: APPROVED_STATUS },
          ],
        },
      },
      {
        $group: {
          _id: { $toLower: { $ifNull: ["$approvalStatus", ""] } },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray()

  const counts = new Map(summary.map((item) => [item._id, item.count]))

  return {
    pending: counts.get("pending") ?? 0,
    approved: counts.get("approved") ?? 0,
  }
}

/**
 * All four statistics are read directly from MongoDB with count/aggregation
 * queries. Callers are responsible for the Better Auth session and admin role
 * check before invoking this function.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const users = database.collection(USERS_COLLECTION)

  const [totalUsers, totalTutors, tuitionCounts, stripeRevenue] =
    await Promise.all([
      users.countDocuments({}),
      users.countDocuments({ role: TUTOR_ROLE }),
      getTuitionCounts(),
      getStripeRevenue(),
    ])

  return {
    totalUsers,
    totalTutors,
    pendingTuitions: tuitionCounts.pending,
    approvedTuitions: tuitionCounts.approved,
    stripeRevenue,
    updatedAt: new Date().toISOString(),
  }
}
