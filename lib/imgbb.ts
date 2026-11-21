/**
 * Shared server-side ImgBB upload helper.
 *
 * Only route handlers may import this module: IMGBB_API_KEY is read from the
 * server environment and never sent to the browser. Tuition banners and
 * registration profile pictures both use the same integration.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]

export class ImageUploadError extends Error {
  readonly status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

/** Validate the `image` entry of an upload request's FormData. */
export function validateImageUpload(value: FormDataEntryValue | null): File {
  if (!(value instanceof File) || value.size === 0) {
    throw new ImageUploadError("Please choose an image file to upload.", 400)
  }

  if (!ALLOWED_IMAGE_TYPES.includes(value.type)) {
    throw new ImageUploadError(
      "Only JPG, PNG, WebP and GIF images are supported.",
      400
    )
  }

  if (value.size > MAX_IMAGE_BYTES) {
    throw new ImageUploadError("Images must be 5 MB or smaller.", 413)
  }

  return value
}

/** Normalize any thrown value into a safe, user-facing upload error. */
export function toImageUploadError(error: unknown): ImageUploadError {
  return error instanceof ImageUploadError
    ? error
    : new ImageUploadError("Image upload failed.", 502)
}

/** Send a validated file to ImgBB and return its hosted URL. */
export async function uploadImageToImgbb(file: File): Promise<{
  url: string
  deleteUrl: string | null
}> {
  const apiKey = process.env.IMGBB_API_KEY

  if (!apiKey) {
    console.error("IMGBB_API_KEY is not configured.")
    throw new ImageUploadError("Image uploads are not configured.", 500)
  }

  const body = new FormData()
  body.append("key", apiKey)
  body.append("image", file)

  try {
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body,
    })

    const data = (await response.json().catch(() => null)) as
      | {
          success?: boolean
          data?: { url?: string; delete_url?: string }
          error?: { message?: string }
        }
      | null

    if (!response.ok || !data?.success || !data.data?.url) {
      const message = data?.error?.message || "Image upload failed."
      console.error("ImgBB upload failed:", message)
      throw new ImageUploadError(message, 502)
    }

    return {
      url: data.data.url,
      deleteUrl: data.data.delete_url ?? null,
    }
  } catch (error) {
    if (error instanceof ImageUploadError) throw error
    console.error("Could not reach ImgBB:", error)
    throw new ImageUploadError("Image upload failed.", 502)
  }
}
