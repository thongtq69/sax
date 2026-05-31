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
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2, Code2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { SingleImageUpload } from '@/components/admin/ImageUpload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { sanitizeHtmlDesign, type HtmlImportLog } from '@/components/admin/RichTextEditor'
import { HtmlFileUploadButton, formatHtmlFileSize } from '@/components/admin/HtmlFileUploadButton'

interface PopupAd {
    id: string
    title: string
    description: string | null
    image: string | null
    ctaText: string | null
    ctaLink: string | null
    isHtml: boolean
    htmlContent: string | null
    isActive: boolean
}

export default function PopupAdManagement() {
    const [popupAds, setPopupAds] = useState<PopupAd[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<PopupAd | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('content')
    const [htmlCode, setHtmlCode] = useState('')
    const [htmlImportLogs, setHtmlImportLogs] = useState<HtmlImportLog[]>([])
    const [htmlPreview, setHtmlPreview] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '' as string | null,
        ctaText: 'Xem ngay',
        ctaLink: '/',
        isHtml: false,
        htmlContent: '',
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
            isHtml: false,
            htmlContent: '',
            isActive: true,
        })
        setHtmlCode('')
        setHtmlPreview('')
        setHtmlImportLogs([])
        setActiveTab('content')
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
            description: item.description || '',
            image: item.image,
            ctaText: item.ctaText || 'Xem ngay',
            ctaLink: item.ctaLink || '/',
            isHtml: item.isHtml ?? false,
            htmlContent: item.htmlContent || '',
            isActive: item.isActive,
        })
        setHtmlCode(item.htmlContent || '')
        setHtmlPreview(item.htmlContent || '')
        setHtmlImportLogs([])
        setActiveTab(item.isHtml ? 'html' : 'content')
        setDialogOpen(true)
    }

    const handleValidateHtml = () => {
        const result = sanitizeHtmlDesign(htmlCode)
        setHtmlPreview(result.html)
        setHtmlImportLogs(result.logs)
        return result
    }

    const handleHtmlFileLoad = ({ file, text }: { file: File; text: string }) => {
        const result = sanitizeHtmlDesign(text)
        setHtmlCode(text)
        setHtmlPreview(result.html)
        setHtmlImportLogs([
            {
                level: 'info',
                message: `Loaded HTML file "${file.name}" (${formatHtmlFileSize(file.size)}).`,
            },
            ...result.logs,
        ])
    }

    const handleLoadHtml = () => {
        const result = handleValidateHtml()

        if (result.logs.some((log) => log.level === 'error')) {
            return
        }

        setFormData((current) => ({
            ...current,
            htmlContent: result.html,
        }))

        setHtmlImportLogs([
            ...result.logs,
            {
                level: 'info',
                message: 'HTML successfully loaded. Click Update/Create to save.',
            },
        ])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error('Title is required')
            return
        }

        let submissionData = { ...formData }

        if (formData.isHtml) {
            // Auto-load/sanitize HTML from code editor if not yet loaded or updated
            const result = sanitizeHtmlDesign(htmlCode)
            if (result.logs.some((log) => log.level === 'error')) {
                toast.error('HTML content has errors. Please check the AI HTML tab.')
                setActiveTab('html')
                return
            }
            if (!result.html.trim()) {
                toast.error('HTML content is required for custom HTML popups')
                setActiveTab('html')
                return
            }
            submissionData.htmlContent = result.html
        } else {
            if (!formData.image) {
                toast.error('Image is required for standard template')
                return
            }
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
                body: JSON.stringify(submissionData),
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

    const htmlPreviewDocument = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { margin: 0; padding: 16px; font-family: Arial, sans-serif; color: #111827; background: #fff; }
      img { max-width: 100%; height: auto; }
      table { max-width: 100%; border-collapse: collapse; }
    </style>
  </head>
  <body>${htmlPreview || '<p style="color:#6b7280">No preview yet.</p>'}</body>
</html>`

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
                                <TableHead>Image / Type</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead className="hidden md:table-cell">Details</TableHead>
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
                                            {item.isHtml ? (
                                                <div className="flex items-center justify-center h-12 w-20 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase">
                                                    HTML
                                                </div>
                                            ) : (
                                                <div className="relative h-12 w-20 rounded overflow-hidden bg-gray-100">
                                                    {item.image ? (
                                                        <Image
                                                            src={item.image}
                                                            alt={item.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full w-full text-xs text-gray-400">No Image</div>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell className="hidden md:table-cell max-w-xs truncate">
                                            {item.isHtml ? 'Custom HTML Template' : item.description}
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit Popup Ad' : 'Add Popup Ad'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        {/* Title & Type Selection placed globally at the top */}
                        <div className="space-y-4 pb-4 border-b border-gray-100">
                            <div>
                                <Label htmlFor="title" className="font-semibold text-gray-900">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Special Offer!"
                                    className="mt-1.5"
                                />
                            </div>

                            <div className="flex items-center gap-2.5 py-1">
                                <Switch
                                    id="isHtml"
                                    checked={formData.isHtml}
                                    onCheckedChange={(checked) => {
                                        setFormData({ ...formData, isHtml: checked })
                                        setActiveTab(checked ? 'html' : 'content')
                                    }}
                                />
                                <Label htmlFor="isHtml" className="font-semibold text-gray-800 cursor-pointer">
                                    Use Custom HTML Template
                                </Label>
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-2 w-full">
                                {formData.isHtml ? (
                                    <TabsTrigger value="html">AI HTML</TabsTrigger>
                                ) : (
                                    <TabsTrigger value="content">Content</TabsTrigger>
                                )}
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>

                            <TabsContent value="content" className="space-y-4 mt-4">
                                {!formData.isHtml ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="mb-2 block font-semibold text-gray-900">Popup Image *</Label>
                                            <SingleImageUpload
                                                image={formData.image}
                                                onChange={(image) => setFormData({ ...formData, image })}
                                                folder="sax/popups"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="description" className="font-semibold text-gray-900">Description (optional)</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Describe your promotion..."
                                                rows={3}
                                                className="mt-1.5"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="ctaText" className="font-semibold text-gray-900">Button Text</Label>
                                                <Input
                                                    id="ctaText"
                                                    value={formData.ctaText}
                                                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                                    placeholder="e.g., Xem ngay"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="ctaLink" className="font-semibold text-gray-900">Button Link</Label>
                                                <Input
                                                    id="ctaLink"
                                                    value={formData.ctaLink}
                                                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                                                    placeholder="e.g., /shop"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900 text-sm">
                                        <p className="font-semibold">Custom HTML Mode Enabled</p>
                                        <p className="mt-1 text-xs">Please go to the <strong>AI HTML</strong> tab to write or paste your custom HTML code.</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="html" className="space-y-4 mt-4">
                                <div className="rounded-lg border border-gray-200 bg-white">
                                    <div className="flex items-center gap-2 border-b border-gray-200 p-4">
                                        <Code2 className="h-5 w-5 text-primary" />
                                        <h3 className="font-semibold text-gray-900">Custom HTML Code</h3>
                                    </div>

                                    <div className="grid gap-4 p-4 lg:grid-cols-2">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <Label className="block text-sm font-medium text-gray-700">
                                                    HTML / CSS Code
                                                </Label>
                                                <HtmlFileUploadButton
                                                    onLoad={handleHtmlFileLoad}
                                                    onError={(message) => toast.error(message)}
                                                />
                                            </div>
                                            <textarea
                                                value={htmlCode}
                                                onChange={(event) => setHtmlCode(event.target.value)}
                                                spellCheck={false}
                                                className="min-h-[300px] w-full rounded-lg border border-gray-300 bg-gray-950 px-4 py-3 font-mono text-sm text-gray-100 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                                placeholder={`<div style="padding: 24px; text-align: center; background: linear-gradient(to right, #f43f5e, #e11d48); color: white; border-radius: 16px;">\n  <h2>Custom Flash Sale!</h2>\n  <p>Get 20% off all saxophones</p>\n</div>`}
                                            />
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" size="sm" onClick={handleValidateHtml}>
                                                    Validate
                                                </Button>
                                                <Button type="button" size="sm" onClick={handleLoadHtml} disabled={!htmlCode.trim()}>
                                                    Load HTML
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="block text-sm font-medium text-gray-700">
                                                Clean Preview
                                            </Label>
                                            <iframe
                                                title="HTML preview"
                                                srcDoc={htmlPreviewDocument}
                                                className="h-[300px] w-full rounded-lg border border-gray-300 bg-white"
                                                sandbox=""
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
                                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                            {htmlImportLogs.some((log) => log.level === 'error') ? (
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            )}
                                            Import Log
                                        </div>
                                        <div className="max-h-32 space-y-2 overflow-y-auto text-sm">
                                            {htmlImportLogs.length === 0 ? (
                                                <p className="text-gray-500">No logs yet. Enter HTML and click Validate or Load.</p>
                                            ) : (
                                                htmlImportLogs.map((log, index) => (
                                                    <div
                                                        key={`${log.level}-${index}`}
                                                        className={`rounded border px-3 py-2 ${
                                                            log.level === 'error'
                                                                ? 'border-red-200 bg-red-50 text-red-800'
                                                                : log.level === 'warning'
                                                                ? 'border-amber-200 bg-amber-50 text-amber-800'
                                                                : 'border-blue-200 bg-blue-50 text-blue-800'
                                                        }`}
                                                    >
                                                        {log.message}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="settings" className="space-y-4 mt-4">
                                <div className="flex items-center gap-2 py-4">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                    />
                                    <Label htmlFor="isActive">Active (Display on Homepage)</Label>
                                </div>
                            </TabsContent>
                        </Tabs>

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
