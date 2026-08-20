'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Activity,
    ChartColumn,
    ChartPie,
    CircleCheckBig,
    Compass,
    Flame,
    Grid3x3,
    Heart,
    Lightbulb,
    Moon,
    Scale,
    Smile,
    Sparkles,
    Sunrise,
    Target,
    Timer,
    TrendingDown,
    TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
    ActivityBars,
    BalanceWheel,
    CategoryTrendChart,
    HourProfileChart,
} from '@/components/app/charts'
import { GoalsPanel } from '@/components/app/goals-panel'
import { api, type InsightsResult } from '@/lib/api-client'
import { queryKeys, useMonthDays, useSubcategories } from '@/hooks/use-tracker'
import { breakdownBySubcategory, dailySeries, hourProfile, wellBeingCounts } from '@/lib/stats'
import { lastNDays } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { Insight } from '@/types'

const ICONS: Record<string, typeof Lightbulb> = {
    activity: Activity,
    'chart-column': ChartColumn,
    'chart-pie': ChartPie,
    'circle-check-big': CircleCheckBig,
    compass: Compass,
    flame: Flame,
    'grid-3x3': Grid3x3,
    heart: Heart,
    moon: Moon,
    scale: Scale,
    smile: Smile,
    sparkles: Sparkles,
    sunrise: Sunrise,
    target: Target,
    timer: Timer,
    'trending-down': TrendingDown,
    'trending-up': TrendingUp,
}

export default function InsightsPage() {
    const [useAi, setUseAi] = useState(false)
    const anchor = useMemo(() => new Date(), [])

    const { data: days = [] } = useMonthDays(anchor)
    const { data: subcategories = [] } = useSubcategories()

    const { data, isLoading } = useQuery<InsightsResult>({
        queryKey: queryKeys.insights(useAi),
        queryFn: () => api.getInsights(useAi),
        staleTime: 120_000,
    })

    const series = useMemo(() => dailySeries(days, lastNDays(14)), [days])
    const profile = useMemo(() => hourProfile(days), [days])
    const counts = useMemo(() => wellBeingCounts(days), [days])
    const breakdown = useMemo(
        () => breakdownBySubcategory(days, subcategories).slice(0, 6),
        [days, subcategories]
    )

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-lg font-semibold tracking-tight">Insights</h1>
                <p className="text-muted-foreground text-sm">
                    Patterns pulled from your own logged hours.
                </p>
            </header>

            {data?.headline && (
                <Card className="border-brand/40 bg-brand-muted/40">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium">{data.headline}</p>
                        {data.suggestion && (
                            <p className="text-muted-foreground mt-2 text-sm">
                                <span className="text-foreground font-medium">Try this: </span>
                                {data.suggestion}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            <section className="space-y-3">
                {isLoading ? (
                    <>
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                    </>
                ) : (
                    data?.insights.map((insight) => (
                        <InsightCard key={insight.id} insight={insight} />
                    ))
                )}

                {data?.aiAvailable && !data.aiUsed && (
                    <Button variant="outline" className="w-full" onClick={() => setUseAi(true)}>
                        <Sparkles className="size-4" />
                        Write me a deeper read
                    </Button>
                )}
            </section>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Last 14 days</CardTitle>
                </CardHeader>
                <CardContent>
                    <CategoryTrendChart series={series} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Your typical day</CardTitle>
                </CardHeader>
                <CardContent>
                    <HourProfileChart profile={profile} />
                </CardContent>
            </Card>

            {breakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Top activities this month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ActivityBars items={breakdown} />
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Life balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <BalanceWheel counts={counts} />
                </CardContent>
            </Card>

            <GoalsPanel />
        </div>
    )
}

function InsightCard({ insight }: { insight: Insight }) {
    const Icon = ICONS[insight.icon] ?? Lightbulb

    return (
        <Card>
            <CardContent className="flex gap-3 p-4">
                <div
                    className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg',
                        insight.severity === 'warning'
                            ? 'bg-warning/15 text-warning'
                            : insight.severity === 'positive'
                              ? 'bg-success/15 text-success'
                              : 'bg-accent text-muted-foreground'
                    )}
                >
                    <Icon className="size-4" />
                </div>
                <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold leading-snug">{insight.title}</h3>
                        {insight.id.startsWith('ai-') && (
                            <Badge variant="brand" className="shrink-0">
                                AI
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{insight.body}</p>
                </div>
            </CardContent>
        </Card>
    )
}
