'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, Pencil, Trash2, X, Save, MessageSquare, Star, Search
} from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
}

interface Review {
  id: string
  buyerName: string
  message: string
  rating: number
  date: string
  productId: string
  product: Product
  createdAt: string
  updatedAt: string
}

export default function TestimonialsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [formData, setFormData] = useState({
    buyerName: '',
    message: '',
    rating: 5,
    productId: '',
    customProductName: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filterRating, setFilterRating] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({})
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })

  useEffect(() => {
    fetchReviews()
    fetchProducts()
  }, [filterRating])

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams()
      if (filterRating) params.append('rating', filterRating)
      params.append('limit', '100')
      
      const response = await fetch(`/api/admin/testimonials?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
        setRatingDistribution(data.ratingDistribution || {})
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=500')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingReview 
        ? `/api/admin/testimonials/${editingReview.id}`
        : '/api/admin/testimonials'
      
      const response = await fetch(url, {
        method: editingReview ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchReviews()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save review')
      }
    } catch (error) {
      console.error('Error saving review:', error)
      alert('Failed to save review')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
    setFormData({
      buyerName: review.buyerName,
      message: review.message,
      rating: review.rating,
      productId: review.productId || '',
      customProductName: (review as any).customProductName || '',
      date: new Date(review.date).toISOString().split('T')[0],
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await fetchReviews()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingReview(null)
    setFormData({
      buyerName: '',
      message: '',
      rating: 5,
      productId: '',
      customProductName: '',
      date: new Date().toISOString().split('T')[0],
    })
  }

  const filteredReviews = reviews.filter(review => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      review.buyerName.toLowerCase().includes(search) ||
      review.message.toLowerCase().includes(search) ||
      review.product?.name.toLowerCase().includes(search)
    )
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Reviews / Testimonials</h1>
          <p className="text-gray-600 mt-1">Manage customer reviews and testimonials</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Review
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
        {[5, 4, 3, 2, 1].map(rating => (
          <div key={rating} className="bg-white rounded-lg border p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="font-bold">{rating}</span>
            </div>
            <div className="text-sm text-gray-600">{ratingDistribution[rating] || 0}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, message, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingReview ? 'Edit Review' : 'Add New Review'}
              </h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label htmlFor="buyerName">Customer Name *</Label>
                <Input
                  id="buyerName"
                  value={formData.buyerName}
                  onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                  required
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label htmlFor="productId">Product</Label>
                <select
                  id="productId"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value, customProductName: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a product (or enter custom below)</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="customProductName">Or Enter Custom Product Name</Label>
                <Input
                  id="customProductName"
                  value={formData.customProductName}
                  onChange={(e) => setFormData({ ...formData, customProductName: e.target.value, productId: '' })}
                  placeholder="e.g., Yamaha YAS-62 (from Reverb)"
                />
                <p className="text-xs text-gray-500 mt-1">Use this for reviews from external channels (Reverb, eBay, etc.)</p>
              </div>
              <div>
                <Label htmlFor="rating">Rating *</Label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= formData.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">{formData.rating} stars</span>
                </div>
              </div>
              <div>
                <Label htmlFor="message">Review Message *</Label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  placeholder="Enter the review message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="date">Review Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving || !formData.buyerName || !formData.message || (!formData.productId && !formData.customProductName)} 
                  className="flex-1 gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Review'}
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
            <h3 className="text-lg font-semibold text-gray-900">Delete Review?</h3>
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

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No reviews yet</h3>
          <p className="mt-2 text-gray-600">Add your first customer review.</p>
          <Button onClick={() => setShowForm(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Add Review
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900">{review.buyerName}</span>
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{review.message}</p>
                    {(review.product || (review as any).customProductName) && (
                      <p className="text-sm text-primary mt-1">
                        Product: {review.product?.name || (review as any).customProductName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(review)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(review.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
