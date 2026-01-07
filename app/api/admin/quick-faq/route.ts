import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Quick FAQ API for product pages

const defaultQuickFaqs = [
  {
    id: '1',
    question: 'Is this a beginner saxophone?',
    answer: 'No. We sell professional models only, intended for serious students and working musicians.',
    category: 'Product',
    isActive: true
  },
  {
    id: '2',
    question: 'Is this instrument ready to ship?',
    answer: 'Yes. All listed saxophones are fully prepared and ready for immediate shipment.',
    category: 'Shipping',
    isActive: true
  },
  {
    id: '3',
    question: 'How long does delivery to the U.S. take?',
    answer: 'We use FedEx, DHL, or UPS express international shipping, with delivery typically in 3–4 business days.',
    category: 'Shipping',
    isActive: true
  },
  {
    id: '4',
    question: 'Is payment secure?',
    answer: 'Yes. All payments are processed via PayPal with full buyer protection.',
    category: 'Payment',
    isActive: true
  },
  {
    id: '5',
    question: 'Can I ask questions before buying?',
    answer: 'Absolutely. We encourage you to contact us before purchase for detailed guidance.',
    category: 'Support',
    isActive: true
  }
]

// GET /api/admin/quick-faq - Get quick FAQ for product pages
export async function GET() {
  try {
    // Get site settings which stores quick FAQ
    const settings = await prisma.siteSettings.findFirst()
    
    if (settings && settings.quickFaq) {
      return NextResponse.json(settings.quickFaq)
    }
    
    return NextResponse.json(defaultQuickFaqs)
  } catch (error: any) {
    console.error('Error fetching quick FAQ:', error)
    return NextResponse.json(defaultQuickFaqs)
  }
}

// PUT /api/admin/quick-faq - Update quick FAQ
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { faqs } = body

    if (!faqs || !Array.isArray(faqs)) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', message: 'Dữ liệu FAQ phải là một danh sách' },
        { status: 400 }
      )
    }

    // Validate each FAQ item
    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i]
      const missingFields = []
      if (!faq.question || faq.question.trim() === '') missingFields.push('Câu hỏi')
      if (!faq.answer || faq.answer.trim() === '') missingFields.push('Câu trả lời')
      
      if (missingFields.length > 0) {
        return NextResponse.json(
          { 
            error: 'Thiếu thông tin bắt buộc', 
            message: `FAQ #${i + 1}: Vui lòng điền đầy đủ các trường: ${missingFields.join(', ')}`,
            missingFields 
          },
          { status: 400 }
        )
      }
    }

    // Get existing settings or create new
    let settings = await prisma.siteSettings.findFirst()

    if (settings) {
      // Update existing settings with quick FAQ
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          quickFaq: faqs,
        },
      })
    } else {
      // Create new settings with quick FAQ
      settings = await prisma.siteSettings.create({
        data: {
          companyName: 'James Sax Corner',
          quickFaq: faqs,
        },
      })
    }

    return NextResponse.json(settings.quickFaq)
  } catch (error: any) {
    console.error('Error updating quick FAQ:', error)
    return NextResponse.json(
      { error: 'Lỗi cập nhật FAQ', message: 'Không thể cập nhật Quick FAQ. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}
