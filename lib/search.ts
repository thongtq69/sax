import type { Product } from '@/lib/data'

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const tokenize = (value: string) => normalize(value).split(' ').filter(Boolean)

const buildSearchFields = (product: Product) => {
  const specs = product.specs ? Object.values(product.specs).join(' ') : ''
  const text = normalize(
    [
      product.name,
      product.brand,
      product.sku,
      product.categoryName || product.category,
      product.subcategoryName || product.subcategory || '',
      product.description || '',
      specs,
    ]
      .filter(Boolean)
      .join(' ')
  )

  return {
    text,
    name: normalize(product.name),
    brand: normalize(product.brand),
    sku: normalize(product.sku),
    category: normalize(product.categoryName || product.category),
    subcategory: normalize(product.subcategoryName || product.subcategory || ''),
    description: normalize(product.description || ''),
  }
}

export function getProductSearchScore(product: Product, query: string): number {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return 0

  const tokens = tokenize(normalizedQuery)
  if (tokens.length === 0) return 0

  const fields = buildSearchFields(product)
  let score = 0

  if (fields.sku === normalizedQuery) score += 280
  if (fields.name === normalizedQuery) score += 240
  if (fields.name.startsWith(normalizedQuery)) score += 180
  if (fields.brand.startsWith(normalizedQuery)) score += 120
  if (fields.text.includes(normalizedQuery)) score += 80

  let matchedTokens = 0
  for (const token of tokens) {
    let tokenScore = 0

    if (fields.sku.includes(token)) tokenScore = Math.max(tokenScore, 70)
    if (fields.name.split(' ').some((w) => w.startsWith(token))) tokenScore = Math.max(tokenScore, 48)
    else if (fields.name.includes(token)) tokenScore = Math.max(tokenScore, 36)

    if (fields.brand.split(' ').some((w) => w.startsWith(token))) tokenScore = Math.max(tokenScore, 28)
    else if (fields.brand.includes(token)) tokenScore = Math.max(tokenScore, 20)

    if (fields.subcategory.includes(token) || fields.category.includes(token)) {
      tokenScore = Math.max(tokenScore, 18)
    }

    if (fields.description.includes(token)) tokenScore = Math.max(tokenScore, 10)

    if (tokenScore > 0) {
      matchedTokens += 1
      score += tokenScore
    } else {
      score -= 30
    }
  }

  if (matchedTokens === tokens.length) {
    score += 40
  }

  return Math.max(0, score)
}

export function matchesSmartSearch(product: Product, query: string): boolean {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return true

  const tokenCount = tokenize(normalizedQuery).length
  const minScore = tokenCount <= 1 ? 40 : 55
  return getProductSearchScore(product, normalizedQuery) >= minScore
}

export function rankProductsBySearch(products: Product[], query: string, limit?: number): Product[] {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return products

  const ranked = products
    .map((product) => ({
      product,
      score: getProductSearchScore(product, normalizedQuery),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if ((b.product.rating || 0) !== (a.product.rating || 0)) {
        return (b.product.rating || 0) - (a.product.rating || 0)
      }
      return a.product.name.localeCompare(b.product.name)
    })
    .map((item) => item.product)

  if (typeof limit === 'number') {
    return ranked.slice(0, limit)
  }

  return ranked
}
