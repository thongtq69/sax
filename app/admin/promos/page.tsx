'use client'

import { useState, useEffect } from 'react'
import { getPromoBanners, createPromo, updatePromo, deletePromo } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Megaphone, Loader2, Eye, ExternalLink, GripVertical } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { SingleImageUpload } from '@/components/admin/ImageUpload'

export default function PromosManagement() {
  const [promoList, setPromoList] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPromo, setEditingPromo] = useState<any | null>(null)
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    image: '',
    ctaText: '',
    ctaLink: '',
  })

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const promos = await getPromoBanners()
        setPromoList(promos)
      } catch (error) {
        console.error('Error fetching promo banners:', error)
        alert('Failed to load promo banners. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleOpenDialog = (promo?: any) => {
    if (promo) {
      setEditingPromo(promo)
      setFormData(promo)
    } else {
      setEditingPromo(null)
      setFormData({
        title: '',
        description: '',
        image: '',
        ctaText: 'Shop Now',
        ctaLink: '/shop',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    // Validation
    if (!formData.title?.trim()) {
      alert('Title is required')
      return
    }
    if (!formData.description?.trim()) {
      alert('Description is required')
      return
    }
    if (!formData.image?.trim()) {
      alert('Image is required')
      return
    }

    try {
      setIsSaving(true)
      
      const promoData = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        ctaText: formData.ctaText || 'Shop Now',
        ctaLink: formData.ctaLink || '/shop',
      }

      if (editingPromo) {
        await updatePromo(editingPromo.id, promoData)
      } else {
        await createPromo(promoData)
      }

      // Refresh data
      const promos = await getPromoBanners()
      setPromoList(promos)
      
      setIsDialogOpen(false)
      setEditingPromo(null)
    } catch (error: any) {
      console.error('Error saving promo banner:', error)
      alert(error.message || 'Failed to save promo banner. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo banner? This action cannot be undone.')) {
      return
    }

    try {
      await deletePromo(id)
      
      // Refresh data
      const promos = await getPromoBanners()
      setPromoList(promos)
    } catch (error: any) {
      console.error('Error deleting promo banner:', error)
      alert(error.message || 'Failed to delete promo banner. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Loading promo banners...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promo Banners</h1>
          <p className="text-gray-600 mt-1">Manage promotional banners and campaigns ({promoList.length} banners)</p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="lg" className="w-full sm:w-auto">
          <Plus className="h-5 w-5 mr-2" />
          Add Banner
        </Button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Megaphone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">About Promo Banners</h3>
            <p className="text-sm text-blue-700 mt-1">
              Promo banners are displayed on the homepage carousel. Add compelling images and call-to-actions to drive traffic to your promotions.
            </p>
          </div>
        </div>
      </div>

      {/* Promos List */}
      {promoList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <Megaphone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No promo banners found</p>
          <p className="text-gray-400 text-sm mt-1">Create your first promo banner to get started</p>
          <Button onClick={() => handleOpenDialog()} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Banner
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {promoList.map((promo, index) => (
            <div 
              key={promo.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-80 h-48 md:h-auto relative bg-gray-100 flex-shrink-0">
                  {promo.image ? (
                    <Image
                      src={promo.image}
                      alt={promo.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Megaphone className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{promo.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{promo.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                            {promo.ctaText}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <ExternalLink className="h-4 w-4" />
                          <span className="truncate max-w-[200px]">{promo.ctaLink}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={promo.ctaLink} target="_blank">
                        <Button variant="ghost" size="sm" title="Preview">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(promo)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(promo.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Promo Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingPromo ? 'Edit Promo Banner' : 'Create Promo Banner'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Banner Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Upload an eye-catching image for your promo banner. Recommended size: 1200x400px
              </p>
              <SingleImageUpload
                image={formData.image}
                onChange={(image) => setFormData({ ...formData, image })}
                folder="sax/promos"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Summer Sale - Up to 50% Off!"
                className="text-lg"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full min-h-[100px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your promotion or offer..."
              />
            </div>

            {/* CTA Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <Input
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Link
                </label>
                <Input
                  value={formData.ctaLink}
                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                  placeholder="/shop"
                />
              </div>
            </div>

            {/* Preview */}
            {formData.image && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="relative h-40 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={formData.image}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                    <div className="p-6 text-white">
                      <h3 className="text-xl font-bold">{formData.title || 'Your Title'}</h3>
                      <p className="text-sm mt-1 opacity-90 line-clamp-1">{formData.description || 'Your description'}</p>
                      <button className="mt-3 bg-white text-black px-4 py-1.5 rounded text-sm font-medium">
                        {formData.ctaText || 'Shop Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingPromo ? 'Update Banner' : 'Create Banner'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
