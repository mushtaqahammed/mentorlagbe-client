import {
  toImageUploadError,
  uploadImageToImgbb,
  validateImageUpload,
} from "@/lib/imgbb"
import { getRequestSession } from "@/lib/session"

export const runtime = "nodejs"

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

/** Authenticated uploads, used by the tuition banner form. */
export async function POST(request: Request) {
  const session = await getRequestSession()

  if (!session?.user) {
    return jsonError("Sign in to upload an image.", 401)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return jsonError("Invalid upload request.", 400)
  }

  let file: File
  try {
    file = validateImageUpload(formData.get("image"))
  } catch (error) {
    const uploadError = toImageUploadError(error)
    return jsonError(uploadError.message, uploadError.status)
  }

  try {
    const { url, deleteUrl } = await uploadImageToImgbb(file)
    return Response.json({ url, deleteUrl })
  } catch (error) {
    const uploadError = toImageUploadError(error)
    return jsonError(uploadError.message, uploadError.status)
  }
}
