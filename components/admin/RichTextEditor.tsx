'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Extension, Mark } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { Table as TiptapTable } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useEffect, useRef, useState } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export interface HtmlImportLog {
  level: 'error' | 'warning' | 'info'
  message: string
}

interface HtmlSanitizeStats {
  removedAttributes: Record<string, number>
  removedBlankNodes: number
  removedStyleProperties: Record<string, number>
  removedTags: Record<string, number>
  inlinedStyleRules: number
  skippedStyleRules: number
  structureIssues: string[]
}

interface HtmlSanitizeOptions {
  preserveDesignStyles?: boolean
}

const createSanitizeStats = (): HtmlSanitizeStats => ({
  removedAttributes: {},
  removedBlankNodes: 0,
  removedStyleProperties: {},
  removedTags: {},
  inlinedStyleRules: 0,
  skippedStyleRules: 0,
  structureIssues: [],
})

function incrementStat(bucket: Record<string, number>, key: string) {
  bucket[key] = (bucket[key] || 0) + 1
}

const STYLE_ATTRIBUTE_NODES = [
  'paragraph',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'table',
  'tableRow',
  'tableCell',
  'tableHeader',
  'image',
  'horizontalRule',
]

const ALLOWED_STYLE_PROPERTIES = new Set([
  'align-content',
  'align-items',
  'background',
  'background-color',
  'border',
  'border-bottom',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-collapse',
  'border-color',
  'border-left',
  'border-radius',
  'border-right',
  'border-spacing',
  'border-style',
  'border-top',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-width',
  'break-after',
  'break-before',
  'box-shadow',
  'box-sizing',
  'color',
  'column-gap',
  'display',
  'flex-direction',
  'flex-wrap',
  'font-family',
  'font-size',
  'font-style',
  'font-variant',
  'font-weight',
  'gap',
  'grid-template-columns',
  'grid-template-rows',
  'height',
  'justify-content',
  'justify-items',
  'letter-spacing',
  'line-height',
  'list-style-type',
  'margin',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'margin-top',
  'max-height',
  'max-width',
  'min-height',
  'min-width',
  'object-fit',
  'opacity',
  'overflow',
  'overflow-x',
  'overflow-y',
  'padding',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'page-break-after',
  'page-break-before',
  'place-items',
  'row-gap',
  'text-align',
  'text-decoration',
  'text-decoration-color',
  'text-decoration-line',
  'text-decoration-style',
  'text-indent',
  'text-shadow',
  'text-transform',
  'vertical-align',
  'white-space',
  'width',
])

const DISALLOWED_HTML_TAGS = [
  'script',
  'style',
  'meta',
  'link',
  'iframe',
  'object',
  'embed',
  'xml',
  'o\\:p',
  'form',
  'input',
  'textarea',
  'select',
  'option',
]

const VOID_HTML_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

const OPTIONAL_CLOSE_TAGS = new Set([
  'body',
  'colgroup',
  'dd',
  'dt',
  'head',
  'html',
  'li',
  'option',
  'p',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
])

const STYLE_PROPERTY_ALIASES: Record<string, string> = {
  '-webkit-text-fill-color': 'color',
  background: 'background-color',
  'mso-highlight': 'background-color',
  'mso-color-alt': 'color',
  'mso-style-textfill-fill-color': 'color',
}

const HTML_FONT_SIZE_MAP: Record<string, string> = {
  '1': '8pt',
  '2': '10pt',
  '3': '12pt',
  '4': '14pt',
  '5': '18pt',
  '6': '24pt',
  '7': '36pt',
}

function normalizeStyleProperty(property: string) {
  const normalized = property.trim().toLowerCase()
  return STYLE_PROPERTY_ALIASES[normalized] || normalized
}

