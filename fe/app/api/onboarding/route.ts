import { NextResponse } from 'next/server'
import { initializeUser } from '@/lib/user-init'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        // Initialize user (creates if doesn't exist, returns database user)
        const user = await initializeUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { occupation, age, focus } = body || {}

        // Update user with onboarding data using database user ID
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                occupation,
                age: age ? Number(age) : null,
                focus
            }
        })

        // Set cookie to indicate onboarding is completed
        const res = NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                clerkId: updatedUser.clerkId,
                occupation: updatedUser.occupation,
                age: updatedUser.age,
                focus: updatedUser.focus
            }
        })
        res.headers.append('Set-Cookie', 'onboardingCompleted=true; Path=/; Max-Age=31536000')
        return res

    } catch (error) {
        console.error('Onboarding error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}


