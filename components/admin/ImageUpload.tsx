'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Link as LinkIcon, X, Loader2, ImageIcon, Plus, XCircle, GripVertical } from 'lucide-react'

// Max file size for Cloudinary free plan (10MB limit)
// Files larger than this will be auto-compressed before upload
const MAX_FILE_SIZE = 10 * 1024 * 1024
const CLOUDINARY_MAX_SIZE_MB = 9 // Target 9MB to stay safely under 10MB limit

// Compress image if it's too large for Cloudinary
async function compressImage(file: File, maxSizeMB: number = CLOUDINARY_MAX_SIZE_MB): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    img.onload = () => {
      let { width, height } = img
      
      // Calculate scale factor based on file size
      const fileSizeMB = file.size / (1024 * 1024)
      let quality = 0.9
      let scale = 1
      
      if (fileSizeMB > maxSizeMB) {
        // Reduce dimensions for very large files
        scale = Math.sqrt(maxSizeMB / fileSizeMB)
        quality = 0.85
      }
      
      // Also limit max dimensions to 4000px
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
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(compressedFile)
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
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [totalFiles, setTotalFiles] = useState<number>(0)
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isCancelledRef = useRef<boolean>(false)
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Cancel upload function
  const cancelUpload = useCallback(() => {
    isCancelledRef.current = true
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsUploading(false)
    setUploadProgress(0)
    setStatusMessage('Upload cancelled')
    setTotalFiles(0)
    setCurrentFileIndex(0)
    setTimeout(() => setStatusMessage(''), 2000)
  }, [])

  // Upload directly to Cloudinary (bypasses server body size limit)
  const uploadToCloudinary = async (file: File): Promise<string> => {
    // Get signature from our API
    const sigResponse = await fetch('/api/upload/signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
    })
    
    if (!sigResponse.ok) {
      throw new Error('Failed to get upload signature')
    }
    
    const { signature, timestamp, cloudName, apiKey, folder: uploadFolder } = await sigResponse.json()
    
    // Upload directly to Cloudinary
    const formData = new FormData()
    formData.append('file', file)
    formData.append('signature', signature)
    formData.append('timestamp', timestamp.toString())
    formData.append('api_key', apiKey)
    formData.append('folder', uploadFolder)
    
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json()
      throw new Error(errorData.error?.message || 'Upload failed')
    }
    
    const result = await uploadResponse.json()
    return result.secure_url
  }

  // Fallback: Upload via our server API (for smaller files or URL uploads)
  const uploadViaServer = async (file: File) => {
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

    // Reset cancel flag
    isCancelledRef.current = false
    abortControllerRef.current = new AbortController()
    
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)
    setStatusMessage('')
    setTotalFiles(files.length)
    setCurrentFileIndex(0)

    // Process uploads in background - don't block UI
    const processUploads = async () => {
      try {
        const filesToUpload = files.length
        const newUrls: string[] = []
        
        for (let i = 0; i < filesToUpload; i++) {
          // Check if cancelled
          if (isCancelledRef.current) {
            break
          }
          
          let file = files[i]
          setCurrentFileIndex(i + 1)
          setUploadProgress(Math.round((i / filesToUpload) * 100))
          setStatusMessage(`Processing ${i + 1}/${filesToUpload}...`)
          
          // Compress if file is too large for Cloudinary (> 10MB)
          if (file.size > MAX_FILE_SIZE) {
            setStatusMessage(`Compressing ${file.name}...`)
            try {
              file = await compressImage(file, CLOUDINARY_MAX_SIZE_MB)
              setStatusMessage(`Compressed to ${(file.size / (1024 * 1024)).toFixed(1)}MB`)
            } catch (compressError) {
              console.error('Compression failed:', compressError)
              throw new Error(`File ${file.name} is too large and could not be compressed`)
            }
          }
          
          // Check if cancelled after compression
          if (isCancelledRef.current) {
            break
          }
          
          setStatusMessage(`Uploading ${i + 1}/${filesToUpload}...`)
          
          // Use direct Cloudinary upload for files > 4MB
          let url: string
          if (file.size > 4 * 1024 * 1024) {
            url = await uploadToCloudinary(file)
          } else {
            const result = await uploadViaServer(file)
            url = result.url
          }
          
          // Check if cancelled after upload
          if (isCancelledRef.current) {
            break
          }
          
          newUrls.push(url)
          
          // Update images immediately after each successful upload
          onChange([...images, ...newUrls].slice(0, maxImages))
        }
        
        if (!isCancelledRef.current) {
          setUploadProgress(100)
          setStatusMessage('Upload complete!')
        }
      } catch (err: any) {
        if (!isCancelledRef.current) {
          setError(err.message || 'Failed to upload images')
        }
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
        setTotalFiles(0)
        setCurrentFileIndex(0)
        setTimeout(() => setStatusMessage(''), 2000)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    
    // Start upload process (non-blocking)
    processUploads()
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    // Add a slight delay to show the dragging state
    setTimeout(() => {
      const target = e.target as HTMLElement
      target.style.opacity = '0.5'
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement
    target.style.opacity = '1'
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    
    if (dragIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newImages = [...images]
    const [draggedImage] = newImages.splice(dragIndex, 1)
    newImages.splice(dropIndex, 0, draggedImage)
    onChange(newImages)
    
    setDraggedIndex(null)
    setDragOverIndex(null)
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
        <div className="relative">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isUploading 
                ? 'border-primary bg-primary/5 cursor-default' 
                : 'border-gray-300 hover:border-primary cursor-pointer'
            }`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
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
                <p className="mt-2 text-sm text-gray-600">
                  {statusMessage || `Uploading ${currentFileIndex}/${totalFiles}...`}
                </p>
                {uploadProgress > 0 && (
                  <div className="w-full max-w-xs mt-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    cancelUpload()
                  }}
                  className="mt-3 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Upload
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  You can switch tabs while uploading
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ImageIcon className="h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click or drag & drop to upload images
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, WEBP (max 10MB per file, auto-compressed if larger)
                </p>
              </div>
            )}
          </div>
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
        <div>
          <p className="text-sm text-gray-500 mb-2">
            💡 Drag and drop to reorder images
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 ${
                  draggedIndex === index ? 'opacity-50 scale-95' : ''
                } ${
                  dragOverIndex === index ? 'ring-2 ring-primary ring-offset-2 scale-105' : ''
                }`}
              >
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover pointer-events-none"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
                
                {/* Drag handle indicator */}
                <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4" />
                </div>
                
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

  // Upload directly to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const sigResponse = await fetch('/api/upload/signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
    })
    
    if (!sigResponse.ok) {
      throw new Error('Failed to get upload signature')
    }
    
    const { signature, timestamp, cloudName, apiKey, folder: uploadFolder } = await sigResponse.json()
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('signature', signature)
    formData.append('timestamp', timestamp.toString())
    formData.append('api_key', apiKey)
    formData.append('folder', uploadFolder)
    
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json()
      throw new Error(errorData.error?.message || 'Upload failed')
    }
    
    const result = await uploadResponse.json()
    return result.secure_url
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // Compress if file is too large for Cloudinary (> 10MB)
      if (file.size > MAX_FILE_SIZE) {
        try {
          file = await compressImage(file, CLOUDINARY_MAX_SIZE_MB)
        } catch (compressError) {
          console.error('Compression failed:', compressError)
          throw new Error('File is too large and could not be compressed')
        }
      }
      
      // Use direct Cloudinary upload for large files
      let url: string
      if (file.size > 4 * 1024 * 1024) {
        url = await uploadToCloudinary(file)
      } else {
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
        url = result.url
      }
      
      onChange(url)
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
                  <p className="text-xs text-gray-400 mt-1">Max 10MB, auto-compressed if larger</p>
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
