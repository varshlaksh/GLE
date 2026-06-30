import { NextResponse } from "next/server"
import { requireUser } from "@/lib/adminAuth"
import crypto from "crypto"
import type { ApiResponse } from "@/types"

// POST /api/upload
// FormData fields: "file" (image), "folder" (optional - "products" | "avatars")
// Returns: { url: string } — Cloudinary secure_url
// Any logged-in user can upload (needed for profile photos);
// admin-only restriction was removed since regular users need
// this for their own avatar.

export async function POST(request: Request) {
  const { error, status, user } = await requireUser()
  if (error || !user) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Cloudinary is not configured. Add CLOUDINARY_* keys to .env.local" },
      { status: 500 }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json<ApiResponse<never>>({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json<ApiResponse<never>>({ error: "No file provided" }, { status: 400 })
  }

  // Restrict subfolder to known safe values only
  const requestedFolder = formData.get("folder")
  const subfolder = requestedFolder === "avatars" ? "avatars" : "products"
  const folder = `thegana-gallery/${subfolder}`

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex")

  const uploadForm = new FormData()
  uploadForm.append("file", file)
  uploadForm.append("api_key", apiKey)
  uploadForm.append("timestamp", timestamp)
  uploadForm.append("signature", signature)
  uploadForm.append("folder", folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: uploadForm }
  )

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json<ApiResponse<never>>(
      { error: `Cloudinary upload failed: ${text}` },
      { status: 500 }
    )
  }

  const data = await res.json()
  return NextResponse.json<ApiResponse<{ url: string }>>({
    data: { url: data.secure_url },
  })
}
