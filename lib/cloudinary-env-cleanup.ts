// This module must be imported BEFORE the cloudinary SDK to clean up invalid env vars.
// The Cloudinary SDK auto-reads CLOUDINARY_URL on import and throws if invalid.

const cloudinaryUrl = process.env.CLOUDINARY_URL
if (cloudinaryUrl && !cloudinaryUrl.startsWith('cloudinary://')) {
  // Invalid URL format - delete it to prevent SDK error
  delete process.env.CLOUDINARY_URL
}
