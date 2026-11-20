"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  Banknote,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileSearch,
  GraduationCap,
  Loader2,
  ReceiptText,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { RoleBadge } from "@/components/dashboard/role-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ADMIN_TRANSACTIONS_PAGE_SIZE,
  type AdminApiError,
  type AdminTransaction,
  type AdminTransactionCounts,
  type AdminTransactionPlanFilter,
  type AdminTransactionRoleFilter,
  type AdminTransactionsResponse,
  type AdminTransactionsSummary,
} from "@/lib/admin/types"
import { notify, userMessage } from "@/lib/notify"
import { cn } from "@/lib/utils"

const numberFormatter = new Intl.NumberFormat("en-BD")

const ROLE_TABS: { value: AdminTransactionRoleFilter; label: string }[] = [
  { value: "all", label: "All payments" },
  { value: "tutor", label: "Tutor" },
  { value: "student", label: "Student" },
]

const PLAN_OPTIONS: { value: AdminTransactionPlanFilter; label: string }[] = [
  { value: "all", label: "All plans" },
  { value: "pro-tutor", label: "Pro Tutor" },
  { value: "pro-student", label: "Pro Student" },
]

const EMPTY_COUNTS: AdminTransactionCounts = {
  all: 0,
  tutor: 0,
  student: 0,
}

const EMPTY_SUMMARY: AdminTransactionsSummary = {
  total: 0,
  tutorCount: 0,
  studentCount: 0,
  revenue: { amount: 0, currency: "USD", formatted: "$0" },
}

const PLAN_STYLES: Record<AdminTransaction["planId"], string> = {
  "pro-tutor": "border-lime-400/25 bg-lime-400/10 text-lime-300",
  "pro-student": "border-sky-400/25 bg-sky-400/10 text-sky-300",
}

function errorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data) {
    const value = (data as { error?: unknown }).error
    if (typeof value === "string" && value.trim()) return value
  }
  return fallback
}

function formatPaymentDate(value: string | null) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return {
    date: date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

function PlanBadge({ transaction }: { transaction: AdminTransaction }) {
  const Icon = transaction.planId === "pro-tutor" ? GraduationCap : Sparkles

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        PLAN_STYLES[transaction.planId]
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {transaction.planName}
    </span>
  )
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof ReceiptText
  label: string
  value: string
  accent: "lime" | "sky" | "amber"
}) {
  const styles = {
    lime: "bg-lime-400/10 text-lime-300 ring-lime-400/25",
    sky: "bg-sky-400/10 text-sky-300 ring-sky-400/25",
    amber: "bg-amber-400/10 text-amber-300 ring-amber-400/25",
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950/60 p-4 shadow-lg shadow-black/10">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
          styles[accent]
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xl font-bold tracking-tight text-white tabular-nums">
          {value}
        </p>
      </div>
    </div>
  )
}

function TransactionTableRow({
  transaction,
}: {
  transaction: AdminTransaction
}) {
  const paymentDate = formatPaymentDate(transaction.paymentDate)

  return (
    <tr className="transition-colors hover:bg-white/[0.02]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={transaction} className="size-9" />
          <p className="max-w-[180px] truncate text-sm font-semibold text-white">
            {transaction.userName}
          </p>
        </div>
      </td>
      <td className="px-5 py-4">
        <p
          className="max-w-[200px] truncate text-sm text-neutral-400"
          title={transaction.email}
        >
          {transaction.email || "—"}
        </p>
      </td>
      <td className="px-5 py-4">
        <RoleBadge role={transaction.role} />
      </td>
      <td className="px-5 py-4">
        <PlanBadge transaction={transaction} />
      </td>
      <td className="px-5 py-4 text-sm font-bold whitespace-nowrap text-white tabular-nums">
        {transaction.amountFormatted}
      </td>
      <td className="px-5 py-4">
        <code
          className="block max-w-[200px] truncate rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-neutral-300"
          title={transaction.transactionId}
        >
          {transaction.transactionId}
        </code>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        {paymentDate ? (
          <>
            <p className="text-sm text-neutral-300">{paymentDate.date}</p>
            <p className="mt-0.5 text-[11px] text-neutral-500 tabular-nums">
              {paymentDate.time}
            </p>
          </>
        ) : (
          <span className="text-sm text-neutral-500">—</span>
        )}
      </td>
    </tr>
  )
}

