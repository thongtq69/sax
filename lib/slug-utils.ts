/**
 * Generate a URL-friendly slug from a string
 * Handles Vietnamese characters and special characters
 */
export function generateSlug(text: string): string {
  // Vietnamese character mapping
  const vietnameseMap: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'đ': 'd',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'À': 'a', 'Á': 'a', 'Ả': 'a', 'Ã': 'a', 'Ạ': 'a',
    'Ă': 'a', 'Ằ': 'a', 'Ắ': 'a', 'Ẳ': 'a', 'Ẵ': 'a', 'Ặ': 'a',
    'Â': 'a', 'Ầ': 'a', 'Ấ': 'a', 'Ẩ': 'a', 'Ẫ': 'a', 'Ậ': 'a',
    'Đ': 'd',
    'È': 'e', 'É': 'e', 'Ẻ': 'e', 'Ẽ': 'e', 'Ẹ': 'e',
    'Ê': 'e', 'Ề': 'e', 'Ế': 'e', 'Ể': 'e', 'Ễ': 'e', 'Ệ': 'e',
    'Ì': 'i', 'Í': 'i', 'Ỉ': 'i', 'Ĩ': 'i', 'Ị': 'i',
    'Ò': 'o', 'Ó': 'o', 'Ỏ': 'o', 'Õ': 'o', 'Ọ': 'o',
    'Ô': 'o', 'Ồ': 'o', 'Ố': 'o', 'Ổ': 'o', 'Ỗ': 'o', 'Ộ': 'o',
    'Ơ': 'o', 'Ờ': 'o', 'Ớ': 'o', 'Ở': 'o', 'Ỡ': 'o', 'Ợ': 'o',
    'Ù': 'u', 'Ú': 'u', 'Ủ': 'u', 'Ũ': 'u', 'Ụ': 'u',
    'Ư': 'u', 'Ừ': 'u', 'Ứ': 'u', 'Ử': 'u', 'Ữ': 'u', 'Ự': 'u',
    'Ỳ': 'y', 'Ý': 'y', 'Ỷ': 'y', 'Ỹ': 'y', 'Ỵ': 'y',
  }

  let slug = text.toLowerCase()

  // Remove common SN markers including variants like s n, sn:, s/n etc.
  // We use word boundaries and common patterns
  slug = slug.replace(/\b(sn|s\/n|serial|ref|s\s+n)\b[:\-]?\s*/g, ' ')

  // Also handle cases like SN0001 (no space)
  slug = slug.replace(/\b(sn|s\/n|serial|ref)(\d+)/g, '$2')

  // Replace Vietnamese characters
  for (const [vietnamese, ascii] of Object.entries(vietnameseMap)) {
    slug = slug.replace(new RegExp(vietnamese, 'g'), ascii)
  }

  // Replace special characters with hyphens
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except spaces and hyphens
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens

  return slug
}

export function normalizeSerialNumber(serial?: string | null): string {
  const raw = (serial || '').trim()
  if (!raw || raw.length > 20) return ''

  // Remove "SN", "S/N", "Serial", etc.
  return raw.replace(/^\s*(SN|S\/N|Serial|Serial Number|Ref|S\s+N)\b\s*[:\-]?\s*/i, '')
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9.-]/g, '')
    .trim()
}

export function getProductSerialFromSpecs(specs?: any | null): string {
  if (!specs) return ''
  const candidates = [
    specs['SN'], specs['sn'], specs['Serial'], specs['serial'],
    specs['Serial Number'], specs['serial number']
  ]
  for (const value of candidates) {
    const normalized = normalizeSerialNumber(typeof value === 'string' ? value : String(value || ''))
    if (normalized) return normalized
  }
  return ''
}

/**
 * Generate a unique slug by appending a number if needed
 */
export async function generateUniqueSlug(
  name: string,
  checkExists: (slug: string) => Promise<boolean>,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(name)
  let slug = baseSlug
  let counter = 1

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++

    // Safety limit
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`
      break
    }
  }

  return slug
}
