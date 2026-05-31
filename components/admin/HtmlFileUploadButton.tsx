'use client'

import { ChangeEvent, useRef, useState } from 'react'
import { Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'

const MAX_HTML_FILE_SIZE_BYTES = 2 * 1024 * 1024

interface HtmlFileUploadButtonProps {
  disabled?: boolean
  label?: string
  onError?: (message: string) => void
  onLoad: (payload: { file: File; text: string }) => void
}

function isHtmlFile(file: File) {
  const fileName = file.name.toLowerCase()
  return (
    fileName.endsWith('.html') ||
    fileName.endsWith('.htm') ||
    file.type === 'text/html' ||
    file.type === 'application/xhtml+xml'
  )
}

export function formatHtmlFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function HtmlFileUploadButton({
  disabled,
  label = 'Upload .html',
  onError,
  onLoad,
}: HtmlFileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isReading, setIsReading] = useState(false)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!isHtmlFile(file)) {
      onError?.('Please choose an .html or .htm file.')
      return
    }

    if (file.size > MAX_HTML_FILE_SIZE_BYTES) {
      onError?.(`HTML file is too large. Maximum size is ${formatHtmlFileSize(MAX_HTML_FILE_SIZE_BYTES)}.`)
      return
    }

    try {
      setIsReading(true)
      const text = await file.text()
      onLoad({ file, text })
    } catch {
      onError?.('Could not read the HTML file. Please try another file.')
    } finally {
      setIsReading(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".html,.htm,text/html,application/xhtml+xml"
        className="sr-only"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || isReading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isReading ? 'Reading...' : label}
      </Button>
    </>
  )
}
