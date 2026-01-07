'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2, GripVertical, Save, X, Loader2, MessageSquareText, Check } from 'lucide-react'

interface InquiryTitle {
  id: string
  title: string
  order: number
  isActive: boolean
}

export default function InquiryTitlesPage() {
  const [titles, setTitles] = useState<InquiryTitle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', order: 0, isActive: true })
  const [newTitle, setNewTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const fetchTitles = async () => {
    try {
      const response = await fetch('/api/admin/inquiry-titles')
      if (response.ok) {
        const data = await response.json()
        setTitles(data)
      }
    } catch (error) {
      console.error('Error fetching titles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTitles()
  }, [])

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/inquiry-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, order: titles.length }),
      })
      if (response.ok) {
        setNewTitle('')
        setIsAdding(false)
        fetchTitles()
      }
    } catch (error) {
      console.error('Error adding title:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (title: InquiryTitle) => {
    setEditingId(title.id)
    setEditForm({ title: title.title, order: title.order, isActive: title.isActive })
  }

  const handleSave = async () => {
    if (!editingId) return
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/inquiry-titles/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (response.ok) {
        setEditingId(null)
        fetchTitles()
      }
    } catch (error) {
      console.error('Error updating title:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry title?')) return
    try {
      const response = await fetch(`/api/admin/inquiry-titles/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchTitles()
      }
    } catch (error) {
      console.error('Error deleting title:', error)
    }
  }

  const handleToggleActive = async (title: InquiryTitle) => {
    try {
      await fetch(`/api/admin/inquiry-titles/${title.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !title.isActive }),
      })
      fetchTitles()
    } catch (error) {
      console.error('Error toggling active:', error)
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquareText className="h-6 w-6 text-primary" />
            Inquiry Titles
          </h1>
          <p className="text-muted-foreground">Manage inquiry type options shown in the product inquiry form</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Add Title
        </Button>
      </div>

      {/* Add new title form */}
      {isAdding && (
        <div className="bg-white rounded-lg border p-4 flex items-center gap-3">
          <Input
            placeholder="Enter inquiry title (e.g., Price Inquiry, Shipping Question)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button onClick={handleAdd} disabled={isSaving || !newTitle.trim()}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={() => { setIsAdding(false); setNewTitle('') }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Titles list */}
      <div className="bg-white rounded-lg border divide-y">
        {titles.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquareText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No inquiry titles yet. Add your first one!</p>
          </div>
        ) : (
          titles.map((title) => (
            <div key={title.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
              <GripVertical className="h-5 w-5 text-gray-300 cursor-grab" />
              
              {editingId === title.id ? (
                <>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={editForm.order}
                    onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) || 0 })}
                    className="w-20"
                    placeholder="Order"
                  />
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <span className={`font-medium ${!title.isActive ? 'text-gray-400 line-through' : ''}`}>
                      {title.title}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">Order: {title.order}</span>
                  </div>
                  <button
                    onClick={() => handleToggleActive(title)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      title.isActive ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                      title.isActive ? 'left-5' : 'left-1'
                    }`} />
                  </button>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(title)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(title.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Preview */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-medium text-amber-800 mb-2">Preview in Inquiry Form</h3>
        <p className="text-sm text-amber-700">
          Active titles will appear as dropdown options in the product inquiry form. 
          Customers can select the type of inquiry they want to make.
        </p>
      </div>
    </div>
  )
}
