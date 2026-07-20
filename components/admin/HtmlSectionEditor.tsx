'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Code2, Eye, FileUp, LayoutTemplate } from 'lucide-react'

interface HtmlSectionEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
}

const STARTER = `<section style="padding: 48px 24px; max-width: 1200px; margin: 0 auto;">
  <h2 style="margin: 0 0 16px;">Section heading</h2>
  <p>Add your content here. Classes, IDs, inline CSS, &lt;style&gt; blocks and responsive layouts are supported.</p>
</section>`

export function HtmlSectionEditor({
  value,
  onChange,
  placeholder = 'Paste or write HTML here…',
  minHeight = 360,
}: HtmlSectionEditorProps) {
  const [mode, setMode] = useState<'code' | 'preview'>('code')
  const fileRef = useRef<HTMLInputElement>(null)

  const importFile = async (file?: File) => {
    if (!file) return
    onChange(await file.text())
    setMode('code')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-gray-50 px-3 py-2">
        <div className="flex gap-1">
          <Button type="button" size="sm" variant={mode === 'code' ? 'default' : 'ghost'} onClick={() => setMode('code')}>
            <Code2 className="mr-2 h-4 w-4" /> HTML Source
          </Button>
          <Button type="button" size="sm" variant={mode === 'preview' ? 'default' : 'ghost'} onClick={() => setMode('preview')}>
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
        </div>
        <div className="flex gap-1">
          <input ref={fileRef} type="file" accept=".html,.htm,text/html" className="hidden" onChange={(e) => importFile(e.target.files?.[0])} />
          <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
            <FileUp className="mr-2 h-4 w-4" /> Import HTML
          </Button>
          {!value.trim() && (
            <Button type="button" size="sm" variant="outline" onClick={() => onChange(STARTER)}>
              <LayoutTemplate className="mr-2 h-4 w-4" /> Starter
            </Button>
          )}
        </div>
      </div>

      {mode === 'code' ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full resize-y border-0 bg-[#10141c] p-4 font-mono text-sm leading-6 text-gray-100 outline-none"
          style={{ minHeight }}
        />
      ) : (
        <iframe
          title="HTML preview"
          sandbox=""
          srcDoc={`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:Arial,sans-serif;color:#172033}*{box-sizing:border-box}img{max-width:100%;height:auto}</style></head><body>${value || '<p style="padding:24px;color:#777">Nothing to preview yet.</p>'}</body></html>`}
          className="w-full bg-white"
          style={{ minHeight }}
        />
      )}
      <p className="border-t bg-amber-50 px-3 py-2 text-xs text-amber-900">
        Layout HTML and CSS are preserved. Executable scripts, event handlers and form controls are removed when saved.
      </p>
    </div>
  )
}
