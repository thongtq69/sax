'use client'

import { useState, useEffect } from 'react'
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, transformBlogPost } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Code2,
  Edit,
  Eye,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  User,
  Calendar,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { RichTextEditor, sanitizeHtmlDesign, type HtmlImportLog } from '@/components/admin/RichTextEditor'
import { SingleImageUpload } from '@/components/admin/ImageUpload'
import { HtmlFileUploadButton, formatHtmlFileSize } from '@/components/admin/HtmlFileUploadButton'

const blogCategories = [
  { slug: 'instruments', name: 'Instruments', icon: '🎷' },
  { slug: 'techniques', name: 'Techniques', icon: '🎵' },
  { slug: 'reviews', name: 'Reviews', icon: '⭐' },
  { slug: 'maintenance', name: 'Maintenance', icon: '🔧' },
  { slug: 'history', name: 'History', icon: '📜' },
  { slug: 'news', name: 'News', icon: '📰' },
]

function cleanImportedText(text: string | null | undefined) {
  return (text || '').replace(/\s+/g, ' ').trim()
}

function trimSiteTitle(title: string) {
  return title
    .replace(/\s+[\-|]\s+James Sax Corner$/i, '')
    .replace(/\s+[\-|]\s+Sax Corner$/i, '')
    .trim()
}

function getHtmlPostMetadata(html: string) {
  if (typeof window === 'undefined') return { title: '', excerpt: '' }

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const metaTags = Array.from(doc.querySelectorAll('meta'))
    const metaDescription = cleanImportedText(
      metaTags.find((meta) => {
        const name = meta.getAttribute('name')?.toLowerCase()
        const property = meta.getAttribute('property')?.toLowerCase()
        return name === 'description' || property === 'og:description'
      })?.getAttribute('content')
    )
    const ogTitle = cleanImportedText(
      metaTags.find((meta) => meta.getAttribute('property')?.toLowerCase() === 'og:title')?.getAttribute('content')
    )
    const documentTitle = cleanImportedText(doc.querySelector('title')?.textContent)
    const headingTitle = cleanImportedText(doc.body.querySelector('h1')?.textContent)
    const firstUsefulParagraph = Array.from(doc.body.querySelectorAll('p'))
      .map((paragraph) => cleanImportedText(paragraph.textContent))
      .find((text) => text.length >= 60)

    return {
      title: trimSiteTitle(ogTitle || documentTitle || headingTitle),
      excerpt: metaDescription || firstUsefulParagraph || '',
    }
  } catch {
    return { title: '', excerpt: '' }
  }
}

