interface LoaderProps {
  src: string
  width: number
  quality?: number
}

export default function cloudinaryLoader({ src, width, quality }: LoaderProps) {
  if (!src.includes('res.cloudinary.com') || !src.includes('/image/upload/')) {
    return src
  }

  const transformation = `f_auto,q_${quality || 'auto'},c_limit,w_${width}`
  return src.replace('/image/upload/', `/image/upload/${transformation}/`)
}
