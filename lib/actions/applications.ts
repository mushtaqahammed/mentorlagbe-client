"use server"

import { authFetch } from "../core/server"

export type ApplicationStatus = "pending" | "accepted" | "rejected"
export type ReviewStatus = "accepted" | "rejected"

export type Applicant = {
  id: string
  studentName: string
  studentEmail: string
  phone: string
  tuitionId: string
  tuitionTitle: string
  preferredSchedule: string
  note: string
  applicationDate: string
  status: ApplicationStatus
}

export type ApplicantStats = {
  total: number
  pending: number
  accepted: number
  rejected: number
}

export type TutorApplicantsResponse = {
  applicants: Applicant[]
  stats: ApplicantStats
}

export type ApplicationDetails = {
  phone: string
  preferredSchedule: string
  note?: string
}

export type StudentStats = {
  totalApplied: number
  accepted: number
  pending: number
  plan: string
}

export type StudentApplication = {
  id: string
  tuitionId: string
  tuitionTitle: string
  tutorName: string
  tutorEmail: string
  monthlyFee: number
  applicationDate: string
  status: ApplicationStatus
}

export type StudentApplicationsResponse = {
  applications: StudentApplication[]
  stats: ApplicantStats
}

// Server action module: the backend URL never reaches the browser bundle.
const BASE_URL = process.env.BACKEND_API_URL || "http://localhost:5000"

async function parseError(res: Response, fallback: string) {
  const data = await res.json().catch(() => null)
  throw new Error(data?.error || fallback)
}

export const getStudentStats = async (): Promise<StudentStats> => {
  const res = await authFetch(`${BASE_URL}/student-stats`)

  if (!res.ok) {
    await parseError(res, "Could not load your dashboard statistics.")
  }

  return res.json()
}

export const getStudentApplications = async (
  query = ""
): Promise<StudentApplicationsResponse> => {
  const api = `${BASE_URL}/student-applications?${query}`

  const res = await authFetch(api)

  if (!res.ok) {
    await parseError(res, "Could not load your applications.")
  }

  return res.json()
}

export const deleteStudentApplication = async (id: string) => {
  const res = await authFetch(
    `${BASE_URL}/applications/${encodeURIComponent(id)}`,
    { method: "DELETE", headers: { "Content-Type": "application/json" } }
  )

  if (!res.ok) {
    await parseError(res, "Could not cancel this application.")
  }

  return res.json()
}

export const getTutorApplicants = async (): Promise<TutorApplicantsResponse> => {
  const res = await authFetch(`${BASE_URL}/tutor-applicants`)

  if (!res.ok) {
    await parseError(res, "Could not load your applicants.")
  }

  return res.json()
}

export const updateApplicationStatus = async (
  id: string,
  status: ReviewStatus
) => {
  const res = await authFetch(
    `${BASE_URL}/applications/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  )

  if (!res.ok) {
    await parseError(res, "Could not update this application.")
  }

  return res.json()
}
