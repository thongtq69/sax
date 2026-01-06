'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, FolderTree, Loader2, AlertCircle } from 'lucide-react'

interface Subcategory {
  id: string
  name: string
  slug: string
  path: string
  categoryId: string
}

interface Category {
  id: string
  name: string
  slug: string
  path: string
  subcategories: Subcategory[]
}

export default function CategoriesManagement() {
  const [categoryList, setCategoryList] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<{ category: Category; subcategory: Subcategory | null } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'subcategory'; id: string; name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    path: '',
  })
  const [subFormData, setSubFormData] = useState({
    name: '',
    slug: '',
    path: '',
  })

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategoryList(data)
    } catch (error: any) {
      console.error('Error fetching categories:', error)
      setError('Failed to load categories. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenDialog = (category?: Category) => {
    setError(null)
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        path: category.path,
      })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', slug: '', path: '' })
    }
    setIsDialogOpen(true)
  }

  const handleOpenSubDialog = (category: Category, subcategory?: Subcategory) => {
    setError(null)
    if (subcategory) {
      setEditingSubcategory({ category, subcategory })
      setSubFormData({
        name: subcategory.name,
        slug: subcategory.slug,
        path: subcategory.path,
      })
    } else {
      setEditingSubcategory({ category, subcategory: null })
      setSubFormData({ name: '', slug: '', path: '' })
    }
    setIsSubDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const path = formData.path || `/shop/${slug}`

      const categoryData = {
        name: formData.name,
        slug,
        path,
      }

      let response
      if (editingCategory) {
        response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        })
      } else {
        response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save category')
      }

      await fetchCategories()
      setIsDialogOpen(false)
      setEditingCategory(null)
      setSuccessMessage(editingCategory ? 'Category updated successfully!' : 'Category created successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error: any) {
      console.error('Error saving category:', error)
      setError(error.message || 'Failed to save category')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSubcategory = async () => {
    if (!editingSubcategory) return

    try {
      setIsSaving(true)
      setError(null)

      const slug = subFormData.slug || subFormData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const path = subFormData.path || `${editingSubcategory.category.path}/${slug}`

      const subcategoryData = {
        name: subFormData.name,
        slug,
        path,
        categoryId: editingSubcategory.category.id,
      }

      let response
      if (editingSubcategory.subcategory) {
        response = await fetch(`/api/subcategories/${editingSubcategory.subcategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subcategoryData),
        })
      } else {
        response = await fetch('/api/subcategories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subcategoryData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save subcategory')
      }

      await fetchCategories()
      setIsSubDialogOpen(false)
      setEditingSubcategory(null)
      setSuccessMessage(editingSubcategory.subcategory ? 'Subcategory updated successfully!' : 'Subcategory created successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error: any) {
      console.error('Error saving subcategory:', error)
      setError(error.message || 'Failed to save subcategory')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenDeleteDialog = (type: 'category' | 'subcategory', id: string, name: string) => {
    setDeleteTarget({ type, id, name })
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      setIsSaving(true)
      setError(null)

      const endpoint = deleteTarget.type === 'category' 
        ? `/api/categories/${deleteTarget.id}`
        : `/api/subcategories/${deleteTarget.id}`

      const response = await fetch(endpoint, { method: 'DELETE' })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to delete ${deleteTarget.type}`)
      }

      await fetchCategories()
      setIsDeleteDialogOpen(false)
      setDeleteTarget(null)
      setSuccessMessage(`${deleteTarget.type === 'category' ? 'Category' : 'Subcategory'} deleted successfully!`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error: any) {
      console.error('Error deleting:', error)
      setError(error.message || 'Failed to delete')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-1">Organize your product categories and subcategories</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {categoryList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500 mb-4">Create your first category to organize products</p>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        ) : (
          categoryList.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">
                    Slug: {category.slug} | Path: {category.path}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenSubDialog(category)}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Sub
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
                    onClick={() => handleOpenDeleteDialog('category', category.id, category.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="pl-4 border-l-2 border-gray-200 space-y-2 mt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Subcategories ({category.subcategories.length})
                  </p>
                  {category.subcategories.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{sub.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({sub.slug})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenSubDialog(category, sub)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog('subcategory', sub.id, sub.name)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
                placeholder="Auto-generated from name if empty"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Path
              </label>
              <Input
                value={formData.path}
                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                placeholder="Auto-generated if empty (e.g., /shop/category-name)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={isSaving || !formData.name}>
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
              {editingSubcategory?.subcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
              {editingSubcategory && (
                <span className="text-sm font-normal text-gray-500 block mt-1">
                  Parent: {editingSubcategory.category.name}
                </span>
              )}
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
                placeholder="Auto-generated from name if empty"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Path
              </label>
              <Input
                value={subFormData.path}
                onChange={(e) => setSubFormData({ ...subFormData, path: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveSubcategory} disabled={isSaving || !subFormData.name}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingSubcategory?.subcategory ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete the {deleteTarget?.type}{' '}
              <strong>"{deleteTarget?.name}"</strong>?
            </p>
            {deleteTarget?.type === 'category' && (
              <p className="text-sm text-amber-600 mt-2">
                Warning: This will also delete all subcategories under this category.
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
