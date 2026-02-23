'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Ticket, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Coupon {
    id: string
    amount: string
    code: string
    label: string
    description: string
    minSpend: number
    expiryDate: string
    applicableProducts?: string[] // IDs of products it applies to
}

interface CouponsData {
    title: string
    subtitle: string
    isVisible: boolean
    metadata: {
        coupons: Coupon[]
    }
}

export default function CouponsAdminPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [formData, setFormData] = useState<CouponsData>({
        title: 'EXCLUSIVE PRIVILEGES FOR PROFESSIONAL MUSICIANS',
        subtitle: 'Unlock premium discounts and seasonal vouchers curated for our most valued collectors and performers.',
        isVisible: true,
        metadata: { coupons: [] },
    })

    useEffect(() => {
        fetchCouponsData()
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products?limit=1000')
            if (response.ok) {
                const data = await response.json()
                setProducts(data.products || [])
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const fetchCouponsData = async () => {
        try {
            const response = await fetch('/api/admin/homepage-content/rewards-vouchers')
            if (response.ok) {
                const data = await response.json()
                setFormData({
                    title: data.title || '',
                    subtitle: data.subtitle || '',
                    isVisible: data.isVisible ?? true,
                    metadata: {
                        coupons: (data.metadata?.coupons || []).map((c: any) => ({
                            ...c,
                            applicableProducts: c.applicableProducts || []
                        })),
                    },
                })
            }
        } catch (error) {
            console.error('Error fetching coupons data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await fetch('/api/admin/homepage-content/rewards-vouchers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            if (response.ok) {
                alert('Coupons updated successfully!')
            }
        } catch (error) {
            alert('Failed to save coupons')
        } finally {
            setIsSaving(false)
        }
    }

    const addCoupon = () => {
        const newCoupon: Coupon = {
            id: Math.random().toString(36).substr(2, 9),
            amount: '10%',
            code: 'NEW-CODE',
            label: 'New Promotion',
            description: 'Terms and conditions apply.',
            minSpend: 1000,
            expiryDate: '2026-12-31',
            applicableProducts: []
        }
        setFormData(prev => ({
            ...prev,
            metadata: { ...prev.metadata, coupons: [...prev.metadata.coupons, newCoupon] }
        }))
    }

    const removeCoupon = (id: string) => {
        setFormData(prev => ({
            ...prev,
            metadata: { ...prev.metadata, coupons: prev.metadata.coupons.filter(c => c.id !== id) }
        }))
    }

    const updateCoupon = (id: string, field: keyof Coupon, value: any) => {
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                coupons: prev.metadata.coupons.map(c => c.id === id ? { ...c, [field]: value } : c)
            }
        }))
    }

    const toggleProductInCoupon = (couponId: string, productId: string) => {
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                coupons: prev.metadata.coupons.map(c => {
                    if (c.id === couponId) {
                        const current = c.applicableProducts || []
                        const next = current.includes(productId)
                            ? current.filter(id => id !== productId)
                            : [...current, productId]
                        return { ...c, applicableProducts: next }
                    }
                    return c
                })
            }
        }))
    }

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Ticket className="h-8 w-8 text-primary" />
                        Coupons & Vouchers
                    </h1>
                    <p className="text-gray-500">Manage the Golden Ticket tokens shown on the homepage.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Section Header</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Main Title</Label>
                            <Input value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Subtitle</Label>
                            <Input value={formData.subtitle} onChange={e => setFormData(prev => ({ ...prev, subtitle: e.target.value }))} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Active Vouchers</h2>
                    <Button variant="outline" onClick={addCoupon} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Voucher
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.metadata.coupons.map((coupon) => (
                        <Card key={coupon.id} className="relative group overflow-hidden border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold font-mono">
                                        ID: {coupon.id}
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeCoupon(coupon.id)} className="text-red-500 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase font-bold text-gray-400">Amount (e.g. $500 or 15%)</Label>
                                        <Input value={coupon.amount} onChange={e => updateCoupon(coupon.id, 'amount', e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase font-bold text-gray-400">Promo Code</Label>
                                        <Input value={coupon.code} onChange={e => updateCoupon(coupon.id, 'code', e.target.value)} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-bold text-gray-400">Voucher Label</Label>
                                    <Input value={coupon.label} onChange={e => updateCoupon(coupon.id, 'label', e.target.value)} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-bold text-gray-400">Short Description</Label>
                                    <Input value={coupon.description} onChange={e => updateCoupon(coupon.id, 'description', e.target.value)} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase font-bold text-gray-400">Min Spend ($)</Label>
                                        <Input type="number" value={coupon.minSpend} onChange={e => updateCoupon(coupon.id, 'minSpend', parseInt(e.target.value))} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase font-bold text-gray-400">Expiry Date</Label>
                                        <Input value={coupon.expiryDate} onChange={e => updateCoupon(coupon.id, 'expiryDate', e.target.value)} />
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <Label className="text-[10px] uppercase font-bold text-gray-400">Applicable Products (Empty = All)</Label>
                                        <input
                                            type="text"
                                            placeholder="Filter..."
                                            className="text-[10px] px-2 py-0.5 border rounded bg-white w-24 focus:w-32 transition-all outline-none"
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1 bg-gray-50/50">
                                        {products.length === 0 && <p className="text-xs text-center py-4 text-gray-400">No products found</p>}
                                        {products.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => (
                                            <div key={product.id} className="flex items-center gap-2 group/item">
                                                <input
                                                    type="checkbox"
                                                    id={`product-${coupon.id}-${product.id}`}
                                                    checked={(coupon.applicableProducts || []).includes(product.id)}
                                                    onChange={() => toggleProductInCoupon(coupon.id, product.id)}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <label
                                                    htmlFor={`product-${coupon.id}-${product.id}`}
                                                    className="text-xs text-gray-600 truncate flex-1 cursor-pointer group-hover/item:text-primary transition-colors"
                                                >
                                                    {product.name}
                                                </label>
                                                <span className="text-[10px] text-gray-400 font-mono">${product.price.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {formData.metadata.coupons.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
                        <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No vouchers created yet.</p>
                        <Button variant="link" onClick={addCoupon}>Create your first promotion</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
