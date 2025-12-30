import { v2 as cloudinary } from 'cloudinary'

// Cloudinary auto-reads CLOUDINARY_URL. Guard against reconfig in dev HMR.
declare global {
  // eslint-disable-next-line no-var
  var _cloudinaryConfigured: boolean | undefined
}

if (!global._cloudinaryConfigured) {
  cloudinary.config({
    secure: true,
    // CLOUDINARY_URL already includes key/secret/cloud name
    url: process.env.CLOUDINARY_URL,
  })
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
