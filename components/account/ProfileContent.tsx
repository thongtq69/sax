'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Calendar, Shield, Edit2, Save, X } from 'lucide-react'

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
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name || '')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Profile updated successfully!')
        setIsEditing(false)
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        setMessage(data.message || 'Failed to update profile')
      }
    } catch (error) {
      setMessage('An error occurred while updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setName(user.name || '')
    setIsEditing(false)
    setMessage('')
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || 'User'}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-medium">
              {getInitials(user.name)}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">
            {user.name || 'User'}
          </h2>
          <p className="text-gray-600">{user.email}</p>
          {user.role === 'admin' && (
            <div className="flex items-center mt-2">
              <Shield className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm text-blue-600 font-medium">Administrator</span>
            </div>
          )}
        </div>
        
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          
          <div>
            <Label htmlFor="name">Full Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            ) : (
              <div className="mt-1 flex items-center">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900">{user.name || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div>
            <Label>Email Address</Label>
            <div className="mt-1 flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-900">{user.email}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Account Details</h3>
          
          <div>
            <Label>Account Type</Label>
            <div className="mt-1 flex items-center">
              <Shield className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-900 capitalize">{user.role || 'User'}</span>
            </div>
          </div>

          <div>
            <Label>Member Since</Label>
            <div className="mt-1 flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-900">Recently joined</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex space-x-3 pt-4 border-t">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-md ${
          message.includes('success') 
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}