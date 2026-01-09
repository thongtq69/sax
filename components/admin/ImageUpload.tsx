'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Link as LinkIcon, X, Loader2, ImageIcon, Plus } from 'lucide-react'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  folder?: string
}

export function ImageUpload({ 
  images, 
  onChange, 
  maxImages = 999, // Unlimited by default
  folder = 'sax/products'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')
  const [urlInput, setUrlInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Upload failed')
    }

    return await response.json()
  }

  const uploadFromUrl = async (url: string) => {
    const formData = new FormData()
    formData.append('url', url)
    formData.append('folder', folder)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Upload failed')
    }

    return await response.json()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      const uploadPromises = Array.from(files).map(file => uploadFile(file))
      const results = await Promise.all(uploadPromises)
      
      const newUrls = results.map(r => r.url)
      const combinedImages = [...images, ...newUrls].slice(0, maxImages)
      onChange(combinedImages)
    } catch (err: any) {
      setError(err.message || 'Failed to upload images')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return

    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadFromUrl(urlInput.trim())
      onChange([...images, result.url].slice(0, maxImages))
      setUrlInput('')
    } catch (err: any) {
      setError(err.message || 'Failed to upload from URL')
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddUrlDirectly = () => {
    if (!urlInput.trim()) return
    // Add URL directly without uploading to Cloudinary
    onChange([...images, urlInput.trim()].slice(0, maxImages))
    setUrlInput('')
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images]
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length) return
    
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]]
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload Mode Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={uploadMode === 'file' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMode('file')}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
        <Button
          type="button"
          variant={uploadMode === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMode('url')}
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          From URL
        </Button>
      </div>

      {/* Upload Area */}
      {uploadMode === 'file' ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="mt-2 text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click or drag & drop to upload images
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, WEBP up to 50MB
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter image URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isUploading}
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={isUploading || !urlInput.trim()}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddUrlDirectly}
              disabled={!urlInput.trim()}
              title="Add URL directly without uploading to Cloudinary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Click upload button to save to Cloudinary, or + to use URL directly
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
              
              {/* First image badge */}
              {index === 0 && (
                <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                  Main
                </span>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, 'left')}
                  >
                    ←
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {index < images.length - 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, 'right')}
                  >
                    →
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image count */}
      <p className="text-sm text-gray-500">
        {images.length} {maxImages < 999 ? `/ ${maxImages}` : ''} images
      </p>
    </div>
  )
}

// Single image upload component
interface SingleImageUploadProps {
  image: string | null
  onChange: (image: string | null) => void
  folder?: string
}

export function SingleImageUpload({ 
  image, 
  onChange, 
  folder = 'sax/images'
}: SingleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')
  const [urlInput, setUrlInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const result = await response.json()
      onChange(result.url)
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('url', urlInput.trim())
      formData.append('folder', folder)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const result = await response.json()
      onChange(result.url)
      setUrlInput('')
    } catch (err: any) {
      setError(err.message || 'Failed to upload from URL')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {image ? (
        <div className="relative aspect-video max-w-md bg-gray-100 rounded-lg overflow-hidden group">
          <Image
            src={image}
            alt="Preview"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onChange(null)}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('file')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button
              type="button"
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('url')}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              URL
            </Button>
          </div>

          {uploadMode === 'file' ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload</p>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter image URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={isUploading}
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={isUploading || !urlInput.trim()}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Add'
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}
    </div>
  )
}

