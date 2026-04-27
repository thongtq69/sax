'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getProducts,
  getCategories,
  deleteProduct,
  transformProduct,
  transformCategory,
  getProductUrl,
} from '@/lib/api'
import type { Product } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  Loader2,
  Eye,
  Grid,
  List,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function ProductsManagement() {
  const router = useRouter()
  const [productList, setProductList] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBadge, setSelectedBadge] = useState<string>('all')
  const [selectedProductType, setSelectedProductType] = useState<string>('all')
  const [selectedStock, setSelectedStock] = useState<string>('all')
  const [selectedCondition, setSelectedCondition] = useState<string>('all')
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name-asc')
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const refreshProducts = async () => {
    const productsResponse = await getProducts({
      limit: 1000,
      showHidden: true,
      showArchived: true,
      showDrafts: true,
    } as any)
    const transformedProducts = productsResponse.products.map(transformProduct)
    setProductList(transformedProducts)
  }

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const [productsResponse, categoriesData] = await Promise.all([
          getProducts({
            limit: 1000,
            showHidden: true,
            showArchived: true,
            showDrafts: true,
          } as any),
          getCategories(),
        ])
        const transformedProducts = productsResponse.products.map(transformProduct)
        const transformedCategories = categoriesData.map(transformCategory)
        setProductList(transformedProducts)
        setCategories(transformedCategories)
      } catch (error) {
        console.error('Error fetching data:', error)
        alert('Failed to load data. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = productList

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    if (selectedBadge !== 'all') {
      if (selectedBadge === 'none') {
        filtered = filtered.filter((p) => !p.badge)
      } else {
        filtered = filtered.filter((p) => p.badge === selectedBadge)
      }
    }

    if (selectedProductType !== 'all') {
      filtered = filtered.filter((p) => (p as any).productType === selectedProductType)
    }

    if (selectedStock !== 'all') {
      filtered = filtered.filter((p) => {
        const stockStatus = (p as any).stockStatus || (p.inStock ? 'in-stock' : 'sold-out')
        switch (selectedStock) {
          case 'in-stock':
            return stockStatus === 'in-stock' && p.inStock
          case 'pre-order':
            return stockStatus === 'pre-order'
          case 'sold-out':
            return stockStatus === 'sold-out' || p.inStock === false
          default:
            return true
        }
      })
    }

    if (selectedCondition !== 'all') {
      filtered = filtered.filter((p) => (p as any).condition === selectedCondition)
    }

    if (selectedVisibility !== 'all') {
      if (selectedVisibility === 'hidden') {
        filtered = filtered.filter((p) => p.isVisible === false)
      } else if (selectedVisibility === 'visible') {
        filtered = filtered.filter((p) => p.isVisible !== false)
      }
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((p) => {
        const status = (p as any).status || 'published'
        return selectedStatus === 'draft' ? status === 'draft' : status === 'published'
      })
    }

    const sorted = [...filtered].sort((a, b) => {
      const aStockStatus = (a as any).stockStatus || (a.inStock ? 'in-stock' : 'sold-out')
      const bStockStatus = (b as any).stockStatus || (b.inStock ? 'in-stock' : 'sold-out')
      const stockRank: Record<string, number> = {
        'in-stock': 0,
        'pre-order': 1,
        'sold-out': 2,
      }

      const aCategoryName = (a as any).categoryName || a.category || ''
      const bCategoryName = (b as any).categoryName || b.category || ''

      switch (sortBy) {
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'price-high':
        case 'price-desc':
          return b.price - a.price
        case 'price-low':
        case 'price-asc':
          return a.price - b.price
        case 'stock-high':
        case 'stock-desc':
          return (b.stock || 0) - (a.stock || 0)
        case 'stock-low':
        case 'stock-asc':
          return (a.stock || 0) - (b.stock || 0)
        case 'category-asc':
          return aCategoryName.localeCompare(bCategoryName)
        case 'category-desc':
          return bCategoryName.localeCompare(aCategoryName)
        case 'status':
          return (stockRank[aStockStatus] ?? 99) - (stockRank[bStockStatus] ?? 99)
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredProducts(sorted)
  }, [
    searchTerm,
    selectedCategory,
    selectedBadge,
    selectedProductType,
    selectedStock,
    selectedCondition,
    selectedVisibility,
    selectedStatus,
    sortBy,
    productList,
  ])

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this product? This action cannot be undone.'
      )
    )
      return
    try {
      await deleteProduct(id)
      await refreshProducts()
    } catch (error: any) {
      console.error('Error deleting product:', error)
      alert(error.message || 'Failed to delete product. Please try again.')
    }
  }

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId)
    return cat?.name || categoryId
  }

  const badgeColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    sale: 'bg-red-100 text-red-800',
    rare: 'bg-purple-100 text-purple-800',
    'coming-soon': 'bg-yellow-100 text-yellow-800',
    'out-of-stock': 'bg-gray-100 text-gray-800',
  }

  const draftCount = productList.filter((p) => (p as any).status === 'draft').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage your product catalog ({productList.length} products
            {draftCount > 0 && `, ${draftCount} draft${draftCount === 1 ? '' : 's'}`})
          </p>
        </div>
        <Link href="/admin/products/new" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto">
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name, brand, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full lg:w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedBadge} onValueChange={setSelectedBadge}>
            <SelectTrigger className="w-full lg:w-[150px]">
              <SelectValue placeholder="All Badges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Badges</SelectItem>
              <SelectItem value="none">Special Pricing</SelectItem>
              <SelectItem value="new">New Arrival</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="rare">Limited Availability</SelectItem>
              <SelectItem value="coming-soon">Arriving Soon</SelectItem>
              <SelectItem value="premium">Premium Selection</SelectItem>
              <SelectItem value="top-tier">Top-Tier</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedProductType} onValueChange={setSelectedProductType}>
            <SelectTrigger className="w-full lg:w-[130px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger className="w-full lg:w-[150px]">
              <SelectValue placeholder="All Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="pre-order">Pre-Order</SelectItem>
              <SelectItem value="sold-out">Sold Out</SelectItem>
            </SelectContent>
          </Select>

          {selectedProductType === 'used' && (
            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="mint">Mint</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="very-good">Very Good</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
            <SelectTrigger className="w-full lg:w-[150px]">
              <SelectValue placeholder="All Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visibility</SelectItem>
              <SelectItem value="visible">Visible Only</SelectItem>
              <SelectItem value="hidden">Hidden Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-[170px]">
              <SelectValue placeholder="Sort products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="price-high">Price High-Low</SelectItem>
              <SelectItem value="price-low">Price Low-High</SelectItem>
              <SelectItem value="stock-high">Stock High-Low</SelectItem>
              <SelectItem value="stock-low">Stock Low-High</SelectItem>
              <SelectItem value="status">Stock Status</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredProducts.length} of {productList.length} products
          </span>
        </div>
      </div>

      {/* Products Display */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() =>
                        setSortBy(sortBy === 'category-asc' ? 'category-desc' : 'category-asc')
                      }
                      className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-gray-900 transition-colors"
                    >
                      Category
                      {sortBy === 'category-asc' ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : sortBy === 'category-desc' ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() =>
                        setSortBy(
                          sortBy === 'price-asc' || sortBy === 'price-low'
                            ? 'price-desc'
                            : 'price-asc'
                        )
                      }
                      className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-gray-900 transition-colors"
                    >
                      Price
                      {sortBy === 'price-asc' || sortBy === 'price-low' ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : sortBy === 'price-desc' || sortBy === 'price-high' ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() =>
                        setSortBy(
                          sortBy === 'stock-asc' || sortBy === 'stock-low'
                            ? 'stock-desc'
                            : 'stock-asc'
                        )
                      }
                      className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-gray-900 transition-colors"
                    >
                      Stock
                      {sortBy === 'stock-asc' || sortBy === 'stock-low' ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : sortBy === 'stock-desc' || sortBy === 'stock-high' ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Badge
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No products found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try adjusting your search or filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const status = (product as any).status || 'published'
                    const isDraft = status === 'draft'
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <Link
                              href={getProductUrl(
                                product.sku,
                                product.slug,
                                (product as any).serialNumber || product.specs?.SN
                              )}
                              target="_blank"
                              className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
                            >
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={56}
                                  height={56}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </Link>
                            <div className="min-w-0">
                              <Link
                                href={getProductUrl(
                                  product.sku,
                                  product.slug,
                                  (product as any).serialNumber || product.specs?.SN
                                )}
                                target="_blank"
                                className="font-medium text-gray-900 truncate max-w-[300px] hover:text-primary hover:underline cursor-pointer block"
                              >
                                {product.name}
                              </Link>
                              <div className="text-sm text-gray-500">
                                {product.brand} • {product.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {getCategoryName(product.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            ${product.price.toLocaleString()}
                          </div>
                          {product.shippingCost && product.shippingCost > 0 && (
                            <div className="text-sm text-blue-600">
                              Ship: ${product.shippingCost.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                (product as any).stockStatus === 'pre-order'
                                  ? 'bg-amber-100 text-amber-800'
                                  : product.inStock
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {(product as any).stockStatus === 'pre-order'
                                ? 'Pre-Order'
                                : product.inStock
                                  ? `${product.stock || 0} in stock`
                                  : 'Out of stock'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {product.badge ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                badgeColors[product.badge] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {product.badge}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {isDraft ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide w-fit">
                                Draft
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 w-fit">
                                Published
                              </span>
                            )}
                            {product.isVisible === false && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200 w-fit">
                                Hidden
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={getProductUrl(
                                product.sku,
                                product.slug,
                                (product as any).serialNumber || product.specs?.SN
                              )}
                              target="_blank"
                            >
                              <Button variant="ghost" size="sm" title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="ghost" size="sm" title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const status = (product as any).status || 'published'
              const isDraft = status === 'draft'
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square relative bg-gray-100">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    {isDraft && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                        Draft
                      </span>
                    )}
                    {!isDraft && product.badge && (
                      <span
                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                          badgeColors[product.badge] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.badge}
                      </span>
                    )}
                    {product.isVisible === false && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-white z-10">
                        Hidden
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Link
                        href={getProductUrl(
                          product.sku,
                          product.slug,
                          (product as any).serialNumber || product.specs?.SN
                        )}
                        target="_blank"
                      >
                        <Button size="sm" variant="secondary">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button size="sm" variant="secondary">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
                    <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900">
                          ${product.price.toLocaleString()}
                        </span>
                        {product.shippingCost && product.shippingCost > 0 && (
                          <span className="text-sm text-blue-600 ml-2">
                            Ship: ${product.shippingCost.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          (product as any).stockStatus === 'pre-order'
                            ? 'bg-amber-100 text-amber-700'
                            : product.inStock
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {(product as any).stockStatus === 'pre-order'
                          ? 'Pre-Order'
                          : product.inStock
                            ? 'In Stock'
                            : 'Out'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
