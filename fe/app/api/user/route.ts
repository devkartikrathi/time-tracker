import { NextResponse } from 'next/server'
import { initializeUser } from '@/lib/user-init'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// GET - Get or create user and check onboarding status
export async function GET() {
    try {
        const user = await initializeUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json({
            user: {
                id: user.id,
                clerkId: user.clerkId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                occupation: user.occupation,
                age: user.age,
                focus: user.focus
            },
            onboardingCompleted: user.onboardingCompleted,
            isNewUser: !user.occupation
        })

    } catch (error) {
        console.error('Error in user API:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
