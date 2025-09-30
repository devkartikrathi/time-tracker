import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export interface DatabaseUser {
    id: string
    clerkId: string
    email: string
    firstName: string | null
    lastName: string | null
    occupation: string | null
    age: number | null
    focus: string | null
    onboardingCompleted: boolean
}

/**
 * Ensures user exists in database and returns the database user ID
 * This should be called at the beginning of every API route that needs user data
 */
export async function initializeUser(): Promise<DatabaseUser | null> {
    try {
        // Check if user is authenticated
        const { isAuthenticated } = await auth()
        if (!isAuthenticated) {
            return null
        }

        // Get the Backend API User object
        const clerkUser = await currentUser()
        if (!clerkUser) {
            return null
        }

        const clerkId = clerkUser.id

        // Check if user exists in our database
        let user = await prisma.user.findUnique({
            where: { clerkId }
        })

        if (!user) {
            const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress || `${clerkId}@placeholder.local`

            // Create new user in database
            user = await prisma.user.create({
                data: {
                    clerkId,
                    email: primaryEmail,
                    firstName: clerkUser.firstName || null,
                    lastName: clerkUser.lastName || null,
                    occupation: null,
                    age: null,
                    focus: null
                }
            })

            // Create default subcategories for new user
            const defaultSubcategories = [
                { name: 'Sleep', color: '#9ca3af', category: 'REST' },
                { name: 'Meals', color: '#a1a1aa', category: 'REST' },
                { name: 'Office', color: '#22c55e', category: 'WORK' },
                { name: 'Study', color: '#16a34a', category: 'WORK' },
                { name: 'Personal', color: '#ef4444', category: 'OTHER' },
                { name: 'Entertainment', color: '#dc2626', category: 'OTHER' },
            ]

            for (const subcat of defaultSubcategories) {
                await prisma.subcategory.create({
                    data: {
                        userId: user.id,
                        name: subcat.name,
                        color: subcat.color,
                        category: subcat.category as any
                    }
                })
            }
        }

        // Check if onboarding is completed
        const onboardingCompleted = !!(user.occupation && user.age && user.focus)

        return {
            id: user.id,
            clerkId: user.clerkId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            occupation: user.occupation,
            age: user.age,
            focus: user.focus,
            onboardingCompleted
        }

    } catch (error) {
        console.error('Error initializing user:', error)
        return null
    }
}

/**
 * Simple helper to get just the database user ID
 */
export async function getDatabaseUserId(): Promise<string | null> {
    const user = await initializeUser()
    return user?.id || null
}
