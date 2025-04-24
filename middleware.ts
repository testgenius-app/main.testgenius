// Create a new middleware file at the root of the project

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define paths that don't require authentication
const publicPaths = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback/google",
]

// Define auth-only paths that should redirect to dashboard if authenticated
const authOnlyPaths = ["/auth/signin", "/auth/signup"]

// Token key name for consistency
const ACCESS_TOKEN_KEY = "access_token"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
  const isAuthOnlyPath = authOnlyPaths.some((path) => pathname.startsWith(path))

  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value

  // If trying to access protected route without token, redirect to login
  if (!isPublicPath && !accessToken) {
    const url = new URL("/auth/signin", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // If trying to access auth pages while authenticated, redirect to dashboard
  if (isAuthOnlyPath && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If on homepage and authenticated, redirect to dashboard
  if (pathname === "/" && accessToken && pathname !== "/auth/callback/google") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all routes except static files, api routes, and _next
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}
