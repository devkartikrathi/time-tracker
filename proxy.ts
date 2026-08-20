import { clerkMiddleware } from '@clerk/nextjs/server'

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`.
 *
 * This deliberately does nothing beyond attaching the Clerk session to the
 * request. Authorization happens at each resource instead — every API route
 * calls `requireUser()`, and the authenticated layouts check the session
 * server-side.
 *
 * Clerk 7 deprecated `createRouteMatcher` for exactly this reason: middleware
 * path matching can diverge from how Next.js actually resolves a route, which
 * leaves protected resources reachable if the matcher and the router disagree.
 * Checking at the point where data is read cannot drift that way.
 */
export default clerkMiddleware()

export const config = {
    matcher: [
        '/((?!_next|manifest\\.webmanifest|sw\\.js|icons/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}