function extractCssColor(value: string) {
  const trimmed = value.trim()
  const hexMatch = trimmed.match(/#[0-9a-f]{3,8}\b/i)
  if (hexMatch) return hexMatch[0]

  const rgbMatch = trimmed.match(/rgba?\(\s*[\d.]+(?:\s*,\s*[\d.]+){2}(?:\s*,\s*[\d.]+)?\s*\)/i)
  if (rgbMatch) return rgbMatch[0]

  const namedMatch = trimmed.match(/\b(?:black|gray|grey|silver|white|yellow|orange|red|blue|green|purple|brown)\b/i)
  if (namedMatch) return namedMatch[0]

  return trimmed
}

function parseColorChannels(value: string): { r: number; g: number; b: number; a: number } | null {
  const hex = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
  if (hex) {
    const raw = hex[1]
    const expanded = raw.length === 3
      ? raw.split('').map((char) => `${char}${char}`).join('')
      : raw

    return {
      r: Number.parseInt(expanded.slice(0, 2), 16),
      g: Number.parseInt(expanded.slice(2, 4), 16),
      b: Number.parseInt(expanded.slice(4, 6), 16),
      a: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1,
    }
  }

  const rgb = value.trim().match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i)
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
      a: rgb[4] === undefined ? 1 : Number(rgb[4]),
    }
  }

  const named: Record<string, { r: number; g: number; b: number; a: number }> = {
    black: { r: 0, g: 0, b: 0, a: 1 },
    gray: { r: 128, g: 128, b: 128, a: 1 },
    grey: { r: 128, g: 128, b: 128, a: 1 },
    silver: { r: 192, g: 192, b: 192, a: 1 },
  }

  return named[value.trim().toLowerCase()] || null
}

function isOfficeSelectionBackground(value: string) {
  const color = extractCssColor(value)
  const channels = parseColorChannels(color)
  if (!channels) return false

  const { r, g, b, a } = channels
  const isNeutral = Math.max(r, g, b) - Math.min(r, g, b) <= 10
  if (!isNeutral) return false

  // Office/Word web often serializes copy-selection as neutral grey spans.
  // Real content color is preserved; this only strips selection-like backgrounds.
  return a <= 0.45 || r <= 50 || (r >= 80 && r <= 230)
}

