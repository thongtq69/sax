import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewsletterWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 400 }
        )
      } else {
        // Reactivate subscription
        await prisma.subscriber.update({
          where: { email: email.toLowerCase() },
          data: { isActive: true },
        })
      }
    } else {
      // Create new subscriber
      await prisma.subscriber.create({
        data: { email: email.toLowerCase() },
      })
    }

    // Send welcome email
    try {
      await sendNewsletterWelcomeEmail(email.toLowerCase())
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({ 
      success: true,
      message: 'Thank you for subscribing!' 
    })
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
}
