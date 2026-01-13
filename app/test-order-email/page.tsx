'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react'

export default function TestOrderEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSendTest = async () => {
    if (!email || !email.includes('@')) {
      setResult({ success: false, message: 'Please enter a valid email' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/test/order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, message: 'Failed to send test email' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center mb-6">
          <Mail className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <h1 className="text-xl font-bold">Test Order Email</h1>
          <p className="text-sm text-gray-500 mt-1">
            Send a test email from <strong>order@jamessaxcorner.com</strong>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Recipient Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email to receive test"
              className="mt-1"
            />
          </div>

          <Button 
            onClick={handleSendTest} 
            disabled={loading} 
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Test Email'
            )}
          </Button>

          {result && (
            <div className={`p-3 rounded-md flex items-center gap-2 ${
              result.success 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {result.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="text-sm">{result.message}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          This page is for testing purposes only. Delete after testing.
        </p>
      </div>
    </div>
  )
}
