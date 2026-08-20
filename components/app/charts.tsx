'use client'

import { useMemo } from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { CATEGORY_META, CATEGORY_ORDER } from '@/lib/categories'
import { useChartTheme } from '@/hooks/use-chart-theme'
import { fromDayKey } from '@/lib/date'
import { WELL_BEING_TAGS, type WellBeingTag } from '@/types'
import type { DailySeriesPoint } from '@/lib/stats'
import type { CategoryTotals } from '@/lib/stats'

/** Shared legend — identity is never carried by colour alone. */
function CategoryLegend() {
    const theme = useChartTheme()
    return (
        <ul className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {CATEGORY_ORDER.map((category) => (
                <li key={category} className="flex items-center gap-1.5">
                    <span
                        aria-hidden
                        className="size-2.5 rounded-sm"
                        style={{ backgroundColor: theme.category(category) }}
                    />
                    {CATEGORY_META[category].label}
                </li>
            ))}
        </ul>
    )
}

function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean
    payload?: Array<{ name?: string; dataKey?: string; value?: number; color?: string }>
    label?: string | number
}) {
    if (!active || !payload?.length) return null
    const rows = payload.filter((row) => (row.value ?? 0) > 0)
    if (rows.length === 0) return null

    return (
        <div className="bg-popover rounded-lg border px-3 py-2 text-xs shadow-lg">
            <p className="mb-1 font-medium">{label}</p>
            {rows.map((row) => (
                <p key={row.dataKey} className="flex items-center gap-2">
                    <span
                        aria-hidden
                        className="size-2 rounded-sm"
                        style={{ backgroundColor: row.color }}
                    />
                    <span className="text-muted-foreground">{row.name}</span>
                    <span className="ml-auto font-medium tabular-nums">{row.value}h</span>
                </p>
            ))}
        </div>
    )
}

interface CategoryTrendProps {
    series: DailySeriesPoint[]
}

/** Daily stacked hours over the recent window. */
export function CategoryTrendChart({ series }: CategoryTrendProps) {
    const theme = useChartTheme()

    const data = useMemo(
        () =>
            series.map((point) => ({
                ...point,
                label: fromDayKey(point.date).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                }),
            })),
        [series]
    )

    return (
        <div>
            <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                    <CartesianGrid stroke={theme.grid} vertical={false} strokeDasharray="2 4" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: theme.muted }}
                        tickLine={false}
                        axisLine={{ stroke: theme.axis }}
                        interval="preserveStartEnd"
                        minTickGap={16}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: theme.muted }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        allowDecimals={false}
                    />
                    <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ fill: theme.grid, opacity: 0.4 }}
                    />
                    {CATEGORY_ORDER.map((category, index) => (
                        <Bar
                            key={category}
                            dataKey={category}
                            name={CATEGORY_META[category].label}
                            stackId="hours"
                            fill={theme.category(category)}
                            // 2px surface gap between stacked segments so the
                            // boundary reads without a border.
                            stroke={theme.surface}
                            strokeWidth={1}
                            radius={index === CATEGORY_ORDER.length - 1 ? [3, 3, 0, 0] : 0}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
            <CategoryLegend />
        </div>
    )
}

interface HourProfileProps {
    profile: Array<{ hour: number } & CategoryTotals>
}

/** "Your typical day" — which categories occupy which hours, across history. */
export function HourProfileChart({ profile }: HourProfileProps) {
    const theme = useChartTheme()

    const data = useMemo(
        () =>
            profile.map((point) => ({
                ...point,
                label:
                    point.hour === 0
                        ? '12a'
                        : point.hour === 12
                          ? '12p'
                          : point.hour < 12
                            ? `${point.hour}a`
                            : `${point.hour - 12}p`,
            })),
        [profile]
    )

    return (
        <div>
            <ResponsiveContainer width="100%" height={170}>
                <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                    <CartesianGrid stroke={theme.grid} vertical={false} strokeDasharray="2 4" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 9, fill: theme.muted }}
                        tickLine={false}
                        axisLine={{ stroke: theme.axis }}
                        interval={3}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: theme.muted }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: theme.grid, opacity: 0.4 }} />
                    {CATEGORY_ORDER.map((category) => (
                        <Bar
                            key={category}
                            dataKey={category}
                            name={CATEGORY_META[category].label}
                            stackId="profile"
                            fill={theme.category(category)}
                            stroke={theme.surface}
                            strokeWidth={1}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
            <CategoryLegend />
        </div>
    )
}

interface BalanceWheelProps {
    counts: Partial<Record<WellBeingTag, number>>
}

/**
 * The life-balance wheel.
 *
 * A radar is the right form here specifically because the question is "is this
 * shape even?" rather than "which value is biggest" — the eye reads asymmetry
 * far faster than it reads eleven bar lengths.
 */
export function BalanceWheel({ counts }: BalanceWheelProps) {
    const theme = useChartTheme()

    const data = useMemo(
        () => WELL_BEING_TAGS.map((tag) => ({ tag, value: counts[tag] ?? 0 })),
        [counts]
    )
    const max = Math.max(...data.map((d) => d.value), 1)
    const empty = data.every((d) => d.value === 0)

    if (empty) {
        return (
            <p className="text-muted-foreground py-8 text-center text-sm">
                Tag a few days on the Today tab and your balance wheel appears here.
            </p>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={data} outerRadius="70%">
                <PolarGrid stroke={theme.grid} />
                <PolarAngleAxis dataKey="tag" tick={{ fontSize: 10, fill: theme.muted }} />
                <PolarRadiusAxis domain={[0, max]} tick={false} axisLine={false} />
                <Radar
                    name="Days tagged"
                    dataKey="value"
                    stroke={theme.category('WORK')}
                    fill={theme.category('WORK')}
                    fillOpacity={0.28}
                    strokeWidth={2}
                />
                <Tooltip
                    content={({ active, payload }) =>
                        active && payload?.length ? (
                            <div className="bg-popover rounded-lg border px-3 py-2 text-xs shadow-lg">
                                <span className="font-medium">{payload[0]?.payload?.tag}</span>{' '}
                                <span className="text-muted-foreground">
                                    {payload[0]?.value} {payload[0]?.value === 1 ? 'day' : 'days'}
                                </span>
                            </div>
                        ) : null
                    }
                />
            </RadarChart>
        </ResponsiveContainer>
    )
}

interface ActivityBarsProps {
    items: Array<{ id: string; name: string; color: string; hours: number; percent: number }>
}

/** Horizontal ranked bars — the form for "which is biggest" with long labels. */
export function ActivityBars({ items }: ActivityBarsProps) {
    const theme = useChartTheme()
    const max = Math.max(...items.map((i) => i.hours), 1)

    return (
        <ul className="space-y-2">
            {items.map((item) => (
                <li key={item.id} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="truncate font-medium">{item.name}</span>
                        <span className="text-muted-foreground shrink-0 tabular-nums">
                            {item.hours}h · {Math.round(item.percent)}%
                        </span>
                    </div>
                    <div className="bg-cell-empty h-2 overflow-hidden rounded-full">
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${(item.hours / max) * 100}%`,
                                backgroundColor: theme.color(item.color),
                            }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    )
}