function isSafeStyleValue(property: string, value: string) {
  if (!value) return false
  if (/[\u0000-\u001f<>]/.test(value)) return false
  if (/(?:url\s*\(|expression\s*\(|javascript:|vbscript:|behavior\s*:|binding\s*:|@import)/i.test(value)) {
    return false
  }
  if (property === 'background-color' && /\b(?:none|initial|inherit)\b/i.test(value)) {
    return false
  }
  return true
}

function sanitizeStyleAttribute(
  style: string | null,
  stats?: HtmlSanitizeStats,
  options?: HtmlSanitizeOptions
) {
  if (!style) return null

  const declarations = style
    .split(';')
    .map((declaration) => {
      const separatorIndex = declaration.indexOf(':')
      if (separatorIndex === -1) return null

      const rawProperty = declaration.slice(0, separatorIndex).trim().toLowerCase()
      const property =
        options?.preserveDesignStyles && rawProperty === 'background'
          ? 'background'
          : normalizeStyleProperty(rawProperty)
      if (property.startsWith('mso-') || !ALLOWED_STYLE_PROPERTIES.has(property)) {
        if (stats) incrementStat(stats.removedStyleProperties, property)
        return null
      }

      let value = declaration
        .slice(separatorIndex + 1)
        .replace(/\s*!important/gi, '')
        .trim()

      if (property === 'background-color') {
        value = extractCssColor(value)
        if (isOfficeSelectionBackground(value)) {
          if (stats) incrementStat(stats.removedStyleProperties, 'selection-background')
          return null
        }
      }

      if (!isSafeStyleValue(property, value)) {
        if (stats) incrementStat(stats.removedStyleProperties, property)
        return null
      }

      return `${property}: ${value}`
    })
    .filter(Boolean)

  return declarations.length ? declarations.join('; ') : null
}

function isBlankTextContent(element: Element) {
  return !(element.textContent || '').replace(/\u00a0/g, ' ').trim()
}

function isSafeUrl(value: string, type: 'href' | 'src') {
  const url = value.trim()
  if (!url) return false

  if (/^(https?:|mailto:|tel:|#|\/)/i.test(url)) {
    return true
  }

  if (type === 'src' && /^(data:image\/(?:png|jpe?g|gif|webp);base64,|blob:)/i.test(url)) {
    return true
  }

  return false
}

function isSafeDimension(value: string) {
  return /^-?\d+(?:\.\d+)?(?:px|pt|pc|em|rem|%|cm|mm|in)?$/i.test(value.trim())
}

function removeComments(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT)
  const comments: ChildNode[] = []
  let node = walker.nextNode()

  while (node) {
    comments.push(node as ChildNode)
    node = walker.nextNode()
  }

  comments.forEach((comment) => comment.parentNode?.removeChild(comment))
}

function validateHtmlStructure(html: string, stats: HtmlSanitizeStats) {
  const stack: string[] = []
  const tagPattern = /<\/?([a-zA-Z][\w:-]*)(?:\s[^<>]*)?>/g
  let match: RegExpExecArray | null

  while ((match = tagPattern.exec(html)) !== null) {
    const rawTag = match[0]
    const tag = match[1].toLowerCase()

    if (rawTag.startsWith('<!--') || rawTag.endsWith('/>') || VOID_HTML_TAGS.has(tag) || OPTIONAL_CLOSE_TAGS.has(tag)) {
      continue
    }

    if (rawTag.startsWith('</')) {
      const index = stack.lastIndexOf(tag)
      if (index === -1) {
        stats.structureIssues.push(`Closing tag </${tag}> does not match any opened tag.`)
        continue
      }

      stack.slice(index + 1).forEach((unclosedTag) => {
        stats.structureIssues.push(`Missing closing tag for <${unclosedTag}> before </${tag}>.`)
      })
      stack.splice(index)
      continue
    }

    stack.push(tag)
  }

  stack.slice(-5).forEach((tag) => {
    stats.structureIssues.push(`Missing closing tag for <${tag}>.`)
  })
}

function combineStyles(...styles: Array<string | null | undefined>) {
  return styles.filter(Boolean).join('; ')
}

function inlineStyleBlocks(root: HTMLElement, stats: HtmlSanitizeStats, options?: HtmlSanitizeOptions) {
  root.querySelectorAll('style').forEach((styleElement) => {
    const css = styleElement.textContent || ''
    const ruleMatches = css.matchAll(/([^{}@]+)\{([^{}]+)\}/g)

    for (const match of ruleMatches) {
      const selectors = match[1]
        .split(',')
        .map((selector) => selector.trim())
        .filter(Boolean)
      const sanitizedRuleStyle = sanitizeStyleAttribute(match[2], stats, options)

      if (!sanitizedRuleStyle) {
        stats.skippedStyleRules += 1
        continue
      }

      selectors.forEach((selector) => {
        if (
          selector.length > 160 ||
          /[{}@]/.test(selector) ||
          /:(?:hover|active|focus|visited|before|after)/i.test(selector)
        ) {
          stats.skippedStyleRules += 1
          return
        }

        try {
          root.querySelectorAll(selector).forEach((element) => {
            const mergedStyle = sanitizeStyleAttribute(
              combineStyles(sanitizedRuleStyle, element.getAttribute('style')),
              stats,
              options
            )

            if (mergedStyle) {
              element.setAttribute('style', mergedStyle)
              stats.inlinedStyleRules += 1
            }
          })
        } catch {
          stats.skippedStyleRules += 1
        }
      })
    }
  })
}

function convertFontTags(root: HTMLElement) {
  root.querySelectorAll('font').forEach((font) => {
    const span = document.createElement('span')
    const styles = [
      font.getAttribute('style') || '',
      font.getAttribute('color') ? `color: ${font.getAttribute('color')}` : '',
      font.getAttribute('face') ? `font-family: ${font.getAttribute('face')}` : '',
      font.getAttribute('size') ? `font-size: ${HTML_FONT_SIZE_MAP[font.getAttribute('size') || ''] || ''}` : '',
    ]
      .filter(Boolean)
      .join('; ')

    const sanitizedStyle = sanitizeStyleAttribute(styles)
    if (sanitizedStyle) {
      span.setAttribute('style', sanitizedStyle)
    }

    while (font.firstChild) {
      span.appendChild(font.firstChild)
    }

    font.replaceWith(span)
  })
}

function getWordListMarker(paragraph: Element) {
  return Array.from(paragraph.querySelectorAll('span')).find((span) => {
    return /mso-list\s*:\s*ignore/i.test(span.getAttribute('style') || '')
  })
}

function isWordListParagraph(element: Element) {
  if (element.tagName.toLowerCase() !== 'p') return false

  const className = element.getAttribute('class') || ''
  const style = element.getAttribute('style') || ''

  return /MsoListParagraph/i.test(className) || /mso-list\s*:/i.test(style)
}

function getWordListType(paragraph: Element): 'ol' | 'ul' {
  const markerText = getWordListMarker(paragraph)?.textContent?.replace(/\s+/g, '') || ''
  return /^(?:\d+|[a-z]|[ivxlcdm]+)[.)]/i.test(markerText) ? 'ol' : 'ul'
}

function convertWordLists(container: Element) {
  let child = container.firstElementChild

  while (child) {
    if (isWordListParagraph(child)) {
      const listType = getWordListType(child)
      const list = document.createElement(listType)

      while (child && isWordListParagraph(child) && getWordListType(child) === listType) {
        const current = child
        child = child.nextElementSibling

        getWordListMarker(current)?.remove()

        const listItem = document.createElement('li')
        const style = sanitizeStyleAttribute(current.getAttribute('style'))

        if (style) {
          listItem.setAttribute('style', style)
        }

        listItem.innerHTML = current.innerHTML
        list.appendChild(listItem)
        current.remove()
      }

      container.insertBefore(list, child)
      continue
    }

    convertWordLists(child)
    child = child.nextElementSibling
  }
}

function sanitizeElementAttributes(element: Element, stats?: HtmlSanitizeStats, options?: HtmlSanitizeOptions) {
  const tagName = element.tagName.toLowerCase()

  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase()
    const value = attribute.value

    if (name === 'style') {
      const sanitizedStyle = sanitizeStyleAttribute(value, stats, options)
      if (sanitizedStyle) {
        element.setAttribute('style', sanitizedStyle)
      } else {
        element.removeAttribute(attribute.name)
      }
      return
    }

    if (
      name.startsWith('on') ||
      name.startsWith('data-') ||
      name.startsWith('aria-') ||
      name === 'class' ||
      name === 'id' ||
      name === 'lang' ||
      name === 'xml:lang' ||
      name.startsWith('xmlns') ||
      name.startsWith('mso-')
    ) {
      if (stats) incrementStat(stats.removedAttributes, name)
      element.removeAttribute(attribute.name)
      return
    }

    if (tagName === 'a' && name === 'href') {
      if (!isSafeUrl(value, 'href')) {
        if (stats) incrementStat(stats.removedAttributes, 'unsafe href')
        element.removeAttribute(attribute.name)
      }
      return
    }

    if (tagName === 'img' && name === 'src') {
      if (!isSafeUrl(value, 'src')) {
        if (stats) incrementStat(stats.removedAttributes, 'unsafe src')
        element.removeAttribute(attribute.name)
      }
      return
    }

    if (['alt', 'title'].includes(name) && ['a', 'img'].includes(tagName)) {
      return
    }

    if (['width', 'height'].includes(name) && ['img', 'table', 'td', 'th'].includes(tagName)) {
      if (!isSafeDimension(value)) {
        if (stats) incrementStat(stats.removedAttributes, name)
        element.removeAttribute(attribute.name)
      }
      return
    }

    if (['colspan', 'rowspan'].includes(name) && ['td', 'th'].includes(tagName)) {
      const numberValue = Number.parseInt(value, 10)
      if (!Number.isFinite(numberValue) || numberValue < 1 || numberValue > 100) {
        if (stats) incrementStat(stats.removedAttributes, name)
        element.removeAttribute(attribute.name)
      }
      return
    }

    if (stats) incrementStat(stats.removedAttributes, name)
    element.removeAttribute(attribute.name)
  })
}

