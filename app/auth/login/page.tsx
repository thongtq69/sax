import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LoginForm } from '@/components/auth/LoginForm'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'
import { LogIn } from 'lucide-react'

interface LoginPageProps {
  searchParams: { callbackUrl?: string }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
          <div className="flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          </div>
          <p className="text-gray-600">
            Sign in to your account to continue shopping
          </p>
        </div>

        {/* Login Form */}
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm callbackUrl={callbackUrl} />
        </Suspense>

        {/* Social Login */}
        <div className="mt-6">
          <SocialLoginButtons callbackUrl={callbackUrl} />
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-600">
            New to James Sax Corner?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-500 font-medium">
              Create an account
            </Link>
          </p>
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Sign In - James Sax Corner',
  description: 'Sign in to your James Sax Corner account',
}