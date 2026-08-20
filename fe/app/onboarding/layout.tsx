import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUser } from '@/lib/auth'

/** Onboarding needs a session, and is skipped once it has been completed. */
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const user = await getCurrentUser()
    if (user?.onboardingCompleted) redirect('/app')

    return children
}
