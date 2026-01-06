import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      { error: 'Failed to fetch site settings', message: error?.message },
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
    } = body

    // Validate required fields
    if (!companyName || companyName.trim() === '') {
      return NextResponse.json(
        { error: 'Validation failed', details: ['companyName is required'] },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Validation failed', details: ['Invalid email format'] },
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
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error updating site settings:', error)
    return NextResponse.json(
      { error: 'Failed to update site settings', message: error?.message },
      { status: 500 }
    )
  }
}
