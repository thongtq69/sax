'use client'

import { useRef } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InvoiceFrame({ html, invoiceNumber }: { html: string; invoiceNumber: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null)

  const printInvoice = () => {
    const invoiceWindow = frameRef.current?.contentWindow
    if (!invoiceWindow) return
    invoiceWindow.focus()
    invoiceWindow.print()
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Invoice {invoiceNumber}</h2>
        <Button variant="outline" onClick={printInvoice}>
          <Printer className="mr-2 h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>
      <iframe
        ref={frameRef}
        title={`Invoice ${invoiceNumber}`}
        srcDoc={html}
        className="h-[900px] w-full rounded-lg border bg-[#f7f1e5]"
      />
    </section>
  )
}
