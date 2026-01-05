'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, Pencil, Trash2, Eye, EyeOff, X, Save, HelpCircle, ChevronDown, ChevronRight
} from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    isActive: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const response = await fetch('/api/admin/faqs')
      if (response.ok) {
        const data = await response.json()
        setFaqs(data.faqs)
        setCategories(data.categories)
        setExpandedCategories(new Set(data.categories))
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingFaq 
        ? `/api/admin/faqs/${editingFaq.id}`
        : '/api/admin/faqs'
      
      const response = await fetch(url, {
        method: editingFaq ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchFaqs()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save FAQ')
      }
    } catch (error) {
      console.error('Error saving FAQ:', error)
      alert('Failed to save FAQ')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await fetchFaqs()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
    }
  }

  const handleToggleActive = async (faq: FAQ) => {
    try {
      const response = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: 'PATCH',
      })
      if (response.ok) {
        await fetchFaqs()
      }
    } catch (error) {
      console.error('Error toggling FAQ:', error)
    }
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingFaq(null)
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      isActive: true,
    })
  }

  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = []
    }
    acc[faq.category].push(faq)
    return acc
  }, {} as Record<string, FAQ[]>)

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
          <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600 mt-1">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                  placeholder="Enter the question"
                />
              </div>
              <div>
                <Label htmlFor="answer">Answer *</Label>
                <textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                  placeholder="Enter the answer"
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="General"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
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
                <Button type="submit" disabled={isSaving || !formData.question || !formData.answer} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save FAQ'}
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
            <h3 className="text-lg font-semibold text-gray-900">Delete FAQ?</h3>
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

      {/* FAQs List */}
      {faqs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <HelpCircle className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No FAQs yet</h3>
          <p className="mt-2 text-gray-600">Create your first FAQ to help customers.</p>
          <Button onClick={() => setShowForm(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Add FAQ
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
            <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedCategories.has(category) ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                  <h3 className="font-semibold text-gray-900">{category}</h3>
                  <span className="text-sm text-gray-500">({categoryFaqs.length})</span>
                </div>
              </button>
              {expandedCategories.has(category) && (
                <div className="divide-y divide-gray-200">
                  {categoryFaqs.map((faq) => (
                    <div key={faq.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{faq.question}</h4>
                            {!faq.isActive && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                Hidden
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{faq.answer}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(faq)}
                            title={faq.isActive ? 'Hide FAQ' : 'Show FAQ'}
                          >
                            {faq.isActive ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(faq)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(faq.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
