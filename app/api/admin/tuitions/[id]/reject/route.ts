import { handleApproval } from "@/app/api/admin/tuitions/[id]/handle-approval"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return handleApproval(request, context, "rejected")
}
