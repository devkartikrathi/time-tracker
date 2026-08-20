'use client'

import { AppHeader } from '@/components/app/app-header'
import { BottomNav, SideNav } from '@/components/app/bottom-nav'
import { InstallPrompt } from '@/components/app/install-prompt'
import { useUserBundle } from '@/hooks/use-tracker'
import { todayKey } from '@/lib/date'

export function AppShell({ children }: { children: React.ReactNode }) {
    const { data } = useUserBundle()
    const user = data?.user

    // Streak is at risk when it is alive but today has not been logged yet.
    const atRisk = Boolean(
        user && user.currentStreak > 0 && user.lastLoggedDate !== todayKey()
    )

    return (
        <div className="min-h-dvh">
            <AppHeader streak={user?.currentStreak ?? 0} streakAtRisk={atRisk} />

            <div className="mx-auto flex max-w-5xl gap-8 px-4 py-4 md:py-6">
                <SideNav />
                {/* Bottom padding clears the fixed tab bar and the brush bar. */}
                <main className="min-w-0 flex-1 pb-40 md:pb-8">{children}</main>
            </div>

            <BottomNav />
            <InstallPrompt />
        </div>
    )
}
