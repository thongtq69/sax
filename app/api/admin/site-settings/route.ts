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
      footerText,
      copyrightText,
      domesticShippingCost,
    } = body

    // Validate required fields
    if (companyName !== undefined && companyName.trim() === '') {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc', message: 'Tên công ty không được để trống' },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Email không hợp lệ', message: 'Vui lòng nhập địa chỉ email đúng định dạng (ví dụ: example@domain.com)' },
          { status: 400 }
        )
      }
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
          ...(footerText !== undefined && { footerText }),
          ...(copyrightText !== undefined && { copyrightText }),
          ...(domesticShippingCost !== undefined && { domesticShippingCost }),
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
          footerText: footerText || '',
          copyrightText: copyrightText || '',
          domesticShippingCost: domesticShippingCost ?? 25,
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
