export const runtime = "nodejs"

export async function POST(request: Request) {
  const apiKey = process.env.IMGBB_API_KEY

  if (!apiKey) {
    return Response.json({ error: "API key missing" }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get("image") as File

  const uploadBody = new FormData()
  uploadBody.append("key", apiKey)
  uploadBody.append("image", file)

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: uploadBody,
  })

  const data = await response.json()

  if (!data.success) {
    return Response.json({ error: "Image upload failed" }, { status: 500 })
  }

  return Response.json({
    url: data.data.url,
    deleteUrl: data.data.delete_url,
  })
}
