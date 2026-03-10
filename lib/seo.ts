export function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.jamessaxcorner.com').replace(/\/+$/, '')
}

export function buildCanonicalUrl(path = '') {
  const normalizedPath = path ? `/${path.replace(/^\/+/, '')}` : ''
  return `${getBaseUrl()}${normalizedPath}`
}
