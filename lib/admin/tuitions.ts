import { ObjectId, type Document, type WithId } from "mongodb"

import {
  ADMIN_TUITION_STATUSES,
  type AdminTuition,
  type AdminTuitionCounts,
  type AdminTuitionStatus,
  type AdminTuitionStatusFilter,
  type AdminTuitionsResponse,
} from "@/lib/admin/types"
import { isValidObjectId } from "@/lib/admin/users"
import { database } from "@/lib/auth"

const TUITIONS_COLLECTION = "tuition"
const USERS_COLLECTION = "user"

// The existing tutor-post API inserts "Pending"/"Approved"/"Rejected" and
// older records can be lowercase. Comparisons are therefore case-insensitive,
// while writes use the canonical capitalised values for consistency.
const APPROVAL_DB_VALUES: Record<AdminTuitionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
}

type TuitionSort = "latest" | "oldest"

type TutorIdentity = {
  name: string
  email: string
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

export function normalizeApprovalStatus(value: unknown): AdminTuitionStatus {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""
  return (ADMIN_TUITION_STATUSES as readonly string[]).includes(normalized)
    ? (normalized as AdminTuitionStatus)
    : "pending"
}

function normalizeStatus(value: unknown): "active" | "closed" {
  return typeof value === "string" && value.trim().toLowerCase() === "closed"
    ? "closed"
    : "active"
}

function buildBaseFilter(search: string, subject: string): Document {
  const filter: Document = {}
  const term = search.trim().slice(0, 100)
  const subjectTerm = subject.trim().slice(0, 100)

  if (term) {
    const pattern = new RegExp(escapeRegExp(term), "i")
    filter.$or = [
      { title: pattern },
      { tutorName: pattern },
      { tutorEmail: pattern },
    ]
  }

  if (subjectTerm && subjectTerm.toLowerCase() !== "all") {
    filter.subject = new RegExp(`^${escapeRegExp(subjectTerm)}$`, "i")
  }

  return filter
}

function withStatusFilter(
  filter: Document,
  status: AdminTuitionStatusFilter
): Document {
  if (status === "all") return filter

  return {
    ...filter,
    approvalStatus: new RegExp(`^${APPROVAL_DB_VALUES[status]}$`, "i"),
  }
}

async function getTutorIdentities(
  tutorIds: string[]
): Promise<Map<string, TutorIdentity>> {
  const validIds = [
    ...new Set(tutorIds.filter((id) => Boolean(id) && isValidObjectId(id))),
  ]

  if (validIds.length === 0) return new Map()

  const tutors = await database
    .collection(USERS_COLLECTION)
    .find(
      { _id: { $in: validIds.map((id) => new ObjectId(id)) } },
      { projection: { name: 1, email: 1 } }
    )
    .toArray()

  return new Map(
    tutors.map((tutor) => [
      String(tutor._id),
      {
        name:
          typeof tutor.name === "string" && tutor.name.trim()
            ? tutor.name.trim()
            : "Tutor",
        email: typeof tutor.email === "string" ? tutor.email : "",
      },
    ])
  )
}

function serializeTuition(
  tuition: WithId<Document>,
  tutors: Map<string, TutorIdentity>
): AdminTuition {
  const tutorId = String(tuition.tutorId || "")
  const identity = tutors.get(tutorId)
  const storedTutorName =
    typeof tuition.tutorName === "string" && tuition.tutorName.trim()
      ? tuition.tutorName.trim()
      : ""

  return {
    id: String(tuition._id),
    tutorId,
    tutorName: storedTutorName || identity?.name || "Tutor",
    tutorEmail:
      typeof tuition.tutorEmail === "string" && tuition.tutorEmail.trim()
        ? tuition.tutorEmail
        : (identity?.email ?? ""),
    title: typeof tuition.title === "string" ? tuition.title : "",
    subject: typeof tuition.subject === "string" ? tuition.subject : "",
    classLevel:
      typeof tuition.classLevel === "string" ? tuition.classLevel : "",
    mode: typeof tuition.mode === "string" ? tuition.mode : "Online",
    location: typeof tuition.location === "string" ? tuition.location : "",
    monthlyFee: Number(tuition.monthlyFee || 0),
    daysPerWeek: Number(tuition.daysPerWeek || 0),
    description:
      typeof tuition.description === "string" ? tuition.description : "",
    bannerImage:
      typeof tuition.bannerImage === "string" && tuition.bannerImage.trim()
        ? tuition.bannerImage
        : null,
    approvalStatus: normalizeApprovalStatus(tuition.approvalStatus),
    status: normalizeStatus(tuition.status),
    createdAt: toIsoString(tuition.createdAt),
    updatedAt: toIsoString(tuition.updatedAt),
  }
}

/**
 * Reads tuitions directly from the shared `tuition` collection. Search,
 * approval filtering and pagination happen in MongoDB so the admin page stays
 * responsive as the collection grows. Tutor identity is joined from the same
 * Better Auth `user` collection used everywhere else in the project.
 */
export async function getAdminTuitions({
  search,
  subject,
  status,
  sort,
  page,
  limit,
}: {
  search: string
  subject: string
  status: AdminTuitionStatusFilter
  sort: TuitionSort
  page: number
  limit: number
}): Promise<AdminTuitionsResponse> {
  const tuitions = database.collection(TUITIONS_COLLECTION)
  const baseFilter = buildBaseFilter(search, subject)
  const filter = withStatusFilter(baseFilter, status)

  const statusCounts = await Promise.all(
    (["all", ...ADMIN_TUITION_STATUSES] as AdminTuitionStatusFilter[]).map(
      async (value) => ({
        value,
        count: await tuitions.countDocuments(
          withStatusFilter(baseFilter, value)
        ),
      })
    )
  )
  const counts = Object.fromEntries(
    statusCounts.map(({ value, count }) => [value, count])
  ) as AdminTuitionCounts

  const [total, totalTuitions] = await Promise.all([
    tuitions.countDocuments(filter),
    tuitions.countDocuments({}),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const direction = sort === "oldest" ? 1 : -1

  const documents =
    total === 0
      ? []
      : await tuitions
          .find(filter, {
            projection: {
              tutorId: 1,
              tutorName: 1,
              tutorEmail: 1,
              title: 1,
              subject: 1,
              classLevel: 1,
              mode: 1,
              location: 1,
              monthlyFee: 1,
              daysPerWeek: 1,
              description: 1,
              bannerImage: 1,
              approvalStatus: 1,
              status: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          })
          .sort({ createdAt: direction, _id: direction })
          .skip((safePage - 1) * limit)
          .limit(limit)
          .toArray()

  const tutors = await getTutorIdentities(
    documents.map((tuition) => String(tuition.tutorId || ""))
  )

  return {
    tuitions: documents.map((tuition) => serializeTuition(tuition, tutors)),
    total,
    counts,
    totalTuitions,
    page: safePage,
    totalPages,
    limit,
    updatedAt: new Date().toISOString(),
  }
}

/** Returns null when the tuition does not exist or the id is malformed. */
export async function updateTuitionApprovalStatus(
  tuitionId: string,
  status: AdminTuitionStatus
): Promise<AdminTuition | null> {
  if (!isValidObjectId(tuitionId)) return null

  const updated = await database
    .collection(TUITIONS_COLLECTION)
    .findOneAndUpdate(
      { _id: new ObjectId(tuitionId) },
      { $set: { approvalStatus: APPROVAL_DB_VALUES[status] } },
      { returnDocument: "after" }
    )

  if (!updated) return null

  const tutors = await getTutorIdentities([String(updated.tutorId || "")])
  return serializeTuition(updated, tutors)
}

export function parseTuitionSort(value: string | null): TuitionSort {
  return value?.trim().toLowerCase() === "oldest" ? "oldest" : "latest"
}
