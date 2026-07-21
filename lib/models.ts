export function normalizeModels(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  const unique = new Map<string, string>()
  for (const item of value) {
    if (typeof item !== 'string') continue
    const model = item.trim().replace(/\s+/g, ' ')
    if (!model) continue
    const key = model.toLocaleLowerCase('en-US')
    if (!unique.has(key)) unique.set(key, model)
  }

  return Array.from(unique.values()).sort((left, right) =>
    left.localeCompare(right, 'en-US', { numeric: true, sensitivity: 'base' }),
  )
}

export function hasModel(models: unknown, candidate: string) {
  const key = candidate.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US')
  return normalizeModels(models).some((model) => model.toLocaleLowerCase('en-US') === key)
}
