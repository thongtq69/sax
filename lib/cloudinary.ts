import { v2 as cloudinary } from 'cloudinary'

// Cloudinary auto-reads CLOUDINARY_URL. Guard against reconfig in dev HMR.
declare global {
  // eslint-disable-next-line no-var
  var _cloudinaryConfigured: boolean | undefined
}

if (!global._cloudinaryConfigured) {
  // Try to configure from CLOUDINARY_URL first
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
      secure: true,
      url: process.env.CLOUDINARY_URL,
    })
  } else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    // Fallback to individual env vars
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })
  }
  global._cloudinaryConfigured = true
}

export { cloudinary }

export const uploadImage = async (filePath: string, options?: Record<string, any>) => {
  return cloudinary.uploader.upload(filePath, {
    folder: 'sax',
    overwrite: true,
    resource_type: 'image',
    ...options,
  })
}
