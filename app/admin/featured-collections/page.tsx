'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Search, 
  Plus, 
  Trash2, 
  Loader2, 
  Star, 
  Sparkles,
  GripVertical,
  X,
  Check,
  Image as ImageIcon,
  Pencil,
  Upload
} from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  slug: string
  brand: string
  price: number
  images: string[]
  badge?: string
}

interface FeaturedCollection {
  id: string
  name: string
  slug: string
  productIds: string[]
  products?: Product[]
  backgroundImage?: string
}

export default function FeaturedCollectionsPage() {
  const [collections, setCollections] = useState<FeaturedCollection[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<FeaturedCollection | null>(null)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [editTitleValue, setEditTitleValue] = useState('')
  const [uploadingBg, setUploadingBg] = useState<string | null>(null)

  // Fetch collections and products
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [collectionsRes, productsRes] = await Promise.all([
        fetch('/api/admin/featured-collections'),
        fetch('/api/products?limit=100'),
      ])

      const collectionsData = await collectionsRes.json()
      const productsData = await productsRes.json()

      setCollections(collectionsData)
      setAllProducts(productsData.products || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Ensure default collections exist
  useEffect(() => {
    const ensureDefaultCollections = async () => {
      const defaultCollections = [
        { name: 'New Arrivals', slug: 'new-arrivals' },
        { name: 'Featured Instruments', slug: 'featured-instruments' },
      ]

      for (const col of defaultCollections) {
        const exists = collections.find((c) => c.slug === col.slug)
        if (!exists && !loading) {
          try {
            await fetch('/api/admin/featured-collections', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(col),
            })
          } catch (error) {
            console.error('Error creating default collection:', error)
          }
        }
      }

      // Refetch if we created any
      if (!loading && collections.length < 2) {
        fetchData()
      }
    }

    ensureDefaultCollections()
  }, [collections, loading])

  // Save collection products
  const saveCollection = async (slug: string, productIds: string[]) => {
    setSaving(slug)
    try {
      const response = await fetch(`/api/admin/featured-collections/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
      })

      if (response.ok) {
        setCollections((prev) =>
          prev.map((c) =>
            c.slug === slug
              ? { ...c, productIds, products: productIds.map((id) => allProducts.find((p) => p.id === id)).filter(Boolean) as Product[] }
              : c
          )
        )
      }
    } catch (error) {
      console.error('Error saving collection:', error)
    } finally {
      setSaving(null)
    }
  }

  // Save collection title
  const saveCollectionTitle = async (slug: string, name: string) => {
    setSaving(slug)
    try {
      const response = await fetch(`/api/admin/featured-collections/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        setCollections((prev) =>
          prev.map((c) =>
            c.slug === slug ? { ...c, name } : c
          )
        )
        setEditingTitle(null)
      }
    } catch (error) {
      console.error('Error saving collection title:', error)
    } finally {
      setSaving(null)
    }
  }

  // Start editing title
  const startEditingTitle = (collection: FeaturedCollection) => {
    setEditingTitle(collection.slug)
    setEditTitleValue(collection.name)
  }

  // Cancel editing title
  const cancelEditingTitle = () => {
    setEditingTitle(null)
    setEditTitleValue('')
  }

  // Upload background image
  const handleBackgroundUpload = async (slug: string, file: File) => {
    setUploadingBg(slug)
    try {
      // Get signature for direct Cloudinary upload
      const sigResponse = await fetch('/api/upload/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'sax/collections' }),
      })

      if (!sigResponse.ok) {
        throw new Error('Failed to get upload signature')
      }

      const { signature, timestamp, cloudName, apiKey, folder } = await sigResponse.json()

      // Upload directly to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp.toString())
      formData.append('signature', signature)
      formData.append('folder', folder)

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error?.message || 'Upload failed')
      }

      const uploadData = await uploadResponse.json()
      const url = uploadData.secure_url

      // Save to collection
      const response = await fetch(`/api/admin/featured-collections/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backgroundImage: url }),
      })

      if (response.ok) {
        setCollections((prev) =>
          prev.map((c) =>
            c.slug === slug ? { ...c, backgroundImage: url } : c
          )
        )
      }
    } catch (error) {
      console.error('Error uploading background:', error)
      alert('Failed to upload background image')
    } finally {
      setUploadingBg(null)
    }
  }

  // Remove background image
  const removeBackgroundImage = async (slug: string) => {
    setSaving(slug)
    try {
      const response = await fetch(`/api/admin/featured-collections/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backgroundImage: null }),
      })

      if (response.ok) {
        setCollections((prev) =>
          prev.map((c) =>
            c.slug === slug ? { ...c, backgroundImage: undefined } : c
          )
        )
      }
    } catch (error) {
      console.error('Error removing background:', error)
    } finally {
      setSaving(null)
    }
  }

  // Add product to collection
  const addProductToCollection = (product: Product) => {
    if (!selectedCollection) return

    const newProductIds = [...selectedCollection.productIds, product.id]
    const newProducts = [...(selectedCollection.products || []), product]

    setSelectedCollection({
      ...selectedCollection,
      productIds: newProductIds,
      products: newProducts,
    })

    setCollections((prev) =>
      prev.map((c) =>
        c.slug === selectedCollection.slug
          ? { ...c, productIds: newProductIds, products: newProducts }
          : c
      )
    )

    saveCollection(selectedCollection.slug, newProductIds)
  }

  // Remove product from collection
  const removeProductFromCollection = (productId: string, collection: FeaturedCollection) => {
    const newProductIds = collection.productIds.filter((id) => id !== productId)
    const newProducts = (collection.products || []).filter((p) => p.id !== productId)

    setCollections((prev) =>
      prev.map((c) =>
        c.slug === collection.slug
          ? { ...c, productIds: newProductIds, products: newProducts }
          : c
      )
    )

    if (selectedCollection?.slug === collection.slug) {
      setSelectedCollection({
        ...collection,
        productIds: newProductIds,
        products: newProducts,
      })
    }

    saveCollection(collection.slug, newProductIds)
  }

  // Filter products for dialog
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(productSearchTerm.toLowerCase())
    const notInCollection = !selectedCollection?.productIds.includes(product.id)
    return matchesSearch && notInCollection
  })

  // Get icon for collection
  const getCollectionIcon = (slug: string) => {
    switch (slug) {
      case 'new-arrivals':
        return <Sparkles className="h-5 w-5 text-amber-500" />
      case 'featured-instruments':
        return <Star className="h-5 w-5 text-primary" />
      default:
        return <Star className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Featured Collections</h1>
        <p className="text-gray-600 mt-2">
          Manage products displayed in NEW ARRIVALS and FEATURED INSTRUMENTS sections on homepage
        </p>
      </div>

      {/* Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCollectionIcon(collection.slug)}
                  <div>
                    {editingTitle === collection.slug ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          className="h-8 text-lg font-semibold w-48"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveCollectionTitle(collection.slug, editTitleValue)
                            } else if (e.key === 'Escape') {
                              cancelEditingTitle()
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => saveCollectionTitle(collection.slug, editTitleValue)}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditingTitle}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/title">
                        <h2 className="text-lg font-semibold text-gray-900">{collection.name}</h2>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditingTitle(collection)}
                          className="h-6 w-6 p-0 opacity-0 group-hover/title:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      {collection.products?.length || 0} products
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setSelectedCollection(collection)
                    setIsProductDialogOpen(true)
                  }}
                  size="sm"
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>

              {/* Background Image Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Background Image</Label>
                <div className="flex items-center gap-3">
                  {collection.backgroundImage ? (
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-100 border group">
                      <Image
                        src={collection.backgroundImage}
                        alt="Background"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeBackgroundImage(collection.slug)}
                          className="h-7 px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleBackgroundUpload(collection.slug, file)
                        e.target.value = ''
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingBg === collection.slug}
                      asChild
                    >
                      <span className="gap-2">
                        {uploadingBg === collection.slug ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {collection.backgroundImage ? 'Change' : 'Upload'}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {collection.products && collection.products.length > 0 ? (
                <div className="space-y-2">
                  {collection.products.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm text-gray-400 w-6">{index + 1}</span>
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white border flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.brand} • ${product.price.toLocaleString()}
                        </p>
                      </div>
                      {product.badge && (
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {product.badge}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProductFromCollection(product.id, collection)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No products in this collection</p>
                  <p className="text-sm">Click "Add Product" to get started</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {saving === collection.slug && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center gap-2 text-blue-600 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Add Product to {selectedCollection?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.slice(0, 20).map((product) => (
                <div
                  key={product.id}
                  onClick={() => addProductToCollection(product)}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.brand} • ${product.price.toLocaleString()}
                    </p>
                  </div>
                  <Plus className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No products found</p>
              </div>
            )}

            {filteredProducts.length > 20 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Showing 20 of {filteredProducts.length} products. Use search to find more.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
