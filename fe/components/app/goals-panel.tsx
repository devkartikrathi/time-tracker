'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Target, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { api, ApiError } from '@/lib/api-client'
import { queryKeys, useGoals, useMonthDays, useSubcategories } from '@/hooks/use-tracker'
import { goalProgress } from '@/lib/stats'
import { todayKey } from '@/lib/date'
import { useChartTheme } from '@/hooks/use-chart-theme'
import type { GoalPeriod } from '@/types'

export function GoalsPanel() {
    const theme = useChartTheme()
    const queryClient = useQueryClient()
    const anchor = useMemo(() => new Date(), [])

    const { data: goals = [] } = useGoals()
    const { data: days = [] } = useMonthDays(anchor)
    const { data: subcategories = [] } = useSubcategories()

    const [adding, setAdding] = useState(false)
    const [name, setName] = useState('')
    const [hours, setHours] = useState('2')
    const [period, setPeriod] = useState<GoalPeriod>('DAILY')
    const [subcategoryId, setSubcategoryId] = useState('')

    const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.goals })

    const create = useMutation({
        mutationFn: () => {
            const sub = subcategories.find((s) => s.id === subcategoryId)
            if (!sub) throw new Error('Pick an activity')
            return api.createGoal({
                name: name.trim(),
                targetHours: Number(hours),
                period,
                category: sub.category,
                subcategoryId,
            })
        },
        onSuccess: () => {
            setAdding(false)
            setName('')
            invalidate()
            toast.success('Goal added')
        },
        onError: (error) =>
            toast.error(error instanceof ApiError ? error.message : 'Could not add that goal'),
    })

    const remove = useMutation({
        mutationFn: (id: string) => api.deleteGoal(id),
        onSuccess: () => {
            invalidate()
            toast.success('Goal removed')
        },
        onError: () => toast.error('Could not remove that goal'),
    })

    const active = goals.filter((g) => g.isActive)
    const today = todayKey()

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-sm">Goals</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setAdding((v) => !v)}>
                    <Plus className="size-4" />
                    Add
                </Button>
            </CardHeader>

            <CardContent className="space-y-4">
                {active.length === 0 && !adding && (
                    <p className="text-muted-foreground text-sm">
                        No goals yet. Set one like &ldquo;2 hours of Deep Work a day&rdquo; and
                        track it against what you actually log.
                    </p>
                )}

                {active.map((goal) => {
                    const progress = goalProgress(goal, days, today)
                    const sub = subcategories.find((s) => s.id === goal.subcategoryId)
                    const color = sub ? theme.color(sub.color) : theme.category(goal.category)

                    return (
                        <div key={goal.id} className="space-y-1.5">
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="truncate text-sm font-medium">{goal.name}</span>
                                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                                    {progress.logged} / {progress.target}h
                                </span>
                                <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    aria-label={`Remove ${goal.name}`}
                                    onClick={() => remove.mutate(goal.id)}
                                >
                                    <Trash2 className="text-muted-foreground size-3.5" />
                                </Button>
                            </div>
                            <div className="bg-cell-empty h-2 overflow-hidden rounded-full">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${progress.percent}%`,
                                        backgroundColor: color,
                                    }}
                                />
                            </div>
                            <p className="text-muted-foreground text-xs">
                                {progress.met ? (
                                    <span className="text-success font-medium">Hit it</span>
                                ) : (
                                    `${(progress.target - progress.logged).toFixed(0)}h to go this ${
                                        goal.period === 'DAILY'
                                            ? 'day'
                                            : goal.period === 'WEEKLY'
                                              ? 'week'
                                              : 'month'
                                    }`
                                )}
                            </p>
                        </div>
                    )
                })}

                {adding && (
                    <form
                        className="space-y-3 border-t pt-4"
                        onSubmit={(event) => {
                            event.preventDefault()
                            if (name.trim() && subcategoryId) create.mutate()
                        }}
                    >
                        <div className="space-y-1.5">
                            <Label htmlFor="goal-name">Goal</Label>
                            <Input
                                id="goal-name"
                                value={name}
                                maxLength={60}
                                placeholder="e.g. Read every day"
                                onChange={(event) => setName(event.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Activity</Label>
                            <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pick an activity" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subcategories.map((sub) => (
                                        <SelectItem key={sub.id} value={sub.id}>
                                            {sub.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="goal-hours">Hours</Label>
                                <Input
                                    id="goal-hours"
                                    type="number"
                                    min={0.5}
                                    max={24}
                                    step={0.5}
                                    value={hours}
                                    onChange={(event) => setHours(event.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Per</Label>
                                <Select
                                    value={period}
                                    onValueChange={(value) => setPeriod(value as GoalPeriod)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DAILY">Day</SelectItem>
                                        <SelectItem value="WEEKLY">Week</SelectItem>
                                        <SelectItem value="MONTHLY">Month</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="brand"
                            className="w-full"
                            disabled={!name.trim() || !subcategoryId || create.isPending}
                        >
                            <Target className="size-4" />
                            Add goal
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}
