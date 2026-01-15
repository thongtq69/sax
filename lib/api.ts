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
// If no slug: /product/SKU (e.g., /product/A-9910042)
export function getProductUrl(sku: string, slug: string): string {
  if (!slug || slug.trim() === '') {
    return `/product/${sku}`
  }
  return `/product/${sku}-${slug}`
}

// Helper function to extract SKU from URL parameter (handles both old and new format)
export function extractSkuFromParam(param: string): string {
  // Decode URL-encoded characters first
  const decoded = decodeURIComponent(param)
  
  // If param contains JSC- prefix, extract just the SKU part
  // SKU format: JSC-XXXXXX (JSC- followed by alphanumeric, may contain multiple dashes)
  // Examples: JSC-C143LF, JSC-YCS-S62III0069, JSC-ABC-DEF-123
  // The SKU ends when we hit a lowercase letter after a dash (which indicates the slug part)
  if (decoded.startsWith('JSC-')) {
    // Find where the slug part starts (lowercase word after dash)
    // SKU parts are uppercase/numbers, slug parts are lowercase
    const parts = decoded.split('-')
    const skuParts: string[] = ['JSC']
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i]
      // If part starts with lowercase letter, it's the start of the slug
      if (part && /^[a-z]/.test(part)) {
        break
      }
      // Otherwise it's part of the SKU (uppercase letters, numbers, or mixed)
      skuParts.push(part)
    }
    
    return skuParts.join('-')
  }
  
  // For non-JSC SKUs, extract SKU before the slug part
  // SKU is typically uppercase/numbers, slug is lowercase
  // Examples: A-9910042-yanagisawa-alto, TEST-123-product-name
  const parts = decoded.split('-')
  const skuParts: string[] = []
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    // If part starts with lowercase letter and we already have some SKU parts, it's the start of the slug
    if (part && /^[a-z]/.test(part) && skuParts.length > 0) {
      break
    }
    // Add part to SKU (could be uppercase, numbers, or mixed case for first part)
    skuParts.push(part)
  }
  
  // If we found SKU parts, return them joined
  if (skuParts.length > 0) {
    return skuParts.join('-')
  }
  
  // Fallback: return the whole param (for old URLs or simple SKUs)
  return decoded
}

// Helper function to fetch from API
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const response = await fetch(url, {
    ...options,
    next: { revalidate: 60 }, // Cache for 60 seconds, then revalidate in background
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })


  if (!response.ok) {
    // Try to get detailed error message from response body
    let errorMessage = `API Error: ${response.status} ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      // If parsing fails, use default error message
    }
    throw new Error(errorMessage)
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

