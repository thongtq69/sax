import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'reverb_feedback.json')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const reviews = JSON.parse(fileContent)
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error reading reviews:', error)
    return NextResponse.json([], { status: 500 })
  }
}
