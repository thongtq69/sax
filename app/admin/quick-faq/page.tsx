'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CircleHelp, Save, Plus, Trash2, GripVertical } from 'lucide-react'

interface QuickFaqItem {
  id: string
  question: string
  answer: string
  category: string
  isActive: boolean
}

const defaultQuickFaqs: QuickFaqItem[] = [
  {
    id: '1',
    question: 'Is this a beginner saxophone?',
    answer: 'No. We sell professional models only, intended for serious students and working musicians.',
    category: 'Product',
    isActive: true
  },
  {
    id: '2',
    question: 'Is this instrument ready to ship?',
    answer: 'Yes. All listed saxophones are fully prepared and ready for immediate shipment.',
    category: 'Shipping',
    isActive: true
  },
  {
    id: '3',
    question: 'How long does delivery to the U.S. take?',
    answer: 'We use FedEx, DHL, or UPS express international shipping, with delivery typically in 3–4 business days.',
    category: 'Shipping',
    isActive: true
  },
  {
    id: '4',
    question: 'Is payment secure?',
    answer: 'Yes. All payments are processed via PayPal with full buyer protection.',
    category: 'Payment',
    isActive: true
  },
  {
    id: '5',
    question: 'Can I ask questions before buying?',
    answer: 'Absolutely. We encourage you to contact us before purchase for detailed guidance.',
    category: 'Support',
    isActive: true
  }
]

export default function QuickFaqPage() {
  const [faqs, setFaqs] = useState<QuickFaqItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    fetchQuickFaqs()
  }, [])

  const fetchQuickFaqs = async () => {
    try {
      const response = await fetch('/api/admin/quick-faq')
      if (response.ok) {
        const data = await response.json()
        setFaqs(data.length > 0 ? data : defaultQuickFaqs)
      } else {
        setFaqs(defaultQuickFaqs)
      }
    } catch (error) {
      console.error('Error fetching quick FAQs:', error)
      setFaqs(defaultQuickFaqs)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setErrors([])
    setSuccessMessage('')

    try {
      const response = await fetch('/api/admin/quick-faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqs }),
      })

      if (response.ok) {
        setSuccessMessage('Quick FAQ saved successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const error = await response.json()
        setErrors([error.error || 'Failed to save Quick FAQ'])
      }
    } catch (error) {
      console.error('Error saving Quick FAQ:', error)
      setErrors(['Failed to save Quick FAQ'])
    } finally {
      setIsSaving(false)
    }
  }

  const addFaq = () => {
    const newFaq: QuickFaqItem = {
      id: Date.now().toString(),
      question: '',
      answer: '',
      category: 'General',
      isActive: true
    }
    setFaqs([...faqs, newFaq])
  }

  const removeFaq = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id))
  }

  const updateFaq = (id: string, field: keyof QuickFaqItem, value: string | boolean) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    ))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CircleHelp className="h-6 w-6" />
            Quick FAQ (Product Page)
          </h1>
          <p className="text-gray-600 mt-1">Manage FAQ displayed on all product detail pages</p>
        </div>
        <Button onClick={addFaq} className="gap-2">
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 text-gray-400 pt-2">
                <GripVertical className="h-5 w-5" />
                <span className="font-medium text-sm">{index + 1}</span>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <Label htmlFor={`question-${faq.id}`}>Question *</Label>
                    <Input
                      id={`question-${faq.id}`}
                      value={faq.question}
                      onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                      placeholder="Enter question"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`category-${faq.id}`}>Category</Label>
                    <select
                      id={`category-${faq.id}`}
                      value={faq.category}
                      onChange={(e) => updateFaq(faq.id, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Product">Product</option>
                      <option value="Shipping">Shipping</option>
                      <option value="Payment">Payment</option>
                      <option value="Support">Support</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`answer-${faq.id}`}>Answer *</Label>
                  <textarea
                    id={`answer-${faq.id}`}
                    value={faq.answer}
                    onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                    placeholder="Enter answer"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={faq.isActive}
                      onChange={(e) => updateFaq(faq.id, 'isActive', e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFaq(faq.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {faqs.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <CircleHelp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Quick FAQ</h3>
          <p className="text-gray-500 mb-4">Add FAQ items to display on product pages</p>
          <Button onClick={addFaq} className="gap-2">
            <Plus className="h-4 w-4" />
            Add First FAQ
          </Button>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end sticky bottom-4">
        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="gap-2 shadow-lg"
          size="lg"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Quick FAQ'}
        </Button>
      </div>
    </div>
  )
}
