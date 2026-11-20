"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { RoleBadge } from "@/components/dashboard/role-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { notify, userMessage } from "@/lib/notify"
import {
  ADMIN_USERS_PAGE_SIZE,
  ADMIN_USER_ROLES,
  type AdminApiError,
  type AdminUser,
  type AdminUserRole,
  type AdminUserRoleUpdateResponse,
  type AdminUsersResponse,
} from "@/lib/admin/types"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const numberFormatter = new Intl.NumberFormat("en-BD")

const ROLE_OPTIONS = ADMIN_USER_ROLES.map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}))

type RoleFilter = AdminUserRole | "all"

function formatDate(value: string | null) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function errorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data) {
    const value = (data as { error?: unknown }).error
    if (typeof value === "string" && value.trim()) return value
  }
  return fallback
}

function RoleSelect({
  id,
  value,
  userName,
  disabled,
  onChange,
}: {
  id: string
  value: AdminUserRole
  userName: string
  disabled: boolean
  onChange: (role: AdminUserRole) => void
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        disabled={disabled}
        aria-label={`Change role for ${userName}`}
        onChange={(event) => onChange(event.target.value as AdminUserRole)}
        className="h-9 w-full appearance-none rounded-xl border border-white/10 bg-neutral-950/60 pr-8 pl-3 text-xs font-semibold text-white transition-colors outline-none hover:border-white/20 focus-visible:border-lime-400/60 focus-visible:ring-4 focus-visible:ring-lime-400/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {ROLE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-neutral-500"
        aria-hidden="true"
      />
    </div>
  )
}

type UserRowControls = {
  draftRole: AdminUserRole
  isCurrentUser: boolean
  updating: boolean
  onDraftRoleChange: (id: string, role: AdminUserRole) => void
  onRequestChange: (user: AdminUser, role: AdminUserRole) => void
}

function UserTableRow({
  user,
  draftRole,
  isCurrentUser,
  updating,
  onDraftRoleChange,
  onRequestChange,
}: { user: AdminUser } & UserRowControls) {
  const changed = draftRole !== user.role

  return (
    <tr
      className={cn(
        "transition-colors hover:bg-white/[0.02]",
        updating && "opacity-60"
      )}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} className="size-10" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user.name}
            </p>
            {isCurrentUser ? (
              <span className="mt-1 inline-flex rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 ring-1 ring-white/10">
                You
              </span>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="truncate text-sm text-neutral-400" title={user.email}>
          {user.email || "—"}
        </p>
      </td>
      <td className="px-5 py-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-5 py-4">
        <RoleSelect
          id={`role-${user.id}`}
          value={draftRole}
          userName={user.name}
          disabled={isCurrentUser || updating}
          onChange={(role) => onDraftRoleChange(user.id, role)}
        />
      </td>
      <td className="px-5 py-4 text-sm whitespace-nowrap text-neutral-400">
        {formatDate(user.createdAt)}
      </td>
      <td className="px-5 py-4 text-right">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onRequestChange(user, draftRole)}
          disabled={!changed || isCurrentUser || updating}
          className="h-8 gap-1.5 rounded-lg border-white/15 bg-white/5 px-2.5 text-xs font-semibold text-neutral-200 hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-200"
        >
          {updating ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <UserCog className="size-3.5" aria-hidden="true" />
          )}
          <span className="hidden lg:inline">
            {updating ? "Updating" : "Apply"}
          </span>
        </Button>
      </td>
    </tr>
  )
}

