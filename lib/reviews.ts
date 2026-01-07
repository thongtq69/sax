// Reviews/Testimonials - fetched from database via API
export interface Review {
  id: string
  productName: string
  buyerName: string
  rating: number
  message: string
  date: string
  sourceUrl?: string
}

// Cache for reviews to avoid repeated API calls
let reviewsCache: Review[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 10000 // 10 seconds cache (shorter for better sync)

// Clear cache to force refresh
export function clearReviewsCache(): void {
  reviewsCache = null
  cacheTimestamp = 0
}

// Fetch reviews from API
async function fetchReviewsFromAPI(): Promise<Review[]> {
  try {
    // Check cache first
    if (reviewsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return reviewsCache
    }

    const baseUrl = typeof window !== 'undefined' 
      ? '' 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/admin/testimonials?limit=100`, {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      console.error('Failed to fetch reviews:', response.status)
      return reviewsCache || []
    }
    
    const data = await response.json()
    
    // Transform API data to Review format
    const reviews: Review[] = (data.reviews || []).map((r: any) => ({
      id: r.id,
      productName: r.product?.name || r.customProductName || 'General Review',
      buyerName: r.buyerName,
      rating: r.rating,
      message: r.message || '',
      date: r.date ? new Date(r.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      sourceUrl: r.sourceUrl,
    }))
    
    // Update cache
    reviewsCache = reviews
    cacheTimestamp = Date.now()
    
    return reviews
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return reviewsCache || []
  }
}

// Hardcoded fallback reviews (used when API is not available)
const fallbackReviews: Review[] = [
  {
    id: '1',
    productName: 'Vintage Yamaha YTS-62 Tenor Saxophone',
    buyerName: 'Joseph T.',
    rating: 5,
    date: '2025-12-26',
    message: "Working with James to purchase a very nicely overhauled Yamaha 62 tenor was a pleasure! Awesome communication from day-1.",
  },
  {
    id: '2',
    productName: 'Vintage Yamaha YTS-62 Tenor Saxophone',
    buyerName: 'Zach E.',
    rating: 5,
    date: '2025-12-09',
    message: "This was the single best transaction I've had with an online seller. James sent me a 10 minute video minutes after contacting him.",
  },
]

// Get all reviews (for store-wide display) - async version
export async function getAllReviewsAsync(): Promise<Review[]> {
  const reviews = await fetchReviewsFromAPI()
  // Filter out reviews with empty messages
  return reviews.filter(r => r.message && r.message.trim().length > 0)
}

// Get all reviews - sync version (uses cache or fallback)
export function getAllReviews(): Review[] {
  // Return cached reviews if available, otherwise fallback
  if (reviewsCache && reviewsCache.length > 0) {
    return reviewsCache.filter(r => r.message && r.message.trim().length > 0)
  }
  
  // Trigger async fetch for next time
  if (typeof window !== 'undefined') {
    fetchReviewsFromAPI()
  }
  
  return fallbackReviews.filter(r => r.message && r.message.trim().length > 0)
}

// Get total review count (excluding empty messages)
export function getTotalReviewCount(): number {
  return getAllReviews().length
}

// Get average rating across all reviews
export function getAverageRating(): number {
  const validReviews = getAllReviews()
  if (validReviews.length === 0) return 0
  const total = validReviews.reduce((sum, r) => sum + r.rating, 0)
  return Math.round((total / validReviews.length) * 10) / 10
}

// Calculate rating and review count for a product
// Returns store-wide stats since all products share the same reviews
export function getProductRatingStats(_productName: string): { rating: number; reviewCount: number } {
  const validReviews = getAllReviews()
  
  if (validReviews.length === 0) {
    return { rating: 4.9, reviewCount: 35 } // Default fallback
  }
  
  const totalRating = validReviews.reduce((sum, r) => sum + r.rating, 0)
  const avgRating = totalRating / validReviews.length
  
  return {
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: validReviews.length,
  }
}

// Initialize reviews cache on module load (client-side only)
if (typeof window !== 'undefined') {
  fetchReviewsFromAPI()
}
