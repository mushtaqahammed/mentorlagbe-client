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

export type PlanUsage = {
  plan: "free" | "pro"
  used: number
  limit: number | null
  remaining: number | null
  unlimited: boolean
}

const BASE_URL = process.env.BACKEND_API_URL || "http://localhost:5000"

export const createTuition = async (
  tuitionData: TuitionInput,
  token: string
) => {
  const res = await fetch(`${BASE_URL}/tuitions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(tuitionData),
  })
  return res.json()
}
