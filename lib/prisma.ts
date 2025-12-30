import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('⚠️  DATABASE_URL is not set in environment variables')
}

// Ensure DATABASE_URL has proper SSL/TLS parameters for MongoDB Atlas
function ensureDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url
  
  // If it's already a mongodb+srv:// URL, ensure it has SSL parameters
  if (url.startsWith('mongodb+srv://')) {
    try {
      const urlObj = new URL(url)
      
      // Add SSL/TLS parameters if not present
      if (!urlObj.searchParams.has('ssl')) {
        urlObj.searchParams.set('ssl', 'true')
      }
      if (!urlObj.searchParams.has('tls')) {
        urlObj.searchParams.set('tls', 'true')
      }
      if (!urlObj.searchParams.has('tlsAllowInvalidCertificates')) {
        urlObj.searchParams.set('tlsAllowInvalidCertificates', 'false')
      }
      // Add connection timeout for serverless
      if (!urlObj.searchParams.has('connectTimeoutMS')) {
        urlObj.searchParams.set('connectTimeoutMS', '10000')
      }
      if (!urlObj.searchParams.has('socketTimeoutMS')) {
        urlObj.searchParams.set('socketTimeoutMS', '45000')
      }
      
      return urlObj.toString()
    } catch (e) {
      // If URL parsing fails, return original
      return url
    }
  }
  
  return url
}

// Get optimized DATABASE_URL
const optimizedDatabaseUrl = ensureDatabaseUrl(process.env.DATABASE_URL)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// For serverless, don't connect eagerly - let Prisma connect on first query
// This avoids connection issues in cold start scenarios
