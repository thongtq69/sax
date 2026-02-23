'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ShieldCheck, Lock, Package, Truck, ArrowLeft, AlertCircle, Loader2, MapPin, Calculator, ChevronDown, Ticket } from 'lucide-react'
import { PayPalStandardButton } from '@/components/checkout/PayPalStandardButton'
import { countries, getStatesByCountry, getCountryByName } from '@/lib/location-data'
// import { PayPalMeButton } from '@/components/checkout/PayPalMeButton' // Temporarily hidden

interface SavedAddress {
  id: string
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  isDefault: boolean
}
interface Coupon {
  id: string
  amount: string
  code: string
  label: string
  description: string
  minSpend: number
  expiryDate: string
  applicableProducts?: string[]
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.getSubtotal())

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddressSelector, setShowAddressSelector] = useState(false)

  const [shippingInfo, setShippingInfo] = useState({
    email: '', firstName: '', lastName: '', address1: '', address2: '',
    city: '', state: '', zip: '', country: 'United States', phone: '',
  })

  // Coupon state
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [isCouponSectionOpen, setIsCouponSectionOpen] = useState(false)

  // Fetch saved addresses when user is logged in
  useEffect(() => {
    if (session?.user) {
      fetchSavedAddresses()
    }
    fetchCoupons()
  }, [session])

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/admin/homepage-content/rewards-vouchers')
      if (response.ok) {
        const data = await response.json()
        setAvailableCoupons(data.metadata?.coupons || [])
      }
    } catch (error) {
      console.error('Failed to fetch coupons')
    }
  }

  const calculateDiscount = (coupon: Coupon) => {
    let applicableSubtotal = 0
    const hasRestriction = coupon.applicableProducts && coupon.applicableProducts.length > 0

    items.forEach(item => {
      if (!hasRestriction || coupon.applicableProducts?.includes(item.productId)) {
        applicableSubtotal += item.price * item.quantity
      }
    })

    if (applicableSubtotal < coupon.minSpend) return 0

    if (coupon.amount.endsWith('%')) {
      const percentage = parseFloat(coupon.amount) / 100
      return applicableSubtotal * percentage
    } else {
      const fixedValue = parseFloat(coupon.amount.replace(/[^0-9.]/g, ''))
      return Math.min(fixedValue, applicableSubtotal)
    }
  }

  const handleApplyCoupon = (code: string) => {
    if (!code.trim()) return

    const coupon = availableCoupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase())

    if (!coupon) {
      setCouponError('Invalid coupon code')
      setAppliedCoupon(null)
      return
    }

    if (subtotal < coupon.minSpend) {
      setCouponError(`Minimum spend of $${coupon.minSpend.toLocaleString()} required for this coupon`)
      setAppliedCoupon(null)
      return
    }

    const discount = calculateDiscount(coupon)
    if (discount <= 0) {
      setCouponError('This coupon does not apply to the items in your cart')
      setAppliedCoupon(null)
      return
    }

    setAppliedCoupon(coupon)
    setCouponError(null)
    setCouponCode(coupon.code)
  }

  const discountAmount = appliedCoupon ? calculateDiscount(appliedCoupon) : 0

  const fetchSavedAddresses = async () => {
    try {
      const res = await fetch('/api/user/address')
      const data = await res.json()
      if (data.success && data.addresses.length > 0) {
        setSavedAddresses(data.addresses)
        // Auto-fill with default address
        const defaultAddress = data.addresses.find((a: SavedAddress) => a.isDefault) || data.addresses[0]
        if (defaultAddress) {
          applyAddress(defaultAddress)
          setSelectedAddressId(defaultAddress.id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
    }
  }

  const applyAddress = (address: SavedAddress) => {
    setShippingInfo(prev => ({
      ...prev,
      email: session?.user?.email || prev.email,
      firstName: address.firstName,
      lastName: address.lastName,
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      phone: address.phone,
    }))
    setSelectedAddressId(address.id)
    setShowAddressSelector(false)
  }

  // Shipping calculation based on zipcode
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false)
  const [shippingMessage, setShippingMessage] = useState<string>('')

  const calculateShipping = async () => {
    if (!shippingInfo.country) {
      setShippingMessage('Please select a country')
      return
    }
    if (!shippingInfo.zip.trim()) {
      setShippingMessage('Please enter a ZIP/Postal code')
      return
    }

    setIsCalculatingShipping(true)

    try {
      // Get country code from country name
      const country = getCountryByName(shippingInfo.country)
      const countryCode = country?.code || shippingInfo.country

      // Prepare cart items with shipping cost info
      const cartItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        shippingCost: item.shippingCost ?? null,
      }))

      // Call shipping calculation API
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode,
          items: cartItems,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to calculate shipping')
      }

      const data = await response.json()

      setShippingCost(data.shippingCost)

      // Format message based on zone
      if (data.shippingCost === 0) {
        setShippingMessage(`Free shipping (${data.zoneName})`)
      } else {
        setShippingMessage(`${data.zoneName}: $${data.shippingCost}`)
      }
    } catch (error) {
      console.error('Error calculating shipping:', error)
      // Fallback to default shipping
      const isVietnam = shippingInfo.country === 'Vietnam'
      if (isVietnam) {
        setShippingCost(25)
        setShippingMessage('Domestic shipping (Vietnam): $25')
      } else {
        setShippingCost(200)
        setShippingMessage('International shipping: $200')
      }
    } finally {
      setIsCalculatingShipping(false)
    }
  }

  // Auto-calculate shipping when country or zip changes
  useEffect(() => {
    if (shippingInfo.country && shippingInfo.zip.length >= 3) {
      const timer = setTimeout(() => {
        calculateShipping()
      }, 800)
      return () => clearTimeout(timer)
    } else {
      setShippingCost(null)
      setShippingMessage('')
    }
  }, [shippingInfo.country, shippingInfo.zip])

  const shipping = shippingCost ?? 0 // No default shipping - will be calculated or shown in PayPal
  const tax = 0 // No tax
  const total = Math.max(0, subtotal + shipping + tax - discountAmount)

  // Check if payment was cancelled
  useEffect(() => {
    if (searchParams.get('cancelled') === 'true') {
      setPaymentError('Payment was cancelled. Please try again.')
    }
  }, [searchParams])

  const handleChange = (field: string, value: string) => {
    setShippingInfo(prev => {
      const newInfo = { ...prev, [field]: value }
      // Reset state and city when country changes
      if (field === 'country') {
        newInfo.state = ''
        newInfo.city = ''
      }
      // Reset city when state changes
      if (field === 'state') {
        newInfo.city = ''
      }
      return newInfo
    })
  }

  // Get states for selected country
  const availableStates = useMemo(() => {
    return getStatesByCountry(shippingInfo.country)
  }, [shippingInfo.country])

  // Check if country has states (for showing dropdown vs text input)
  const hasStates = availableStates.length > 0

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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 max-w-full">
        <div className="mb-6 md:mb-8">
          <Link href="/shop" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-3 md:mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Continue Shopping
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
        </div>

        {/* Payment cancelled warning */}
        {paymentError && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 md:gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm md:text-base text-amber-800">{paymentError}</p>
            <button
              onClick={() => setPaymentError(null)}
              className="ml-auto text-amber-600 hover:text-amber-800"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-8">
          <div className="w-full lg:col-span-7">
            <div className="bg-white rounded-xl border p-4 md:p-6">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Shipping Information</h2>
              </div>

              {/* Saved Address Selector */}
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAddressSelector(!showAddressSelector)}
                      className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg text-left hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          {selectedAddressId
                            ? `Using: ${savedAddresses.find(a => a.id === selectedAddressId)?.firstName} ${savedAddresses.find(a => a.id === selectedAddressId)?.lastName}`
                            : 'Select a saved address'
                          }
                        </span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-blue-600 transition-transform ${showAddressSelector ? 'rotate-180' : ''}`} />
                    </button>

                    {showAddressSelector && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {savedAddresses.map((address) => (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => applyAddress(address)}
                            className={`w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 ${selectedAddressId === address.id ? 'bg-blue-50' : ''
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{address.firstName} {address.lastName}</span>
                              {address.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Default</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {address.address1}, {address.city}, {address.state} {address.zip}
                            </p>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(null)
                            setShippingInfo({
                              email: session?.user?.email || '',
                              firstName: '', lastName: '', address1: '', address2: '',
                              city: '', state: '', zip: '', country: 'United States', phone: '',
                            })
                            setShowAddressSelector(false)
                          }}
                          className="w-full p-3 text-left hover:bg-gray-50 text-sm text-gray-600"
                        >
                          + Enter new address
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Row 1: Email */}
                <Input placeholder="Email *" value={shippingInfo.email} onChange={(e) => handleChange('email', e.target.value)} />

                {/* Row 2: First Name, Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
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
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>

                {/* Row 4: State/Province, City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {/* State/Province - Dropdown if country has states, otherwise text input */}
                  {hasStates ? (
                    <select
                      value={shippingInfo.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">State/Province *</option>
                      {availableStates.map((state) => (
                        <option key={state.code} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      placeholder="State/Province *"
                      value={shippingInfo.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                    />
                  )}

                  {/* City - Text input */}
                  <Input
                    placeholder="City *"
                    value={shippingInfo.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
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
                        {shippingInfo.country ? `${shippingInfo.country}${shippingInfo.zip ? ` - ${shippingInfo.zip}` : ''}` : 'Select country above'}
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
                    disabled={isCalculatingShipping || !shippingInfo.country || !shippingInfo.zip}
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

          <div className="w-full lg:col-span-5">
            <div className="bg-white rounded-xl border p-4 md:p-6 space-y-3 md:space-y-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="relative h-14 w-14 overflow-hidden rounded bg-white border">
                      <Image src={item.image} alt={item.name} fill className="object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/saxophone-icon.svg' }} />
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
                    {shippingCost !== null && shippingCost > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${shippingCost === 25 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {shippingCost === 25 ? 'VN' : 'INT'}
                      </span>
                    )}
                  </span>
                  <span className={shippingCost === null ? "text-amber-600 text-xs" : shippingCost === 0 ? "text-green-600" : ""}>
                    {shippingCost === null
                      ? "Fill address for exact fee"
                      : shippingCost === 0
                        ? "FREE"
                        : "$" + shippingCost}
                  </span>
                </div>
                <Separator />
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <div className="flex flex-col">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="text-[10px] text-gray-500">{appliedCoupon.label}</span>
                    </div>
                    <span>-${discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCouponSectionOpen(!isCouponSectionOpen)}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-600 hover:text-primary transition-colors py-2"
                >
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    <span>Apply Discount Code</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCouponSectionOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCouponSectionOpen && (
                  <div className="mt-3 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="text-sm h-9"
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon(couponCode)}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleApplyCoupon(couponCode)}
                        disabled={!couponCode.trim()}
                        className="h-9"
                      >
                        Apply
                      </Button>
                    </div>

                    {couponError && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {couponError}
                      </p>
                    )}

                    {appliedCoupon && !couponError && (
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                        <div className="flex items-center gap-2 font-medium">
                          <ShieldCheck className="h-3 w-3" />
                          Applied: {appliedCoupon.code}
                        </div>
                        <button
                          onClick={() => {
                            setAppliedCoupon(null)
                            setCouponCode('')
                          }}
                          className="hover:text-green-900"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {availableCoupons.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Available Offers</p>
                        <div className="grid grid-cols-1 gap-2">
                          {availableCoupons.map((coupon) => (
                            <button
                              key={coupon.id}
                              type="button"
                              onClick={() => handleApplyCoupon(coupon.code)}
                              className={`text-left p-2 rounded border transition-all hover:border-primary group ${appliedCoupon?.id === coupon.id ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50/50'
                                }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-secondary group-hover:text-primary transition-colors">{coupon.label}</span>
                                <span className="bg-white px-1.5 py-0.5 border rounded text-[10px] font-bold font-mono text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                  {coupon.code}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{coupon.description}</p>
                              <p className="text-[9px] text-gray-400 mt-1 font-medium">Min spend: ${coupon.minSpend.toLocaleString()}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Separator />
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Secured with PayPal</span>
              </div>

              {/* Warning if form not filled */}
              {!allFieldsFilled && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-700">Please fill in all shipping information to continue</span>
                </div>
              )}

              <PayPalStandardButton
                shippingInfo={allFieldsFilled ? shippingInfo : null}
                shippingCost={shippingCost}
                discountAmount={discountAmount}
                couponCode={appliedCoupon?.code}
                onError={(error) => setPaymentError(error.message || 'Payment failed. Please try again.')}
                disabled={!allFieldsFilled}
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
