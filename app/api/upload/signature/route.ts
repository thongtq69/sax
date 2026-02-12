// Force dynamic to prevent static generation (Cloudinary SDK requires runtime env vars)
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cloudinary } from '@/lib/cloudinary'

// Generate Cloudinary upload signature for direct client-side upload
export async function POST(request: NextRequest) {
  try {
    const { folder = 'sax/products' } = await request.json()
    
    const timestamp = Math.round(new Date().getTime() / 1000)
    
    const config = cloudinary.config()
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured' },
        { status: 500 }
      )
    }

    // Generate signature for unsigned upload
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      config.api_secret
    )

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: config.cloud_name,
      apiKey: config.api_key,
      folder,
    })
  } catch (error: any) {
    console.error('Signature generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    )
  }
}
