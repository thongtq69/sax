'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings as SettingsIcon, Save, Globe, Phone, Mail, Clock, Facebook, Youtube, Instagram, Twitter } from 'lucide-react'

interface SocialLinks {
  facebook?: string
  youtube?: string
  instagram?: string
  twitter?: string
  tiktok?: string
}

interface SiteSettings {
  id: string
  companyName: string
  address: string
  phone: string
  email: string
  workingHours: string
  socialLinks: SocialLinks
  footerText: string
  copyrightText: string
  updatedAt: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    phone: '',
    email: '',
    workingHours: '',
    facebook: '',
    youtube: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    footerText: '',
    copyrightText: '',
  })
  const [errors, setErrors] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/site-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        const socialLinks = data.socialLinks || {}
        setFormData({
          companyName: data.companyName || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          workingHours: data.workingHours || '',
          facebook: socialLinks.facebook || '',
          youtube: socialLinks.youtube || '',
          instagram: socialLinks.instagram || '',
          twitter: socialLinks.twitter || '',
          tiktok: socialLinks.tiktok || '',
          footerText: data.footerText || '',
          copyrightText: data.copyrightText || '',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setErrors([])
    setSuccessMessage('')

    try {
      // Build socialLinks object - use empty string for empty fields to ensure they're saved
      const socialLinksData: Record<string, string> = {}
      if (formData.facebook.trim()) socialLinksData.facebook = formData.facebook.trim()
      if (formData.youtube.trim()) socialLinksData.youtube = formData.youtube.trim()
      if (formData.instagram.trim()) socialLinksData.instagram = formData.instagram.trim()
      if (formData.twitter.trim()) socialLinksData.twitter = formData.twitter.trim()
      if (formData.tiktok.trim()) socialLinksData.tiktok = formData.tiktok.trim()

      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          workingHours: formData.workingHours,
          socialLinks: socialLinksData,
          footerText: formData.footerText,
          copyrightText: formData.copyrightText,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setSuccessMessage('Settings saved successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const error = await response.json()
        setErrors(error.details || [error.error || 'Failed to save settings'])
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setErrors(['Failed to save settings'])
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-600 mt-1">Manage your website settings and information</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          Company Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Your company name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@example.com"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="workingHours">Working Hours</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="workingHours"
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                placeholder="Mon-Fri: 9AM-6PM"
                className="pl-10"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Your business address"
                rows={2}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
              <Input
                id="facebook"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/yourpage"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="youtube">YouTube</Label>
            <div className="relative">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600" />
              <Input
                id="youtube"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                placeholder="https://youtube.com/yourchannel"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-600" />
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/yourprofile"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="twitter">Twitter / X</Label>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" />
              <Input
                id="twitter"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="https://twitter.com/yourhandle"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tiktok">TikTok</Label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
              <Input
                id="tiktok"
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@yourhandle"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Footer Content</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="footerText">Footer Text</Label>
            <textarea
              id="footerText"
              value={formData.footerText}
              onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
              placeholder="Additional text to display in the footer"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <Label htmlFor="copyrightText">Copyright Text</Label>
            <Input
              id="copyrightText"
              value={formData.copyrightText}
              onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
              placeholder="© 2024 Your Company. All rights reserved."
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || !formData.companyName} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Last Updated */}
      {settings?.updatedAt && (
        <p className="text-sm text-gray-500 text-right">
          Last updated: {new Date(settings.updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  )
}
