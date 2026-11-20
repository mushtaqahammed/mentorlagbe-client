/**
 * Public, read-only platform counters.
 *
 * The values are computed by the Express backend so the Next.js app never
 * reads MongoDB directly. The backend only uses real signals from the
 * database (verified tutor accounts, unexpired student sessions, approved
 * live tuitions, and accepted applications).
 */
export type PlatformStats = {
  verifiedTutors: number
  activeStudents: number
  approvedTuitions: number
  successfulMatches: number
  updatedAt: string
}

function toCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const baseUrl = process.env.BACKEND_API_URL || "http://localhost:5000"

  const response = await fetch(`${baseUrl}/platform/stats`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Backend /platform/stats responded with ${response.status}`)
  }

  const data = (await response.json()) as Partial<PlatformStats>

  return {
    verifiedTutors: toCount(data.verifiedTutors),
    activeStudents: toCount(data.activeStudents),
    approvedTuitions: toCount(data.approvedTuitions),
    successfulMatches: toCount(data.successfulMatches),
    updatedAt:
      typeof data.updatedAt === "string" && data.updatedAt
        ? data.updatedAt
        : new Date().toISOString(),
  }
}
