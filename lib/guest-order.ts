import { randomBytes } from 'crypto'

export function generateGuestAccessToken() {
  // 128 bits prevents order URLs from being guessed. Existing 8-character
  // tokens remain readable for backwards compatibility in the page route.
  return randomBytes(16).toString('hex').toUpperCase()
}

export function getGuestVerificationCode(address: any) {
  const zip = String(address?.zip || '').replace(/\s+/g, '').slice(0, 5).padEnd(5, '0')
  const phone = String(address?.phone || '').replace(/\D/g, '')
  return `${zip}${phone.slice(-3).padStart(3, '0')}`.toUpperCase()
}

export function getSecureOrderPath(orderNumber: string, token: string) {
  return `/order-secure/${encodeURIComponent(orderNumber)}-${encodeURIComponent(token)}`
}