function cleanPastedHtml(html: string, stats?: HtmlSanitizeStats, options?: HtmlSanitizeOptions): string {
  if (!html) return ''

  if (stats) {
    validateHtmlStructure(html, stats)
  }

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  removeComments(tempDiv)
  if (stats) {
    inlineStyleBlocks(tempDiv, stats, options)
  }

  tempDiv
    .querySelectorAll(DISALLOWED_HTML_TAGS.join(', '))
    .forEach((element) => {
      if (stats) incrementStat(stats.removedTags, element.tagName.toLowerCase())
      element.remove()
    })

  convertFontTags(tempDiv)
  convertWordLists(tempDiv)

  tempDiv.querySelectorAll('*').forEach((element) => {
    sanitizeElementAttributes(element, stats, options)
  })

  tempDiv.querySelectorAll('span, p:empty, div:empty').forEach((element) => {
    if (isBlankTextContent(element) && !element.querySelector('img, table')) {
      if (stats) stats.removedBlankNodes += 1
      element.remove()
    }
  })

  return tempDiv.innerHTML.trim()
}

function summarizeStats(stats: HtmlSanitizeStats, sanitizedHtml: string): HtmlImportLog[] {
  const logs: HtmlImportLog[] = []
  const removedTags = Object.entries(stats.removedTags)
  const removedAttrs = Object.entries(stats.removedAttributes)
  const removedStyles = Object.entries(stats.removedStyleProperties)

  if (!sanitizedHtml.trim()) {
    logs.push({ level: 'error', message: 'HTML has no safe content after cleaning.' })
  }

  stats.structureIssues.slice(0, 6).forEach((message) => {
    logs.push({ level: 'warning', message })
  })

  if (removedTags.length) {
    logs.push({
      level: 'warning',
      message: `Removed unsafe tags: ${removedTags.map(([tag, count]) => `${tag} (${count})`).join(', ')}.`,
    })
  }

  if (removedAttrs.length) {
    logs.push({
      level: 'warning',
      message: `Removed unsafe or unsupported attributes: ${removedAttrs.map(([attr, count]) => `${attr} (${count})`).join(', ')}.`,
    })
  }

  if (removedStyles.length) {
    logs.push({
      level: 'info',
      message: `Dropped unsupported or unsafe CSS properties: ${removedStyles.map(([prop, count]) => `${prop} (${count})`).join(', ')}.`,
    })
  }

  if (stats.inlinedStyleRules) {
    logs.push({
      level: 'info',
      message: `Converted ${stats.inlinedStyleRules} CSS rule application(s) from <style> blocks to inline styles.`,
    })
  }

  if (stats.skippedStyleRules) {
    logs.push({
      level: 'info',
      message: `Skipped ${stats.skippedStyleRules} unsupported CSS selector/rule(s).`,
    })
  }

  if (stats.removedBlankNodes) {
    logs.push({
      level: 'info',
      message: `Removed ${stats.removedBlankNodes} blank selection/spacing node(s).`,
    })
  }

  if (!logs.length) {
    logs.push({ level: 'info', message: 'HTML looks valid and did not require cleanup.' })
  }

  return logs
}

