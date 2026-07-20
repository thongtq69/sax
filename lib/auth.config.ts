import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

// Edge-compatible config for middleware (no Prisma)
export const authConfig: NextAuthConfig = {
    providers: [], // Providers are added in auth.ts
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            // Pass role from user object to token
            if (user) {
                token.role = (user as any).role || "user"
            }
            return token
        },
        async session({ session, token }) {
            // Pass role from token to session
            if (session.user) {
                (session.user as any).role = token.role
            }
            return session
        },
        authorized({ auth, request }) {
            const { nextUrl } = request
            const isLoggedIn = !!auth?.user

            // Define protected routes
            const isAdminApi = nextUrl.pathname.startsWith('/api/admin')
            const adminContentPrefixes = [
                '/api/categories',
                '/api/subcategories',
                '/api/blog',
                '/api/promos',
                '/api/models',
            ]
            const isProductAdminMutation = (
                request.method === 'POST' && nextUrl.pathname === '/api/products'
            ) || (
                ['PUT', 'PATCH', 'DELETE'].includes(request.method)
                && /^\/api\/products\/[^/]+$/.test(nextUrl.pathname)
            )
            const isAdminContentMutation = request.method !== 'GET' && (
                isProductAdminMutation
                || adminContentPrefixes.some((path) => nextUrl.pathname.startsWith(path))
            )
            const isSensitiveApi = isAdminApi ||
                nextUrl.pathname.startsWith('/api/orders') ||
                nextUrl.pathname.startsWith('/api/upload') ||
                nextUrl.pathname.startsWith('/api/test') ||
                isAdminContentMutation

            const publicAdminGetPrefixes = [
                '/api/admin/testimonials',
                '/api/admin/homepage-content',
                '/api/admin/inquiry-titles',
                '/api/admin/site-settings',
                '/api/admin/faqs',
                '/api/admin/quick-faq',
            ]
            const isPublicAdminRead = request.method === 'GET' && isAdminApi &&
                publicAdminGetPrefixes.some((path) => nextUrl.pathname.startsWith(path))

            const isProtectedRoute = nextUrl.pathname.startsWith('/account') ||
                nextUrl.pathname.startsWith('/admin') ||
                (isSensitiveApi && !isPublicAdminRead)

            // Define admin routes
            const isAdminRoute = nextUrl.pathname.startsWith('/admin') ||
                (isSensitiveApi && !isPublicAdminRead)

            // Define auth routes (login, register, etc.)
            const isAuthRoute = nextUrl.pathname.startsWith('/auth')

            // Redirect logged-in users away from auth pages
            if (isAuthRoute && isLoggedIn) {
                // Redirect admin to dashboard, regular users to home
                const userRole = (auth?.user as any)?.role
                if (userRole === 'admin') {
                    return Response.redirect(new URL('/admin', nextUrl))
                }
                return Response.redirect(new URL('/', nextUrl))
            }

            // Redirect non-logged-in users from protected routes to login
            if (isProtectedRoute && !isLoggedIn) {
                if (nextUrl.pathname.startsWith('/api/')) {
                    return Response.json({ error: 'Unauthorized' }, { status: 401 })
                }
                const callbackUrl = nextUrl.pathname + nextUrl.search
                return Response.redirect(
                    new URL(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
                )
            }

            // Check admin access for admin routes
            if (isAdminRoute && isLoggedIn) {
                const userRole = (auth?.user as any)?.role
                if (userRole !== 'admin') {
                    if (nextUrl.pathname.startsWith('/api/')) {
                        return Response.json({ error: 'Forbidden' }, { status: 403 })
                    }
                    return Response.redirect(new URL('/auth/error?error=AccessDenied', nextUrl))
                }
            }

            return true
        },
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
    },
}

export const { auth: middleware } = NextAuth(authConfig)

