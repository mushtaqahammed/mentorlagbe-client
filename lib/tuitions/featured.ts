import { ObjectId, type Document, type WithId } from "mongodb"

import { database } from "@/lib/auth"
import {
  FEATURED_TUITIONS_LIMIT,
  type FeaturedTuitionsResponse,
} from "@/lib/tuitions/featured-types"

export { FEATURED_TUITIONS_LIMIT } from "@/lib/tuitions/featured-types"
export type {
  FeaturedTuition,
  FeaturedTuitionsResponse,
} from "@/lib/tuitions/featured-types"

const TUITIONS_COLLECTION = "tuition"
const USERS_COLLECTION = "user"

// Existing tuitions store "Approved"/"Active" with a capital letter, while
// older records can be lowercase. Legacy posts without a status are treated as
// active everywhere else in the app, so the featured section does the same.
const APPROVED = /^approved$/i
const ACTIVE = /^active$/i

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

/**
 * Returns the six most recently posted tuitions that are both approved and
 * active. Tutor names are joined from the Better Auth `user` collection using
 * the same shared database connection as the rest of the app.
 */
export async function getFeaturedTuitions(): Promise<FeaturedTuitionsResponse> {
  const documents = await database
    .collection(TUITIONS_COLLECTION)
    .find(
      {
        approvalStatus: APPROVED,
        $or: [
          { status: ACTIVE },
          { status: { $exists: false } },
          { status: null },
        ],
      },
      {
        projection: {
          tutorId: 1,
          tutorName: 1,
          title: 1,
          subject: 1,
          classLevel: 1,
          mode: 1,
          location: 1,
          description: 1,
          monthlyFee: 1,
          daysPerWeek: 1,
          bannerImage: 1,
          status: 1,
          createdAt: 1,
        },
      }
    )
    .sort({ createdAt: -1, _id: -1 })
    .limit(FEATURED_TUITIONS_LIMIT)
    .toArray()

  const tutorIds = [
    ...new Set(
      documents
        .map((tuition) => String(tuition.tutorId || ""))
        .filter((id) => /^[a-f\d]{24}$/i.test(id))
    ),
  ]

  const tutors = tutorIds.length
    ? await database
        .collection(USERS_COLLECTION)
        .find(
          {
            _id: {
              $in: tutorIds.map((id) => new ObjectId(id)),
            },
          },
          { projection: { name: 1 } }
        )
        .toArray()
    : []

  const tutorNames = new Map(
    tutors.map((tutor) => [
      String(tutor._id),
      typeof tutor.name === "string" && tutor.name.trim()
        ? tutor.name.trim()
        : "Tutor",
    ])
  )

  return {
    tuitions: documents.map((tuition: WithId<Document>) => {
      const tutorId = String(tuition.tutorId || "")
      const storedName =
        typeof tuition.tutorName === "string" && tuition.tutorName.trim()
          ? tuition.tutorName.trim()
          : ""

      return {
        id: String(tuition._id),
        title: typeof tuition.title === "string" ? tuition.title : "",
        subject: typeof tuition.subject === "string" ? tuition.subject : "",
        classLevel:
          typeof tuition.classLevel === "string" ? tuition.classLevel : "",
        mode: typeof tuition.mode === "string" ? tuition.mode : "Online",
        location: typeof tuition.location === "string" ? tuition.location : "",
        description:
          typeof tuition.description === "string" ? tuition.description : "",
        monthlyFee: Number(tuition.monthlyFee || 0),
        daysPerWeek: Number(tuition.daysPerWeek || 0),
        bannerImage:
          typeof tuition.bannerImage === "string" && tuition.bannerImage.trim()
            ? tuition.bannerImage
            : null,
        tutorName: storedName || tutorNames.get(tutorId) || "Tutor",
        status:
          typeof tuition.status === "string" &&
          tuition.status.trim().toLowerCase() === "closed"
            ? "closed"
            : "active",
        createdAt: toIsoString(tuition.createdAt),
      }
    }),
  }
}