function normalizeHtmlDesignSource(html: string) {
  if (!/<\/?(?:html|head|body|style)\b/i.test(html)) {
    return html
  }

  try {
    const documentFromHtml = new DOMParser().parseFromString(html, 'text/html')
    const bodyHtml = documentFromHtml.body?.innerHTML || ''
    const styleHtml = Array.from(documentFromHtml.querySelectorAll('style'))
      .map((styleElement) => styleElement.outerHTML)
      .join('')

    return bodyHtml.includes('<style') ? bodyHtml : `${styleHtml}${bodyHtml || html}`
  } catch {
    return html
  }
}

export function sanitizeHtmlDesign(html: string): { html: string; logs: HtmlImportLog[] } {
  const stats = createSanitizeStats()
  const sanitizedHtml = cleanPastedHtml(normalizeHtmlDesignSource(html), stats, { preserveDesignStyles: true })

  return {
    html: sanitizedHtml,
    logs: summarizeStats(stats, sanitizedHtml),
  }
}

const PreservedStyleAttributes = Extension.create({
  name: 'preservedStyleAttributes',

  addGlobalAttributes() {
    return [
      {
        types: STYLE_ATTRIBUTE_NODES,
        attributes: {
          style: {
            default: null,
            parseHTML: (element) => sanitizeStyleAttribute(element.getAttribute('style')),
            renderHTML: (attributes) => {
              if (!attributes.style) return {}
              return { style: attributes.style }
            },
          },
        },
      },
    ]
  },
})

