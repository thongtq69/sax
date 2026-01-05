import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'reverb_feedback.json')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const reviews = JSON.parse(fileContent)
    
    // Sort by date descending (newest first)
    const sortedReviews = reviews.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    })
    
    return NextResponse.json(sortedReviews)
  } catch (error) {
    console.error('Error reading reviews:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newReview = await request.json()
    const filePath = path.join(process.cwd(), 'reverb_feedback.json')
    
    // Read existing reviews
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const reviews = JSON.parse(fileContent)
    
    // Add new review with current timestamp if not provided
    const reviewToAdd = {
      message: newReview.message || '',
      rating: newReview.rating || 5,
      author_name: newReview.author_name || 'Anonymous',
      recipient_name: 'James S.',
      order_title: newReview.order_title || '',
      created_at: newReview.created_at || new Date().toISOString(),
      listing_url: newReview.listing_url || '',
      feedback_url: ''
    }
    
    // Add to beginning of array
    reviews.unshift(reviewToAdd)
    
    // Sort by date descending
    reviews.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    })
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2))
    
    return NextResponse.json({ success: true, review: reviewToAdd })
  } catch (error) {
    console.error('Error adding review:', error)
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const index = parseInt(searchParams.get('index') || '-1')
    
    if (index < 0) {
      return NextResponse.json({ error: 'Invalid index' }, { status: 400 })
    }
    
    const filePath = path.join(process.cwd(), 'reverb_feedback.json')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const reviews = JSON.parse(fileContent)
    
    if (index >= reviews.length) {
      return NextResponse.json({ error: 'Index out of range' }, { status: 400 })
    }
    
    // Remove review at index
    reviews.splice(index, 1)
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
