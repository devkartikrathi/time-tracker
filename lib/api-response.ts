import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { UnauthorizedError } from '@/lib/auth'
import { fieldErrors } from '@/lib/validation'

/**
 * One place that decides what an API route returns, so error shapes are
 * consistent and internal details never leak to the client in production.
 */

export function ok<T>(data: T, init?: ResponseInit) {
    return NextResponse.json({ data }, init)
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
    return NextResponse.json({ error: message, ...extra }, { status })
}

export function handleRouteError(error: unknown, context: string) {
    if (error instanceof UnauthorizedError) {
        return fail('You need to be signed in', 401)
    }

    if (error instanceof ZodError) {
        return fail('Some fields need fixing', 422, { fields: fieldErrors(error) })
    }

    // Prisma surfaces a unique-constraint violation as P2002.
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = (error as { code?: string }).code
        if (code === 'P2002') return fail('That already exists', 409)
        if (code === 'P2025') return fail('Not found', 404)
        if (code === 'P2003') return fail('Referenced record does not exist', 400)
    }

    console.error(`[${context}]`, error)

    const detail =
        process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined

    return fail('Something went wrong on our end', 500, detail ? { detail } : undefined)
}

/**
 * Small fixed-window rate limiter, keyed per user per route.
 *
 * In-memory, so it is per-instance rather than global — enough to stop a
 * runaway client loop hammering the database, which is what it is for. A
 * distributed limit would need Redis or Vercel KV.
 */
const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit = 60, windowMs = 60_000): boolean {
    const now = Date.now()
    const bucket = buckets.get(key)

    if (!bucket || now > bucket.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs })
        return true
    }

    if (bucket.count >= limit) return false
    bucket.count += 1
    return true
}

// Keeps the map from growing without bound in a long-lived instance.
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now()
        for (const [key, bucket] of buckets) {
            if (now > bucket.resetAt) buckets.delete(key)
        }
    }, 300_000).unref?.()
}
