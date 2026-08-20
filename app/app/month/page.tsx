'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MonthHeatmap } from '@/components/app/month-heatmap'
import { DaySummary } from '@/components/app/day-summary'
import { useMonthDays, useSubcategories } from '@/hooks/use-tracker'
import { breakdownBySubcategory, filledHours, totalsForRange } from '@/lib/stats'
import { useChartTheme } from '@/hooks/use-chart-theme'

export default function MonthPage() {
    const router = useRouter()
    const theme = useChartTheme()
    const [anchor, setAnchor] = useState(() => new Date())
    const [sharing, setSharing] = useState(false)

    const { data: days = [], isLoading } = useMonthDays(anchor)
    const { data: subcategories = [] } = useSubcategories()

    const totals = useMemo(() => totalsForRange(days), [days])
    const breakdown = useMemo(
        () => breakdownBySubcategory(days, subcategories),
        [days, subcategories]
    )
    const loggedDays = days.filter((d) => filledHours(d.hours) > 0).length
    const loggedHours = totals.REST + totals.WORK + totals.OTHER

    const monthParam = `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

    const shift = (months: number) => {
        setAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + months, 1))
    }

    const share = async () => {
        setSharing(true)
        try {
            const res = await fetch(`/api/share/month?month=${monthParam}`)
            if (!res.ok) throw new Error('Could not build the card')
            const blob = await res.blob()
            const file = new File([blob], `chronos-${monthParam}.png`, { type: 'image/png' })

            // Web Share with files is the good path on mobile; elsewhere fall
            // back to a plain download.
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({ files: [file], title: `My ${monthLabel}` })
            } else {
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = file.name
                link.click()
                URL.revokeObjectURL(url)
                toast.success('Card saved to your downloads')
            }
        } catch (error) {
            // A user dismissing the share sheet throws AbortError — not a failure.
            if ((error as Error).name !== 'AbortError') {
                toast.error('Could not create your card')
            }
        } finally {
            setSharing(false)
        }
    }

    return (
        <div className="space-y-5">
            <header className="flex items-center justify-between gap-2">
                <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => shift(-1)}>
                    <ChevronLeft className="size-5" />
                </Button>
                <h1 className="text-lg font-semibold tracking-tight">{monthLabel}</h1>
                <Button variant="ghost" size="icon" aria-label="Next month" onClick={() => shift(1)}>
                    <ChevronRight className="size-5" />
                </Button>
            </header>

            <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="Hours" value={loggedHours} />
                <Stat label="Days" value={loggedDays} />
                <Stat
                    label="Avg / day"
                    value={loggedDays > 0 ? Math.round(loggedHours / loggedDays) : 0}
                />
            </div>

            <DaySummary totals={totals} />

            {isLoading ? (
                <div className="space-y-1">
                    {Array.from({ length: 12 }, (_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                    ))}
                </div>
            ) : (
                <MonthHeatmap
                    anchor={anchor}
                    days={days}
                    subcategories={subcategories}
                    onSelectDay={() => router.push('/app')}
                />
            )}

            {breakdown.length > 0 && (
                <section>
                    <h2 className="mb-2 text-sm font-semibold">Where the time went</h2>
                    <ul className="space-y-1.5">
                        {breakdown.slice(0, 8).map((item) => (
                            <li key={item.id} className="flex items-center gap-2.5 text-sm">
                                <span
                                    aria-hidden
                                    className="size-3 shrink-0 rounded-sm"
                                    style={{ backgroundColor: theme.color(item.color) }}
                                />
                                <span className="flex-1 truncate">{item.name}</span>
                                <span className="text-muted-foreground tabular-nums">
                                    {item.hours}h
                                </span>
                                <span className="text-muted-foreground w-10 text-right tabular-nums">
                                    {Math.round(item.percent)}%
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <Button
                variant="outline"
                className="w-full"
                onClick={share}
                disabled={sharing || loggedHours === 0}
            >
                {sharing ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
                Share this month
            </Button>
        </div>
    )
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-card rounded-lg border p-3">
            <div className="text-xl font-semibold tabular-nums">{value}</div>
            <div className="text-muted-foreground text-xs">{label}</div>
        </div>
    )
}
