import { Suspense } from 'react'
import { Metadata } from 'next'
import VerifyEmailContent from './VerifyEmailContent'

export const metadata: Metadata = {
  title: 'Verify Email - James Sax Corner',
  description: 'Verify your email address',
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-pulse text-gray-600">Verifying...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
