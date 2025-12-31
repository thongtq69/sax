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
  if (url.startsWith('/') || url.includes('/api/image-proxy')) {
    return url;
  }
  
  // If it's a Reverb image, use proxy
  if (url.includes('reverb.com') || url.includes('rvb-img.reverb.com') || url.includes('img.reverb.com')) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  
  // Otherwise return original URL
  return url;
}
