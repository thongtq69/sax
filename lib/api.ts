// API Client helpers for fetching data from API routes

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// Helper function to generate URL-friendly slug from product name
export function generateProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Helper function to generate product URL with SKU and slug
// Format: /product/SKU-slug (e.g., /product/JSC-C143LF-yamaha-yts-62-tenor-saxophone)
export function getProductUrl(sku: string, slug: string): string {
  return `/product/${sku}-${slug}`
}

// Helper function to extract SKU from URL parameter (handles both old and new format)
export function extractSkuFromParam(param: string): string {
  // Decode URL-encoded characters first
  const decoded = decodeURIComponent(param)
  
  // If param contains JSC- prefix, extract just the SKU part
  // SKU format: JSC-XXXXXX (JSC- followed by alphanumeric)
  const jscMatch = decoded.match(/^(JSC-[A-Z0-9]+)/i)
  if (jscMatch) {
    return jscMatch[1]
  }
  
  // For non-JSC SKUs (like TEST-PRODUCT-10), try to match the SKU pattern
  // Look for pattern like WORD-WORD-NUMBER at the start
  const genericMatch = decoded.match(/^([A-Z]+-[A-Z]+-\d+)/i)
  if (genericMatch) {
    return genericMatch[1]
  }
  
  // Fallback: return the whole param (for old URLs or simple SKUs)
  return decoded
}

// Helper function to fetch from API
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const response = await fetch(url, {
    ...options,
    cache: 'no-store', // Disable caching to always get fresh data
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    // Try to get detailed error message from response body
    try {
      const errorData = await response.json()
      throw new Error(errorData.message || errorData.error || `API Error: ${response.status} ${response.statusText}`)
    } catch (parseError) {
      // If parsing fails, use status text
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
  }

  return response.json()
}

// Products API
export async function getProducts(params?: {
  category?: string
  subcategory?: string
  brand?: string
  search?: string
  inStock?: boolean
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
  badge?: string
}) {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })
  }
  const query = searchParams.toString()
  return fetchAPI<{
    products: any[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>(`/api/products${query ? `?${query}` : ''}`)
}

export async function getProductById(id: string) {
  return fetchAPI<any>(`/api/products/${id}`)
}

export async function getProductBySlug(slug: string) {
  return fetchAPI<any>(`/api/products/slug/${slug}`)
}

// Categories API
export async function getCategories() {
  return fetchAPI<any[]>('/api/categories')
}

// Blog API
export async function getBlogPosts(params?: {
  category?: string
  search?: string
  page?: number
  limit?: number
}) {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })
  }
  const query = searchParams.toString()
  return fetchAPI<{
    posts: any[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>(`/api/blog${query ? `?${query}` : ''}`)
}

export async function getBlogPostById(id: string) {
  return fetchAPI<any>(`/api/blog/${id}`)
}

export async function getBlogPostBySlug(slug: string) {
  return fetchAPI<any>(`/api/blog/slug/${slug}`)
}

// Promos API
export async function getPromoBanners() {
  return fetchAPI<any[]>('/api/promos')
}

// Helper to transform API product to match old interface
export function transformProduct(apiProduct: any) {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    brand: apiProduct.brand,
    price: apiProduct.price,
    shippingCost: apiProduct.shippingCost,
    category: apiProduct.category?.slug || apiProduct.categoryId,
    subcategory: apiProduct.subcategory?.slug || apiProduct.subcategoryId,
    images: apiProduct.images || [],
    videoUrls: apiProduct.videoUrls || (apiProduct.videoUrl ? [apiProduct.videoUrl] : []),
    badge: apiProduct.badge,
    inStock: apiProduct.inStock,
    stock: apiProduct.stock,
    stockStatus: apiProduct.stockStatus || (apiProduct.inStock ? 'in-stock' : 'sold-out'),
    description: apiProduct.description,
    specs: apiProduct.specs || {},
    included: apiProduct.included || [],
    warranty: apiProduct.warranty,
    sku: apiProduct.sku,
    rating: apiProduct.rating,
    reviewCount: apiProduct.reviewCount,
    productType: apiProduct.productType || 'new',
    condition: apiProduct.condition,
    conditionNotes: apiProduct.conditionNotes,
  }
}

// Helper to transform API category to match old interface
export function transformCategory(apiCategory: any) {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    slug: apiCategory.slug,
    path: apiCategory.path,
    subcategories: apiCategory.subcategories?.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      path: sub.path,
    })) || [],
  }
}

// Helper to transform API blog post to match old interface
export function transformBlogPost(apiPost: any) {
  return {
    id: apiPost.id,
    title: apiPost.title,
    slug: apiPost.slug,
    excerpt: apiPost.excerpt,
    content: apiPost.content,
    date: apiPost.date,
    author: apiPost.author,
    categories: apiPost.categories || [],
    image: apiPost.image,
    readTime: apiPost.readTime,
  }
}

// CRUD Operations for Products
export async function createProduct(data: any) {
  return fetchAPI<any>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProduct(id: string, data: any) {
  return fetchAPI<any>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteProduct(id: string) {
  return fetchAPI<{ message: string }>(`/api/products/${id}`, {
    method: 'DELETE',
  })
}

// CRUD Operations for Blog Posts
export async function createBlogPost(data: any) {
  return fetchAPI<any>('/api/blog', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateBlogPost(id: string, data: any) {
  return fetchAPI<any>(`/api/blog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteBlogPost(id: string) {
  return fetchAPI<{ message: string }>(`/api/blog/${id}`, {
    method: 'DELETE',
  })
}

// CRUD Operations for Categories
export async function createCategory(data: any) {
  return fetchAPI<any>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// CRUD Operations for Promos
export async function createPromo(data: any) {
  return fetchAPI<any>('/api/promos', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updatePromo(id: string, data: any) {
  return fetchAPI<any>(`/api/promos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deletePromo(id: string) {
  return fetchAPI<{ message: string }>(`/api/promos/${id}`, {
    method: 'DELETE',
  })
}