function UserMobileCard({
  user,
  draftRole,
  isCurrentUser,
  updating,
  onDraftRoleChange,
  onRequestChange,
}: { user: AdminUser } & UserRowControls) {
  const changed = draftRole !== user.role

  return (
    <article
      className={cn(
        "rounded-2xl border border-white/10 bg-neutral-950/60 p-4 shadow-lg shadow-black/10",
        updating && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <UserAvatar user={user} className="size-11" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">
              {user.name}
            </p>
            {isCurrentUser ? (
              <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 ring-1 ring-white/10">
                You
              </span>
            ) : null}
          </div>
          <p
            className="mt-0.5 truncate text-xs text-neutral-400"
            title={user.email}
          >
            {user.email || "—"}
          </p>
        </div>
        <RoleBadge role={user.role} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            Change role
          </dt>
          <dd className="mt-1.5">
            <RoleSelect
              id={`mobile-role-${user.id}`}
              value={draftRole}
              userName={user.name}
              disabled={isCurrentUser || updating}
              onChange={(role) => onDraftRoleChange(user.id, role)}
            />
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            Registered
          </dt>
          <dd className="mt-3 text-sm text-neutral-300">
            {formatDate(user.createdAt)}
          </dd>
        </div>
      </dl>

      <Button
        type="button"
        onClick={() => onRequestChange(user, draftRole)}
        disabled={!changed || isCurrentUser || updating}
        className="mt-4 h-9 w-full gap-2 rounded-lg bg-lime-400 text-xs font-bold text-neutral-950 hover:bg-lime-300"
      >
        {updating ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <UserCog className="size-4" aria-hidden="true" />
        )}
        {updating ? "Updating role..." : "Apply role change"}
      </Button>
    </article>
  )
}

export function AdminUsersManager() {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id ?? null

  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [draftRoles, setDraftRoles] = useState<Record<string, AdminUserRole>>(
    {}
  )
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [pendingUpdate, setPendingUpdate] = useState<{
    user: AdminUser
    role: AdminUserRole
  } | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const requestIdRef = useRef(0)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [search])

  const loadUsers = useCallback(
    async (options?: { silent?: boolean; signal?: AbortSignal }) => {
      const requestId = ++requestIdRef.current
      const silent = options?.silent ?? false

      if (silent) setRefreshing(true)
      else setLoading(true)
      setError("")

      const params = new URLSearchParams({
        page: String(page),
        limit: String(ADMIN_USERS_PAGE_SIZE),
      })
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim())
      if (roleFilter !== "all") params.set("role", roleFilter)

      try {
        const response = await fetch(`/api/admin/users?${params.toString()}`, {
          cache: "no-store",
          signal: options?.signal,
        })
        const data: AdminUsersResponse | AdminApiError = await response.json()

        if (!response.ok) {
          throw new Error(errorMessage(data, "Could not load users."))
        }

        if (requestId !== requestIdRef.current) return

        const result = data as AdminUsersResponse
        setUsers(result.users)
        setTotal(result.total)
        setTotalUsers(result.totalUsers)
        setTotalPages(result.totalPages)
        setDraftRoles({})
        if (result.page !== page) setPage(result.page)
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError")
          return
        if (requestId !== requestIdRef.current) return
        const message = userMessage(loadError, "Could not load users.")
        setError(message)
        notify.error("Could not load users", message)
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    },
    [debouncedSearch, page, roleFilter]
  )

  useEffect(() => {
    const controller = new AbortController()

    async function run() {
      await loadUsers({ signal: controller.signal })
    }

    void run()
    return () => controller.abort()
  }, [loadUsers])

  useEffect(() => {
    if (!pendingUpdate) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !updatingUserId) setPendingUpdate(null)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [pendingUpdate, updatingUserId])

  const handleDraftRoleChange = useCallback(
    (id: string, role: AdminUserRole) => {
      setDraftRoles((current) => ({ ...current, [id]: role }))
    },
    []
  )

  const isCurrentUserRow = useCallback(
    (id: string) =>
      Boolean(
        currentUserId && id.toLowerCase() === currentUserId.toLowerCase()
      ),
    [currentUserId]
  )

  const requestRoleChange = useCallback(
    (user: AdminUser, role: AdminUserRole) => {
      if (user.role === role || isCurrentUserRow(user.id)) return
      setPendingUpdate({ user, role })
    },
    [isCurrentUserRow]
  )

  async function confirmRoleChange() {
    if (!pendingUpdate || updatingUserId) return

    const { user, role } = pendingUpdate
    setUpdatingUserId(user.id)

    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(user.id)}/role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
          cache: "no-store",
        }
      )
      const data: AdminUserRoleUpdateResponse | AdminApiError =
        await response.json()

      if (!response.ok) {
        throw new Error(errorMessage(data, "Could not update user role."))
      }

      const updated = (data as AdminUserRoleUpdateResponse).user
      setUsers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      )
      setDraftRoles((current) => {
        const next = { ...current }
        delete next[updated.id]
        return next
      })
      setPendingUpdate(null)
      notify.success(
        "Updated successfully!",
        `${updated.name} is now ${updated.role}.`
      )
      await loadUsers({ silent: true })
    } catch (updateError) {
      notify.error("Could not update role", userMessage(updateError))
    } finally {
      setUpdatingUserId(null)
    }
  }

  function clearFilters() {
    setSearch("")
    setDebouncedSearch("")
    setRoleFilter("all")
    setPage(1)
  }

  const isFiltering = Boolean(debouncedSearch.trim()) || roleFilter !== "all"
  const start = total === 0 ? 0 : (page - 1) * ADMIN_USERS_PAGE_SIZE + 1
  const end = Math.min(page * ADMIN_USERS_PAGE_SIZE, total)
  const rowControls = (user: AdminUser): UserRowControls => ({
    draftRole: draftRoles[user.id] ?? user.role,
    isCurrentUser: isCurrentUserRow(user.id),
    updating: updatingUserId === user.id,
    onDraftRoleChange: handleDraftRoleChange,
    onRequestChange: requestRoleChange,
  })

  return (
    <>
      <DashboardPage
        title="Manage Users"
        description="View and manage every student, tutor, and admin on MentorLagbe."
      >
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/25">
              <Users className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
                Total registered users
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-white tabular-nums">
                {numberFormatter.format(totalUsers)}
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
              onClick={() => loadUsers({ silent: users.length > 0 })}
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

        <section className="mt-6 rounded-2xl border border-white/10 bg-neutral-950/60 p-4 shadow-lg shadow-black/10">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_auto]">
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
                placeholder="Search by name or email..."
                aria-label="Search users by name or email"
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
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value as RoleFilter)
                  setPage(1)
                }}
                aria-label="Filter users by role"
                className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-neutral-950/60 pr-9 pl-3 text-sm font-semibold text-white transition-colors outline-none hover:border-white/20 focus-visible:border-lime-400/60 focus-visible:ring-4 focus-visible:ring-lime-400/15"
              >
                <option value="all">All roles</option>
                {ROLE_OPTIONS.map((option) => (
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
              {numberFormatter.format(total)} matching user
              {total === 1 ? "" : "s"}
              {isFiltering ? " for the current filter" : ""}
            </span>
            {refreshing ? (
              <Loader2
                className="size-3.5 animate-spin text-lime-300"
                aria-label="Refreshing users"
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
              Could not load users
            </p>
            <p className="mt-2 text-xs text-neutral-400">{error}</p>
            <Button
              type="button"
              onClick={() => loadUsers()}
              className="mt-5 h-9 gap-2 rounded-xl bg-lime-400 px-4 text-xs font-bold text-neutral-950 hover:bg-lime-300"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : loading ? (
          <div aria-busy="true" aria-label="Loading users">
            <div className="mt-5 hidden overflow-hidden rounded-2xl border border-white/10 md:block">
              <div className="divide-y divide-white/5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-6 items-center gap-4 px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full bg-white/10" />
                      <Skeleton className="h-4 w-24 bg-white/10" />
                    </div>
                    <Skeleton className="h-4 w-full bg-white/10" />
                    <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
                    <Skeleton className="h-9 w-full rounded-xl bg-white/10" />
                    <Skeleton className="h-4 w-20 bg-white/10" />
                    <Skeleton className="ml-auto h-8 w-16 rounded-lg bg-white/10" />
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
                  <Skeleton className="mt-4 h-9 w-full rounded-xl bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-neutral-950/60 p-10 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/5 text-neutral-400 ring-1 ring-white/10">
              {isFiltering ? (
                <FileSearch className="size-7" aria-hidden="true" />
              ) : (
                <AlertTriangle className="size-7" aria-hidden="true" />
              )}
            </span>
            <h2 className="mt-5 text-xl font-bold tracking-tight text-white">
              {isFiltering ? "No matching users" : "No users yet"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
              {isFiltering
                ? "Try another name, email, or role to find the user you are looking for."
                : "Registered users will appear here as soon as they join MentorLagbe."}
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
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead className="bg-white/[0.03] text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Current role</th>
                    <th className="px-5 py-3">Change role</th>
                    <th className="px-5 py-3">Registered</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      {...rowControls(user)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid gap-3 md:hidden">
              {users.map((user) => (
                <UserMobileCard
                  key={user.id}
                  user={user}
                  {...rowControls(user)}
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
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
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

      {pendingUpdate ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !updatingUserId) {
              setPendingUpdate(null)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-update-title"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl shadow-black/50"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/25">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="role-update-title"
                  className="text-lg font-bold tracking-tight text-white"
                >
                  Confirm role change
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                  This updates the user’s permissions immediately.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-neutral-950/60 p-4">
              <div className="flex items-center gap-3">
                <UserAvatar user={pendingUpdate.user} className="size-10" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {pendingUpdate.user.name}
                  </p>
                  <p className="truncate text-xs text-neutral-400">
                    {pendingUpdate.user.email}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-3">
                <RoleBadge role={pendingUpdate.user.role} />
                <ArrowRight
                  className="size-4 text-neutral-500"
                  aria-hidden="true"
                />
                <RoleBadge role={pendingUpdate.role} />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingUpdate(null)}
                disabled={Boolean(updatingUserId)}
                className="h-9 rounded-xl border-white/15 bg-white/5 px-4 text-xs font-semibold text-neutral-200 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmRoleChange}
                disabled={Boolean(updatingUserId)}
                className="h-9 gap-2 rounded-xl bg-lime-400 px-4 text-xs font-bold text-neutral-950 hover:bg-lime-300"
              >
                {updatingUserId ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {updatingUserId ? "Updating..." : "Confirm change"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
