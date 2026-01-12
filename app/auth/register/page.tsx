import Link from 'next/link'
import Image from 'next/image'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'
import { UserPlus } from 'lucide-react'

export default function RegisterPage() {
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
            <UserPlus className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          </div>
          <p className="text-gray-600">
            Join James Sax Corner to start your musical journey
          </p>
        </div>

        {/* Register Form */}
        <RegisterForm />

        {/* Social Login */}
        <div className="mt-6">
          <SocialLoginButtons />
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
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
  title: 'Create Account - James Sax Corner',
  description: 'Create your James Sax Corner account',
}