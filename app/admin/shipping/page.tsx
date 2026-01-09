'use client'

import { useState, useEffect } from 'react'
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
import { Plus, Edit, Trash2, Loader2, Truck, Globe, Check } from 'lucide-react'

// Common country list
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'PH', name: 'Philippines' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'IL', name: 'Israel' },
  { code: 'RU', name: 'Russia' },
  { code: 'PL', name: 'Poland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IE', name: 'Ireland' },
  { code: 'GR', name: 'Greece' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'TR', name: 'Turkey' },
]

interface ShippingZone {
  id: string
  name: string
  countries: string[]
  shippingCost: number
  isDefault: boolean
  order: number
  isActive: boolean
}

export default function ShippingManagement() {
  const [zones, setZones] = useState<ShippingZone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    countries: [] as string[],
    shippingCost: 0,
    isDefault: false,
    order: 0,
    isActive: true,
  })

  const fetchZones = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/shipping-zones')
      if (response.ok) {
        const data = await response.json()
        setZones(data)
      }
    } catch (error) {
      console.error('Error fetching shipping zones:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchZones()
  }, [])

  const handleOpenDialog = (zone?: ShippingZone) => {
    if (zone) {
      setEditingZone(zone)
      setFormData({
        name: zone.name,
        countries: zone.countries,
        shippingCost: zone.shippingCost,
        isDefault: zone.isDefault,
        order: zone.order,
        isActive: zone.isActive,
      })
    } else {
      setEditingZone(null)
      setFormData({
        name: '',
        countries: [],
        shippingCost: 200,
        isDefault: false,
        order: zones.length,
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Zone name is required')
      return
    }

    try {
      setIsSaving(true)
      const url = editingZone 
        ? `/api/admin/shipping-zones/${editingZone.id}`
        : '/api/admin/shipping-zones'
      
      const response = await fetch(url, {
        method: editingZone ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchZones()
        setIsDialogOpen(false)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save shipping zone')
      }
    } catch (error) {
      console.error('Error saving shipping zone:', error)
      alert('Failed to save shipping zone')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipping zone?')) return

    try {
      const response = await fetch(`/api/admin/shipping-zones/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchZones()
      } else {
        alert('Failed to delete shipping zone')
      }
    } catch (error) {
      console.error('Error deleting shipping zone:', error)
    }
  }

  const toggleCountry = (code: string) => {
    setFormData(prev => ({
      ...prev,
      countries: prev.countries.includes(code)
        ? prev.countries.filter(c => c !== code)
        : [...prev.countries, code],
    }))
  }

  const getCountryName = (code: string) => {
    return COUNTRIES.find(c => c.code === code)?.name || code
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipping Zones</h1>
          <p className="text-gray-600 mt-2">Manage shipping costs by country groups</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Zone
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Shipping Logic</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Vietnam: $25 domestic shipping</li>
          <li>• Single product with specific shipping cost → use that cost</li>
          <li>• Multiple products with specific costs → use the highest one</li>
          <li>• Products without specific cost → use zone&apos;s base rate</li>
          <li>• Default zone applies to countries not in any specific zone</li>
        </ul>
      </div>

      {/* Zones List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {zones.length === 0 ? (
          <div className="p-12 text-center">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No shipping zones configured</p>
            <p className="text-sm text-gray-400 mt-2">Add zones to set shipping costs by region</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {zones.map((zone) => (
              <div key={zone.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {zone.name}
                        {zone.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                        {!zone.isActive && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {zone.countries.length > 0 
                          ? zone.countries.slice(0, 5).map(getCountryName).join(', ')
                          : 'All other countries'}
                        {zone.countries.length > 5 && ` +${zone.countries.length - 5} more`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-primary">${zone.shippingCost}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(zone)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(zone.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? 'Edit Shipping Zone' : 'Add Shipping Zone'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., North America, Europe, Asia Pacific"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Cost ($) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.shippingCost}
                onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
                placeholder="200"
                min="0"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Default zone (for countries not in any zone)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Countries in this zone
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select countries for this zone. Leave empty for default zone.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto border rounded-lg p-3">
                {COUNTRIES.map((country) => (
                  <label
                    key={country.code}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      formData.countries.includes(country.code)
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.countries.includes(country.code)}
                      onChange={() => toggleCountry(country.code)}
                      className="sr-only"
                    />
                    {formData.countries.includes(country.code) && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                    <span className="text-sm">{country.name}</span>
                  </label>
                ))}
              </div>
              {formData.countries.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {formData.countries.length} countries
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingZone ? 'Update Zone' : 'Create Zone'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
