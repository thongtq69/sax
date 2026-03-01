'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Loader2, Tag, Search, GripVertical } from 'lucide-react'
import Image from 'next/image'
import { SingleImageUpload } from '@/components/admin/ImageUpload'
import { getBrandDescriptionTemplate } from '@/lib/brand-description'

interface Brand {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  models: string[]
  isActive: boolean
  order: number
  createdAt: string
}

export default function BrandsManagement() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    logo: null as string | null,
    description: '',
    models: [] as string[],
    isActive: true,
    order: 0
  })
  const [newModel, setNewModel] = useState('')

  // Fetch brands
  useEffect(() => {
    fetchBrands()
  }, [])

  // Filter brands
  useEffect(() => {
    if (searchTerm) {
      setFilteredBrands(
        brands.filter(b => 
          b.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredBrands(brands)
    }
  }, [searchTerm, brands])

  const fetchBrands = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/brands')
      if (response.ok) {
        const data = await response.json()
        setBrands(data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand)
      setFormData({
        name: brand.name,
        logo: brand.logo,
        description: brand.description || '',
        models: brand.models || [],
        isActive: brand.isActive,
        order: brand.order
      })
    } else {
      setEditingBrand(null)
      setFormData({
        name: '',
        logo: null,
        description: '',
        models: [],
        isActive: true,
        order: brands.length
      })
    }
    setNewModel('')
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Brand name is required')
      return
    }

    try {
      setIsSaving(true)
      const url = editingBrand 
        ? `/api/admin/brands/${editingBrand.id}`
        : '/api/admin/brands'
      
      const response = await fetch(url, {
        method: editingBrand ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save brand')
      }

      await fetchBrands()
      setIsDialogOpen(false)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Are you sure you want to delete "${brand.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/brands/${brand.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete brand')
      }

      await fetchBrands()
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Loading brands...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600 mt-1">Manage product brands ({brands.length} brands)</p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBrands.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No brands found</p>
            <p className="text-gray-400 text-sm mt-1">Add your first brand to get started</p>
          </div>
        ) : (
          filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
                !brand.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {brand.logo ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={48}
                      height={48}
                      className="object-contain w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Tag className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{brand.name}</h3>
                  <p className="text-sm text-gray-500">{brand.slug}</p>
                  {brand.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{brand.description}</p>
                  )}
                  {brand.models && brand.models.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {brand.models.length} model{brand.models.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  brand.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {brand.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(brand)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(brand)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Brand Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Yamaha, Selmer, Yanagisawa"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Brand Description (Optional)
                </label>
                {getBrandDescriptionTemplate(formData.name) && !formData.description.trim() && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => {
                      const template = getBrandDescriptionTemplate(formData.name)
                      if (template) {
                        setFormData({ ...formData, description: template })
                      }
                    }}
                  >
                    Use suggested text
                  </button>
                )}
              </div>

              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short brand overview for brand page and SEO"
                rows={4}
              />

              {!formData.description.trim() && getBrandDescriptionTemplate(formData.name) && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  Suggested: {getBrandDescriptionTemplate(formData.name)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo (Optional)
              </label>
              <SingleImageUpload
                image={formData.logo}
                onChange={(logo) => setFormData({ ...formData, logo })}
                folder="sax/brands"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Models
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Add model lines for this brand (e.g., Mark VI, Serie III, YAS-62)
              </p>
              
              {/* Current models */}
              {formData.models.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.models.map((model, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {model}
                      <button
                        type="button"
                        onClick={() => {
                          const newModels = [...formData.models]
                          newModels.splice(index, 1)
                          setFormData({ ...formData, models: newModels })
                        }}
                        className="text-primary/60 hover:text-red-500 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add new model */}
              <div className="flex gap-2">
                <Input
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="Enter model name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newModel.trim()) {
                      e.preventDefault()
                      if (!formData.models.includes(newModel.trim())) {
                        setFormData({
                          ...formData,
                          models: [...formData.models, newModel.trim()]
                        })
                      }
                      setNewModel('')
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newModel.trim() && !formData.models.includes(newModel.trim())) {
                      setFormData({
                        ...formData,
                        models: [...formData.models, newModel.trim()]
                      })
                      setNewModel('')
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active (visible in brand selection)
              </label>
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
                editingBrand ? 'Update Brand' : 'Create Brand'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
