export const FEATURED_TUITIONS_LIMIT = 6

export type FeaturedTuition = {
  id: string
  title: string
  subject: string
  classLevel: string
  mode: string
  location: string
  description: string
  monthlyFee: number
  daysPerWeek: number
  bannerImage: string | null
  tutorName: string
  status: "active" | "closed"
  createdAt: string | null
}

export type FeaturedTuitionsResponse = {
  tuitions: FeaturedTuition[]
}