export default function BlogManagement() {
  const [postList, setPostList] = useState<any[]>([])
  const [filteredPosts, setFilteredPosts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPost, setEditingPost] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState('content')
  const [htmlCode, setHtmlCode] = useState('')
  const [htmlImportLogs, setHtmlImportLogs] = useState<HtmlImportLog[]>([])
  const [htmlPreview, setHtmlPreview] = useState('')
  const [htmlImportMode, setHtmlImportMode] = useState<'replace' | 'append'>('replace')
  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
    categories: [],
    image: '',
    readTime: 0,
    status: 'published',
    scheduledAt: '',
  })

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const response = await getBlogPosts({ limit: 1000, includeAll: true })
        const transformed = response.posts.map(transformBlogPost)
        setPostList(transformed)
        setFilteredPosts(transformed)
      } catch (error) {
        console.error('Error fetching blog posts:', error)
        alert('Failed to load blog posts. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = postList

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => 
        p.categories?.includes(selectedCategory)
      )
    }

    setFilteredPosts(filtered)
  }, [searchTerm, selectedCategory, postList])

  const handleOpenDialog = (post?: any) => {
    if (post) {
      setEditingPost(post)
      setFormData({
        ...post,
        date: post.date ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: post.status || 'published',
        scheduledAt: post.scheduledAt
          ? new Date(post.scheduledAt).toISOString().slice(0, 16)
          : '',
      })
    } else {
      setEditingPost(null)
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        author: '',
        categories: [],
        image: '',
        readTime: 0,
        status: 'published',
        scheduledAt: '',
      })
    }
    setHtmlCode('')
    setHtmlImportLogs([])
    setHtmlPreview('')
    setHtmlImportMode('replace')
    setActiveTab('content')
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    // Validation
    if (!formData.title?.trim()) {
      alert('Title is required')
      return
    }
    if (!formData.author?.trim()) {
      alert('Author is required')
      return
    }
    if (!formData.content?.trim()) {
      alert('Content is required')
      return
    }

    try {
      setIsSaving(true)
      
      const status = formData.status || 'published'
      const scheduledAtIso = status === 'scheduled' && formData.scheduledAt
        ? new Date(formData.scheduledAt).toISOString()
        : null

      if (status === 'scheduled' && !scheduledAtIso) {
        alert('Please pick a scheduled publish date/time')
        setIsSaving(false)
        return
      }

      const postData = {
        title: formData.title,
        slug: formData.slug || formData.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '',
        excerpt: formData.excerpt || formData.content?.substring(0, 150) + '...',
        content: formData.content,
        date: formData.date,
        author: formData.author,
        categories: formData.categories || [],
        image: formData.image || null,
        readTime: formData.readTime || Math.ceil(formData.content.split(/\s+/).length / 200),
        status,
        scheduledAt: scheduledAtIso,
      }

      if (editingPost) {
        await updateBlogPost(editingPost.id, postData)
      } else {
        await createBlogPost(postData)
      }

      // Refresh data
      const response = await getBlogPosts({ limit: 1000, includeAll: true })
      const transformed = response.posts.map(transformBlogPost)
      setPostList(transformed)
      
      setIsDialogOpen(false)
      setEditingPost(null)
    } catch (error: any) {
      console.error('Error saving blog post:', error)
      alert(error.message || 'Failed to save blog post. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return
    }

    try {
      await deleteBlogPost(id)
      
      // Refresh data
      const response = await getBlogPosts({ limit: 1000, includeAll: true })
      const transformed = response.posts.map(transformBlogPost)
      setPostList(transformed)
    } catch (error: any) {
      console.error('Error deleting blog post:', error)
      alert(error.message || 'Failed to delete blog post. Please try again.')
    }
  }

  const toggleCategory = (category: string) => {
    const current = formData.categories || []
    if (current.includes(category)) {
      setFormData({ ...formData, categories: current.filter((c: string) => c !== category) })
    } else {
      setFormData({ ...formData, categories: [...current, category] })
    }
  }

  const handleValidateHtml = () => {
    const result = sanitizeHtmlDesign(htmlCode)
    setHtmlPreview(result.html)
    setHtmlImportLogs(result.logs)
    return result
  }

  const loadHtmlIntoPost = (html: string, sourceHtml = html) => {
    const metadata = getHtmlPostMetadata(sourceHtml)

    setFormData((current: any) => ({
      ...current,
      title: current.title?.trim() ? current.title : metadata.title,
      excerpt: current.excerpt?.trim() ? current.excerpt : metadata.excerpt,
      author: current.author?.trim() ? current.author : 'James',
      content:
        htmlImportMode === 'append' && current.content
          ? `${current.content}\n${html}`
          : html,
    }))
  }

  const handleHtmlFileLoad = ({ file, text }: { file: File; text: string }) => {
    const result = sanitizeHtmlDesign(text)
    setHtmlCode(text)
    setHtmlPreview(result.html)
    if (!result.logs.some((log) => log.level === 'error')) {
      loadHtmlIntoPost(result.html, text)
    }
    setHtmlImportLogs([
      {
        level: 'info',
        message: `Loaded HTML file "${file.name}" (${formatHtmlFileSize(file.size)}).`,
      },
      ...result.logs,
      ...(result.logs.some((log) => log.level === 'error')
        ? []
        : [
            {
              level: 'info' as const,
              message: htmlImportMode === 'append'
                ? 'HTML appended to the post content from file.'
                : 'HTML loaded into the post content from file.',
            },
          ]),
    ])
  }

  const handleLoadHtml = () => {
    const result = handleValidateHtml()

    if (result.logs.some((log) => log.level === 'error')) {
      return
    }

    loadHtmlIntoPost(result.html, htmlCode)

    setHtmlImportLogs([
      ...result.logs,
      {
        level: 'info',
        message: htmlImportMode === 'append' ? 'HTML appended to the post content.' : 'HTML loaded into the post content.',
      },
    ])
  }

  const htmlPreviewDocument = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { margin: 0; padding: 24px; font-family: Arial, sans-serif; color: #111827; background: #fff; }
      img { max-width: 100%; height: auto; }
      table { max-width: 100%; border-collapse: collapse; }
    </style>
  </head>
  <body>${htmlPreview || '<p style="color:#6b7280">No preview yet.</p>'}</body>
</html>`

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">Manage your blog content ({postList.length} posts)</p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="lg" className="w-full sm:w-auto">
          <Plus className="h-5 w-5 mr-2" />
          New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {blogCategories.map((cat) => (
              <Button
                key={cat.slug}
                variant={selectedCategory === cat.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredPosts.length} of {postList.length} posts
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No blog posts found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first blog post to get started</p>
            <Button onClick={() => handleOpenDialog()} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="h-48 relative bg-gray-100">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    <Button size="sm" variant="secondary">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button size="sm" variant="secondary" onClick={() => handleOpenDialog(post)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {/* Categories */}
                {post.categories?.length > 0 && (
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {post.categories.slice(0, 2).map((cat: string) => (
                      <span key={cat} className="bg-white/90 text-xs px-2 py-1 rounded-full font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">{post.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                  {post.readTime > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime} min
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Blog Post Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="html">AI HTML</TabsTrigger>
              <TabsTrigger value="media">Featured Image</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter a compelling title..."
                  className="text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  className="w-full min-h-[80px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief summary of your post (auto-generated if empty)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  content={formData.content || ''}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Start writing your blog post... You can paste content from Word or Google Docs and it will automatically format correctly."
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: You can paste content directly from Microsoft Word or Google Docs. The editor will automatically clean and format it.
                </p>
              </div>
            </TabsContent>

            {/* AI HTML Tab */}
            <TabsContent value="html" className="space-y-4 mt-6">
              <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Auto-filled from HTML title or H1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="James"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    className="w-full min-h-[72px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Auto-filled from meta description or first paragraph"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-gray-900">AI HTML Import</h3>
                  </div>
                  <div className="flex rounded-md border border-gray-200 p-1">
                    {[
                      { value: 'replace', label: 'Replace' },
                      { value: 'append', label: 'Append' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setHtmlImportMode(option.value as 'replace' | 'append')}
                        className={`rounded px-3 py-1 text-sm font-medium ${
                          htmlImportMode === option.value
                            ? 'bg-primary text-primary-foreground'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 p-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="block text-sm font-medium text-gray-700">
                        HTML code
                      </label>
                      <HtmlFileUploadButton
                        onLoad={handleHtmlFileLoad}
                        onError={(message) => alert(message)}
                      />
                    </div>
                    <textarea
                      value={htmlCode}
                      onChange={(event) => setHtmlCode(event.target.value)}
                      spellCheck={false}
                      className="min-h-[360px] w-full rounded-lg border border-gray-300 bg-gray-950 px-4 py-3 font-mono text-sm text-gray-100 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="<section style=&quot;padding: 32px; ...&quot;>...</section>"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={handleValidateHtml}>
                        Validate
                      </Button>
                      <Button type="button" onClick={handleLoadHtml} disabled={!htmlCode.trim()}>
                        Load into Post
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Clean preview
                    </label>
                    <iframe
                      title="AI HTML preview"
                      srcDoc={htmlPreviewDocument}
                      className="h-[360px] w-full rounded-lg border border-gray-300 bg-white"
                      sandbox=""
                    />
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                        {htmlImportLogs.some((log) => log.level === 'error') ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                        Import log
                      </div>
                      <div className="max-h-40 space-y-2 overflow-y-auto text-sm">
                        {htmlImportLogs.length === 0 ? (
                          <p className="text-gray-500">No log yet.</p>
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
                </div>
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload an image or add from URL. This will be displayed at the top of your post.
                </p>
                <SingleImageUpload
                  image={formData.image}
                  onChange={(image) => setFormData({ ...formData, image })}
                  folder="sax/blog"
                />
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Enter author name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publish Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Auto-generated from title"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Read Time (minutes)
                  </label>
                  <Input
                    type="number"
                    value={formData.readTime || ''}
                    onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 0 })}
                    placeholder="Auto-calculated if empty"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Publish Status
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { value: 'draft', label: '📝 Draft', desc: 'Save without publishing' },
                    { value: 'scheduled', label: '⏰ Schedule', desc: 'Auto-publish at a future time' },
                    { value: 'published', label: '✅ Published', desc: 'Live now' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: opt.value })}
                      title={opt.desc}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.status === opt.value
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {formData.status === 'scheduled' && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled publish date/time <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduledAt || ''}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Post will automatically go live at this time. Uses server timezone.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {blogCategories.map((cat) => {
                    const isSelected = formData.categories?.includes(cat.name)
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => toggleCategory(cat.name)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat.icon} {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingPost
                  ? 'Update Post'
                  : formData.status === 'draft'
                    ? 'Save Draft'
                    : formData.status === 'scheduled'
                      ? 'Schedule Post'
                      : 'Publish Post'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
