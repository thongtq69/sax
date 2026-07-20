import { randomBytes } from 'crypto'

export function generateGuestAccessToken() {
  return randomBytes(4).toString('hex').toUpperCase()
}

export function getGuestVerificationCode(address: any) {
  const zip = String(address?.zip || '').replace(/\s+/g, '').slice(0, 5).padEnd(5, '0')
  const phone = String(address?.phone || '').replace(/\D/g, '')
  return `${zip}${phone.slice(-3).padStart(3, '0')}`.toUpperCase()
}

export function getSecureOrderPath(orderNumber: string, token: string) {
  return `/order-secure/${encodeURIComponent(orderNumber)}-${encodeURIComponent(token)}`
}
