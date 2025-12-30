'use client'

import { useState } from 'react'
import { categories, type Category, type SubCategory } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react'

export default function CategoriesManagement() {
  const [categoryList, setCategoryList] = useState<Category[]>(categories)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<{ category: Category; subcategory: SubCategory } | null>(null)
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    path: '',
    subcategories: [],
  })
  const [subFormData, setSubFormData] = useState<Partial<SubCategory>>({
    name: '',
    slug: '',
    path: '',
  })

  const handleOpenDialog = (category?: Category) => {
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

  const handleOpenSubDialog = (category: Category, subcategory?: SubCategory) => {
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

  const handleSave = () => {
    if (editingCategory) {
      setCategoryList(
        categoryList.map((c) =>
          c.id === editingCategory.id ? { ...formData, id: editingCategory.id } as Category : c
        )
      )
    } else {
      const newCategory: Category = {
        ...formData,
        id: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-') || '',
        subcategories: [],
      } as Category
      setCategoryList([...categoryList, newCategory])
    }
    setIsDialogOpen(false)
    setEditingCategory(null)
  }

  const handleSaveSub = () => {
    if (!editingSubcategory) return

    const { category } = editingSubcategory
    const updatedCategory = { ...category }
    
    if (editingSubcategory.subcategory.id) {
      // Update existing subcategory
      updatedCategory.subcategories = category.subcategories?.map((sub) =>
        sub.id === editingSubcategory.subcategory.id
          ? { ...subFormData, id: editingSubcategory.subcategory.id } as SubCategory
          : sub
      ) || []
    } else {
      // Add new subcategory
      const newSub: SubCategory = {
        ...subFormData,
        id: subFormData.slug || subFormData.name?.toLowerCase().replace(/\s+/g, '-') || '',
      } as SubCategory
      updatedCategory.subcategories = [...(category.subcategories || []), newSub]
    }

    setCategoryList(
      categoryList.map((c) => (c.id === category.id ? updatedCategory : c))
    )
    setIsSubDialogOpen(false)
    setEditingSubcategory(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategoryList(categoryList.filter((c) => c.id !== id))
    }
  }

  const handleDeleteSub = (categoryId: string, subId: string) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      setCategoryList(
        categoryList.map((c) =>
          c.id === categoryId
            ? { ...c, subcategories: c.subcategories?.filter((s) => s.id !== subId) || [] }
            : c
        )
      )
    }
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
                  {category.subcategories.map((sub) => (
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingCategory ? 'Update' : 'Create'}
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

