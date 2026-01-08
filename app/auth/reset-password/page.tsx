import { Suspense } from 'react'
import { Metadata } from 'next'
import ResetPasswordContent from './ResetPasswordContent'

export const metadata: Metadata = {
  title: 'Reset Password - James Sax Corner',
  description: 'Reset your password',
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
