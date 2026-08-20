import Link from 'next/link'
import type { Metadata } from 'next'
import { Check, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarketingFooter, MarketingHeader } from '@/components/marketing/chrome'
import { PLAN_LIMITS, PRO_PRICE_MONTHLY, PRO_PRICE_YEARLY } from '@/lib/plan'

export const metadata: Metadata = {
    title: 'Pricing',
    description:
        'Chronos is free forever for daily tracking. Pro adds unlimited history, exports and deeper AI reads.',
}

const ROWS: Array<{ label: string; free: string | boolean; pro: string | boolean }> = [
    { label: 'Daily 24-hour grid', free: true, pro: true },
    { label: 'Month view and heatmap', free: true, pro: true },
    { label: 'Streaks and achievements', free: true, pro: true },
    { label: 'Pattern insights', free: true, pro: true },
    { label: 'Mood tracking and correlations', free: true, pro: true },
    { label: 'Shareable month card', free: true, pro: true },
    { label: 'Install on your phone, works offline', free: true, pro: true },
    { label: 'Daily reminders', free: true, pro: true },
    {
        label: 'History kept',
        free: `${PLAN_LIMITS.FREE.historyDays} days`,
        pro: 'Forever',
    },
    {
        label: 'Activities',
        free: String(PLAN_LIMITS.FREE.maxSubcategories),
        pro: String(PLAN_LIMITS.PRO.maxSubcategories),
    },
    {
        label: 'Active goals',
        free: String(PLAN_LIMITS.FREE.maxGoals),
        pro: String(PLAN_LIMITS.PRO.maxGoals),
    },
    { label: 'Export to CSV and JSON', free: false, pro: true },
    { label: 'AI written analysis', free: false, pro: true },
    { label: 'Custom activity colours', free: false, pro: true },
]

export default function PricingPage() {
    return (
        <div className="min-h-dvh">
            <MarketingHeader />

            <main className="mx-auto max-w-3xl px-4 py-12">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Free for the part that matters
                    </h1>
                    <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-pretty">
                        Daily tracking, the month view, insights and streaks cost nothing and always
                        will. Pro is for people who want their whole history and their data on
                        demand.
                    </p>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <div className="bg-card rounded-xl border p-6">
                        <h2 className="font-medium">Free</h2>
                        <p className="mt-2 text-3xl font-semibold tabular-nums">$0</p>
                        <p className="text-muted-foreground mt-1 text-sm">Forever, no card.</p>
                        <Button asChild variant="outline" className="mt-5 w-full">
                            <Link href="/sign-up">Start tracking</Link>
                        </Button>
                    </div>

                    <div className="border-brand bg-card relative rounded-xl border-2 p-6">
                        <span className="bg-brand text-brand-foreground absolute -top-2.5 left-6 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                            Recommended
                        </span>
                        <h2 className="font-medium">Pro</h2>
                        <p className="mt-2 text-3xl font-semibold tabular-nums">
                            ${PRO_PRICE_MONTHLY}
                            <span className="text-muted-foreground text-base font-normal">
                                {' '}
                                / month
                            </span>
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Or ${PRO_PRICE_YEARLY} a year — two months free.
                        </p>
                        <Button asChild variant="brand" className="mt-5 w-full">
                            <Link href="/sign-up">Start free, upgrade later</Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-10 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="py-3 text-left font-medium">What you get</th>
                                <th className="w-20 py-3 text-center font-medium">Free</th>
                                <th className="w-20 py-3 text-center font-medium">Pro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ROWS.map((row) => (
                                <tr key={row.label} className="border-b last:border-0">
                                    <td className="py-2.5 pr-3">{row.label}</td>
                                    <Cell value={row.free} />
                                    <Cell value={row.pro} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="text-muted-foreground mt-8 text-center text-xs">
                    Payments are not wired up yet — every account is on the free plan for now, and
                    Pro limits are already enforced in the app so nothing changes underneath you
                    when they are.
                </p>
            </main>

            <MarketingFooter />
        </div>
    )
}

function Cell({ value }: { value: string | boolean }) {
    return (
        <td className="py-2.5 text-center">
            {value === true ? (
                <Check className="text-success mx-auto size-4" aria-label="Included" />
            ) : value === false ? (
                <Minus className="text-muted-foreground mx-auto size-4" aria-label="Not included" />
            ) : (
                <span className="tabular-nums">{value}</span>
            )}
        </td>
    )
}
