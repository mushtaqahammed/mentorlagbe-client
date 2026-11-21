import {
  toImageUploadError,
  uploadImageToImgbb,
  validateImageUpload,
} from "@/lib/imgbb"

export const runtime = "nodejs"

// Registration has no session yet, so this endpoint cannot require one. Keep
// it narrowly scoped (profile images only), strictly validated, and rate
// limited so the server-held ImgBB key cannot be used as a free public relay.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 6
const recentUploads = new Map<string, number[]>()

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")
  const first = forwarded?.split(",")[0]?.trim()
  return first || request.headers.get("x-real-ip") || "unknown"
}

function isAllowed(ip: string) {
  const now = Date.now()

  if (recentUploads.size > 500) {
    for (const [key, times] of recentUploads) {
      if (!times.some((time) => now - time < RATE_LIMIT_WINDOW_MS)) {
        recentUploads.delete(key)
      }
    }
  }

  const times = (recentUploads.get(ip) ?? []).filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS
  )

  if (times.length >= RATE_LIMIT_MAX) {
    recentUploads.set(ip, times)
    return false
  }

  times.push(now)
  recentUploads.set(ip, times)
  return true
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

/** Upload a registration profile picture before an account/session exists. */
export async function POST(request: Request) {
  if (!isAllowed(clientIp(request))) {
    return jsonError("Too many uploads. Please try again in a few minutes.", 429)
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
