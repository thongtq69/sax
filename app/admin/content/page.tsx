'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Image as ImageIcon, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'

// Max file size for Cloudinary (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Compress image if too large
async function compressImage(file: File, maxSizeMB: number = 9): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    img.onload = () => {
      let { width, height } = img
      const fileSizeMB = file.size / (1024 * 1024)
      let quality = 0.9
      let scale = 1
      
      if (fileSizeMB > maxSizeMB) {
        scale = Math.sqrt(maxSizeMB / fileSizeMB)
        quality = 0.85
      }
      
      const maxDimension = 4000
      if (width > maxDimension || height > maxDimension) {
        const dimensionScale = maxDimension / Math.max(width, height)
        scale = Math.min(scale, dimensionScale)
      }
      
      width = Math.round(width * scale)
      height = Math.round(height * scale)
      
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }))
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        'image/jpeg',
        quality
      )
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

interface HeroData {
  image: string
  logoImage: string
  buttonText: string
  buttonLink: string
}

export default function HomepageContentPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isUploading, setIsUploading] = useState<string | null>(null)
  const [formData, setFormData] = useState<HeroData>({
    image: '/homepage3.png',
    logoImage: '/jsc-logo-transparent.svg',
    buttonText: 'Shop now!',
    buttonLink: '/shop',
  })

  useEffect(() => {
    fetchHeroData()
  }, [])

  const fetchHeroData = async () => {
    try {
      const response = await fetch('/api/admin/homepage-content/hero')
      if (response.ok) {
        const data = await response.json()
        setFormData({
          image: data.image || '/homepage3.png',
          logoImage: data.metadata?.logoImage || '/jsc-logo-transparent.svg',
          buttonText: data.metadata?.buttonText || 'Shop now!',
          buttonLink: data.metadata?.buttonLink || '/shop',
        })
      }
    } catch (error) {
      console.error('Error fetching hero data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSuccessMessage('')

    try {
      const response = await fetch('/api/admin/homepage-content/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: formData.image,
          metadata: {
            logoImage: formData.logoImage,
            buttonText: formData.buttonText,
            buttonLink: formData.buttonLink,
          },
        }),
      })

      if (response.ok) {
        setSuccessMessage('Settings saved successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (field: 'image' | 'logoImage', file: File) => {
    setIsUploading(field)
    
    try {
      let uploadFile = file
      if (file.size > MAX_FILE_SIZE) {
        uploadFile = await compressImage(file, 9)
      }
      
      let imageUrl = ''
      
      if (uploadFile.size > 4 * 1024 * 1024) {
        const sigResponse = await fetch('/api/upload/signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: 'sax/homepage' }),
        })
        
        if (!sigResponse.ok) throw new Error('Failed to get upload signature')
        
        const { signature, timestamp, cloudName, apiKey, folder } = await sigResponse.json()
        
        const uploadFormData = new FormData()
        uploadFormData.append('file', uploadFile)
        uploadFormData.append('signature', signature)
        uploadFormData.append('timestamp', timestamp.toString())
        uploadFormData.append('api_key', apiKey)
        uploadFormData.append('folder', folder)
        
        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: uploadFormData }
        )
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error?.message || 'Upload failed')
        }
        
        const result = await uploadResponse.json()
        imageUrl = result.secure_url
      } else {
        const formDataUpload = new FormData()
        formDataUpload.append('file', uploadFile)
        formDataUpload.append('folder', 'sax/homepage')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Upload failed')
        }

        const result = await response.json()
        imageUrl = result.url
      }
      
      // Update local state
      setFormData(prev => ({ ...prev, [field]: imageUrl }))
      
      // Auto-save
      const saveData = field === 'image' 
        ? { image: imageUrl, metadata: { logoImage: formData.logoImage, buttonText: formData.buttonText, buttonLink: formData.buttonLink } }
        : { image: formData.image, metadata: { logoImage: imageUrl, buttonText: formData.buttonText, buttonLink: formData.buttonLink } }
      
      const saveResponse = await fetch('/api/admin/homepage-content/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      })
      
      if (saveResponse.ok) {
        setSuccessMessage('Image uploaded and saved!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
      
    } catch (error: any) {
      alert(error.message || 'Failed to upload image')
    } finally {
      setIsUploading(null)
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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Homepage Content</h1>
        <p className="text-gray-600 mt-1">Manage hero section settings</p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Background Image */}
        <div>
          <Label>Background Image URL</Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="/images/background.jpg"
                className="pl-10"
              />
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload('image', file)
                  e.target.value = ''
                }}
              />
              <Button type="button" variant="outline" disabled={isUploading === 'image'} asChild>
                <span>
                  {isUploading === 'image' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </span>
              </Button>
            </label>
          </div>
          {formData.image && (
            <div className="mt-3 relative w-full max-w-md aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image src={formData.image} alt="Background preview" fill className="object-cover" />
            </div>
          )}
        </div>

        {/* Logo Image */}
        <div>
          <Label>Logo Image URL</Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={formData.logoImage}
                onChange={(e) => setFormData(prev => ({ ...prev, logoImage: e.target.value }))}
                placeholder="/logo.svg"
                className="pl-10"
              />
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload('logoImage', file)
                  e.target.value = ''
                }}
              />
              <Button type="button" variant="outline" disabled={isUploading === 'logoImage'} asChild>
                <span>
                  {isUploading === 'logoImage' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </span>
              </Button>
            </label>
          </div>
          {formData.logoImage && (
            <div className="mt-3 relative h-20 w-60 bg-gray-100 rounded-lg overflow-hidden">
              <Image src={formData.logoImage} alt="Logo preview" fill className="object-contain" />
            </div>
          )}
        </div>

        {/* Button Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Button Text</Label>
            <Input
              value={formData.buttonText}
              onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
              placeholder="Shop Now"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Button Link</Label>
            <Input
              value={formData.buttonLink}
              onChange={(e) => setFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
              placeholder="/shop"
              className="mt-1"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
