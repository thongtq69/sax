'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createProduct,
  updateProduct,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Save,
  CheckCircle2,
  FileText,
} from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'

type CategoryShape = {
  id: string
  name: string
  slug: string
  path: string
  subcategories?: { id: string; name: string; slug: string; path: string }[]
}

type BrandShape = {
  id: string
  name: string
  models?: string[]
  isActive: boolean
}

type SpecKeyShape = {
  id: string
  name: string
  isActive: boolean
}

type AccessoryShape = {
  id: string
  name: string
  isActive: boolean
}

type DescTemplateShape = {
  id: string
  name: string
  content: string
  type: string
}

interface ProductFormProps {
  initialData?: any // Raw API product or transformed product
  productId?: string
  categories: CategoryShape[]
  brands: BrandShape[]
  specKeys: SpecKeyShape[]
  accessories: AccessoryShape[]
  descTemplates: DescTemplateShape[]
}

type FormState = Partial<Product> & {
  stockStatus?: string
  productType?: string
  condition?: string
  conditionNotes?: string
  videoUrls?: string[]
  subBrand?: string
  isVisible?: boolean
  status?: 'draft' | 'published'
}

const AUTOSAVE_KEY_PREFIX = 'admin_product_form_autosave:'
const AUTOSAVE_INTERVAL_MS = 5000

