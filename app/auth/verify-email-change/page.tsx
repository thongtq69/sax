'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

function VerifyEmailChangeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    verifyEmailChange(token)
  }, [searchParams])

  const verifyEmailChange = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email-change?token=${token}`)
      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage('Your email has been updated successfully!')
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Failed to verify email change')
      }
    } catch {
      setStatus('error')
      setMessage('An error occurred while verifying your email')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Verifying your email...</h1>
            <p className="text-gray-500">Please wait while we update your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Email Updated!</h1>
            <p className="text-gray-500 mb-4">{message}</p>
            <p className="text-sm text-gray-400 mb-4">Redirecting to login page...</p>
            <Button asChild>
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Verification Failed</h1>
            <p className="text-gray-500 mb-4">{message}</p>
            <Button asChild variant="outline">
              <Link href="/account/profile">Back to Profile</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <VerifyEmailChangeContent />
    </Suspense>
  )
}
