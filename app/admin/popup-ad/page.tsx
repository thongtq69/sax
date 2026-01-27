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
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Megaphone, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { SingleImageUpload } from '@/components/admin/ImageUpload'

interface PopupAd {
    id: string
    title: string
    description: string
    image: string
    ctaText: string | null
    ctaLink: string | null
    isActive: boolean
}

export default function PopupAdManagement() {
    const [popupAds, setPopupAds] = useState<PopupAd[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<PopupAd | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '' as string | null,
        ctaText: 'Xem ngay',
        ctaLink: '/',
        isActive: true,
    })

    useEffect(() => {
        fetchPopupAds()
    }, [])

    const fetchPopupAds = async () => {
        try {
            const res = await fetch('/api/admin/popup-ad')
            const data = await res.json()
            setPopupAds(data)
        } catch (error) {
            toast.error('Failed to load popup ads')
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            image: '' as string | null,
            ctaText: 'Xem ngay',
            ctaLink: '/',
            isActive: true,
        })
        setEditingItem(null)
    }

    const openCreateDialog = () => {
        resetForm()
        setDialogOpen(true)
    }

    const openEditDialog = (item: PopupAd) => {
        setEditingItem(item)
        setFormData({
            title: item.title,
            description: item.description,
            image: item.image,
            ctaText: item.ctaText || 'Xem ngay',
            ctaLink: item.ctaLink || '/',
            isActive: item.isActive,
        })
        setDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error('Title is required')
            return
        }
        if (!formData.image) {
            toast.error('Image is required')
            return
        }

        try {
            setIsSaving(true)
            const url = editingItem
                ? `/api/admin/popup-ad/${editingItem.id}`
                : '/api/admin/popup-ad'

            const method = editingItem ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) throw new Error('Failed to save')

            toast.success(editingItem ? 'Popup ad updated' : 'Popup ad created')
            setDialogOpen(false)
            resetForm()
            fetchPopupAds()
        } catch (error) {
            toast.error('Failed to save popup ad')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this popup ad?')) return

        try {
            const res = await fetch(`/api/admin/popup-ad/${id}`, {
                method: 'DELETE',
            })

            if (!res.ok) throw new Error('Failed to delete')

            toast.success('Popup ad deleted')
            fetchPopupAds()
        } catch (error) {
            toast.error('Failed to delete popup ad')
        }
    }

    const toggleActive = async (item: PopupAd) => {
        try {
            const res = await fetch(`/api/admin/popup-ad/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...item,
                    isActive: !item.isActive,
                }),
            })

            if (!res.ok) throw new Error('Failed to update')

            toast.success(`Popup ad ${!item.isActive ? 'enabled' : 'disabled'}`)
            fetchPopupAds()
        } catch (error) {
            toast.error('Failed to update popup ad')
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
                    <h1 className="text-2xl font-bold">Popup Advertisements</h1>
                    <p className="text-gray-500">Manage popups that appear on the homepage for new users</p>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Popup Ad
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead className="hidden md:table-cell">Description</TableHead>
                                <TableHead className="w-20">Active</TableHead>
                                <TableHead className="w-24">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {popupAds.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        No popup ads yet. Add your first one!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                popupAds.map((item) => (
                                    <TableRow key={item.id} className={!item.isActive ? 'opacity-50' : ''}>
                                        <TableCell>
                                            <div className="relative h-12 w-20 rounded overflow-hidden bg-gray-100">
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell className="hidden md:table-cell max-w-xs truncate">
                                            {item.description}
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

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit Popup Ad' : 'Add Popup Ad'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div>
                            <Label className="mb-2 block">Popup Image *</Label>
                            <SingleImageUpload
                                image={formData.image}
                                onChange={(image) => setFormData({ ...formData, image })}
                                folder="sax/popups"
                            />
                        </div>

                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Special Offer!"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description (optional)</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe your promotion..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="ctaText">Button Text</Label>
                                <Input
                                    id="ctaText"
                                    value={formData.ctaText}
                                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                    placeholder="e.g., Xem ngay"
                                />
                            </div>
                            <div>
                                <Label htmlFor="ctaLink">Button Link</Label>
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

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    editingItem ? 'Update' : 'Create'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
