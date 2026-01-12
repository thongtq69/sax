'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'

const errorMessages: Record<string, { title: string; description: string; suggestion: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration.',
    suggestion: 'Please try again later or contact support if the problem persists.'
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in.',
    suggestion: 'Please contact an administrator if you believe this is an error.'
  },
  Verification: {
    title: 'Email Verification Required',
    description: 'Please verify your email address before signing in.',
    suggestion: 'Check your email for a verification link or request a new one.'
  },
  Default: {
    title: 'Authentication Error',
    description: 'An error occurred during authentication.',
    suggestion: 'Please try signing in again.'
  },
  OAuthSignin: {
    title: 'OAuth Sign-in Error',
    description: 'There was an error signing in with your social account.',
    suggestion: 'Please try again or use a different sign-in method.'
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'There was an error processing your social login.',
    suggestion: 'Please try signing in again.'
  },
  OAuthCreateAccount: {
    title: 'Account Creation Error',
    description: 'Could not create an account with your social login.',
    suggestion: 'The email may already be registered. Try signing in with email and password.'
  },
  EmailCreateAccount: {
    title: 'Email Account Error',
    description: 'Could not create an account with this email.',
    suggestion: 'The email may already be registered. Try signing in instead.'
  },
  Callback: {
    title: 'Callback Error',
    description: 'There was an error in the authentication callback.',
    suggestion: 'Please try signing in again.'
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'This social account is not linked to any existing account.',
    suggestion: 'Sign in with your email and password first, then link your social accounts in your profile.'
  },
  EmailSignin: {
    title: 'Email Sign-in Error',
    description: 'There was an error sending the sign-in email.',
    suggestion: 'Please check your email address and try again.'
  },
  CredentialsSignin: {
    title: 'Invalid Credentials',
    description: 'The email or password you entered is incorrect.',
    suggestion: 'Please check your credentials and try again, or reset your password.'
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'You must be signed in to access this page.',
    suggestion: 'Please sign in to continue.'
  }
}

export default function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Default'
  
  const errorInfo = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image 
              src="/Banner.png" 
              alt="James Sax Corner" 
              width={280} 
              height={80} 
              className="h-12 w-auto"
            />
          </Link>
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{errorInfo.title}</h1>
          <p className="text-gray-600 mb-4">{errorInfo.description}</p>
          <p className="text-sm text-gray-500">{errorInfo.suggestion}</p>
        </div>

        {/* Error Details */}
        {error !== 'Default' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-700">
              <strong>Error Code:</strong> {error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </Button>
          
          {(error === 'CredentialsSignin' || error === 'EmailSignin') && (
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/forgot-password">
                Reset Password
              </Link>
            </Button>
          )}
          
          {error === 'Verification' && (
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/verify-email">
                Resend Verification
              </Link>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>

        {/* Support Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-500">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
