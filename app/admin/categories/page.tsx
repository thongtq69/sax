'use client'

import { useState, useEffect } from 'react'
import { getCategories, createCategory, transformCategory } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, FolderTree, Loader2 } from 'lucide-react'

export default function CategoriesManagement() {
  const [categoryList, setCategoryList] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<{ category: any; subcategory: any } | null>(null)
  const [formData, setFormData] = useState<any>({
    name: '',
    slug: '',
    path: '',
    subcategories: [],
  })
  const [subFormData, setSubFormData] = useState<any>({
    name: '',
    slug: '',
    path: '',
  })

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const categoriesData = await getCategories()
        const transformed = categoriesData.map(transformCategory)
        setCategoryList(transformed)
      } catch (error) {
        console.error('Error fetching categories:', error)
        alert('Failed to load categories. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleOpenDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category)
      setFormData(category)
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        slug: '',
        path: '',
        subcategories: [],
      })
    }
    setIsDialogOpen(true)
  }

  const handleOpenSubDialog = (category: any, subcategory?: any) => {
    if (subcategory) {
      setEditingSubcategory({ category, subcategory })
      setSubFormData(subcategory)
    } else {
      setEditingSubcategory({ category, subcategory: { id: '', name: '', slug: '', path: '' } })
      setSubFormData({
        name: '',
        slug: '',
        path: '',
      })
    }
    setIsSubDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const categoryData = {
        name: formData.name,
        slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-') || '',
        path: formData.path,
      }

      if (editingCategory) {
        // Update - Note: API doesn't support update yet, so we'll just refresh
        alert('Update functionality will be available soon. For now, please delete and recreate.')
      } else {
        await createCategory(categoryData)
      }

      // Refresh data
      const categoriesData = await getCategories()
      const transformed = categoriesData.map(transformCategory)
      setCategoryList(transformed)
      
      setIsDialogOpen(false)
      setEditingCategory(null)
    } catch (error: any) {
      console.error('Error saving category:', error)
      alert(error.message || 'Failed to save category. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSub = async () => {
    if (!editingSubcategory) return

    // Note: Subcategory update/create via API is not yet implemented
    // This would require updating the parent category with new subcategories
    alert('Subcategory management via API will be available soon.')
    setIsSubDialogOpen(false)
    setEditingSubcategory(null)
  }

  const handleDelete = (id: string) => {
    alert('Delete functionality will be available soon via API.')
  }

  const handleDeleteSub = (categoryId: string, subId: string) => {
    alert('Delete subcategory functionality will be available soon via API.')
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
          <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-2">Organize your product categories</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categoryList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          categoryList.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.path}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenSubDialog(category)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Subcategory
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                  {category.subcategories.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{sub.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{sub.path}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenSubDialog(category, sub)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSub(category.id, sub.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Category Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Auto-generated from name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Path *
              </label>
              <Input
                value={formData.path}
                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                placeholder="/shop/category-name"
              />
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
                editingCategory ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory Form Dialog */}
      <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubcategory?.subcategory.id ? 'Edit Subcategory' : 'Add New Subcategory'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory Name *
              </label>
              <Input
                value={subFormData.name}
                onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                placeholder="Enter subcategory name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <Input
                value={subFormData.slug}
                onChange={(e) => setSubFormData({ ...subFormData, slug: e.target.value })}
                placeholder="Auto-generated from name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Path *
              </label>
              <Input
                value={subFormData.path}
                onChange={(e) => setSubFormData({ ...subFormData, path: e.target.value })}
                placeholder="/shop/category/subcategory"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSub}>
              {editingSubcategory?.subcategory.id ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
