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

const BASE_URL = process.env.BACKEND_API_URL || "http://localhost:5000"

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

export const createTuition = async (
  tuitionData: TuitionInput,
  token: string
) => {
  const res = await fetch(`${BASE_URL}/tuitions`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(tuitionData),
  })
  return res.json()
}

export const getMyTuitions = async (
  userId: string,
  token: string
): Promise<TuitionRecord[]> => {
  const res = await fetch(
    `${BASE_URL}/tuitions?tutorId=${encodeURIComponent(userId)}`,
    {
      headers: authHeaders(token),
      cache: "no-store",
    }
  )

  if (!res.ok) throw new Error("Could not load your tuitions.")
  return res.json()
}

export const updateTuition = async (
  id: string,
  tuitionData: TuitionInput,
  token: string
) => {
  const res = await fetch(`${BASE_URL}/tuitions/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(tuitionData),
  })

  if (!res.ok) throw new Error("Could not update this tuition.")
  return res.json()
}

export const updateTuitionStatus = async (
  id: string,
  status: "Active" | "Closed",
  token: string
) => {
  const res = await fetch(`${BASE_URL}/tuitions/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  })

  if (!res.ok) throw new Error("Could not change this tuition status.")
  return res.json()
}

export const deleteTuition = async (id: string, token: string) => {
  const res = await fetch(`${BASE_URL}/tuitions/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  })

  if (!res.ok) throw new Error("Could not delete this tuition.")
  return res.json()
}

export const applyForTuition = async (id: string, token: string) => {
  const res = await fetch(
    `${BASE_URL}/tuitions/${encodeURIComponent(id)}/apply`,
    {
      method: "POST",
      headers: authHeaders(token),
    }
  )

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error || "Could not submit your application.")
  }

  return res.json()
}
