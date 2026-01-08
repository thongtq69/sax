'use client'
import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

// Edge-compatible config for middleware (no Prisma)
export const authConfig: NextAuthConfig = {
    providers: [], // Providers are added in auth.ts
    session: {
        strategy: "jwt",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user

            // Define protected routes
            const isProtectedRoute = nextUrl.pathname.startsWith('/account') ||
                nextUrl.pathname.startsWith('/admin')

            // Define admin routes
            const isAdminRoute = nextUrl.pathname.startsWith('/admin')

            // Define auth routes (login, register, etc.)
            const isAuthRoute = nextUrl.pathname.startsWith('/auth')

            // Redirect logged-in users away from auth pages
            if (isAuthRoute && isLoggedIn) {
                return Response.redirect(new URL('/', nextUrl))
            }

            // Redirect non-logged-in users from protected routes to login
            if (isProtectedRoute && !isLoggedIn) {
                const callbackUrl = nextUrl.pathname + nextUrl.search
                return Response.redirect(
                    new URL(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
                )
            }

            // Check admin access for admin routes
            if (isAdminRoute && isLoggedIn) {
                const userRole = (auth?.user as any)?.role
                if (userRole !== 'admin') {
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
