export class ProductImageValidationError extends Error {}

export function normalizeProductImages(value: unknown): string[] {
  if (value == null) return []
  if (!Array.isArray(value)) throw new ProductImageValidationError('Images must be an array')
  if (value.length > 100) throw new ProductImageValidationError('A product can have at most 100 images')

  const normalized = value.map((item) => {
    if (typeof item !== 'string') throw new ProductImageValidationError('Every image must be a URL')
    const url = item.trim()
    if (!url) throw new ProductImageValidationError('Image URLs cannot be empty')
    if (url.startsWith('/') && !url.startsWith('//')) return url
    try {
      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
      return parsed.toString()
    } catch {
      throw new ProductImageValidationError(`Invalid image URL: ${url}`)
    }
  })

  return Array.from(new Set(normalized))
}
