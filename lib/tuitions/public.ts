/**
 * Public surfaces (Browse Tuitions and detail pages) may only show posts that
 * are both approved and active. This mirrors the Express `activeTuitionFilter`
 * and acts as a second line of defence in the Next.js proxy.
 */
export function isPubliclyVisibleTuition(value: unknown) {
  if (!value || typeof value !== "object") return false

  const tuition = value as {
    approvalStatus?: unknown
    status?: unknown
  }

  const approvalStatus =
    typeof tuition.approvalStatus === "string"
      ? tuition.approvalStatus.trim().toLowerCase()
      : ""
  if (approvalStatus !== "approved") return false

  // Legacy records can omit `status`, which the backend treats as active.
  const status =
    typeof tuition.status === "string"
      ? tuition.status.trim().toLowerCase()
      : ""

  return status === "" || status === "active"
}
