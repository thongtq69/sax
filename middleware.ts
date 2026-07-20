import { middleware } from "@/lib/auth.config"

export default middleware

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/orders/:path*',
    '/api/upload/:path*',
    '/api/products/:path*',
    '/api/categories/:path*',
    '/api/subcategories/:path*',
    '/api/blog/:path*',
    '/api/promos/:path*',
    '/api/models/:path*',
    '/api/test/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
