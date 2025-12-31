// API Client helpers for fetching data from API routes

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

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
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
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
    retailPrice: apiProduct.retailPrice,
    category: apiProduct.category?.slug || apiProduct.categoryId,
    subcategory: apiProduct.subcategory?.slug || apiProduct.subcategoryId,
    images: apiProduct.images || [],
    videoUrl: apiProduct.videoUrl,
    badge: apiProduct.badge,
    inStock: apiProduct.inStock,
    stock: apiProduct.stock,
    description: apiProduct.description,
    specs: apiProduct.specs || {},
    included: apiProduct.included || [],
    warranty: apiProduct.warranty,
    sku: apiProduct.sku,
    rating: apiProduct.rating,
    reviewCount: apiProduct.reviewCount,
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

