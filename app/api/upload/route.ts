import { NextRequest, NextResponse } from 'next/server'
import { cloudinary } from '@/lib/cloudinary'

// Upload image to Cloudinary
export async function POST(request: NextRequest) {
  try {
    // Check Cloudinary configuration first
    const config = cloudinary.config()
    if (!config.cloud_name || !config.api_key) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured. Please set CLOUDINARY_URL environment variable.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const url = formData.get('url') as string | null
    const folder = (formData.get('folder') as string) || 'sax'

    if (!file && !url) {
      return NextResponse.json(
        { error: 'No file or URL provided' },
        { status: 400 }
      )
    }

    let uploadResult

    if (url) {
      // Upload from URL
      uploadResult = await cloudinary.uploader.upload(url, {
        folder,
        overwrite: true,
        resource_type: 'image',
      })
    } else if (file) {
      // Convert file to base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

      uploadResult = await cloudinary.uploader.upload(base64, {
        folder,
        overwrite: true,
        resource_type: 'image',
      })
    }

    if (!uploadResult) {
      return NextResponse.json(
        { error: 'Upload failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

// Check Cloudinary configuration
export async function GET() {
  try {
    // Test Cloudinary connection by checking config
    const config = cloudinary.config()
    
    if (!config.cloud_name || !config.api_key) {
      return NextResponse.json({
        configured: false,
        message: 'Cloudinary is not configured. Please set CLOUDINARY_URL environment variable.',
      })
    }

    return NextResponse.json({
      configured: true,
      cloudName: config.cloud_name,
      message: 'Cloudinary is configured correctly.',
    })
  } catch (error: any) {
    return NextResponse.json({
      configured: false,
      error: error.message,
    })
  }
}

