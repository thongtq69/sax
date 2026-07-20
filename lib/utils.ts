import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert Reverb image URLs to use our proxy to avoid CORS issues
 */
export function getImageUrl(url: string): string {
  if (!url) return '';
  
  // If it's already a local/proxy URL, return as is
  if (url.startsWith('/')) {
    return url;
  }

  try {
    const parsed = new URL(url)
    const approvedHosts = new Set(['rvb-img.reverb.com', 'img.reverb.com', 'images.reverb.com'])
    if (parsed.protocol === 'https:' && approvedHosts.has(parsed.hostname.toLowerCase())) {
      return `/api/image-proxy?url=${encodeURIComponent(parsed.toString())}`;
    }
  } catch {
    return ''
  }
  
  // Otherwise return original URL
  return url;
}
