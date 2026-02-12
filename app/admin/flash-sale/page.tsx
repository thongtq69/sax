'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save, Zap, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface FlashSaleData {
    title: string
    subtitle: string
    isVisible: boolean
    metadata: {
        endDate: string
        urgencyText: string
        showTimer: boolean
        buttonText: string
    }
}

export default function FlashSaleAdminPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [formData, setFormData] = useState<FlashSaleData>({
        title: 'Flash Sale Ending Soon',
        subtitle: 'Exclusive prices on selected professional instruments.',
        isVisible: true,
        metadata: {
            endDate: '2026-03-31T23:59:59',
            urgencyText: '🏃 HURRY! LOW STOCK',
            showTimer: true,
            buttonText: 'Grab Now',
        },
    })

    useEffect(() => {
        fetchFlashSaleData()
    }, [])

    const fetchFlashSaleData = async () => {
        try {
            const response = await fetch('/api/admin/homepage-content/flash-sale')
            if (response.ok) {
                const data = await response.json()
                setFormData({
                    title: data.title || 'Flash Sale Ending Soon',
                    subtitle: data.subtitle || '',
                    isVisible: data.isVisible ?? true,
                    metadata: {
                        endDate: data.metadata?.endDate || '2026-03-31T23:59:59',
                        urgencyText: data.metadata?.urgencyText || '🏃 HURRY! LOW STOCK',
                        showTimer: data.metadata?.showTimer ?? true,
                        buttonText: data.metadata?.buttonText || 'Grab Now',
                    },
                })
            }
        } catch (error) {
            console.error('Error fetching flash sale data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        setStatus(null)

        try {
            const response = await fetch('/api/admin/homepage-content/flash-sale', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                setStatus({ type: 'success', message: 'Flash sale settings updated successfully!' })
                setTimeout(() => setStatus(null), 3000)
            } else {
                throw new Error('Failed to save settings')
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to update settings. Please try again.' })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Zap className="h-8 w-8 text-amber-500 fill-amber-500" />
                        Flash Sale Setup
                    </h1>
                    <p className="text-gray-600 mt-1">Configure your main promotional campaign timer and visibility</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2 px-6">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            {status && (
                <div className={`p-4 rounded-lg border flex items-center gap-3 ${status.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    {status.type === 'success' ? <Zap className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                    {status.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Status Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Campaign Visibility</CardTitle>
                        <CardDescription>Emergency toggle and basic naming</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-dashed">
                            <div className="space-y-0.5">
                                <Label className="text-base">Activate Flash Sale</Label>
                                <p className="text-xs text-gray-500">When OFF, the entire section will be hidden from the homepage.</p>
                            </div>
                            <Switch
                                checked={formData.isVisible}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label>Campaign Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g. Flash Sale Ending Soon"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description / Subtitle</Label>
                                <Input
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                                    placeholder="e.g. Professional Instruments at exclusive prices"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Timer Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-400" />
                            Campaign Timer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>End Date & Time</Label>
                            <Input
                                type="datetime-local"
                                value={formData.metadata.endDate.substring(0, 16)}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    metadata: { ...prev.metadata, endDate: e.target.value }
                                }))}
                            />
                            <p className="text-[10px] text-gray-400">The countdown will automatically expire at this time.</p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <Label className="text-sm">Show Timer</Label>
                            <Switch
                                checked={formData.metadata.showTimer}
                                onCheckedChange={(checked) => setFormData(prev => ({
                                    ...prev,
                                    metadata: { ...prev.metadata, showTimer: checked }
                                }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Branding & CTA */}
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Urgency & Action</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Urgency Badge Text</Label>
                            <Input
                                value={formData.metadata.urgencyText}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    metadata: { ...prev.metadata, urgencyText: e.target.value }
                                }))}
                                placeholder="🏃 HURRY! LOW STOCK"
                            />
                            <p className="text-[10px] text-gray-400 italic">Displayed on product cards to drive action.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Button text (CTA)</Label>
                            <Input
                                value={formData.metadata.buttonText}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    metadata: { ...prev.metadata, buttonText: e.target.value }
                                }))}
                                placeholder="Grab Now"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Logic Info */}
                <div className="md:col-span-3 bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 space-y-1">
                        <p className="font-bold">Important Note:</p>
                        <p>The products shown in the Flash Sale section are managed via <a href="/admin/featured-collections" className="underline font-bold">Featured Collections (On Sale slug)</a>. Update that collection to change which specific saxophones are appearing in the sale.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
