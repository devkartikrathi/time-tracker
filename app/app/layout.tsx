import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { AppProviders } from '@/components/app/app-providers'
import { AppShell } from '@/components/app/app-shell'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = { title: 'Your day' }

/**
 * The authorization boundary for every authenticated page.
 *
 * A server component, so the check runs before any child renders and cannot be
 * skipped by a client-side route transition. This replaces the path-matching
 * middleware guard that Clerk 7 warns against.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const user = await getCurrentUser()
    if (!user) redirect('/sign-in')
    if (!user.onboardingCompleted) redirect('/onboarding')

    return (
        <AppProviders>
            <AppShell>{children}</AppShell>
        </AppProviders>
    )
}
