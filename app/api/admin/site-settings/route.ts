import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/admin/site-settings - Get site settings
export async function GET() {
  try {
    // Get the first (and should be only) settings record
    let settings = await prisma.siteSettings.findFirst()

    // Default social links
    const defaultSocialLinks = {
      facebook: 'https://www.facebook.com/jamessaxcorner',
      youtube: 'https://www.youtube.com/@jamessaxcorner',
      instagram: '',
      twitter: '',
    }

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          companyName: 'James Sax Corner',
          address: 'Ha Noi, Viet Nam',
          phone: '',
          email: '',
          workingHours: '24/7',
          socialLinks: defaultSocialLinks,
          trackingPixels: {},
          footerText: '',
          copyrightText: '© 2024 James Sax Corner. All rights reserved.',
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Lỗi tải cài đặt', message: 'Không thể tải cài đặt trang web. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/site-settings - Update site settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyName,
      address,
      phone,
      email,
      workingHours,
      socialLinks,
      trackingPixels,
      footerText,
      copyrightText,
      domesticShippingCost,
      paypalReceiverEmail,
    } = body

    // Validate required fields
    if (companyName !== undefined && companyName.trim() === '') {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc', message: 'Tên công ty không được để trống' },
        { status: 400 }
      )
    }

    // Validate email format if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && email.trim() !== '') {
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Email không hợp lệ', message: 'Vui lòng nhập địa chỉ email đúng định dạng (ví dụ: example@domain.com)' },
          { status: 400 }
        )
      }
    }

    // Validate PayPal receiver email format if provided
    if (paypalReceiverEmail !== undefined && paypalReceiverEmail.trim() !== '') {
      if (!emailRegex.test(paypalReceiverEmail)) {
        return NextResponse.json(
          { error: 'Email PayPal không hợp lệ', message: 'Vui lòng nhập địa chỉ email PayPal đúng định dạng' },
          { status: 400 }
        )
      }
    }

    const normalizedTrackingPixels = normalizeTrackingPixels(trackingPixels)
    if (normalizedTrackingPixels.error) {
      return NextResponse.json(
        {
          error: 'Pixel ID không hợp lệ',
          message: normalizedTrackingPixels.error,
          details: [normalizedTrackingPixels.error],
        },
        { status: 400 }
      )
    }

    // Get existing settings or create new
    let settings = await prisma.siteSettings.findFirst()

    if (settings) {
      // Update existing settings
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          ...(companyName !== undefined && { companyName }),
          ...(address !== undefined && { address }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
          ...(workingHours !== undefined && { workingHours }),
          ...(socialLinks !== undefined && { socialLinks }),
          ...(trackingPixels !== undefined && { trackingPixels: normalizedTrackingPixels.value }),
          ...(footerText !== undefined && { footerText }),
          ...(copyrightText !== undefined && { copyrightText }),
          ...(domesticShippingCost !== undefined && { domesticShippingCost }),
          ...(paypalReceiverEmail !== undefined && { paypalReceiverEmail: paypalReceiverEmail.trim() || 'order@jamessaxcorner.com' }),
        },
      })
    } else {
      // Create new settings
      settings = await prisma.siteSettings.create({
        data: {
          companyName: companyName || 'James Sax Corner',
          address: address || '',
          phone: phone || '',
          email: email || '',
          workingHours: workingHours || '24/7',
          socialLinks: socialLinks || {},
          trackingPixels: normalizedTrackingPixels.value || {},
          footerText: footerText || '',
          copyrightText: copyrightText || '',
          domesticShippingCost: domesticShippingCost ?? 25,
          paypalReceiverEmail: (paypalReceiverEmail && paypalReceiverEmail.trim()) || 'order@jamessaxcorner.com',
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error updating site settings:', error)
    return NextResponse.json(
      { error: 'Lỗi cập nhật cài đặt', message: 'Không thể cập nhật cài đặt trang web. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}

function normalizeTrackingPixels(value: unknown): {
  value?: {
    metaPixelId?: string
    tiktokPixelId?: string
    googleAdsId?: string
  }
  error?: string
} {
  if (value === undefined) return {}
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { error: 'Tracking pixels must be an object.' }
  }

  const pixels = value as Record<string, unknown>
  const metaPixelId = normalizeString(pixels.metaPixelId)
  const tiktokPixelId = normalizeString(pixels.tiktokPixelId)
  const googleAdsId = normalizeString(pixels.googleAdsId).toUpperCase()

  if (metaPixelId && !/^\d{6,30}$/.test(metaPixelId)) {
    return { error: 'Meta Pixel ID chỉ gồm chữ số. Vui lòng dán ID, không dán toàn bộ script.' }
  }

  if (tiktokPixelId && !/^[A-Za-z0-9]{8,80}$/.test(tiktokPixelId)) {
    return { error: 'TikTok Pixel ID chỉ gồm chữ và số. Vui lòng dán ID, không dán toàn bộ script.' }
  }

  if (googleAdsId && !/^(AW|G|GT)-[A-Z0-9_-]{4,60}$/.test(googleAdsId)) {
    return { error: 'Google Ads / Google tag ID phải có dạng AW-123456789, G-XXXX hoặc GT-XXXX.' }
  }

  return {
    value: {
      ...(metaPixelId && { metaPixelId }),
      ...(tiktokPixelId && { tiktokPixelId }),
      ...(googleAdsId && { googleAdsId }),
    },
  }
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}
