import { Suspense } from 'react'
import { Metadata } from 'next'
import AuthErrorContent from './AuthErrorContent'

export const metadata: Metadata = {
  title: 'Authentication Error - James Sax Corner',
  description: 'An error occurred during authentication',
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}