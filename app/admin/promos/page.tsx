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
import { Plus, Edit, Trash2, Megaphone, Loader2 } from 'lucide-react'
import Image from 'next/image'

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
        ctaText: '',
        ctaLink: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const promoData = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        ctaText: formData.ctaText,
        ctaLink: formData.ctaLink,
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
    if (!confirm('Are you sure you want to delete this promo banner?')) {
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promo Banners Management</h1>
          <p className="text-gray-600 mt-2">Manage promotional banners and campaigns</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Promo Banner
        </Button>
      </div>

      {/* Promos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promoList.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No promo banners found</p>
          </div>
        ) : (
          promoList.map((promo) => (
            <div key={promo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {promo.image && (
                <div className="h-48 relative bg-gray-100">
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{promo.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{promo.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{promo.ctaText}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(promo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(promo.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Promo Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? 'Edit Promo Banner' : 'Add New Promo Banner'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter promo title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter promo description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL *
              </label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/images/promo/example.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Text *
                </label>
                <Input
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Link *
                </label>
                <Input
                  value={formData.ctaLink}
                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                  placeholder="/shop"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingPromo ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
