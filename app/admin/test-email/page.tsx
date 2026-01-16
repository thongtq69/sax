'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; orderNumber?: string } | null>(null)

  const handleSendTestEmail = async () => {
    if (!email) {
      toast.error('Vui lòng nhập email')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message, orderNumber: data.orderNumber })
        toast.success('Email đã được gửi thành công!')
      } else {
        setResult({ success: false, message: data.error || 'Có lỗi xảy ra' })
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      setResult({ success: false, message: 'Không thể kết nối đến server' })
      toast.error('Không thể kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Test Order Confirmation Email
          </CardTitle>
          <CardDescription>
            Gửi email xác nhận đơn hàng mẫu để kiểm tra template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email nhận test</Label>
            <Input
              id="email"
              type="email"
              placeholder="your-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendTestEmail()}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <p className="font-medium text-gray-700">Nội dung email mẫu:</p>
            <ul className="text-gray-600 space-y-1 ml-4 list-disc">
              <li>Order Number: TEST-XXXXXX</li>
              <li>Instrument: Selmer Paris Mark VI Alto Saxophone - 1965</li>
              <li>Price: $12,500</li>
              <li>Shipping: $150</li>
              <li>Total: $12,650</li>
            </ul>
          </div>

          <Button 
            onClick={handleSendTestEmail} 
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Gửi Email Test
              </>
            )}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {result.success ? (
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">{result.success ? 'Thành công!' : 'Lỗi!'}</p>
                <p className="text-sm mt-1">{result.message}</p>
                {result.orderNumber && (
                  <p className="text-sm mt-1">Order Number: #{result.orderNumber}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