const InlineStyle = Mark.create({
  name: 'inlineStyle',

  priority: 110,

  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element) => sanitizeStyleAttribute(element.getAttribute('style')),
        renderHTML: (attributes) => {
          if (!attributes.style) return {}
          return { style: attributes.style }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[style]',
        getAttrs: (element) => {
          const style = sanitizeStyleAttribute((element as HTMLElement).getAttribute('style'))
          return style ? { style } : false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },
})

export function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const lastContentRef = useRef(content)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyleKit.configure({
        backgroundColor: {},
        color: {},
        fontFamily: {},
        fontSize: {},
        lineHeight: {},
      }),
      InlineStyle,
      PreservedStyleAttributes,
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'listItem', 'tableCell', 'tableHeader'],
      }),
      Underline,
      TiptapTable.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'rich-text-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      lastContentRef.current = html
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] px-4 py-3',
      },
      transformPastedHTML: (html) => {
        // Clean HTML before it's inserted into the editor
        // This automatically handles paste from Word/Google Docs
        return cleanPastedHtml(html)
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (content === lastContentRef.current) return

    const currentHtml = editor.getHTML()
    if (content !== currentHtml) {
      editor.commands.setContent(content || '', { emitUpdate: false })
    }

    lastContentRef.current = content
  }, [content, editor])

  if (!editor) {
    return null
  }

  const handleAddLink = () => {
    const url = linkUrl.trim()
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
    setLinkUrl('')
    setIsLinkDialogOpen(false)
  }

  const handleAddImage = () => {
    const url = imageUrl.trim()
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
    setImageUrl('')
    setIsImageDialogOpen(false)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap items-center gap-1">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className="h-8 w-8 p-0"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('strike') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className="h-8 w-8 p-0"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className="h-8 px-2 text-xs font-bold"
          >
            H1
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className="h-8 px-2 text-xs font-bold"
          >
            H2
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className="h-8 px-2 text-xs font-bold"
          >
            H3
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className="h-8 w-8 p-0"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className="h-8 w-8 p-0"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className="h-8 w-8 p-0"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className="h-8 w-8 p-0"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        {/* Media */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = editor.getAttributes('link').href
              setLinkUrl(url || '')
              setIsLinkDialogOpen(true)
            }}
            className="h-8 w-8 p-0"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsImageDialogOpen(true)}
            className="h-8 w-8 p-0"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('table') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="h-8 w-8 p-0"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddLink()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLink}>Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddImage()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddImage}>Add Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
