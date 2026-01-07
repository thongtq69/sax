'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, ArrowLeft, ShieldCheck, Lock, TestTube } from 'lucide-react'

export default function TestCheckoutPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Test amount - $1 USD (PayPal minimum is $0.01)
  const testAmount = 1.00
  
  const [shippingInfo, setShippingInfo] = useState({
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    address1: '123 Test Street',
    address2: '',
    city: 'Test City',
    state: 'CA',
    zip: '12345',
    country: 'United States',
    phone: '1234567890',
  })

  // PayPal config
  const paypalEmail = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL || 'jamessaxcorner@gmail.com'
  const isSandbox = process.env.NEXT_PUBLIC_PAYPAL_MODE !== 'live'
  const paypalUrl = isSandbox 
    ? 'https://www.sandbox.paypal.com/cgi-bin/webscr'
    : 'https://www.paypal.com/cgi-bin/webscr'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

  const handleChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleTestPayment = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Create test order
      const response = await fetch('/api/paypal/create-standard-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: 'test-product',
            name: 'Test Payment Product',
            price: testAmount,
            quantity: 1,
            image: '/placeholder.jpg'
          }],
          shippingInfo,
          total: testAmount,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to create order')
      }

      const { orderId } = await response.json()

      // Create PayPal form
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = paypalUrl
      form.target = '_self'

      const params: Record<string, string> = {
        cmd: '_xclick',
        business: paypalEmail,
        item_name: `Test Payment #${orderId.slice(-8)}`,
        item_number: orderId,
        amount: testAmount.toFixed(2),
        currency_code: 'USD',
        no_shipping: '1', // No shipping for test
        no_note: '1',
        custom: orderId,
        invoice: orderId,
        return: `${baseUrl}/checkout/success?orderId=${orderId}&source=test`,
        cancel_return: `${baseUrl}/checkout/test?cancelled=true`,
        notify_url: `${baseUrl}/api/paypal/ipn`,
        rm: '2',
        charset: 'utf-8',
      }

      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()
    } catch (err: any) {
      console.error('Test payment error:', err)
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
        </Link>

        <div className="bg-white rounded-xl border-2 border-amber-200 p-6 shadow-lg">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <TestTube className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Test Payment</h1>
            <p className="text-gray-500 mt-1">PayPal Integration Test - ${testAmount.toFixed(2)} USD</p>
          </div>

          {/* Mode indicator */}
          <div className={`mb-6 p-3 rounded-lg text-center text-sm font-medium ${
            isSandbox 
              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
              : 'bg-green-100 text-green-800 border border-green-300'
          }`}>
            {isSandbox ? '🧪 Sandbox Mode' : '🔴 LIVE Mode - Real Money!'}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Test Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Test Product</span>
              <span className="font-medium">${testAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-green-600">$0.00</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">${testAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Info (pre-filled) */}
          <div className="mb-6 space-y-3">
            <h3 className="font-medium text-gray-700">Test Shipping Info</h3>
            <Input 
              placeholder="Email" 
              value={shippingInfo.email} 
              onChange={(e) => handleChange('email', e.target.value)} 
            />
            <div className="grid grid-cols-2 gap-3">
              <Input 
                placeholder="First Name" 
                value={shippingInfo.firstName} 
                onChange={(e) => handleChange('firstName', e.target.value)} 
              />
              <Input 
                placeholder="Last Name" 
                value={shippingInfo.lastName} 
                onChange={(e) => handleChange('lastName', e.target.value)} 
              />
            </div>
          </div>

          {/* Pay Button */}
          <Button
            onClick={handleTestPayment}
            disabled={isLoading}
            className="w-full h-12 bg-[#0070ba] hover:bg-[#003087] text-white font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Redirecting to PayPal...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.629h6.724c2.332 0 4.058.625 5.13 1.86.976 1.121 1.333 2.584 1.062 4.347-.026.17-.06.348-.1.532-.41 1.893-1.202 3.39-2.354 4.45-1.152 1.06-2.7 1.598-4.6 1.598h-1.94a.77.77 0 0 0-.757.629l-.924 5.855a.641.641 0 0 1-.633.74h-.233v-.765z"/>
                  <path d="M18.27 7.468c-.02.126-.044.255-.07.387-.84 3.894-3.376 5.24-6.71 5.24h-1.7a.82.82 0 0 0-.81.693l-.87 5.518-.247 1.565a.431.431 0 0 0 .426.498h2.99a.72.72 0 0 0 .71-.607l.03-.152.56-3.558.036-.196a.72.72 0 0 1 .71-.607h.447c2.896 0 5.163-1.177 5.826-4.58.277-1.422.134-2.61-.6-3.443a2.86 2.86 0 0 0-.728-.558z"/>
                </svg>
                Pay ${testAmount.toFixed(2)} with PayPal
              </>
            )}
          </Button>

          {/* Security note */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Lock className="h-3 w-3" />
            <span>Secure payment via PayPal</span>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">📋 Test Instructions:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Pay with PayPal"</li>
              <li>Login with your PayPal account</li>
              <li>Complete the $1 payment</li>
              <li>Check Admin → Orders for the new order</li>
              <li>Refund yourself via PayPal if needed</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
