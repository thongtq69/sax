'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Save, FileText, Eye, EyeOff, ChevronDown, ChevronRight, Image as ImageIcon, Upload, Loader2
} from 'lucide-react'
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

interface HomepageSection {
  id: string
  sectionKey: string
  title: string | null
  subtitle: string | null
  content: string | null
  image: string | null
  isVisible: boolean
  order: number
  metadata: any
  updatedAt: string
}

const sectionLabels: Record<string, string> = {
  'hero': 'Hero Section',
  'why-choose-us': 'Why Musicians Choose Us',
  'featured-review': 'Featured Review',
  'newsletter': 'Newsletter Section',
}

export default function HomepageContentPage() {
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['hero']))
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isUploading, setIsUploading] = useState<string | null>(null)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/homepage-content')
      if (response.ok) {
        const data = await response.json()
        setSections(data)
        // Initialize form data
        const initialFormData: Record<string, any> = {}
        data.forEach((section: HomepageSection) => {
          initialFormData[section.sectionKey] = {
            title: section.title || '',
            subtitle: section.subtitle || '',
            content: section.content || '',
            image: section.image || '',
            isVisible: section.isVisible,
            metadata: section.metadata || {},
          }
        })
        setFormData(initialFormData)
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSections(newExpanded)
  }

  const handleSave = async (sectionKey: string) => {
    setIsSaving(true)
    setSuccessMessage('')

    try {
      const data = formData[sectionKey]
      const response = await fetch(`/api/admin/homepage-content/${sectionKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await fetchSections()
        setSuccessMessage(`${sectionLabels[sectionKey] || sectionKey} saved successfully!`)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save section')
      }
    } catch (error) {
      console.error('Error saving section:', error)
      alert('Failed to save section')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleVisibility = async (section: HomepageSection) => {
    try {
      const response = await fetch(`/api/admin/homepage-content/${section.sectionKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !section.isVisible }),
      })

      if (response.ok) {
        await fetchSections()
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
    }
  }

  const updateFormData = (sectionKey: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }))
  }

  const updateMetadata = (sectionKey: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        metadata: {
          ...prev[sectionKey]?.metadata,
          [field]: value,
        },
      },
    }))
  }

  const handleImageUpload = async (sectionKey: string, field: 'image' | 'logoImage', file: File) => {
    setIsUploading(`${sectionKey}-${field}`)
    
    try {
      // Compress if file is too large for Cloudinary (> 10MB)
      let uploadFile = file
      if (file.size > MAX_FILE_SIZE) {
        uploadFile = await compressImage(file, 9)
      }
      
      // For files > 4MB, use direct Cloudinary upload
      if (uploadFile.size > 4 * 1024 * 1024) {
        // Get signature from our API
        const sigResponse = await fetch('/api/upload/signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: 'sax/homepage' }),
        })
        
        if (!sigResponse.ok) {
          throw new Error('Failed to get upload signature')
        }
        
        const { signature, timestamp, cloudName, apiKey, folder } = await sigResponse.json()
        
        // Upload directly to Cloudinary
        const uploadFormData = new FormData()
        uploadFormData.append('file', uploadFile)
        uploadFormData.append('signature', signature)
        uploadFormData.append('timestamp', timestamp.toString())
        uploadFormData.append('api_key', apiKey)
        uploadFormData.append('folder', folder)
        
        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: uploadFormData,
          }
        )
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error?.message || 'Upload failed')
        }
        
        const result = await uploadResponse.json()
        
        if (field === 'image') {
          updateFormData(sectionKey, 'image', result.secure_url)
        } else {
          updateMetadata(sectionKey, field, result.secure_url)
        }
      } else {
        // For smaller files, use server API
        const formData = new FormData()
        formData.append('file', uploadFile)
        formData.append('folder', 'sax/homepage')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Upload failed')
        }

        const result = await response.json()
        
        if (field === 'image') {
          updateFormData(sectionKey, 'image', result.url)
        } else {
          updateMetadata(sectionKey, field, result.url)
        }
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Homepage Content</h1>
        <p className="text-gray-600 mt-1">Manage homepage sections and content</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.sectionKey)}
              className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedSections.has(section.sectionKey) ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-gray-900">
                  {sectionLabels[section.sectionKey] || section.sectionKey}
                </h3>
                {!section.isVisible && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                    Hidden
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleVisibility(section)
                }}
                title={section.isVisible ? 'Hide section' : 'Show section'}
              >
                {section.isVisible ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </button>

            {/* Section Content */}
            {expandedSections.has(section.sectionKey) && (
              <div className="p-6 space-y-4 border-t">
                {/* Title */}
                <div>
                  <Label htmlFor={`${section.sectionKey}-title`}>Title</Label>
                  <Input
                    id={`${section.sectionKey}-title`}
                    value={formData[section.sectionKey]?.title || ''}
                    onChange={(e) => updateFormData(section.sectionKey, 'title', e.target.value)}
                    placeholder="Section title"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <Label htmlFor={`${section.sectionKey}-subtitle`}>Subtitle</Label>
                  <Input
                    id={`${section.sectionKey}-subtitle`}
                    value={formData[section.sectionKey]?.subtitle || ''}
                    onChange={(e) => updateFormData(section.sectionKey, 'subtitle', e.target.value)}
                    placeholder="Section subtitle"
                  />
                </div>

                {/* Content - for sections that have it */}
                {(section.sectionKey === 'featured-review' || section.content) && (
                  <div>
                    <Label htmlFor={`${section.sectionKey}-content`}>Content</Label>
                    <textarea
                      id={`${section.sectionKey}-content`}
                      value={formData[section.sectionKey]?.content || ''}
                      onChange={(e) => updateFormData(section.sectionKey, 'content', e.target.value)}
                      placeholder="Section content"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                {/* Image URL */}
                {(section.sectionKey === 'hero' || section.image) && (
                  <div>
                    <Label htmlFor={`${section.sectionKey}-image`}>Background Image URL</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id={`${section.sectionKey}-image`}
                          value={formData[section.sectionKey]?.image || ''}
                          onChange={(e) => updateFormData(section.sectionKey, 'image', e.target.value)}
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
                            if (file) handleImageUpload(section.sectionKey, 'image', file)
                            e.target.value = ''
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isUploading === `${section.sectionKey}-image`}
                          asChild
                        >
                          <span>
                            {isUploading === `${section.sectionKey}-image` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </span>
                        </Button>
                      </label>
                    </div>
                    {/* Image Preview */}
                    {formData[section.sectionKey]?.image && (
                      <div className="mt-3 relative w-full max-w-md aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={formData[section.sectionKey].image}
                          alt="Background preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Section-specific metadata fields */}
                {section.sectionKey === 'hero' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Button Text</Label>
                        <Input
                          value={formData[section.sectionKey]?.metadata?.buttonText || ''}
                          onChange={(e) => updateMetadata(section.sectionKey, 'buttonText', e.target.value)}
                          placeholder="Shop Now"
                        />
                      </div>
                      <div>
                        <Label>Button Link</Label>
                        <Input
                          value={formData[section.sectionKey]?.metadata?.buttonLink || ''}
                          onChange={(e) => updateMetadata(section.sectionKey, 'buttonLink', e.target.value)}
                          placeholder="/shop"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Logo Image URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData[section.sectionKey]?.metadata?.logoImage || ''}
                          onChange={(e) => updateMetadata(section.sectionKey, 'logoImage', e.target.value)}
                          placeholder="/logo.svg"
                          className="flex-1"
                        />
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(section.sectionKey, 'logoImage', file)
                              e.target.value = ''
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isUploading === `${section.sectionKey}-logoImage`}
                            asChild
                          >
                            <span>
                              {isUploading === `${section.sectionKey}-logoImage` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>
                      {/* Logo Preview */}
                      {formData[section.sectionKey]?.metadata?.logoImage && (
                        <div className="mt-3 relative h-16 w-48 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={formData[section.sectionKey].metadata.logoImage}
                            alt="Logo preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {section.sectionKey === 'featured-review' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Author Name</Label>
                      <Input
                        value={formData[section.sectionKey]?.metadata?.authorName || ''}
                        onChange={(e) => updateMetadata(section.sectionKey, 'authorName', e.target.value)}
                        placeholder="Customer Name"
                      />
                    </div>
                    <div>
                      <Label>Rating (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={formData[section.sectionKey]?.metadata?.rating || 5}
                        onChange={(e) => updateMetadata(section.sectionKey, 'rating', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                {section.sectionKey === 'newsletter' && (
                  <div>
                    <Label>Button Text</Label>
                    <Input
                      value={formData[section.sectionKey]?.metadata?.buttonText || ''}
                      onChange={(e) => updateMetadata(section.sectionKey, 'buttonText', e.target.value)}
                      placeholder="Subscribe"
                    />
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => handleSave(section.sectionKey)}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>

                {/* Last Updated */}
                <p className="text-xs text-gray-500 text-right">
                  Last updated: {new Date(section.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
