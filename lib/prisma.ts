import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('⚠️  DATABASE_URL is not set in environment variables')
}

// Ensure DATABASE_URL has proper parameters for MongoDB Atlas Serverless
function getOptimizedDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url

  if (url.startsWith('mongodb+srv://') || url.startsWith('mongodb://')) {
    try {
      const urlObj = new URL(url)

      // Keep existing connection if already customized, 
      // otherwise enforce strict limits to prevent connection exhaustion
      // on M0 Free Tier (which allows max 500 connections)
      if (!urlObj.searchParams.has('maxPoolSize')) {
        urlObj.searchParams.set('maxPoolSize', '10') // Limit connections per instance
      }
      if (!urlObj.searchParams.has('minPoolSize')) {
        urlObj.searchParams.set('minPoolSize', '0') // Don't hold idle connections
      }
      if (!urlObj.searchParams.has('maxIdleTimeMS')) {
        urlObj.searchParams.set('maxIdleTimeMS', '10000') // Drop connections faster in serverless
      }

      return urlObj.toString()
    } catch (e) {
      return url
    }
  }

  return url
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getOptimizedDatabaseUrl(process.env.DATABASE_URL),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// For serverless, don't connect eagerly - let Prisma connect on first query
// This avoids connection issues in cold start scenarios
