import { redirect } from 'next/navigation'

// Redirect /login to /auth/login
export default function LoginRedirect() {
  redirect('/auth/login')
}
