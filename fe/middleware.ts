import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/onboarding'
])

export default clerkMiddleware(async (auth, req) => {
    const url = req.nextUrl

    // If Clerk is not configured, allow all public routes to pass through
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        if (isPublicRoute(req)) {
            return NextResponse.next()
        }
        // For non-public routes without Clerk, redirect to home
        return NextResponse.redirect(new URL('/', req.url))
    }

    // Protect non-public routes
    if (!isPublicRoute(req)) {
        await auth.protect()
    }

    // For authenticated users, let the client-side handle onboarding checks
    // The middleware will only protect routes, not handle onboarding redirects
    // This simplifies the logic and avoids cookie/database sync issues

    return NextResponse.next()
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
