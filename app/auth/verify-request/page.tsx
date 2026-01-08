import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image 
              src="/jsc.svg" 
              alt="James Sax Corner" 
              width={200} 
              height={60} 
              className="h-12 w-auto"
            />
          </Link>
          <Mail className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600">
            A sign-in link has been sent to your email address. Please check your inbox and click the link to continue.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">What to do next:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Check your email inbox</li>
            <li>• Look for an email from James Sax Corner</li>
            <li>• Click the sign-in link in the email</li>
            <li>• Check your spam folder if you don't see it</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the email?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-500">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Check Your Email - James Sax Corner',
  description: 'Please check your email for a sign-in link',
}