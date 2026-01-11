'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, GripVertical, Megaphone } from 'lucide-react'
import { toast } from 'sonner'

interface Announcement {
  id: string
  title: string
  description: string
  ctaText: string | null
  ctaLink: string | null
  order: number
  isActive: boolean
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ctaText: '',
    ctaLink: '',
    isActive: true,
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements')
      const data = await res.json()
      setAnnouncements(data)
    } catch (error) {
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }


  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      ctaText: '',
      ctaLink: '',
      isActive: true,
    })
    setEditingItem(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (item: Announcement) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      ctaText: item.ctaText || '',
      ctaLink: item.ctaLink || '',
      isActive: item.isActive,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required')
      return
    }

    try {
      const url = editingItem
        ? `/api/admin/announcements/${editingItem.id}`
        : '/api/admin/announcements'
      
      const method = editingItem ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          order: editingItem?.order ?? announcements.length,
        }),
      })

      if (!res.ok) throw new Error('Failed to save')

      toast.success(editingItem ? 'Announcement updated' : 'Announcement created')
      setDialogOpen(false)
      resetForm()
      fetchAnnouncements()
    } catch (error) {
      toast.error('Failed to save announcement')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast.success('Announcement deleted')
      fetchAnnouncements()
    } catch (error) {
      toast.error('Failed to delete announcement')
    }
  }

  const toggleActive = async (item: Announcement) => {
    try {
      const res = await fetch(`/api/admin/announcements/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          isActive: !item.isActive,
        }),
      })

      if (!res.ok) throw new Error('Failed to update')

      toast.success(`Announcement ${!item.isActive ? 'enabled' : 'disabled'}`)
      fetchAnnouncements()
    } catch (error) {
      toast.error('Failed to update announcement')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcement Bar</h1>
          <p className="text-gray-500">Manage the rotating announcements at the top of your site</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Announcement' : 'Add Announcement'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Professional Setup"
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Every instrument professionally set up before shipping"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ctaText">Button Text (optional)</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="e.g., Shop Now"
                  />
                </div>
                <div>
                  <Label htmlFor="ctaLink">Button Link (optional)</Label>
                  <Input
                    id="ctaLink"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    placeholder="e.g., /shop"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-[#2f3f4f] text-white rounded-lg p-3 text-center">
            {announcements.filter(a => a.isActive).length > 0 ? (
              <div className="text-sm">
                <span className="font-semibold text-[#D4AF37] uppercase tracking-wider">
                  {announcements.find(a => a.isActive)?.title}
                </span>
                <span className="mx-2 text-white/50">-</span>
                <span className="text-white/85">
                  {announcements.find(a => a.isActive)?.description}
                </span>
              </div>
            ) : (
              <span className="text-white/50 text-sm">No active announcements</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="hidden sm:table-cell">Button</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No announcements yet. Add your first one!
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((item) => (
                  <TableRow key={item.id} className={!item.isActive ? 'opacity-50' : ''}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">
                      {item.description}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {item.ctaText ? (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {item.ctaText}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() => toggleActive(item)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
