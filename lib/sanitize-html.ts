/**
 * Keeps layout HTML and CSS (classes, ids, media queries and inline styles)
 * while removing executable markup before it is rendered with innerHTML.
 */
export function sanitizeEditableHtml(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null

  return value
    .replace(/<\s*(script|iframe|object|embed|form|input|button|textarea|select|option)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|iframe|object|embed|form|input|button|textarea|select|option)\b[^>]*\/?\s*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src|action)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .trim()
}
