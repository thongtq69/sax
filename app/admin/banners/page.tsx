'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, 
  X, Save, Image as ImageIcon, ExternalLink 
} from 'lucide-react'
import Image from 'next/image'
import { SingleImageUpload } from '@/components/admin/ImageUpload'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  image: string
  link: string | null
  buttonText: string | null
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    buttonText: '',
    isActive: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/banners')
      if (response.ok) {
        const data = await response.json()
        setBanners(data)
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingBanner 
        ? `/api/admin/banners/${editingBanner.id}`
        : '/api/admin/banners'
      
      const response = await fetch(url, {
        method: editingBanner ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          subtitle: formData.subtitle || null,
          image: formData.image,
          link: formData.link || null,
          buttonText: formData.buttonText || null,
          isActive: formData.isActive,
        }),
      })

      if (response.ok) {
        await fetchBanners()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save banner')
      }
    } catch (error) {
      console.error('Error saving banner:', error)
      alert('Failed to save banner')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image,
      link: banner.link || '',
      buttonText: banner.buttonText || '',
      isActive: banner.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await fetchBanners()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
    }
  }

  const handleToggleActive = async (banner: Banner) => {
    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PATCH',
      })
      if (response.ok) {
        await fetchBanners()
      }
    } catch (error) {
      console.error('Error toggling banner:', error)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingBanner(null)
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      link: '',
      buttonText: '',
      isActive: true,
    })
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-600 mt-1">Manage homepage banners and promotional content</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Banner
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Banner title"
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Optional subtitle"
                />
              </div>
              <div>
                <Label>Image *</Label>
                <SingleImageUpload
                  image={formData.image || null}
                  onChange={(url: string | null) => setFormData({ ...formData, image: url || '' })}
                  folder="sax/banners"
                />
              </div>
              <div>
                <Label htmlFor="link">Link URL</Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active (visible on website)</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving || !formData.title || !formData.image} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Banner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900">Delete Banner?</h3>
            <p className="text-gray-600 mt-2">This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)} className="flex-1">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Banners List */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No banners yet</h3>
          <p className="mt-2 text-gray-600">Create your first banner to display on the homepage.</p>
          <Button onClick={() => setShowForm(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Add Banner
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {banners.map((banner) => (
              <div key={banner.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <div className="text-gray-400 cursor-move">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {banner.image ? (
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      width={128}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">{banner.title}</h3>
                    {!banner.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-600 truncate">{banner.subtitle}</p>
                  )}
                  {banner.link && (
                    <a 
                      href={banner.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {banner.link}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(banner)}
                    title={banner.isActive ? 'Hide banner' : 'Show banner'}
                  >
                    {banner.isActive ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(banner)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteConfirm(banner.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
