import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProfileContent } from '@/components/account/ProfileContent'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
            <ProfileContent user={session.user} />
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'My Profile - James Sax Corner',
  description: 'Manage your account profile and settings',
}