'use client'

import { useState, useEffect } from 'react'
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, transformProduct, transformCategory, getProductUrl } from '@/lib/api'
import type { Product } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, Search, Package, Loader2, Eye, Grid, List, Filter, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ImageUpload } from '@/components/admin/ImageUpload'

export default function ProductsManagement() {
  const [productList, setProductList] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<{ id: string; name: string; isActive: boolean }[]>([])
  const [specKeys, setSpecKeys] = useState<{ id: string; name: string; isActive: boolean }[]>([])
  const [newSpecKey, setNewSpecKey] = useState('')
  const [descTemplates, setDescTemplates] = useState<{ id: string; name: string; content: string; type: string }[]>([])
  const [selectedHeader, setSelectedHeader] = useState('')
  const [selectedFooter, setSelectedFooter] = useState('')
  const [descBody, setDescBody] = useState('')
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateContent, setNewTemplateContent] = useState('')
  const [newTemplateType, setNewTemplateType] = useState<'header' | 'footer'>('header')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBadge, setSelectedBadge] = useState<string>('all')
  const [selectedProductType, setSelectedProductType] = useState<string>('all')
  const [selectedCondition, setSelectedCondition] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [activeTab, setActiveTab] = useState('basic')
  const [customBrand, setCustomBrand] = useState('')
  const [formData, setFormData] = useState<Partial<Product> & { 
    stockStatus?: string
    productType?: string
    condition?: string
    conditionNotes?: string
    videoUrls?: string[]
  }>({
    name: '',
    slug: '',
    brand: '',
    price: 0,
    shippingCost: 0,
    category: '',
    subcategory: '',
    images: [],
    badge: undefined,
    inStock: true,
    stock: 0,
    stockStatus: 'in-stock',
    productType: 'new',
    condition: undefined,
    conditionNotes: '',
    videoUrls: ['', '', '', ''],
    description: '',
    specs: {},
    included: [],
    warranty: '',
    sku: '',
    rating: 0,
    reviewCount: 0,
  })

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const [productsResponse, categoriesData, brandsData, specKeysData, templatesData] = await Promise.all([
          getProducts({ limit: 1000 }),
          getCategories(),
          fetch('/api/admin/brands').then(res => res.json()),
          fetch('/api/admin/spec-keys').then(res => res.json()),
          fetch('/api/admin/description-templates').then(res => res.json()),
        ])
        
        const transformedProducts = productsResponse.products.map(transformProduct)
        const transformedCategories = categoriesData.map(transformCategory)
        
        setProductList(transformedProducts)
        setCategories(transformedCategories)
        setBrands(brandsData.filter((b: any) => b.isActive))
        setSpecKeys(specKeysData.filter((s: any) => s.isActive))
        setDescTemplates(templatesData)
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
    // Filter products
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

    if (selectedCondition !== 'all') {
      filtered = filtered.filter((p) => (p as any).condition === selectedCondition)
    }

    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory, selectedBadge, selectedProductType, selectedCondition, productList])

  // Auto-sync Brand, Model (SKU), Condition to specs when they change
  useEffect(() => {
    if (!isDialogOpen) return
    
    const currentSpecs = formData.specs || {}
    const newSpecs = { ...currentSpecs }
    
    // Auto-fill Brand
    if (formData.brand) {
      newSpecs['Brand'] = formData.brand
    }
    
    // Auto-fill Model (SKU without JSC- prefix)
    if (formData.sku && formData.sku !== 'JSC-') {
      const model = formData.sku.startsWith('JSC-') ? formData.sku.slice(4) : formData.sku
      if (model) {
        newSpecs['Model'] = model
      }
    }
    
    // Auto-fill Condition (only for used products)
    if (formData.productType === 'used' && formData.condition) {
      const conditionLabels: Record<string, string> = {
        'mint': 'Mint',
        'excellent': 'Excellent',
        'very-good': 'Very Good',
        'good': 'Good',
        'fair': 'Fair'
      }
      newSpecs['Condition'] = conditionLabels[formData.condition] || formData.condition
    } else if (formData.productType === 'new') {
      newSpecs['Condition'] = 'New'
    }
    
    // Only update if specs actually changed
    if (JSON.stringify(newSpecs) !== JSON.stringify(currentSpecs)) {
      setFormData(prev => ({ ...prev, specs: newSpecs }))
    }
  }, [formData.brand, formData.sku, formData.condition, formData.productType, isDialogOpen])

  const handleOpenDialog = (product?: Product) => {
    // Reset template states
    setSelectedHeader('')
    setSelectedFooter('')
    setNewTemplateName('')
    setNewTemplateContent('')
    setNewTemplateType('header')
    
    if (product) {
      setEditingProduct(product)
      // Check if brand exists in brands list
      const brandExists = brands.some(b => b.name === product.brand)
      setCustomBrand(brandExists ? '' : product.brand)
      
      // Parse existing description to find header/body/footer
      let parsedBody = product.description || ''
      let foundHeader = ''
      let foundFooter = ''
      
      // Try to match header templates
      for (const template of descTemplates.filter(t => t.type === 'header')) {
        if (parsedBody.startsWith(template.content)) {
          foundHeader = template.id
          parsedBody = parsedBody.slice(template.content.length).replace(/^\n\n/, '')
          break
        }
      }
      
      // Try to match footer templates
      for (const template of descTemplates.filter(t => t.type === 'footer')) {
        if (parsedBody.endsWith(template.content)) {
          foundFooter = template.id
          parsedBody = parsedBody.slice(0, -template.content.length).replace(/\n\n$/, '')
          break
        }
      }
      
      setSelectedHeader(foundHeader)
      setSelectedFooter(foundFooter)
      setDescBody(parsedBody)
      
      setFormData({
        ...product,
        images: product.images || [],
        stockStatus: (product as any).stockStatus || 'in-stock',
        productType: (product as any).productType || 'new',
        condition: (product as any).condition || undefined,
        conditionNotes: (product as any).conditionNotes || '',
        shippingCost: (product as any).shippingCost || undefined,
        videoUrls: (product as any).videoUrls?.length > 0 
          ? [...(product as any).videoUrls, '', '', '', ''].slice(0, 4)
          : (product as any).videoUrl 
            ? [(product as any).videoUrl, '', '', ''] 
            : ['', '', '', ''],
      } as any)
    } else {
      setEditingProduct(null)
      setCustomBrand('')
      setDescBody('')
      setFormData({
        name: '',
        slug: '',
        brand: '',
        price: 0,
        shippingCost: undefined,
        category: '',
        subcategory: '',
        images: [],
        badge: undefined,
        inStock: true,
        stock: 0,
        stockStatus: 'in-stock',
        productType: 'new',
        condition: undefined,
        conditionNotes: '',
        videoUrls: ['', '', '', ''],
        description: '',
        specs: {
          'Brand': '',
          'Model': '',
          'Condition': '',
        },
        included: [],
        warranty: '',
        sku: 'JSC-',
        rating: 0,
        reviewCount: 0,
      } as any)
    }
    setActiveTab('basic')
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    // Validation
    if (!formData.name?.trim()) {
      alert('Product name is required')
      return
    }
    if (!formData.sku?.trim() || formData.sku === 'JSC-' || formData.sku.length <= 4) {
      alert('SKU is required. Please enter a code after JSC-')
      return
    }
    if (!formData.brand?.trim()) {
      alert('Brand is required')
      return
    }
    if (!formData.category) {
      alert('Category is required')
      return
    }

    try {
      setIsSaving(true)
      
      // Find category and subcategory IDs
      const categoryObj = categories.find(c => c.id === formData.category || c.slug === formData.category)
      const subcategoryObj = categoryObj?.subcategories?.find((s: any) => s.id === formData.subcategory || s.slug === formData.subcategory)
      
      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '',
        brand: formData.brand,
        price: formData.price,
        shippingCost: (formData as any).shippingCost || null,
        categoryId: categoryObj?.id || formData.category,
        subcategoryId: subcategoryObj?.id || formData.subcategory || null,
        images: formData.images || [],
        badge: formData.badge || null,
        inStock: formData.stockStatus === 'in-stock',
        stock: formData.productType === 'used' ? 1 : (formData.stock || 0),
        stockStatus: formData.stockStatus || 'in-stock',
        productType: formData.productType || 'new',
        condition: formData.productType === 'used' ? (formData.condition || 'excellent') : null,
        conditionNotes: formData.productType === 'used' ? (formData.conditionNotes || null) : null,
        videoUrls: (formData.videoUrls || []).filter(url => url && url.trim()),
        description: formData.description,
        specs: formData.specs || null,
        included: formData.included || [],
        warranty: formData.warranty || null,
        sku: formData.sku,
        rating: formData.rating || 0,
        reviewCount: formData.reviewCount || 0,
      }
      
      console.log('Saving product with images:', productData.images)

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
      } else {
        await createProduct(productData)
      }

      // Refresh data
      const productsResponse = await getProducts({ limit: 1000 })
      const transformedProducts = productsResponse.products.map(transformProduct)
      setProductList(transformedProducts)
      
      setIsDialogOpen(false)
      setEditingProduct(null)
    } catch (error: any) {
      console.error('Error saving product:', error)
      // Show detailed error message from API
      const errorMessage = error.message || 'Failed to save product. Please try again.'
      alert(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      await deleteProduct(id)
      
      // Refresh data
      const productsResponse = await getProducts({ limit: 1000 })
      const transformedProducts = productsResponse.products.map(transformProduct)
      setProductList(transformedProducts)
    } catch (error: any) {
      console.error('Error deleting product:', error)
      alert(error.message || 'Failed to delete product. Please try again.')
    }
  }

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId)
    return cat?.name || categoryId
  }

  const badgeColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    sale: 'bg-red-100 text-red-800',
    rare: 'bg-purple-100 text-purple-800',
    'coming-soon': 'bg-yellow-100 text-yellow-800',
    'out-of-stock': 'bg-gray-100 text-gray-800',
  }

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
          <p className="text-gray-600 mt-1">Manage your product catalog ({productList.length} products)</p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="lg" className="w-full sm:w-auto">
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name, brand, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Category Filter */}
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

          {/* Badge Filter */}
          <Select value={selectedBadge} onValueChange={setSelectedBadge}>
            <SelectTrigger className="w-full lg:w-[150px]">
              <SelectValue placeholder="All Badges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Badges</SelectItem>
              <SelectItem value="none">No Badge</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="coming-soon">Coming Soon</SelectItem>
            </SelectContent>
          </Select>

          {/* Product Type Filter */}
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

          {/* Condition Filter (only show when used is selected) */}
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

          {/* View Mode Toggle */}
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
          <span>Showing {filteredProducts.length} of {productList.length} products</span>
        </div>
      </div>

      {/* Products Display */}
      {viewMode === 'table' ? (
        // Table View
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Badge
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No products found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Link href={getProductUrl(product.sku, product.slug)} target="_blank" className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
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
                            <Link href={getProductUrl(product.sku, product.slug)} target="_blank" className="font-medium text-gray-900 truncate max-w-[300px] hover:text-primary hover:underline cursor-pointer block">{product.name}</Link>
                            <div className="text-sm text-gray-500">{product.brand} • {product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {getCategoryName(product.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">${product.price.toLocaleString()}</div>
                        {product.shippingCost && product.shippingCost > 0 && (
                          <div className="text-sm text-blue-600">Ship: ${product.shippingCost.toLocaleString()}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? `${product.stock || 0} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.badge ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badgeColors[product.badge] || 'bg-gray-100 text-gray-800'}`}>
                            {product.badge}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={getProductUrl(product.sku, product.slug)} target="_blank">
                            <Button variant="ghost" size="sm" title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(product)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
                <div className="aspect-square relative bg-gray-100">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                  {product.badge && (
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${badgeColors[product.badge] || 'bg-gray-100 text-gray-800'}`}>
                      {product.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Link href={getProductUrl(product.sku, product.slug)} target="_blank">
                      <Button size="sm" variant="secondary">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button size="sm" variant="secondary" onClick={() => handleOpenDialog(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
                  <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">${product.price.toLocaleString()}</span>
                      {product.shippingCost && product.shippingCost > 0 && (
                        <span className="text-sm text-blue-600 ml-2">Ship: ${product.shippingCost.toLocaleString()}</span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.inStock ? 'In Stock' : 'Out'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
              <TabsTrigger value="specs">Specs</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm font-medium">
                      JSC-
                    </span>
                    <Input
                      value={formData.sku?.startsWith('JSC-') ? formData.sku.slice(4) : formData.sku}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
                        setFormData({ ...formData, sku: `JSC-${value}` })
                      }}
                      placeholder="e.g., A3WIIU"
                      className="rounded-l-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">SKU will be prefixed with JSC-</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={brands.some(b => b.name === formData.brand) ? formData.brand : '__custom__'}
                    onValueChange={(value) => {
                      if (value === '__custom__') {
                        setFormData({ ...formData, brand: customBrand })
                      } else {
                        setFormData({ ...formData, brand: value })
                        setCustomBrand('')
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.name}>
                          {brand.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__">✏️ Enter custom brand...</SelectItem>
                    </SelectContent>
                  </Select>
                  {(!brands.some(b => b.name === formData.brand) || formData.brand === '') && (
                    <Input
                      value={customBrand || formData.brand}
                      onChange={(e) => {
                        setCustomBrand(e.target.value)
                        setFormData({ ...formData, brand: e.target.value })
                      }}
                      placeholder="Enter brand name"
                      className="mt-2"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Select from list or enter custom brand. <a href="/admin/brands" target="_blank" className="text-primary hover:underline">Manage brands →</a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <Select
                    value={formData.subcategory || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, subcategory: value === 'none' ? '' : value })}
                    disabled={!formData.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories
                        .find(c => c.id === formData.category)
                        ?.subcategories?.map((sub: any) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Auto-generated from name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge
                  </label>
                  <Select
                    value={formData.badge || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, badge: value === 'none' ? undefined : value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No badge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No badge</SelectItem>
                      <SelectItem value="new">🆕 New</SelectItem>
                      <SelectItem value="sale">🔥 Sale</SelectItem>
                      <SelectItem value="rare">⭐ Rare</SelectItem>
                      <SelectItem value="coming-soon">🔜 Coming Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.productType || 'new'}
                    onValueChange={(value) => {
                      const updates: any = { productType: value }
                      if (value === 'used') {
                        updates.stock = 1
                        if (!formData.condition) {
                          updates.condition = 'excellent'
                        }
                      }
                      setFormData({ ...formData, ...updates })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.productType === 'used' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.condition || 'excellent'}
                      onValueChange={(value) => setFormData({ ...formData, condition: value as 'mint' | 'excellent' | 'very-good' | 'good' | 'fair' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mint">Mint - Essentially new, opened/played</SelectItem>
                        <SelectItem value="excellent">Excellent - Almost no blemishes</SelectItem>
                        <SelectItem value="very-good">Very Good - Few slight marks</SelectItem>
                        <SelectItem value="good">Good - Moderate wear</SelectItem>
                        <SelectItem value="fair">Fair - Noticeable cosmetic damage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {formData.productType === 'used' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition Notes (Optional)
                  </label>
                  <textarea
                    className="w-full min-h-[80px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    value={formData.conditionNotes || ''}
                    onChange={(e) => setFormData({ ...formData, conditionNotes: e.target.value })}
                    placeholder="Additional notes about the item's condition..."
                  />
                </div>
              )}
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload images from your device or add from URL. First image will be the main product image.
                </p>
                <ImageUpload
                  images={formData.images || []}
                  onChange={(images) => setFormData({ ...formData, images })}
                  folder="sax/products"
                />
              </div>
            </TabsContent>

            {/* Pricing & Stock Tab */}
            <TabsContent value="pricing" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={formData.price === 0 ? '' : formData.price?.toString() || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      // Only allow numbers and one decimal point
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        // Remove leading zeros (except for "0." case)
                        const cleanValue = value.replace(/^0+(?=\d)/, '')
                        const numValue = parseFloat(cleanValue) || 0
                        setFormData({ ...formData, price: numValue })
                      }
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Cost ($)
                  </label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={(formData as any).shippingCost ? (formData as any).shippingCost.toString() : ''}
                    onChange={(e) => {
                      const value = e.target.value
                      // Only allow numbers and one decimal point
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        // Remove leading zeros (except for "0." case)
                        const cleanValue = value.replace(/^0+(?=\d)/, '')
                        const numValue = cleanValue ? parseFloat(cleanValue) : undefined
                        setFormData({ ...formData, shippingCost: numValue } as any)
                      }
                    }}
                    placeholder="Leave empty to use zone rate"
                  />
                  <p className="text-xs text-gray-500 mt-1">Product-specific shipping cost (optional). Leave empty to use shipping zone rate.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    disabled={formData.productType === 'used'}
                  />
                  {formData.productType === 'used' && (
                    <p className="text-xs text-gray-500 mt-1">Stock is automatically set to 1 for used products</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Status <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.stockStatus || 'in-stock'}
                    onValueChange={(value) => setFormData({ ...formData, stockStatus: value as 'in-stock' | 'sold-out' | 'pre-order', inStock: value === 'in-stock' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stock status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-stock">In Stock - Ships within 1-2 business days</SelectItem>
                      <SelectItem value="sold-out">Sold Out - This item is currently unavailable</SelectItem>
                      <SelectItem value="pre-order">Pre-Order - Ready to ship in 7-10 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Specs Tab */}
            <TabsContent value="specs" className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Specifications
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Select specification keys from the list or add new ones
                </p>
                <div className="space-y-3">
                  {Object.entries(formData.specs || {}).map(([key, value], index) => (
                    <div key={index} className="flex gap-2 items-center">
                      {/* Spec Key Dropdown */}
                      <Select
                        value={key}
                        onValueChange={(newKey) => {
                          const newSpecs = { ...formData.specs }
                          const oldValue = newSpecs[key]
                          delete newSpecs[key]
                          if (newKey) {
                            newSpecs[newKey] = oldValue
                          }
                          setFormData({ ...formData, specs: newSpecs })
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select spec key" />
                        </SelectTrigger>
                        <SelectContent>
                          {specKeys.map((specKey) => (
                            <SelectItem key={specKey.id} value={specKey.name}>
                              {specKey.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={value as string}
                        onChange={(e) => {
                          const newSpecs = { ...formData.specs, [key]: e.target.value }
                          setFormData({ ...formData, specs: newSpecs })
                        }}
                        placeholder="Value (e.g., Brass)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSpecs = { ...formData.specs }
                          delete newSpecs[key]
                          setFormData({ ...formData, specs: newSpecs })
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newSpecs = { ...formData.specs, '': '' }
                      setFormData({ ...formData, specs: newSpecs })
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Specification
                  </Button>
                </div>

                {/* Add New Spec Key */}
                <div className="mt-6 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add New Spec Key
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="Key name (e.g., Material, Finish)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        if (!newSpecKey.trim()) return
                        try {
                          const response = await fetch('/api/admin/spec-keys', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: newSpecKey.trim() }),
                          })
                          if (response.ok) {
                            const newKey = await response.json()
                            setSpecKeys([...specKeys, newKey])
                            setNewSpecKey('')
                          } else {
                            const error = await response.json()
                            alert(error.error || 'Failed to add spec key')
                          }
                        } catch (error) {
                          console.error('Error adding spec key:', error)
                          alert('Failed to add spec key')
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Key
                    </Button>
                  </div>
                  {specKeys.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {specKeys.map((key) => (
                        <span
                          key={key.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                        >
                          {key.name}
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm(`Delete spec key "${key.name}"?`)) return
                              try {
                                await fetch(`/api/admin/spec-keys?id=${key.id}`, { method: 'DELETE' })
                                setSpecKeys(specKeys.filter(k => k.id !== key.id))
                              } catch (error) {
                                console.error('Error deleting spec key:', error)
                              }
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 mt-6">
              {/* Description with Header/Footer Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                
                {/* Header Template Selection */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Header Template (optional)</label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedHeader}
                      onValueChange={(value) => {
                        setSelectedHeader(value)
                        // Update description with new header
                        const header = descTemplates.find(t => t.id === value)?.content || ''
                        const footer = descTemplates.find(t => t.id === selectedFooter)?.content || ''
                        const newDesc = [header, descBody, footer].filter(Boolean).join('\n\n')
                        setFormData({ ...formData, description: newDesc })
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select header template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No header</SelectItem>
                        {descTemplates.filter(t => t.type === 'header').map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedHeader && selectedHeader !== 'none' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedHeader('')
                          const footer = descTemplates.find(t => t.id === selectedFooter)?.content || ''
                          const newDesc = [descBody, footer].filter(Boolean).join('\n\n')
                          setFormData({ ...formData, description: newDesc })
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>

                {/* Main Description Body */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Main Content</label>
                  <textarea
                    className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    value={descBody}
                    onChange={(e) => {
                      setDescBody(e.target.value)
                      const header = descTemplates.find(t => t.id === selectedHeader)?.content || ''
                      const footer = descTemplates.find(t => t.id === selectedFooter)?.content || ''
                      const newDesc = [header, e.target.value, footer].filter(Boolean).join('\n\n')
                      setFormData({ ...formData, description: newDesc })
                    }}
                    placeholder="Enter main product description..."
                  />
                </div>

                {/* Footer Template Selection */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Footer Template (optional)</label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedFooter}
                      onValueChange={(value) => {
                        setSelectedFooter(value)
                        const header = descTemplates.find(t => t.id === selectedHeader)?.content || ''
                        const footer = descTemplates.find(t => t.id === value)?.content || ''
                        const newDesc = [header, descBody, footer].filter(Boolean).join('\n\n')
                        setFormData({ ...formData, description: newDesc })
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select footer template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No footer</SelectItem>
                        {descTemplates.filter(t => t.type === 'footer').map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedFooter && selectedFooter !== 'none' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFooter('')
                          const header = descTemplates.find(t => t.id === selectedHeader)?.content || ''
                          const newDesc = [header, descBody].filter(Boolean).join('\n\n')
                          setFormData({ ...formData, description: newDesc })
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <label className="block text-xs text-gray-500 mb-2">Preview</label>
                  <div className="text-sm whitespace-pre-wrap text-gray-700 max-h-[200px] overflow-y-auto">
                    {formData.description || <span className="text-gray-400 italic">No description</span>}
                  </div>
                </div>

                {/* Add New Template */}
                <div className="mt-4 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add New Template</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="Template name"
                        className="flex-1"
                      />
                      <Select value={newTemplateType} onValueChange={(v: 'header' | 'footer') => setNewTemplateType(v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="header">Header</SelectItem>
                          <SelectItem value="footer">Footer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <textarea
                      className="w-full min-h-[80px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      value={newTemplateContent}
                      onChange={(e) => setNewTemplateContent(e.target.value)}
                      placeholder="Template content..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (!newTemplateName.trim() || !newTemplateContent.trim()) {
                          alert('Please enter template name and content')
                          return
                        }
                        try {
                          const response = await fetch('/api/admin/description-templates', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: newTemplateName.trim(),
                              content: newTemplateContent.trim(),
                              type: newTemplateType,
                            }),
                          })
                          if (response.ok) {
                            const newTemplate = await response.json()
                            setDescTemplates([...descTemplates, newTemplate])
                            setNewTemplateName('')
                            setNewTemplateContent('')
                          } else {
                            const error = await response.json()
                            alert(error.error || 'Failed to add template')
                          }
                        } catch (error) {
                          console.error('Error adding template:', error)
                          alert('Failed to add template')
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Template
                    </Button>
                  </div>

                  {/* Existing Templates */}
                  {descTemplates.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-500">Existing Templates:</p>
                      <div className="flex flex-wrap gap-2">
                        {descTemplates.map((t) => (
                          <span
                            key={t.id}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                              t.type === 'header' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}
                          >
                            [{t.type}] {t.name}
                            <button
                              type="button"
                              onClick={async () => {
                                if (!confirm(`Delete template "${t.name}"?`)) return
                                try {
                                  await fetch(`/api/admin/description-templates?id=${t.id}`, { method: 'DELETE' })
                                  setDescTemplates(descTemplates.filter(x => x.id !== t.id))
                                } catch (error) {
                                  console.error('Error deleting template:', error)
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 ml-1"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Video URLs (up to 4)
                </label>
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index}>
                      <Input
                        value={formData.videoUrls?.[index] || ''}
                        onChange={(e) => {
                          const newVideoUrls = [...(formData.videoUrls || ['', '', '', ''])]
                          newVideoUrls[index] = e.target.value
                          setFormData({ ...formData, videoUrls: newVideoUrls })
                        }}
                        placeholder={`Video ${index + 1}: https://www.youtube.com/watch?v=...`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Add YouTube videos to showcase the product (supports youtube.com/watch, youtu.be, shorts)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty
                </label>
                <Input
                  value={formData.warranty || ''}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  placeholder="e.g., 2 Year Manufacturer Warranty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What&apos;s Included (comma separated)
                </label>
                <Input
                  value={formData.included?.join(', ') || ''}
                  onChange={(e) => {
                    // Preserve the raw input value including spaces
                    const rawValue = e.target.value
                    // Split by comma only, preserve spaces within items
                    const items = rawValue.split(',').map(s => s.trimStart())
                    setFormData({ 
                      ...formData, 
                      included: items
                    })
                  }}
                  onBlur={(e) => {
                    // Clean up on blur - trim and filter empty items
                    const rawValue = e.target.value
                    const items = rawValue.split(',').map(s => s.trim()).filter(Boolean)
                    setFormData({ 
                      ...formData, 
                      included: items
                    })
                  }}
                  placeholder="e.g., Case, Mouthpiece, Cleaning Kit"
                />
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
                editingProduct ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
