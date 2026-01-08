'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, User, Mail, Lock, CheckCircle, XCircle } from 'lucide-react'

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSuccess, setIsSuccess] = useState(false)
  
  const router = useRouter()

  // Password validation
  const validatePassword = (pwd: string) => {
    const errors: string[] = []
    if (pwd.length < 8) errors.push('At least 8 characters')
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter')
    if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter')
    if (!/[0-9]/.test(pwd)) errors.push('One number')
    return errors
  }

  useEffect(() => {
    setValidationErrors(validatePassword(password))
  }, [password])

  const getPasswordStrength = () => {
    const score = 4 - validationErrors.length
    if (score === 0) return { label: 'Very Weak', color: 'bg-red-500', width: '20%' }
    if (score === 1) return { label: 'Weak', color: 'bg-orange-500', width: '40%' }
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-500', width: '60%' }
    if (score === 3) return { label: 'Good', color: 'bg-blue-500', width: '80%' }
    return { label: 'Strong', color: 'bg-green-500', width: '100%' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (validationErrors.length > 0) {
      setError('Please fix password requirements')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        onSuccess?.()
        // Redirect to OTP verification page
        setTimeout(() => {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`)
        }, 2000)
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
        <p className="text-gray-600">
          We've sent a 6-digit OTP code to <strong>{email}</strong>. 
          Please check your inbox to verify your account.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to verification page...
        </p>
      </div>
    )
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <div className="relative mt-1">
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="pl-10"
            />
            <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <div className="relative mt-1">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="pl-10"
            />
            <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              className="pl-10 pr-10"
            />
            <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {password && (
            <div className="mt-2 space-y-2">
              {/* Password Strength Indicator */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength.label === 'Strong' ? 'text-green-600' :
                    passwordStrength.label === 'Good' ? 'text-blue-600' :
                    passwordStrength.label === 'Fair' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>
              </div>
              
              {/* Password Requirements */}
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Password must contain:</p>
                {['At least 8 characters', 'One uppercase letter', 'One lowercase letter', 'One number'].map((req, index) => (
                  <div key={index} className="flex items-center text-sm">
                    {validationErrors.includes(req) ? (
                      <XCircle className="h-3 w-3 text-red-500 mr-2" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    )}
                    <span className={validationErrors.includes(req) ? 'text-red-600' : 'text-green-600'}>
                      {req}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="pl-10 pr-10"
            />
            <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <XCircle className="h-3 w-3 mr-1" />
              Passwords do not match
            </p>
          )}
          
          {confirmPassword && password === confirmPassword && password && (
            <p className="mt-1 text-sm text-green-600 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Passwords match
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isLoading || validationErrors.length > 0 || password !== confirmPassword || !name || !email} 
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}