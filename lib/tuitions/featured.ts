import { backendRequest } from "@/lib/backend-api"
import type { FeaturedTuitionsResponse } from "@/lib/tuitions/featured-types"

export { FEATURED_TUITIONS_LIMIT } from "@/lib/tuitions/featured-types"
export type {
  FeaturedTuition,
  FeaturedTuitionsResponse,
} from "@/lib/tuitions/featured-types"

/**
 * Returns the most recent approved and active tuitions. The Express backend
 * performs the query and joins tutor names from the shared user collection.
 */
export async function getFeaturedTuitions(): Promise<FeaturedTuitionsResponse> {
  return backendRequest<FeaturedTuitionsResponse>("/featured-tuitions")
}
