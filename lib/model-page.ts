import { generateSlug } from '@/lib/slug-utils'

export interface ModelBrandSource {
  name: string
  slug: string
  logo?: string | null
  models: string[]
  modelPageContent?: unknown
}

export interface ConfiguredModelContext {
  brand: ModelBrandSource
  model: string
  modelKey: string
  customHtml: string | null
}

function includesSlugPart(slug: string, part: string): boolean {
  return Boolean(part) && `-${slug}-`.includes(`-${part}-`)
}

function getModelContent(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .map(([key, html]) => [generateSlug(key), html]),
  )
}

/**
 * Resolve a configured brand/model from a public model-page slug.
 *
 * This deliberately does not depend on a product existing. Admin-authored model
 * introductions therefore remain reachable before the first listing is created,
 * and products with a missing subBrand cannot make the page look up the wrong
 * modelPageContent key.
 */
export function resolveConfiguredModel(
  requestedSlug: string,
  brands: ModelBrandSource[],
  preferredBrand?: string | null,
): ConfiguredModelContext | null {
  const slug = generateSlug(decodeURIComponent(requestedSlug))
  const preferredBrandKey = preferredBrand ? generateSlug(preferredBrand) : ''

  const brandCandidates = brands
    .filter((brand) => {
      const keys = new Set([
        generateSlug(brand.name),
        generateSlug(brand.slug),
        generateSlug(brand.slug).replace(/-saxophones$/, ''),
      ])
      return Array.from(keys).some((key) => includesSlugPart(slug, key))
        || (preferredBrandKey && generateSlug(brand.name) === preferredBrandKey)
    })
    .sort((a, b) => {
      const aPreferred = generateSlug(a.name) === preferredBrandKey ? 1 : 0
      const bPreferred = generateSlug(b.name) === preferredBrandKey ? 1 : 0
      if (aPreferred !== bPreferred) return bPreferred - aPreferred
      return generateSlug(b.name).length - generateSlug(a.name).length
    })

  for (const brand of brandCandidates) {
    const content = getModelContent(brand.modelPageContent)
    const modelsByKey = new Map<string, string>()

    for (const model of brand.models || []) {
      const key = generateSlug(model)
      if (key) modelsByKey.set(key, model)
    }
    for (const key of Object.keys(content)) {
      if (!modelsByKey.has(key)) {
        modelsByKey.set(key, key.replace(/-/g, ' ').toUpperCase())
      }
    }

    const match = Array.from(modelsByKey.entries())
      .filter(([key]) => includesSlugPart(slug, key))
      .sort(([a], [b]) => b.length - a.length)[0]

    if (!match) continue

    const [modelKey, model] = match
    return {
      brand,
      model,
      modelKey,
      customHtml: content[modelKey] || null,
    }
  }

  return null
}

export function inferSaxophoneCategory(slug: string): string {
  const normalized = generateSlug(decodeURIComponent(slug))
  const categories = ['Sopranino', 'Soprano', 'Alto', 'Tenor', 'Baritone', 'Bass']
  return categories.find((category) => includesSlugPart(normalized, generateSlug(category))) || ''
}
