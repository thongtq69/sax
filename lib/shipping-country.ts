import { countries } from '@/lib/location-data'

type ShippingZoneLike = {
  countries: string[]
  isDefault?: boolean
}

const COUNTRY_ALIASES: Record<string, string> = {
  USA: 'US',
  'UNITED STATES OF AMERICA': 'US',
  UK: 'GB',
  'GREAT BRITAIN': 'GB',
  'VIET NAM': 'VN',
  'CZECH REPUBLIC': 'CZ',
  KOREA: 'KR',
  'REPUBLIC OF KOREA': 'KR',
}

/**
 * Convert checkout country names and PayPal ISO values to one stable code.
 * Unknown values are still normalized so legacy zone names can match safely.
 */
export function normalizeShippingCountry(value: unknown): string {
  const input = typeof value === 'string' ? value.trim() : ''
  if (!input) return ''

  const upper = input.toUpperCase()
  if (COUNTRY_ALIASES[upper]) return COUNTRY_ALIASES[upper]

  const country = countries.find((entry) =>
    entry.code.toUpperCase() === upper || entry.name.toUpperCase() === upper,
  )

  return country?.code.toUpperCase() || upper
}

/** Find a specific zone first, then fall back to the configured default zone. */
export function findShippingZone<T extends ShippingZoneLike>(zones: T[], country: unknown): T | undefined {
  const countryCode = normalizeShippingCountry(country)

  const specificZone = countryCode
    ? zones.find((zone) => !zone.isDefault && zone.countries.some((value) =>
      normalizeShippingCountry(value) === countryCode,
    ))
    : undefined

  return specificZone || zones.find((zone) => zone.isDefault)
}
