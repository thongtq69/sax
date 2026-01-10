'use client'

import { useState, useEffect } from 'react'
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
  Search, MessageSquare, Loader2, Eye, RefreshCw, Trash2, 
  Mail, User, Package, Clock, CheckCircle, MessageCircle, XCircle 
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Inquiry {
  id: string
  name: string
  email: string
  inquiryType: string
  message: string
  productName: string | null
  productSku: string | null
  status: string
  notes: string | null
  createdAt: string
}

export default function InquiriesManagement() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  const fetchInquiries = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchTerm) params.set('search', searchTerm)

      const response = await fetch(`/api/inquiries?${params}`)
      const data = await response.json()
      setInquiries(data.inquiries || [])
    } catch (error) {
      console.error('Error fetching inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [statusFilter])

  const handleSearch = () => {
    fetchInquiries()
  }

  const updateInquiryStatus = async (id: string, newStatus: string) => {
    setUpdating(id)
    try {
      const response = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (response.ok) {
        setInquiries(inquiries.map(inq => 
          inq.id === id ? { ...inq, status: newStatus } : inq
        ))
        if (selectedInquiry?.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus })
        }
      }
    } catch (error) {
      console.error('Error updating inquiry:', error)
    } finally {
      setUpdating(null)
    }
  }

  const saveNotes = async () => {
    if (!selectedInquiry) return
    setUpdating(selectedInquiry.id)
    try {
      const response = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedInquiry.id, notes: adminNotes }),
      })

      if (response.ok) {
        setInquiries(inquiries.map(inq => 
          inq.id === selectedInquiry.id ? { ...inq, notes: adminNotes } : inq
        ))
        setSelectedInquiry({ ...selectedInquiry, notes: adminNotes })
      }
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      setUpdating(null)
    }
  }

  const deleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return
    
    setUpdating(id)
    try {
      const response = await fetch(`/api/inquiries?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        setInquiries(inquiries.filter(inq => inq.id !== id))
        if (selectedInquiry?.id === id) setSelectedInquiry(null)
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'read': return 'bg-yellow-100 text-yellow-800'
      case 'replied': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <MessageSquare className="h-4 w-4" />
      case 'read': return <Eye className="h-4 w-4" />
      case 'replied': return <CheckCircle className="h-4 w-4" />
      case 'closed': return <XCircle className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const openInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setAdminNotes(inquiry.notes || '')
    // Mark as read if new
    if (inquiry.status === 'new') {
      updateInquiryStatus(inquiry.id, 'read')
    }
  }

  const newCount = inquiries.filter(i => i.status === 'new').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-primary" />
            Inquiries Management
            {newCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                {newCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-2">View and manage customer inquiries</p>
        </div>
        <Button onClick={fetchInquiries} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-600 flex items-center">
            Total: {inquiries.length} inquiries
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-500">Loading inquiries...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No inquiries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <tr 
                    key={inquiry.id} 
                    className={`hover:bg-gray-50 cursor-pointer ${inquiry.status === 'new' ? 'bg-blue-50/50' : ''}`}
                    onClick={() => openInquiry(inquiry)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(inquiry.status)}`}>
                        {getStatusIcon(inquiry.status)}
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                      <div className="text-sm text-gray-500">{inquiry.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inquiry.inquiryType}
                    </td>
                    <td className="px-6 py-4">
                      {inquiry.productName ? (
                        <div>
                          <div className="text-sm text-gray-900 truncate max-w-[200px]">{inquiry.productName}</div>
                          {inquiry.productSku && (
                            <div className="text-xs text-gray-500">SKU: {inquiry.productSku}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inquiry.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openInquiry(inquiry)}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteInquiry(inquiry.id)}
                          disabled={updating === inquiry.id}
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Inquiry Details
            </DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6">
              {/* Status & Date */}
              <div className="flex items-center justify-between">
                <Select
                  value={selectedInquiry.status}
                  onValueChange={(value) => updateInquiryStatus(selectedInquiry.id, value)}
                  disabled={updating === selectedInquiry.id}
                >
                  <SelectTrigger className={`w-32 ${getStatusColor(selectedInquiry.status)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDate(selectedInquiry.createdAt)}
                </span>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <User className="h-4 w-4" />
                    Name
                  </div>
                  <p className="font-medium">{selectedInquiry.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <a href={`mailto:${selectedInquiry.email}`} className="font-medium text-primary hover:underline">
                    {selectedInquiry.email}
                  </a>
                </div>
              </div>

              {/* Inquiry Type & Product */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="text-sm text-amber-700 mb-1">Inquiry Type</div>
                  <p className="font-medium text-amber-900">{selectedInquiry.inquiryType}</p>
                </div>
                {selectedInquiry.productName && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
                      <Package className="h-4 w-4" />
                      Product
                    </div>
                    <p className="font-medium text-blue-900">{selectedInquiry.productName}</p>
                    {selectedInquiry.productSku && (
                      <p className="text-xs text-blue-600">SKU: {selectedInquiry.productSku}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <h4 className="font-medium mb-2">Message</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedInquiry.message || <span className="text-gray-400 italic">No message</span>}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h4 className="font-medium mb-2">Admin Notes</h4>
                <textarea
                  value={adminNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this inquiry..."
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Button 
                  onClick={saveNotes} 
                  size="sm" 
                  className="mt-2"
                  disabled={updating === selectedInquiry.id}
                >
                  {updating === selectedInquiry.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Save Notes
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button asChild variant="outline" className="flex-1">
                  <a href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.inquiryType}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  className="text-green-600 hover:bg-green-50"
                  onClick={() => updateInquiryStatus(selectedInquiry.id, 'replied')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Replied
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
