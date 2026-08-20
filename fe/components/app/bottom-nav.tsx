'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Grid3x3, Lightbulb, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
    { href: '/app', label: 'Today', icon: Grid3x3 },
    { href: '/app/month', label: 'Month', icon: CalendarDays },
    { href: '/app/insights', label: 'Insights', icon: Lightbulb },
    { href: '/app/you', label: 'You', icon: User },
] as const

/**
 * Primary navigation on mobile: a thumb-reachable bottom bar. Each tab is a
 * real route rather than local state, so the hardware back button, deep links
 * and browser history all behave as users expect.
 */
export function BottomNav() {
    const pathname = usePathname()

    return (
        <nav
            aria-label="Main"
            className="bg-background/95 supports-[backdrop-filter]:bg-background/80 pb-safe fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur md:hidden"
        >
            <ul className="flex items-stretch">
                {TABS.map((tab) => {
                    const active = pathname === tab.href
                    const Icon = tab.icon
                    return (
                        <li key={tab.href} className="flex-1">
                            <Link
                                href={tab.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                                    active ? 'text-brand' : 'text-muted-foreground'
                                )}
                            >
                                <Icon className={cn('size-5', active && 'stroke-[2.4]')} />
                                {tab.label}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}

/** The same destinations as a sidebar on wider screens. */
export function SideNav() {
    const pathname = usePathname()

    return (
        <nav aria-label="Main" className="hidden w-56 shrink-0 md:block">
            <ul className="sticky top-20 space-y-1">
                {TABS.map((tab) => {
                    const active = pathname === tab.href
                    const Icon = tab.icon
                    return (
                        <li key={tab.href}>
                            <Link
                                href={tab.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                                )}
                            >
                                <Icon className="size-4" />
                                {tab.label}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
