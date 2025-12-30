import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/test - Test endpoint to debug database connection
export async function GET() {
  try {
    // Check if DATABASE_URL is set
    const hasDbUrl = !!process.env.DATABASE_URL
    
    if (!hasDbUrl) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'DATABASE_URL is not set',
          env: {
            NODE_ENV: process.env.NODE_ENV,
            hasDatabaseUrl: false,
          },
        },
        { status: 500 }
      )
    }

    // Try to connect
    await prisma.$connect()
    
    // Try a simple query
    const categoryCount = await prisma.category.count()
    const productCount = await prisma.product.count()
    
    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasDatabaseUrl: true,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
      },
      database: {
        connected: true,
        categoryCount,
        productCount,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error?.message || 'Unknown error',
        code: error?.code || 'UNKNOWN_ERROR',
        env: {
          NODE_ENV: process.env.NODE_ENV,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...' || 'not set',
        },
        error: {
          name: error?.name,
          message: error?.message,
          code: error?.code,
          stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
        },
      },
      { status: 500 }
    )
  }
}

