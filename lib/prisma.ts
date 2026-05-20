import { PrismaClient } from '@prisma/client'

const READ_OPERATIONS = new Set([
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
])

const DEFAULT_READ_RETRY_ATTEMPTS = 3
const READ_RETRY_BASE_DELAY_MS = 150

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null
}

function getErrorCode(error: unknown): string | undefined {
  return isObject(error) && typeof error.code === 'string' ? error.code : undefined
}

function getErrorMessage(error: unknown): string {
  const messages: string[] = []

  if (error instanceof Error) {
    messages.push(error.message)
  } else if (typeof error === 'string') {
    messages.push(error)
  }

  if (isObject(error) && isObject(error.meta) && typeof error.meta.message === 'string') {
    messages.push(error.meta.message)
  }

  return messages.join('\n')
}

function isTransientReadError(error: unknown) {
  const code = getErrorCode(error)

  if (code && ['P1001', 'P1002', 'P1017'].includes(code)) {
    return true
  }

  if (code !== 'P2010') {
    return false
  }

  const message = getErrorMessage(error)

  return /RetryableWriteError|Server selection timeout|ReplicaSetNoPrimary|Connection pool|I\/O error|InternalError|ECONNRESET|ETIMEDOUT|TLS|timeout/i.test(message)
}

function getReadRetryAttempts() {
  const configuredAttempts = Number(process.env.PRISMA_READ_RETRY_ATTEMPTS)

  if (Number.isFinite(configuredAttempts) && configuredAttempts >= 1) {
    return Math.min(Math.floor(configuredAttempts), 5)
  }

  return DEFAULT_READ_RETRY_ATTEMPTS
}

function createPrismaClient() {
  const client = new PrismaClient({
    datasourceUrl: getOptimizedDatabaseUrl(process.env.DATABASE_URL),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!READ_OPERATIONS.has(operation)) {
            return query(args)
          }

          const attempts = getReadRetryAttempts()
          let lastError: unknown

          for (let attempt = 1; attempt <= attempts; attempt += 1) {
            try {
              return await query(args)
            } catch (error) {
              lastError = error

              if (attempt >= attempts || !isTransientReadError(error)) {
                throw error
              }

              const delay = READ_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1)

              console.warn(
                `[prisma] transient read error on ${model}.${operation}; retrying ${attempt}/${attempts}`,
                {
                  code: getErrorCode(error),
                  message: getErrorMessage(error).slice(0, 500),
                }
              )

              await sleep(delay)
            }
          }

          throw lastError
        },
      },
    },
  })
}

type PrismaClientWithExtensions = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientWithExtensions | undefined
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
      if (!urlObj.searchParams.has('serverSelectionTimeoutMS')) {
        urlObj.searchParams.set('serverSelectionTimeoutMS', '8000') // Fail fast enough to retry
      }
      if (!urlObj.searchParams.has('connectTimeoutMS')) {
        urlObj.searchParams.set('connectTimeoutMS', '10000')
      }
      if (!urlObj.searchParams.has('retryReads')) {
        urlObj.searchParams.set('retryReads', 'true')
      }
      if (!urlObj.searchParams.has('retryWrites')) {
        urlObj.searchParams.set('retryWrites', 'true')
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
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// For serverless, don't connect eagerly - let Prisma connect on first query
// This avoids connection issues in cold start scenarios
