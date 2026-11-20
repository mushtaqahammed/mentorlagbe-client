/** Shared tuition constants and types used by both client and server code. */
export const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Bangla",
  "ICT",
  "Accounting",
  "General Science",
  "Higher Mathematics",
  "Economics",
  "Statistics",
  "Other",
]

export const CLASS_LEVEL_OPTIONS = [
  "Play",
  "Nursery",
  "KG",
  "Class 1–10",
  "SSC",
  "HSC",
  "Admission",
  "University",
]

export const TUITION_MODES = ["Offline", "Online", "Both"]

export const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6, 7]

export type TuitionInput = {
  title: string
  subject: string
  classLevel: string
  mode: string
  location: string
  monthlyFee: number
  daysPerWeek: number
  description: string
  bannerImage: string
}

export type TuitionRecord = TuitionInput & {
  id: string
  tutorId: string
  approvalStatus: "Pending" | "Approved" | "Rejected"
  status: "Active" | "Closed"
  createdAt: string
  updatedAt?: string | null
}

export type PlanUsage = {
  plan: "free" | "pro"
  used: number
  limit: number | null
  remaining: number | null
  unlimited: boolean
}

export type TutorStats = {
  totalTuitions: number
  activeApprovedTuitions: number
  totalApplicants: number
  plan: string
}
