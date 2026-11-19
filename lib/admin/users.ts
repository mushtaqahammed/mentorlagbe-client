import { ObjectId, type Document, type WithId } from "mongodb"

import {
  ADMIN_USER_ROLES,
  type AdminUser,
  type AdminUserRole,
  type AdminUsersResponse,
} from "@/lib/admin/types"
import { database } from "@/lib/auth"

const USERS_COLLECTION = "user"

// Role values are written with a capital first letter by sign-up, while older
// records may be lowercase. API responses normalise to lowercase.
const ROLE_DB_VALUES: Record<AdminUserRole, string> = {
  student: "Student",
  tutor: "Tutor",
  admin: "Admin",
}

export type AdminUserFilterRole = AdminUserRole | "all"

export function isAdminUserRole(value: unknown): value is AdminUserRole {
  if (typeof value !== "string") return false

  const normalized = value.trim().toLowerCase()
  return (ADMIN_USER_ROLES as readonly string[]).includes(normalized)
}

export function normalizeAdminUserRole(value: unknown): AdminUserRole {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""
  return isAdminUserRole(normalized) ? normalized : "student"
}

export function isValidObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value) && ObjectId.isValid(value)
}

function toObjectId(value: string) {
  return isValidObjectId(value) ? new ObjectId(value) : null
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
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

function serializeUser(user: WithId<Document>): AdminUser {
  const email = typeof user.email === "string" ? user.email : ""
  const name =
    typeof user.name === "string" && user.name.trim()
      ? user.name.trim()
      : email || "Unnamed user"

  return {
    id: String(user._id),
    name,
    email,
    image:
      typeof user.image === "string" && user.image.trim() ? user.image : null,
    role: normalizeAdminUserRole(user.role),
    createdAt: toIsoString(user.createdAt),
  }
}

function buildUserFilter(search: string, role: AdminUserFilterRole): Document {
  const filter: Document = {}
  const term = search.trim().slice(0, 100)

  if (term) {
    const pattern = new RegExp(escapeRegExp(term), "i")
    filter.$or = [{ name: pattern }, { email: pattern }]
  }

  if (role !== "all") {
    filter.role = new RegExp(`^${ROLE_DB_VALUES[role]}$`, "i")
  }

  return filter
}

/**
 * Reads registered users directly from the Better Auth `user` collection.
 * Search, role filtering and pagination are handled in MongoDB so the page
 * stays responsive as the collection grows.
 */
export async function getAdminUsers({
  search,
  role,
  page,
  limit,
}: {
  search: string
  role: AdminUserFilterRole
  page: number
  limit: number
}): Promise<AdminUsersResponse> {
  const users = database.collection(USERS_COLLECTION)
  const filter = buildUserFilter(search, role)

  const [totalUsers, total] = await Promise.all([
    users.countDocuments({}),
    users.countDocuments(filter),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(Math.max(1, page), totalPages)

  const documents =
    total === 0
      ? []
      : await users
          .find(filter, {
            projection: {
              name: 1,
              email: 1,
              image: 1,
              role: 1,
              createdAt: 1,
            },
          })
          .sort({ createdAt: -1, _id: -1 })
          .skip((safePage - 1) * limit)
          .limit(limit)
          .toArray()

  return {
    users: documents.map(serializeUser),
    total,
    totalUsers,
    page: safePage,
    totalPages,
    limit,
    updatedAt: new Date().toISOString(),
  }
}

/** Returns null when the user does not exist or the id is malformed. */
export async function updateAdminUserRole(
  userId: string,
  role: AdminUserRole
): Promise<AdminUser | null> {
  const id = toObjectId(userId)
  if (!id) return null

  const updated = await database.collection(USERS_COLLECTION).findOneAndUpdate(
    { _id: id },
    {
      $set: {
        role: ROLE_DB_VALUES[role],
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  )

  return updated ? serializeUser(updated) : null
}