function TransactionMobileCard({
  transaction,
}: {
  transaction: AdminTransaction
}) {
  const paymentDate = formatPaymentDate(transaction.paymentDate)

  return (
    <article className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4 shadow-lg shadow-black/10">
      <div className="flex items-start gap-3">
        <UserAvatar user={transaction} className="size-11" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {transaction.userName}
          </p>
          <p
            className="mt-0.5 truncate text-xs text-neutral-400"
            title={transaction.email}
          >
            {transaction.email || "—"}
          </p>
        </div>
        <RoleBadge role={transaction.role} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <PlanBadge transaction={transaction} />
        <p className="text-base font-bold text-white tabular-nums">
          {transaction.amountFormatted}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            Payment date
          </dt>
          <dd className="mt-1 text-sm text-neutral-300">
            {paymentDate ? (
              <>
                {paymentDate.date}
                <span className="block text-[11px] text-neutral-500 tabular-nums">
                  {paymentDate.time}
                </span>
              </>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            Transaction ID
          </dt>
          <dd className="mt-1">
            <code
              className="block truncate rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-neutral-300"
              title={transaction.transactionId}
            >
              {transaction.transactionId}
            </code>
          </dd>
        </div>
      </dl>
    </article>
  )
}

export function AdminTransactionsManager() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState<AdminTransactionCounts>(EMPTY_COUNTS)
  const [summary, setSummary] =
    useState<AdminTransactionsSummary>(EMPTY_SUMMARY)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [roleFilter, setRoleFilter] =
    useState<AdminTransactionRoleFilter>("all")
  const [planFilter, setPlanFilter] =
    useState<AdminTransactionPlanFilter>("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const requestIdRef = useRef(0)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [search])

  const loadTransactions = useCallback(
    async (options?: { silent?: boolean; signal?: AbortSignal }) => {
      const requestId = ++requestIdRef.current
      const silent = options?.silent ?? false

      if (silent) setRefreshing(true)
      else setLoading(true)
      setError("")

      const params = new URLSearchParams({
        page: String(page),
        limit: String(ADMIN_TRANSACTIONS_PAGE_SIZE),
      })
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim())
      if (roleFilter !== "all") params.set("role", roleFilter)
      if (planFilter !== "all") params.set("plan", planFilter)

      try {
        const response = await fetch(
          `/api/admin/transactions?${params.toString()}`,
          { cache: "no-store", signal: options?.signal }
        )
        const data: AdminTransactionsResponse | AdminApiError =
          await response.json()

        if (!response.ok) {
          throw new Error(errorMessage(data, "Could not load transactions."))
        }

        if (requestId !== requestIdRef.current) return

        const result = data as AdminTransactionsResponse
        setTransactions(result.transactions)
        setTotal(result.total)
        setCounts(result.counts)
        setSummary(result.summary)
        setTotalPages(result.totalPages)
        if (result.page !== page) setPage(result.page)
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError")
          return
        if (requestId !== requestIdRef.current) return
        const message = userMessage(loadError, "Could not load transactions.")
        setError(message)
        notify.error("Could not load transactions", message)
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    },
    [debouncedSearch, page, planFilter, roleFilter]
  )

  useEffect(() => {
    const controller = new AbortController()

    async function run() {
      await loadTransactions({ signal: controller.signal })
    }

    void run()
    return () => controller.abort()
  }, [loadTransactions])

  function clearFilters() {
    setSearch("")
    setDebouncedSearch("")
    setRoleFilter("all")
    setPlanFilter("all")
    setPage(1)
  }

  const isFiltering =
    Boolean(debouncedSearch.trim()) ||
    roleFilter !== "all" ||
    planFilter !== "all"
  const start = total === 0 ? 0 : (page - 1) * ADMIN_TRANSACTIONS_PAGE_SIZE + 1
  const end = Math.min(page * ADMIN_TRANSACTIONS_PAGE_SIZE, total)

  return (
    <DashboardPage
      title="Transactions"
      description="Every verified Stripe subscription payment across MentorLagbe."
    >
      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25">
            <CreditCard className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
              Verified Stripe revenue
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-white tabular-nums">
              {summary.revenue.formatted}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {numberFormatter.format(summary.total)} successful subscription
              payment{summary.total === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1.5 text-[11px] font-semibold text-lime-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-lime-400" />
            </span>
            Live Data
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              loadTransactions({ silent: transactions.length > 0 })
            }
            disabled={loading || refreshing}
            className="h-8 gap-2 rounded-full border-white/15 bg-white/5 px-3 text-xs font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                (loading || refreshing) && "animate-spin"
              )}
              aria-hidden="true"
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SummaryStat
          icon={ReceiptText}
          label="Verified payments"
          value={numberFormatter.format(summary.total)}
          accent="amber"
        />
        <SummaryStat
          icon={GraduationCap}
          label="Tutor purchases"
          value={numberFormatter.format(summary.tutorCount)}
          accent="lime"
        />
        <SummaryStat
          icon={Sparkles}
          label="Student purchases"
          value={numberFormatter.format(summary.studentCount)}
          accent="sky"
        />
      </div>

      <section className="mt-6 rounded-2xl border border-white/10 bg-neutral-950/60 p-4 shadow-lg shadow-black/10">
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Filter transactions by role"
            className="flex flex-wrap items-center gap-2"
          >
            {ROLE_TABS.map((tab) => {
              const active = roleFilter === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setRoleFilter(tab.value)
                    setPage(1)
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-lime-400/40 focus-visible:outline-none",
                    active
                      ? "border-lime-400/40 bg-lime-400/15 text-lime-200"
                      : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                      active
                        ? "bg-lime-400/20 text-lime-100"
                        : "bg-white/10 text-neutral-300"
                    )}
                  >
                    {numberFormatter.format(counts[tab.value])}
                  </span>
                </button>
              )
            })}
          </div>

          <span className="ml-auto hidden text-[11px] font-semibold tracking-wide text-neutral-500 uppercase sm:inline">
            Newest first
          </span>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-500"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search name, email, or transaction ID..."
              aria-label="Search transactions by name, email, or transaction ID"
              className="h-11 rounded-xl border-white/10 bg-neutral-950/60 pr-10 pl-10 text-sm text-white outline-none placeholder:text-neutral-600 hover:border-white/20 focus-visible:border-lime-400/60 focus-visible:ring-4 focus-visible:ring-lime-400/15"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setPage(1)
                }}
                aria-label="Clear search"
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-neutral-500 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-lime-400/60 focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="relative">
            <select
              value={planFilter}
              onChange={(event) => {
                setPlanFilter(event.target.value as AdminTransactionPlanFilter)
                setPage(1)
              }}
              aria-label="Filter transactions by plan"
              className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-neutral-950/60 pr-9 pl-3 text-sm font-semibold text-white transition-colors outline-none hover:border-white/20 focus-visible:border-lime-400/60 focus-visible:ring-4 focus-visible:ring-lime-400/15"
            >
              {PLAN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neutral-500"
              aria-hidden="true"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            disabled={!isFiltering}
            className="h-11 rounded-xl border-white/15 bg-white/5 px-4 text-xs font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
          >
            Clear filters
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <span>
            {numberFormatter.format(total)} matching transaction
            {total === 1 ? "" : "s"}
            {isFiltering ? " for the current filter" : ""}
          </span>
          {refreshing ? (
            <Loader2
              className="size-3.5 animate-spin text-lime-300"
              aria-label="Refreshing transactions"
            />
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-8 text-center">
          <AlertCircle
            className="mx-auto size-8 text-rose-400"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm font-semibold text-white" role="alert">
            Could not load transactions
          </p>
          <p className="mt-2 text-xs text-neutral-400">{error}</p>
          <Button
            type="button"
            onClick={() => loadTransactions()}
            className="mt-5 h-9 gap-2 rounded-xl bg-lime-400 px-4 text-xs font-bold text-neutral-950 hover:bg-lime-300"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : loading ? (
        <div aria-busy="true" aria-label="Loading transactions">
          <div className="mt-5 hidden overflow-hidden rounded-2xl border border-white/10 md:block">
            <div className="divide-y divide-white/5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-7 items-center gap-4 px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full bg-white/10" />
                    <Skeleton className="h-4 w-24 bg-white/10" />
                  </div>
                  <Skeleton className="h-4 w-full bg-white/10" />
                  <Skeleton className="h-5 w-14 rounded-full bg-white/10" />
                  <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
                  <Skeleton className="h-4 w-14 bg-white/10" />
                  <Skeleton className="h-6 w-32 rounded-md bg-white/10" />
                  <Skeleton className="h-4 w-24 bg-white/10" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-11 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28 bg-white/10" />
                    <Skeleton className="h-3 w-40 bg-white/10" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-6 w-full rounded-md bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-neutral-950/60 p-10 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/5 text-neutral-400 ring-1 ring-white/10">
            {isFiltering ? (
              <FileSearch className="size-7" aria-hidden="true" />
            ) : (
              <Banknote className="size-7" aria-hidden="true" />
            )}
          </span>
          <h2 className="mt-5 text-xl font-bold tracking-tight text-white">
            {isFiltering ? "No matching transactions" : "No payments yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
            {isFiltering
              ? "Try another name, email, transaction ID, role, or plan to find the payment you are looking for."
              : "Verified Stripe subscription payments will appear here as soon as the first purchase completes."}
          </p>
          {isFiltering ? (
            <Button
              type="button"
              onClick={clearFilters}
              className="mt-5 h-9 rounded-xl bg-lime-400 px-4 text-xs font-bold text-neutral-950 hover:bg-lime-300"
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-white/10 md:block">
            <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
              <thead className="bg-white/[0.03] text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Transaction ID</th>
                  <th className="px-5 py-3">Payment date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((transaction) => (
                  <TransactionTableRow
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3 md:hidden">
            {transactions.map((transaction) => (
              <TransactionMobileCard
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
            <span>
              Showing {numberFormatter.format(start)}–
              {numberFormatter.format(end)} of {numberFormatter.format(total)}
            </span>
            {totalPages > 1 ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || refreshing}
                  className="h-8 gap-1 rounded-lg border-white/15 bg-white/5 px-2.5 text-xs font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className="size-3.5" aria-hidden="true" />
                  Previous
                </Button>
                <span className="px-2 font-semibold text-white tabular-nums">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages || refreshing}
                  className="h-8 gap-1 rounded-lg border-white/15 bg-white/5 px-2.5 text-xs font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
                >
                  Next
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </DashboardPage>
  )
}