export default function ProductForm({
  initialData,
  productId,
  categories: initialCategories,
  brands: initialBrands,
  specKeys: initialSpecKeys,
  accessories: initialAccessories,
  descTemplates: initialDescTemplates,
}: ProductFormProps) {
  const router = useRouter()
  const isEditing = Boolean(productId)
  const autosaveKey = `${AUTOSAVE_KEY_PREFIX}${productId || 'new'}`

  const [categories] = useState<CategoryShape[]>(initialCategories)
  const [brands] = useState<BrandShape[]>(initialBrands)
  const [specKeys, setSpecKeys] = useState<SpecKeyShape[]>(initialSpecKeys)
  const [accessories, setAccessories] = useState<AccessoryShape[]>(initialAccessories)
  const [descTemplates, setDescTemplates] = useState<DescTemplateShape[]>(initialDescTemplates)

  const [activeTab, setActiveTab] = useState('basic')
  const [customBrand, setCustomBrand] = useState('')
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newAccessory, setNewAccessory] = useState('')
  const [selectedHeader, setSelectedHeader] = useState('')
  const [selectedFooter, setSelectedFooter] = useState('')
  const [descBody, setDescBody] = useState('')
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateContent, setNewTemplateContent] = useState('')
  const [newTemplateType, setNewTemplateType] = useState<'header' | 'footer'>('header')
  const [isSaving, setIsSaving] = useState(false)
  const [savingMode, setSavingMode] = useState<'draft' | 'publish' | null>(null)
  const [restoredFromAutosave, setRestoredFromAutosave] = useState(false)

  // Initialize form state from initialData (already raw API product passed by server)
  const buildInitialState = useCallback((): FormState => {
    if (!initialData) {
      return {
        name: '',
        slug: '',
        brand: '',
        subBrand: '',
        price: 0,
        discount: 0,
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
        isVisible: true,
        videoUrls: ['', '', '', ''],
        description: '',
        specs: {
          Brand: '',
          SKU: '',
          SN: '',
          Condition: '',
        },
        included: [],
        warranty: '',
        sku: '',
        rating: 0,
        reviewCount: 0,
        status: 'draft',
      }
    }

    // Resolve category to ID (initialData.category may be a relation object or a slug/id string)
    const categoryRel = initialData.category
    const categoryIdFromRel =
      categoryRel && typeof categoryRel === 'object' ? categoryRel.id : null
    const categoryStr =
      typeof categoryRel === 'string' ? categoryRel : initialData.categoryId || ''
    const resolvedCategoryObj = categories.find(
      (c) => c.id === (categoryIdFromRel || categoryStr) || c.slug === categoryStr
    )
    const resolvedCategoryId = resolvedCategoryObj?.id || categoryIdFromRel || categoryStr || ''

    const subcategoryRel = initialData.subcategory
    const subcategoryIdFromRel =
      subcategoryRel && typeof subcategoryRel === 'object' ? subcategoryRel.id : null
    const subcategoryStr =
      typeof subcategoryRel === 'string' ? subcategoryRel : initialData.subcategoryId || ''
    const resolvedSubcategoryObj = resolvedCategoryObj?.subcategories?.find(
      (s) => s.id === (subcategoryIdFromRel || subcategoryStr) || s.slug === subcategoryStr
    )
    const resolvedSubcategoryId =
      resolvedSubcategoryObj?.id || subcategoryIdFromRel || subcategoryStr || ''

    const normalizedSpecs: Record<string, any> = { ...(initialData.specs || {}) }
    if (!normalizedSpecs.SKU && normalizedSpecs.Serial) {
      normalizedSpecs.SKU = normalizedSpecs.Serial
    }

    const videoUrls: string[] =
      Array.isArray(initialData.videoUrls) && initialData.videoUrls.length > 0
        ? [...initialData.videoUrls, '', '', '', ''].slice(0, 4)
        : initialData.videoUrl
          ? [initialData.videoUrl, '', '', '']
          : ['', '', '', '']

    return {
      name: initialData.name || '',
      slug: initialData.slug || '',
      brand: initialData.brand || '',
      subBrand: initialData.subBrand || '',
      price: initialData.price || 0,
      discount: initialData.discount ?? 0,
      shippingCost: initialData.shippingCost ?? undefined,
      category: resolvedCategoryId,
      subcategory: resolvedSubcategoryId,
      images: initialData.images || [],
      badge: initialData.badge || undefined,
      inStock: initialData.inStock ?? true,
      stock: initialData.stock ?? 0,
      stockStatus: initialData.stockStatus || 'in-stock',
      productType: initialData.productType || 'new',
      condition: initialData.condition || undefined,
      conditionNotes: initialData.conditionNotes || '',
      isVisible: initialData.isVisible !== false,
      videoUrls,
      description: initialData.description || '',
      specs: normalizedSpecs,
      included: initialData.included || [],
      warranty: initialData.warranty || '',
      sku: initialData.sku || '',
      rating: initialData.rating || 0,
      reviewCount: initialData.reviewCount || 0,
      status: (initialData.status as 'draft' | 'published') || 'published',
    }
  }, [initialData, categories])

  const [formData, setFormData] = useState<FormState>(buildInitialState)

  // Parse description into header/body/footer once on mount
  useEffect(() => {
    if (!initialData?.description) {
      setDescBody(formData.description || '')
      return
    }
    let parsedBody = initialData.description as string
    let foundHeader = ''
    let foundFooter = ''

    for (const template of descTemplates.filter((t) => t.type === 'header')) {
      if (parsedBody.startsWith(template.content)) {
        foundHeader = template.id
        parsedBody = parsedBody.slice(template.content.length).replace(/^\n\n/, '')
        break
      }
    }
    for (const template of descTemplates.filter((t) => t.type === 'footer')) {
      if (parsedBody.endsWith(template.content)) {
        foundFooter = template.id
        parsedBody = parsedBody.slice(0, -template.content.length).replace(/\n\n$/, '')
        break
      }
    }
    setSelectedHeader(foundHeader)
    setSelectedFooter(foundFooter)
    setDescBody(parsedBody)

    if (initialData.brand && !brands.some((b) => b.name === initialData.brand)) {
      setCustomBrand(initialData.brand)
    }
    // Only run on mount; ignore deps changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-restore from localStorage on mount (only for new products to avoid overriding edits)
  const hasRestoredRef = useRef(false)
  useEffect(() => {
    if (hasRestoredRef.current) return
    hasRestoredRef.current = true
    try {
      const saved = localStorage.getItem(autosaveKey)
      if (!saved) return
      const parsed = JSON.parse(saved)
      if (parsed && parsed.savedAt && parsed.formData) {
        // Only auto-restore for "new" products. For edit, prompt the user.
        if (!isEditing) {
          if (
            window.confirm(
              `Found an unsaved draft from ${new Date(parsed.savedAt).toLocaleString()}.\n\nRestore it?`
            )
          ) {
            setFormData(parsed.formData)
            setDescBody(parsed.descBody || '')
            setSelectedHeader(parsed.selectedHeader || '')
            setSelectedFooter(parsed.selectedFooter || '')
            setRestoredFromAutosave(true)
          } else {
            localStorage.removeItem(autosaveKey)
          }
        }
      }
    } catch (err) {
      console.warn('Could not restore autosave:', err)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save to localStorage every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem(
          autosaveKey,
          JSON.stringify({
            savedAt: new Date().toISOString(),
            formData,
            descBody,
            selectedHeader,
            selectedFooter,
          })
        )
      } catch (err) {
        // localStorage might be full or unavailable
      }
    }, AUTOSAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [formData, descBody, selectedHeader, selectedFooter, autosaveKey])

  // Auto-sync Brand/SKU/Condition/Model to specs
  useEffect(() => {
    const currentSpecs = formData.specs || {}
    const newSpecs: Record<string, any> = { ...currentSpecs }
    if (formData.brand) newSpecs.Brand = formData.brand
    if (formData.subBrand && formData.subBrand.trim() !== '') {
      newSpecs.Model = formData.subBrand
    }
    if (formData.sku && formData.sku.trim() !== '') {
      newSpecs.SKU = formData.sku
    }
    if (formData.productType === 'used' && formData.condition) {
      const conditionLabels: Record<string, string> = {
        mint: 'Mint',
        excellent: 'Excellent',
        'very-good': 'Very Good',
        good: 'Good',
        fair: 'Fair',
      }
      newSpecs.Condition = conditionLabels[formData.condition] || formData.condition
    } else if (formData.productType === 'new') {
      newSpecs.Condition = 'New'
    }
    if (JSON.stringify(newSpecs) !== JSON.stringify(currentSpecs)) {
      setFormData((prev) => ({ ...prev, specs: newSpecs }))
    }
  }, [formData.brand, formData.subBrand, formData.sku, formData.condition, formData.productType])

  const buildPayload = (status: 'draft' | 'published') => {
    const categoryObj = categories.find(
      (c) => c.id === formData.category || c.slug === formData.category
    )
    const subcategoryObj = categoryObj?.subcategories?.find(
      (s) => s.id === formData.subcategory || s.slug === formData.subcategory
    )

    return {
      name: formData.name,
      slug:
        formData.slug ||
        formData.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ||
        '',
      brand: formData.brand,
      subBrand: formData.subBrand || null,
      price: formData.price,
      discount: formData.discount ?? 0,
      shippingCost: formData.shippingCost || null,
      categoryId: categoryObj?.id || formData.category,
      subcategoryId: subcategoryObj?.id || formData.subcategory || null,
      images: formData.images || [],
      badge: formData.badge || null,
      inStock: formData.stockStatus === 'in-stock',
      stock: formData.productType === 'used' ? 1 : formData.stock || 0,
      stockStatus: formData.stockStatus || 'in-stock',
      productType: formData.productType || 'new',
      condition:
        formData.productType === 'used' ? formData.condition || 'excellent' : null,
      conditionNotes:
        formData.productType === 'used' ? formData.conditionNotes || null : null,
      videoUrls: (formData.videoUrls || []).filter((url) => url && url.trim()),
      description: formData.description,
      specs: formData.specs || null,
      included: formData.included || [],
      warranty: formData.warranty || null,
      sku: formData.sku,
      rating: formData.rating || 0,
      reviewCount: formData.reviewCount || 0,
      isVisible: formData.isVisible !== false,
      status,
    }
  }

  const handleSave = async (status: 'draft' | 'published') => {
    if (status === 'published') {
      // Light validation for publish
      if (!formData.name?.trim()) {
        alert('Product name is required to publish.')
        setActiveTab('basic')
        return
      }
      if (!formData.brand?.trim()) {
        alert('Brand is required to publish.')
        setActiveTab('basic')
        return
      }
      if (!formData.sku?.trim()) {
        alert('SKU is required to publish.')
        setActiveTab('basic')
        return
      }
      if (!formData.category) {
        alert('Category is required to publish.')
        setActiveTab('basic')
        return
      }
      if (!formData.price || formData.price <= 0) {
        alert('Price must be greater than 0 to publish.')
        setActiveTab('pricing')
        return
      }
    }

    try {
      setIsSaving(true)
      setSavingMode(status === 'draft' ? 'draft' : 'publish')
      const payload = buildPayload(status)
      if (isEditing && productId) {
        await updateProduct(productId, payload)
      } else {
        await createProduct(payload)
      }
      // Clear autosave on successful save
      try {
        localStorage.removeItem(autosaveKey)
      } catch {}
      router.push('/admin/products')
      router.refresh()
    } catch (error: any) {
      console.error('Error saving product:', error)
      alert(error?.message || 'Failed to save product. Please try again.')
    } finally {
      setIsSaving(false)
      setSavingMode(null)
    }
  }

  const handleCancel = () => {
    if (isSaving) return
    if (
      window.confirm(
        'Are you sure you want to cancel? Unsaved changes will be lost (autosaved draft will be kept for 24h).'
      )
    ) {
      router.push('/admin/products')
    }
  }

  const productNamePreview = formData.name?.trim() || (isEditing ? 'Untitled Product' : 'New Product')

  return (
    <div className="space-y-6">
      {/* Sticky header bar with save buttons */}
      <div className="sticky top-0 z-30 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 bg-white border-b border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm" disabled={isSaving}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-gray-500 truncate">
              {productNamePreview}
              {formData.status === 'draft' && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 uppercase">
                  Draft
                </span>
              )}
              {restoredFromAutosave && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                  Recovered
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="flex-1 sm:flex-none"
          >
            {savingMode === 'draft' ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-1" />
            )}
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="flex-1 sm:flex-none"
          >
            {savingMode === 'publish' ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-1" />
            )}
            {isEditing && formData.status === 'published' ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Autosave hint */}
      <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
        <Save className="h-3 w-3" />
        <span>Autosaving every 5 seconds. Your work is safe even if the tab closes.</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
          <TabsTrigger value="specs">Specs</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  const newName = e.target.value
                  if (!formData.slug || formData.slug === '') {
                    const autoSlug = newName
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '')
                    setFormData({ ...formData, name: newName, slug: autoSlug })
                  } else {
                    setFormData({ ...formData, name: newName })
                  }
                }}
                placeholder="Enter product name"
                className="text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
              <Input
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="e.g., C143LF or A-9910042"
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">Product SKU used for internal lookup</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SN</label>
              <Input
                value={(formData.specs?.['SN'] as string) || ''}
                onChange={(e) => {
                  const newSpecs = { ...(formData.specs || {}), SN: e.target.value.toUpperCase() }
                  setFormData({ ...formData, specs: newSpecs })
                }}
                placeholder="e.g., 9910042"
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-synced to Specs → SN</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <Select
                value={brands.some((b) => b.name === formData.brand) ? formData.brand : '__custom__'}
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
                  <SelectItem value="__custom__">Enter custom brand...</SelectItem>
                </SelectContent>
              </Select>
              {(!brands.some((b) => b.name === formData.brand) || formData.brand === '') && (
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
                Select from list or enter custom brand.{' '}
                <a href="/admin/brands" target="_blank" className="text-primary hover:underline">
                  Manage brands
                </a>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              {(() => {
                const selectedBrand = brands.find((b) => b.name === formData.brand)
                const brandModels = selectedBrand?.models || []
                return (
                  <>
                    {brandModels.length > 0 && (
                      <Select
                        value={formData.subBrand || '__custom__'}
                        onValueChange={(value) => {
                          if (value === '__custom__' || value === '__none__') {
                            setFormData({ ...formData, subBrand: '' })
                          } else {
                            setFormData({ ...formData, subBrand: value })
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">None</SelectItem>
                          {brandModels.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                          <SelectItem value="__custom__">Enter custom model...</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {(brandModels.length === 0 ||
                      formData.subBrand === '' ||
                      (!brandModels.includes(formData.subBrand || '') && formData.subBrand)) && (
                      <Input
                        value={formData.subBrand || ''}
                        onChange={(e) => setFormData({ ...formData, subBrand: e.target.value })}
                        placeholder="e.g., Mark VI, Serie III"
                        className={brandModels.length > 0 ? 'mt-2' : ''}
                      />
                    )}
                  </>
                )
              })()}
              <p className="text-xs text-gray-500 mt-1">
                {formData.brand
                  ? 'Select from list or enter custom model.'
                  : 'Select a brand first to see available models.'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
              <Select
                value={formData.subcategory || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, subcategory: value === 'none' ? '' : value })
                }
                disabled={!formData.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories
                    .find((c) => c.id === formData.category)
                    ?.subcategories?.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL Path)</label>
              <Input
                value={formData.slug}
                onChange={(e) => {
                  const formatted = e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '')
                  setFormData({ ...formData, slug: formatted })
                }}
                placeholder="auto-generated-from-product-name"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to auto-generate from product name.
              </p>
              {(formData.slug || formData.sku) && (
                <p className="text-xs text-blue-600 mt-1">
                  URL:{' '}
                  {getProductUrl(
                    String(formData.sku || ''),
                    String(formData.slug || ''),
                    String((formData.specs?.['SN'] as string) || '')
                  )}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Badges (select multiple)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'new', label: 'New Arrival' },
                  { value: 'sale', label: 'Special Pricing' },
                  { value: 'rare', label: 'Limited Availability' },
                  { value: 'coming-soon', label: 'Arriving Soon' },
                  { value: 'premium', label: 'Premium Selection' },
                  { value: 'top-tier', label: 'Top-Tier' },
                ].map((badge) => {
                  const badges = formData.badge ? formData.badge.split(',') : []
                  const isSelected = badges.includes(badge.value)
                  return (
                    <label
                      key={badge.value}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          let newBadges = badges.filter((b) => b !== badge.value)
                          if (e.target.checked) newBadges.push(badge.value)
                          setFormData({
                            ...formData,
                            badge: newBadges.length > 0 ? newBadges.join(',') : undefined,
                          } as any)
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{badge.label}</span>
                    </label>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Leave all unchecked for &quot;Special Pricing&quot; default
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
              <Select
                value={formData.productType || 'new'}
                onValueChange={(value) => {
                  const updates: any = { productType: value }
                  if (value === 'used') {
                    updates.stock = 1
                    if (!formData.condition) updates.condition = 'excellent'
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <Select
                  value={formData.condition || 'excellent'}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      condition: value as 'mint' | 'excellent' | 'very-good' | 'good' | 'fair',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mint">Mint - Essentially new</SelectItem>
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
            <div>
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

          <div className="pt-4 border-t">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData.isVisible !== false}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                />
                <div
                  className={`block w-14 h-8 rounded-full transition-colors ${
                    formData.isVisible !== false ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
                <div
                  className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                    formData.isVisible !== false ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  Visible on Website
                </span>
                <p className="text-xs text-gray-500">
                  Uncheck to hide this product from the storefront without deleting it. Drafts are
                  always hidden regardless of this toggle.
                </p>
              </div>
            </label>
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
            <p className="text-sm text-gray-500 mb-4">
              Upload images from your device or add from URL. First image will be the main product
              image.
            </p>
            <ImageUpload
              images={formData.images || []}
              onChange={(images) => setFormData((prev) => ({ ...prev, images }))}
              folder="sax/products"
            />
          </div>
        </TabsContent>

        {/* Pricing & Stock Tab */}
        <TabsContent value="pricing" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
              <Input
                type="text"
                inputMode="decimal"
                value={formData.price === 0 ? '' : formData.price?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    const cleanValue = value.replace(/^0+(?=\d)/, '')
                    const numValue = parseFloat(cleanValue) || 0
                    setFormData({ ...formData, price: numValue })
                  }
                }}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount ($)</label>
              <Input
                type="text"
                inputMode="decimal"
                value={
                  formData.discount && formData.discount !== 0
                    ? formData.discount.toString()
                    : ''
                }
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    const cleanValue = value.replace(/^0+(?=\d)/, '')
                    const numValue = cleanValue ? parseFloat(cleanValue) : 0
                    setFormData({ ...formData, discount: numValue })
                  }
                }}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Amount off in dollars (e.g., 200 means $200 off the displayed price). Leave 0 for no
                discount.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Cost ($)
              </label>
              <Input
                type="text"
                inputMode="decimal"
                value={formData.shippingCost ? formData.shippingCost.toString() : ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    const cleanValue = value.replace(/^0+(?=\d)/, '')
                    const numValue = cleanValue ? parseFloat(cleanValue) : undefined
                    setFormData({ ...formData, shippingCost: numValue })
                  }
                }}
                placeholder="Leave empty to use zone rate"
              />
              <p className="text-xs text-gray-500 mt-1">
                Product-specific shipping cost (optional). Leave empty to use shipping zone rate.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                disabled={formData.productType === 'used'}
              />
              {formData.productType === 'used' && (
                <p className="text-xs text-gray-500 mt-1">
                  Stock is automatically set to 1 for used products
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
              <Select
                value={formData.stockStatus || 'in-stock'}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    stockStatus: value as 'in-stock' | 'sold-out' | 'pre-order',
                    inStock: value === 'in-stock',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stock status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-stock">In Stock - Ships within 1-2 business days</SelectItem>
                  <SelectItem value="sold-out">Sold Out - Currently unavailable</SelectItem>
                  <SelectItem value="pre-order">Pre-Order - Ready in 7-10 days</SelectItem>
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
              All specification fields are shown below. Fill in the values as needed.
            </p>
            <div className="space-y-3">
              {specKeys.map((specKey) => (
                <div key={specKey.id} className="flex gap-2 items-center">
                  <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
                    {specKey.name}
                  </div>
                  <Input
                    value={(formData.specs?.[specKey.name] as string) || ''}
                    onChange={(e) => {
                      const newSpecs = { ...formData.specs, [specKey.name]: e.target.value }
                      setFormData({ ...formData, specs: newSpecs })
                    }}
                    placeholder={`Enter ${specKey.name.toLowerCase()}...`}
                    className="flex-1"
                  />
                </div>
              ))}

              {!specKeys.some((sk) => sk.name === 'Model') && (
                <div className="flex gap-2 items-center">
                  <div className="flex-1 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-sm font-medium text-amber-700">
                    Model <span className="text-xs font-normal">(auto-synced)</span>
                  </div>
                  <Input
                    value={(formData.specs?.['Model'] as string) || ''}
                    onChange={(e) => {
                      const newSpecs = { ...formData.specs, Model: e.target.value }
                      setFormData({ ...formData, specs: newSpecs })
                    }}
                    placeholder="Auto-filled from Basic Info"
                    className="flex-1"
                    readOnly
                  />
                </div>
              )}

              {Object.entries(formData.specs || {})
                .filter(([key]) => !specKeys.some((sk) => sk.name === key) && key !== 'Model')
                .map(([key, value], index) => (
                  <div key={`custom-${index}`} className="flex gap-2 items-center">
                    <Select
                      value={key}
                      onValueChange={(newKey) => {
                        const newSpecs = { ...formData.specs }
                        const oldValue = newSpecs[key]
                        delete newSpecs[key]
                        if (newKey) newSpecs[newKey] = oldValue
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
                      placeholder="Value"
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
            </div>

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
                            setSpecKeys(specKeys.filter((k) => k.id !== key.id))
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Header Template (optional)</label>
              <div className="flex gap-2">
                <Select
                  value={selectedHeader}
                  onValueChange={(value) => {
                    setSelectedHeader(value)
                    const header = descTemplates.find((t) => t.id === value)?.content || ''
                    const footer =
                      descTemplates.find((t) => t.id === selectedFooter)?.content || ''
                    const newDesc = [header, descBody, footer].filter(Boolean).join('\n\n')
                    setFormData({ ...formData, description: newDesc })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select header template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No header</SelectItem>
                    {descTemplates
                      .filter((t) => t.type === 'header')
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
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
                      const footer =
                        descTemplates.find((t) => t.id === selectedFooter)?.content || ''
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

            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Main Content</label>
              <textarea
                className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                value={descBody}
                onChange={(e) => {
                  setDescBody(e.target.value)
                  const header =
                    descTemplates.find((t) => t.id === selectedHeader)?.content || ''
                  const footer =
                    descTemplates.find((t) => t.id === selectedFooter)?.content || ''
                  const newDesc = [header, e.target.value, footer].filter(Boolean).join('\n\n')
                  setFormData({ ...formData, description: newDesc })
                }}
                placeholder="Enter main product description..."
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Footer Template (optional)</label>
              <div className="flex gap-2">
                <Select
                  value={selectedFooter}
                  onValueChange={(value) => {
                    setSelectedFooter(value)
                    const header =
                      descTemplates.find((t) => t.id === selectedHeader)?.content || ''
                    const footer = descTemplates.find((t) => t.id === value)?.content || ''
                    const newDesc = [header, descBody, footer].filter(Boolean).join('\n\n')
                    setFormData({ ...formData, description: newDesc })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select footer template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No footer</SelectItem>
                    {descTemplates
                      .filter((t) => t.type === 'footer')
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
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
                      const header =
                        descTemplates.find((t) => t.id === selectedHeader)?.content || ''
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

            <div className="bg-gray-50 rounded-lg p-4 border">
              <label className="block text-xs text-gray-500 mb-2">Preview</label>
              <div className="text-sm whitespace-pre-wrap text-gray-700 max-h-[200px] overflow-y-auto">
                {formData.description || (
                  <span className="text-gray-400 italic">No description</span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Template
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Template name"
                    className="flex-1"
                  />
                  <Select
                    value={newTemplateType}
                    onValueChange={(v: 'header' | 'footer') => setNewTemplateType(v)}
                  >
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

              {descTemplates.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-500">Existing Templates:</p>
                  <div className="flex flex-wrap gap-2">
                    {descTemplates.map((t) => (
                      <span
                        key={t.id}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          t.type === 'header'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        [{t.type}] {t.name}
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm(`Delete template "${t.name}"?`)) return
                            try {
                              await fetch(`/api/admin/description-templates?id=${t.id}`, {
                                method: 'DELETE',
                              })
                              setDescTemplates(descTemplates.filter((x) => x.id !== t.id))
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
                <Input
                  key={index}
                  value={formData.videoUrls?.[index] || ''}
                  onChange={(e) => {
                    const newVideoUrls = [...(formData.videoUrls || ['', '', '', ''])]
                    newVideoUrls[index] = e.target.value
                    setFormData({ ...formData, videoUrls: newVideoUrls })
                  }}
                  placeholder={`Video ${index + 1}: https://www.youtube.com/watch?v=...`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Add YouTube videos to showcase the product (supports youtube.com/watch, youtu.be,
              shorts)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Warranty</label>
            <Input
              value={formData.warranty || ''}
              onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
              placeholder="e.g., 2 Year Manufacturer Warranty"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What&apos;s Included
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Click to add accessories, or type custom items
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {(formData.included || []).map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => {
                      const newIncluded = [...(formData.included || [])]
                      newIncluded.splice(index, 1)
                      setFormData({ ...formData, included: newIncluded })
                    }}
                    className="text-primary/60 hover:text-red-500 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {accessories
                .filter((acc) => !(formData.included || []).includes(acc.name))
                .map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        included: [...(formData.included || []), acc.name],
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    {acc.name}
                  </button>
                ))}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Input
                value={newAccessory}
                onChange={(e) => setNewAccessory(e.target.value)}
                placeholder="Add custom item or new accessory..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newAccessory.trim()) {
                    e.preventDefault()
                    setFormData({
                      ...formData,
                      included: [...(formData.included || []), newAccessory.trim()],
                    })
                    setNewAccessory('')
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newAccessory.trim()) {
                    setFormData({
                      ...formData,
                      included: [...(formData.included || []), newAccessory.trim()],
                    })
                    setNewAccessory('')
                  }
                }}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  if (!newAccessory.trim()) return
                  try {
                    const response = await fetch('/api/admin/accessories', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: newAccessory.trim() }),
                    })
                    if (response.ok) {
                      const newAcc = await response.json()
                      setAccessories([...accessories, newAcc])
                      setFormData({
                        ...formData,
                        included: [...(formData.included || []), newAcc.name],
                      })
                      setNewAccessory('')
                    } else {
                      const error = await response.json()
                      alert(error.error || 'Failed to save accessory')
                    }
                  } catch (error) {
                    console.error('Error saving accessory:', error)
                  }
                }}
                title="Save as reusable accessory"
              >
                Save & Add
              </Button>
            </div>

            {accessories.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2">
                  Saved Accessories (click × to delete):
                </p>
                <div className="flex flex-wrap gap-2">
                  {accessories.map((acc) => (
                    <span
                      key={acc.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                    >
                      {acc.name}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`Delete accessory "${acc.name}"?`)) return
                          try {
                            await fetch(`/api/admin/accessories?id=${acc.id}`, {
                              method: 'DELETE',
                            })
                            setAccessories(accessories.filter((a) => a.id !== acc.id))
                          } catch (error) {
                            console.error('Error deleting accessory:', error)
                          }
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Mobile bottom safe-area save bar */}
      <div className="sm:hidden h-20" aria-hidden />
    </div>
  )
}
