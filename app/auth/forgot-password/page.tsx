'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-600 mb-6">
              If an account with that email exists, we've sent a password reset link to <strong>{email}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Didn't receive the email? Check your spam folder or try again with a different email address.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                }}
                className="w-full"
              >
                Try Different Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="mt-1"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending Reset Link...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Reset Link
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            href="/auth/login" 
            className="text-sm text-blue-600 hover:text-blue-500 inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}