import { cache } from 'react'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_SUBCATEGORIES } from '@/lib/categories'
import type { Plan, UserProfile } from '@/types'

/**
 * Resolves the Clerk session to our database user, creating the row (and a
 * starter set of activities) on first sight.
 *
 * Wrapped in React's `cache` so several server components or helpers in the
 * same request share one lookup instead of each hitting the database. The old
 * `getDatabaseUserId()` called the full initializer again for every route.
 */
export const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
    const { userId: clerkId } = await auth()
    if (!clerkId) return null

    let user = await prisma.user.findUnique({ where: { clerkId } })

    if (!user) {
        const clerkUser = await currentUser()
        if (!clerkUser) return null

        const email =
            clerkUser.emailAddresses?.[0]?.emailAddress ?? `${clerkId}@placeholder.local`

        user = await prisma.user.create({
            data: {
                clerkId,
                email,
                firstName: clerkUser.firstName ?? null,
                lastName: clerkUser.lastName ?? null,
                subcategories: {
                    create: DEFAULT_SUBCATEGORIES.map((sub) => ({
                        name: sub.name,
                        color: sub.color,
                        category: sub.category,
                        icon: sub.icon ?? null,
                        sortOrder: sub.sortOrder ?? 0,
                    })),
                },
            },
        })
    }

    return toProfile(user)
})

type UserRow = Awaited<ReturnType<typeof prisma.user.findUnique>>

function toProfile(user: NonNullable<UserRow>): UserProfile {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        occupation: user.occupation,
        age: user.age,
        focus: user.focus,
        plan: user.plan as Plan,
        timezone: user.timezone,
        weekStartsOn: user.weekStartsOn,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        lastLoggedDate: user.lastLoggedDate,
        reminderHour: user.reminderHour,
        onboardingCompleted: user.onboardingCompleted,
    }
}

/** Throws a typed error API routes turn into a 401. */
export class UnauthorizedError extends Error {
    constructor() {
        super('Unauthorized')
        this.name = 'UnauthorizedError'
    }
}

export async function requireUser(): Promise<UserProfile> {
    const user = await getCurrentUser()
    if (!user) throw new UnauthorizedError()
    return user
}
