import { auth } from '@/lib/auth'

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return null
  }
  return session
}
