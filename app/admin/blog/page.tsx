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
import { Plus, Edit, Trash2, Search, FileText, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

const blogCategories = [
  { slug: 'instruments', name: 'Instruments' },
  { slug: 'techniques', name: 'Techniques' },
  { slug: 'reviews', name: 'Reviews' },
  { slug: 'maintenance', name: 'Maintenance' },
  { slug: 'history', name: 'History' },
  { slug: 'news', name: 'News' },
]

export default function BlogManagement() {
  const [postList, setPostList] = useState<any[]>([])
  const [filteredPosts, setFilteredPosts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPost, setEditingPost] = useState<any | null>(null)
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
  })

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const response = await getBlogPosts({ limit: 1000 })
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

    setFilteredPosts(filtered)
  }, [searchTerm, postList])

  const handleOpenDialog = (post?: any) => {
    if (post) {
      setEditingPost(post)
      setFormData({
        ...post,
        date: post.date ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const postData = {
        title: formData.title,
        slug: formData.slug || formData.title?.toLowerCase().replace(/\s+/g, '-') || '',
        excerpt: formData.excerpt,
        content: formData.content,
        date: formData.date,
        author: formData.author,
        categories: formData.categories || [],
        image: formData.image || null,
        readTime: formData.readTime || null,
      }

      if (editingPost) {
        await updateBlogPost(editingPost.id, postData)
      } else {
        await createBlogPost(postData)
      }

      // Refresh data
      const response = await getBlogPosts({ limit: 1000 })
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
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return
    }

    try {
      await deleteBlogPost(id)
      
      // Refresh data
      const response = await getBlogPosts({ limit: 1000 })
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
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts Management</h1>
          <p className="text-gray-600 mt-2">Manage your blog content</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search blog posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No blog posts found</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {post.image && (
                <div className="h-48 relative bg-gray-100">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{post.author}</span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(post)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
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
            <DialogTitle>
              {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Auto-generated from title"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author *
                </label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Enter author name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt *
              </label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Enter post excerpt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/images/blog/example.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Read Time (minutes)
              </label>
              <Input
                type="number"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 0 })}
                placeholder="5"
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
                editingPost ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
