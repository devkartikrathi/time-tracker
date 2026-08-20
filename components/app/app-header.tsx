'use client'

import Link from 'next/link'
import { Flame } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

interface AppHeaderProps {
    streak?: number
    streakAtRisk?: boolean
}

export function AppHeader({ streak = 0, streakAtRisk = false }: AppHeaderProps) {
    return (
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 pt-safe sticky top-0 z-40 border-b backdrop-blur">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
                <Link href="/app" className="flex items-center gap-2 font-semibold tracking-tight">
                    <svg
                        viewBox="0 0 24 24"
                        className="text-brand size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        aria-hidden
                    >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                    </svg>
                    Chronos
                </Link>

                <div className="flex items-center gap-1.5">
                    {streak > 0 && (
                        <span
                            className={cn(
                                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums',
                                streakAtRisk
                                    ? 'bg-warning/15 text-warning'
                                    : 'bg-brand-muted text-brand'
                            )}
                            title={
                                streakAtRisk
                                    ? 'Log today to keep your streak alive'
                                    : `${streak} day streak`
                            }
                        >
                            <Flame className="size-3.5" />
                            {streak}
                        </span>
                    )}
                    <ThemeToggle />
                    <UserButton
                        appearance={{ elements: { avatarBox: 'size-7' } }}
                        userProfileMode="navigation"
                        userProfileUrl="/app/you"
                    />
                </div>
            </div>
        </header>
    )
}
