import { getRequestSession } from "@/lib/session"

export const runtime = "nodejs"

const MAX_FILE_BYTES = 5 * 1024 * 1024

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export async function POST(request: Request) {
  const session = await getRequestSession()

  if (!session?.user) {
    return jsonError("Sign in to upload an image.", 401)
  }

  const apiKey = process.env.IMGBB_API_KEY

  if (!apiKey) {
    console.error("IMGBB_API_KEY is not configured.")
    return jsonError("Image uploads are not configured.", 500)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return jsonError("Invalid upload request.", 400)
  }

  const file = formData.get("image")

  // `FormData.get` can return a string or null, so never cast it blindly.
  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Please choose an image file to upload.", 400)
  }

  if (!file.type.startsWith("image/")) {
    return jsonError("Only image files can be uploaded.", 400)
  }

  if (file.size > MAX_FILE_BYTES) {
    return jsonError("Images must be 5 MB or smaller.", 413)
  }

  const uploadBody = new FormData()
  uploadBody.append("key", apiKey)
  uploadBody.append("image", file)

  try {
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: uploadBody,
    })

    const data = (await response.json().catch(() => null)) as
      | {
          success?: boolean
          data?: { url?: string; delete_url?: string }
          error?: { message?: string }
        }
      | null

    if (!response.ok || !data?.success || !data.data?.url) {
      console.error("ImgBB upload failed:", data?.error?.message ?? response.status)
      return jsonError(data?.error?.message || "Image upload failed.", 502)
    }

    return Response.json({
      url: data.data.url,
      deleteUrl: data.data.delete_url,
    })
  } catch (error) {
    console.error("Could not reach ImgBB:", error)
    return jsonError("Image upload failed.", 502)
  }
}
