'use client'

import { useState, useEffect } from 'react'
import { Star, Plus, Trash2, ArrowLeft, Calendar, User, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Review {
  message: string
  rating: number
  author_name: string
  order_title: string
  created_at: string
  listing_url?: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newReview, setNewReview] = useState({
    author_name: '',
    order_title: '',
    message: '',
    rating: 5,
    created_at: new Date().toISOString().split('T')[0]
  })

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews')
      const data = await res.json()
      setReviews(data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReview,
          created_at: new Date(newReview.created_at).toISOString()
        })
      })
      
      if (res.ok) {
        setShowAddForm(false)
        setNewReview({
          author_name: '',
          order_title: '',
          message: '',
          rating: 5,
          created_at: new Date().toISOString().split('T')[0]
        })
        fetchReviews()
      }
    } catch (error) {
      console.error('Error adding review:', error)
    }
  }

  const handleDeleteReview = async (index: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    try {
      const res = await fetch(`/api/reviews?index=${index}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        fetchReviews()
      }
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Reviews Management</h1>
                <p className="text-sm text-gray-500">{reviews.length} total reviews</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-[#AFA65F] hover:bg-[#9a9254] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Add Review Form */}
        {showAddForm && (
          <div className="bg-white border mb-6 p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Review</h2>
            <form onSubmit={handleAddReview} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="h-4 w-4 inline mr-1" />
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={newReview.author_name}
                    onChange={(e) => setNewReview({ ...newReview, author_name: e.target.value })}
                    className="w-full px-3 py-2 border focus:ring-2 focus:ring-[#AFA65F] focus:border-transparent"
                    placeholder="e.g., John D."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Package className="h-4 w-4 inline mr-1" />
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newReview.order_title}
                    onChange={(e) => setNewReview({ ...newReview, order_title: e.target.value })}
                    className="w-full px-3 py-2 border focus:ring-2 focus:ring-[#AFA65F] focus:border-transparent"
                    placeholder="e.g., Yamaha YTS-62 Tenor Saxophone"
                    required
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={newReview.created_at}
                    onChange={(e) => setNewReview({ ...newReview, created_at: e.target.value })}
                    className="w-full px-3 py-2 border focus:ring-2 focus:ring-[#AFA65F] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Star className="h-4 w-4 inline mr-1" />
                    Rating
                  </label>
                  <div className="flex gap-1 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newReview.rating
                              ? 'fill-[#D4AF37] text-[#D4AF37]'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Message
                </label>
                <textarea
                  value={newReview.message}
                  onChange={(e) => setNewReview({ ...newReview, message: e.target.value })}
                  className="w-full px-3 py-2 border focus:ring-2 focus:ring-[#AFA65F] focus:border-transparent min-h-[120px]"
                  placeholder="Enter the customer's review..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-[#AFA65F] hover:bg-[#9a9254] text-white">
                  Save Review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#AFA65F] border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{review.author_name}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-[#D4AF37] text-[#D4AF37]'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{review.order_title}</p>
                    <p className="text-gray-700">
                      {review.message || <span className="italic text-gray-400">No message</span>}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReview(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
