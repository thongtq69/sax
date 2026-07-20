import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOSTS = new Set([
  'rvb-img.reverb.com',
  'img.reverb.com',
  'images.reverb.com',
])
const MAX_REDIRECTS = 3
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

function parseAllowedImageUrl(value: string) {
  const url = new URL(value)
  if (
    url.protocol !== 'https:'
    || url.username
    || url.password
    || (url.port && url.port !== '443')
    || !ALLOWED_HOSTS.has(url.hostname.toLowerCase())
  ) {
    throw new Error('Invalid image source')
  }
  return url
}

async function fetchImage(startUrl: URL) {
  let currentUrl = startUrl

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetch(currentUrl, {
      headers: {
        Referer: 'https://reverb.com/',
        'User-Agent': 'JamesSaxCorner-ImageProxy/1.0',
        Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8',
      },
      redirect: 'manual',
      credentials: 'omit',
      signal: AbortSignal.timeout(12_000),
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location || redirectCount === MAX_REDIRECTS) {
        throw new Error('Too many image redirects')
      }
      currentUrl = parseAllowedImageUrl(new URL(location, currentUrl).toString())
      continue
    }

    return response
  }

  throw new Error('Unable to fetch image')
}

async function readLimitedBody(response: Response) {
  const declaredLength = Number(response.headers.get('content-length') || 0)
  if (declaredLength > MAX_IMAGE_BYTES) throw new Error('Image is too large')
  if (!response.body) throw new Error('Image response is empty')

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > MAX_IMAGE_BYTES) throw new Error('Image is too large')
      chunks.push(value)
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined)
    throw error
  }

  const body = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body
}

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('url')
  if (!imageUrl) return new NextResponse('Missing url parameter', { status: 400 })

  let source: URL
  try {
    source = parseAllowedImageUrl(imageUrl)
  } catch {
    return new NextResponse('Invalid image source', { status: 400 })
  }

  try {
    const response = await fetchImage(source)
    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status })
    }

    const contentType = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() || ''
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Remote resource is not an image', { status: 415 })
    }

    const imageBody = await readLimitedBody(response)
    return new NextResponse(imageBody, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
      },
    })
  } catch (error) {
    console.error('Error proxying approved image:', error)
    return new NextResponse('Unable to fetch image', { status: 502 })
  }
}
