'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Flame, Moon, Sun } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useIsClient } from '@/hooks/use-is-client'

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

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    // The server cannot know the user's theme, so the icon only renders once
    // hydrated — otherwise it mismatches on the server pass.
    const mounted = useIsClient()

    return (
        <Button
            variant="ghost"
            size="icon-sm"
            aria-label={
                mounted ? `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'
            }
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
            {mounted && resolvedTheme === 'dark' ? (
                <Sun className="size-4" />
            ) : (
                <Moon className="size-4" />
            )}
        </Button>
    )
}
