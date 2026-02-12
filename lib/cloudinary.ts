// Import cleanup first to handle invalid CLOUDINARY_URL before cloudinary SDK loads
import './cloudinary-env-cleanup'

import { v2 as cloudinary } from 'cloudinary'

// Guard against reconfig in dev HMR.
declare global {
  // eslint-disable-next-line no-var
  var _cloudinaryConfigured: boolean | undefined
}

if (!global._cloudinaryConfigured) {
  // CLOUDINARY_URL was already validated/cleaned up by the cleanup module.
  // If it's still present, it has valid format (cloudinary://).
  // If individual env vars are provided, use those as fallback.
  
  const cloudinaryUrl = process.env.CLOUDINARY_URL
  const hasIndividualVars = process.env.CLOUDINARY_CLOUD_NAME && 
                            process.env.CLOUDINARY_API_KEY && 
                            process.env.CLOUDINARY_API_SECRET

  if (!cloudinaryUrl && hasIndividualVars) {
    // No valid CLOUDINARY_URL, but we have individual vars - configure manually
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })
  }
  // If valid CLOUDINARY_URL exists, SDK auto-configured from it on import
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
