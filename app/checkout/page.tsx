'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ShieldCheck, Lock, Package, Truck, ArrowLeft, AlertCircle, Loader2, MapPin, Calculator } from 'lucide-react'
import { PayPalStandardButton } from '@/components/checkout/PayPalStandardButton'
// import { PayPalMeButton } from '@/components/checkout/PayPalMeButton' // Temporarily hidden

// Vietnam postal codes start with these prefixes (6 digits)
const VIETNAM_POSTAL_PREFIXES = [
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', // Hanoi area
  '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', // Ho Chi Minh area
  '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', // Northern provinces
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', // Central provinces
  '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', // Central provinces
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', // Central provinces
  '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', // Southern provinces
  '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', // Mekong Delta
  '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', // Mekong Delta
]

function isVietnamZipCode(zip: string): boolean {
  const cleanZip = zip.replace(/\s/g, '')
  // Vietnam postal codes are 6 digits
  if (cleanZip.length !== 6 || !/^\d+$/.test(cleanZip)) {
    return false
  }
  const prefix = cleanZip.substring(0, 2)
  return VIETNAM_POSTAL_PREFIXES.includes(prefix)
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.getSubtotal())
  
  const [shippingInfo, setShippingInfo] = useState({
    email: '', firstName: '', lastName: '', address1: '', address2: '',
    city: '', state: '', zip: '', country: 'United States', phone: '',
  })
  
  // Shipping calculation based on zipcode
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false)
  const [shippingMessage, setShippingMessage] = useState<string>('')

  const calculateShipping = () => {
    if (!shippingInfo.zip.trim()) {
      setShippingMessage('Please enter a ZIP/Postal code')
      return
    }
    
    setIsCalculatingShipping(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const isVietnam = isVietnamZipCode(shippingInfo.zip)
      
      if (isVietnam) {
        setShippingCost(25)
        setShippingMessage('Your shipping cost is $25')
      } else {
        setShippingCost(200)
        setShippingMessage('Your shipping cost is $200')
      }
      
      setIsCalculatingShipping(false)
    }, 500)
  }

  // Auto-calculate shipping when zip changes
  useEffect(() => {
    if (shippingInfo.zip.length >= 5) {
      const timer = setTimeout(() => {
        calculateShipping()
      }, 800)
      return () => clearTimeout(timer)
    } else {
      setShippingCost(null)
      setShippingMessage('')
    }
  }, [shippingInfo.zip])

  const shipping = shippingCost ?? (subtotal > 500 ? 0 : 25)
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  // Check if payment was cancelled
  useEffect(() => {
    if (searchParams.get('cancelled') === 'true') {
      setPaymentError('Payment was cancelled. Please try again.')
    }
  }, [searchParams])

  const handleChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }))
  }

  const allFieldsFilled = shippingInfo.email && shippingInfo.firstName && shippingInfo.lastName && 
    shippingInfo.address1 && shippingInfo.city && shippingInfo.state && shippingInfo.zip && shippingInfo.phone

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <Button asChild><Link href="/shop">Continue Shopping</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/shop" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        {/* Payment cancelled warning */}
        {paymentError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800">{paymentError}</p>
            <button 
              onClick={() => setPaymentError(null)}
              className="ml-auto text-amber-600 hover:text-amber-800"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Shipping Information</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Fill this form if your shipping address differs from your PayPal address
              </p>
              <div className="space-y-4">
                {/* Row 1: Email */}
                <Input placeholder="Email *" value={shippingInfo.email} onChange={(e) => handleChange('email', e.target.value)} />
                
                {/* Row 2: First Name, Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="First Name *" value={shippingInfo.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
                  <Input placeholder="Last Name *" value={shippingInfo.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
                </div>
                
                {/* Row 3: Country */}
                <select
                  value={shippingInfo.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select Country *</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Philippines">Philippines</option>
                  <option value="China">China</option>
                  <option value="Taiwan">Taiwan</option>
                  <option value="Hong Kong">Hong Kong</option>
                  <option value="India">India</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Italy">Italy</option>
                  <option value="Spain">Spain</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Norway">Norway</option>
                  <option value="Denmark">Denmark</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Other">Other</option>
                </select>
                
                {/* Row 4: City, State/Province */}
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="City *" value={shippingInfo.city} onChange={(e) => handleChange('city', e.target.value)} />
                  <Input placeholder="State/Province *" value={shippingInfo.state} onChange={(e) => handleChange('state', e.target.value)} />
                </div>
                
                {/* Row 5: ZIP/Postal Code */}
                <div className="relative">
                  <Input 
                    placeholder="ZIP/Postal Code *" 
                    value={shippingInfo.zip} 
                    onChange={(e) => handleChange('zip', e.target.value)} 
                  />
                  {isCalculatingShipping && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                  )}
                </div>
                
                {/* Row 6: Address */}
                <Input placeholder="Address *" value={shippingInfo.address1} onChange={(e) => handleChange('address1', e.target.value)} />
                
                {/* Row 7: Apt, Suite (optional) */}
                <Input placeholder="Apt, Suite (optional)" value={shippingInfo.address2} onChange={(e) => handleChange('address2', e.target.value)} />
                
                {/* Row 8: Phone */}
                <Input placeholder="Phone *" value={shippingInfo.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              </div>
              
              {/* Shipping Calculator */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-amber-50 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-secondary">Shipping Calculator</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {shippingInfo.zip ? `ZIP: ${shippingInfo.zip}` : 'Enter ZIP code above'}
                      </span>
                    </div>
                    {shippingMessage && (
                      <p className={`text-sm mt-1 font-medium ${shippingCost === 25 ? 'text-green-600' : 'text-amber-600'}`}>
                        {shippingMessage}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={calculateShipping}
                    disabled={isCalculatingShipping || !shippingInfo.zip}
                  >
                    {isCalculatingShipping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Calculate'
                    )}
                  </Button>
                </div>

              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="relative h-14 w-14 overflow-hidden rounded bg-white border">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">${item.price.toLocaleString()} x {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold">${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    Shipping
                    {shippingCost !== null && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${shippingCost === 25 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {shippingCost === 25 ? 'VN' : 'INT'}
                      </span>
                    )}
                  </span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? "FREE" : "$" + shipping}
                  </span>
                </div>
                <div className="flex justify-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                <Separator />
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">${total.toFixed(2)}</span></div>
              </div>
              <Separator />
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Secured with PayPal</span>
              </div>
              
              {/* PayPal Standard Button */}
              <PayPalStandardButton
                shippingInfo={allFieldsFilled ? shippingInfo : null}
                shippingCost={shippingCost}
                onError={(error) => setPaymentError(error.message || 'Payment failed. Please try again.')}
              />

              {/* PayPal.me Button - Temporarily hidden */}
              {/* <PayPalMeButton
                shippingInfo={allFieldsFilled ? shippingInfo : null}
                shippingCost={shippingCost}
                onError={(error) => setPaymentError(error.message || 'Payment failed. Please try again.')}
              /> */}
              
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
                <Lock className="h-3 w-3" /><span>Powered by PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
