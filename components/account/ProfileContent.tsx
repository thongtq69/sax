'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  User, Mail, Calendar, Shield, Edit2, Save, X, 
  Lock, MapPin, Plus, Trash2, Star, Eye, EyeOff 
} from 'lucide-react'
import { countries, getStatesByCountry } from '@/lib/location-data'

interface Address {
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

interface ProfileContentProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

export function ProfileContent({ user }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'addresses'>('profile')
  
  // Profile state
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name || '')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Email state
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [showEmailPassword, setShowEmailPassword] = useState(false)

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState({
    firstName: '', lastName: '', address1: '', address2: '',
    city: '', state: '', zip: '', country: 'United States', phone: '', isDefault: false
  })

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/address')
      const data = await res.json()
      if (data.success) {
        setAddresses(data.addresses)
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
    }
  }

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await response.json()
      if (data.success) {
        showMessage('Profile updated successfully!', 'success')
        setIsEditing(false)
        window.location.reload()
      } else {
        showMessage(data.message || 'Failed to update profile', 'error')
      }
    } catch {
      showMessage('An error occurred while updating profile', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match', 'error')
      return
    }
    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', 'error')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await response.json()
      if (data.success) {
        showMessage('Password updated successfully!', 'success')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        showMessage(data.message || 'Failed to change password', 'error')
      }
    } catch {
      showMessage('An error occurred', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      showMessage('Please enter a valid email', 'error')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      })
      const data = await response.json()
      if (data.success) {
        showMessage('Verification email sent! Please check your new email.', 'success')
        setNewEmail('')
        setEmailPassword('')
      } else {
        showMessage(data.message || 'Failed to change email', 'error')
      }
    } catch {
      showMessage('An error occurred', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAddress = async () => {
    setIsLoading(true)
    try {
      const method = editingAddressId ? 'PUT' : 'POST'
      const body = editingAddressId ? { ...addressForm, id: editingAddressId } : addressForm

      const response = await fetch('/api/user/address', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (data.success) {
        showMessage(editingAddressId ? 'Address updated!' : 'Address added!', 'success')
        fetchAddresses()
        resetAddressForm()
      } else {
        showMessage(data.message || 'Failed to save address', 'error')
      }
    } catch {
      showMessage('An error occurred', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const response = await fetch(`/api/user/address?id=${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        showMessage('Address deleted', 'success')
        fetchAddresses()
      } else {
        showMessage(data.message || 'Failed to delete address', 'error')
      }
    } catch {
      showMessage('An error occurred', 'error')
    }
  }

  const handleSetDefault = async (address: Address) => {
    try {
      const response = await fetch('/api/user/address', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...address, isDefault: true }),
      })
      const data = await response.json()
      if (data.success) {
        showMessage('Default address updated', 'success')
        fetchAddresses()
      }
    } catch {
      showMessage('An error occurred', 'error')
    }
  }

  const resetAddressForm = () => {
    setAddressForm({
      firstName: '', lastName: '', address1: '', address2: '',
      city: '', state: '', zip: '', country: 'United States', phone: '', isDefault: false
    })
    setIsAddingAddress(false)
    setEditingAddressId(null)
  }

  const startEditAddress = (address: Address) => {
    setAddressForm({
      firstName: address.firstName,
      lastName: address.lastName,
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault
    })
    setEditingAddressId(address.id)
    setIsAddingAddress(true)
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const availableStates = getStatesByCountry(addressForm.country)

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          {user.image ? (
            <Image src={user.image} alt={user.name || 'User'} width={80} height={80} className="rounded-full" />
          ) : (
            <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-medium">
              {getInitials(user.name)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{user.name || 'User'}</h2>
          <p className="text-gray-600">{user.email}</p>
          {user.role === 'admin' && (
            <div className="flex items-center mt-2">
              <Shield className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm text-blue-600 font-medium">Administrator</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-6">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'addresses', label: 'Addresses', icon: MapPin },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-md ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Personal Information</h3>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit2 className="h-4 w-4 mr-2" /> Edit
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Full Name</Label>
              {isEditing ? (
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              ) : (
                <div className="mt-1 flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{user.name || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div>
              <Label>Email Address</Label>
              <div className="mt-1 flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span>{user.email}</span>
              </div>
            </div>

            <div>
              <Label>Account Type</Label>
              <div className="mt-1 flex items-center">
                <Shield className="h-4 w-4 text-gray-400 mr-2" />
                <span className="capitalize">{user.role || 'User'}</span>
              </div>
            </div>

            <div>
              <Label>Member Since</Label>
              <div className="mt-1 flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span>Recently joined</span>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex space-x-3 pt-4 border-t">
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                {isLoading ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save</>}
              </Button>
              <Button variant="outline" onClick={() => { setIsEditing(false); setName(user.name || '') }}>
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          {/* Change Password */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Change Password</h3>
            <div className="max-w-md space-y-4">
              <div>
                <Label>Current Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label>New Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleChangePassword} disabled={isLoading || !newPassword}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>

          {/* Change Email */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-medium">Change Email</h3>
            <p className="text-sm text-gray-500">A verification link will be sent to your new email address.</p>
            <div className="max-w-md space-y-4">
              <div>
                <Label>New Email Address</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Current Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showEmailPassword ? 'text' : 'password'}
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="Enter your password to confirm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailPassword(!showEmailPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button onClick={handleChangeEmail} disabled={isLoading || !newEmail}>
                {isLoading ? 'Sending...' : 'Send Verification Email'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Saved Addresses</h3>
            {!isAddingAddress && (
              <Button onClick={() => setIsAddingAddress(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Address
              </Button>
            )}
          </div>

          {/* Address Form */}
          {isAddingAddress && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h4 className="font-medium">{editingAddressId ? 'Edit Address' : 'New Address'}</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First Name *"
                  value={addressForm.firstName}
                  onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                />
                <Input
                  placeholder="Last Name *"
                  value={addressForm.lastName}
                  onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                />
              </div>
              <select
                value={addressForm.country}
                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value, state: '' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                {availableStates.length > 0 ? (
                  <select
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select State *</option>
                    {availableStates.map((s) => (
                      <option key={s.code} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    placeholder="State/Province *"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  />
                )}
                <Input
                  placeholder="City *"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                />
              </div>
              <Input
                placeholder="ZIP/Postal Code *"
                value={addressForm.zip}
                onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
              />
              <Input
                placeholder="Address *"
                value={addressForm.address1}
                onChange={(e) => setAddressForm({ ...addressForm, address1: e.target.value })}
              />
              <Input
                placeholder="Apt, Suite (optional)"
                value={addressForm.address2}
                onChange={(e) => setAddressForm({ ...addressForm, address2: e.target.value })}
              />
              <Input
                placeholder="Phone *"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Set as default address</span>
              </label>
              <div className="flex gap-3">
                <Button onClick={handleSaveAddress} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Address'}
                </Button>
                <Button variant="outline" onClick={resetAddressForm}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Address List */}
          {addresses.length === 0 && !isAddingAddress ? (
            <p className="text-gray-500 text-center py-8">No saved addresses yet.</p>
          ) : (
            <div className="grid gap-4">
              {addresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-4 relative">
                  {address.isDefault && (
                    <span className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Star className="h-3 w-3" /> Default
                    </span>
                  )}
                  <p className="font-medium">{address.firstName} {address.lastName}</p>
                  <p className="text-gray-600 text-sm">{address.address1}</p>
                  {address.address2 && <p className="text-gray-600 text-sm">{address.address2}</p>}
                  <p className="text-gray-600 text-sm">
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p className="text-gray-600 text-sm">{address.country}</p>
                  <p className="text-gray-600 text-sm">{address.phone}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => startEditAddress(address)}>
                      <Edit2 className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    {!address.isDefault && (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefault(address)}>
                        <Star className="h-3 w-3 mr-1" /> Set Default
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDeleteAddress(address.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
