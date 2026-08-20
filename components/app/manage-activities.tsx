'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, ApiError } from '@/lib/api-client'
import { queryKeys, useSubcategories, useUserBundle } from '@/hooks/use-tracker'
import { CATEGORY_LIST, nextColorForCategory } from '@/lib/categories'
import { cn } from '@/lib/utils'
import { useChartTheme } from '@/hooks/use-chart-theme'
import type { CategoryType } from '@/types'

interface ManageActivitiesProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ManageActivities({ open, onOpenChange }: ManageActivitiesProps) {
    const theme = useChartTheme()
    const queryClient = useQueryClient()
    const { data: subcategories = [] } = useSubcategories()
    const { data: bundle } = useUserBundle()

    const [name, setName] = useState('')
    const [category, setCategory] = useState<CategoryType>('WORK')

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.subcategories })
    }

    const create = useMutation({
        mutationFn: () =>
            api.createSubcategory({
                name: name.trim(),
                category,
                color: nextColorForCategory(category, subcategories),
            }),
        onSuccess: () => {
            setName('')
            invalidate()
            toast.success('Activity added')
        },
        onError: (error) => {
            const message = error instanceof ApiError ? error.message : 'Could not add that'
            toast.error(message)
        },
    })

    const remove = useMutation({
        mutationFn: (id: string) => api.deleteSubcategory(id),
        onSuccess: () => {
            invalidate()
            // Archived rather than destroyed, so past days keep their colours.
            toast.success('Activity archived', {
                description: 'Your logged history keeps it.',
            })
        },
        onError: () => toast.error('Could not remove that'),
    })

    const limit = bundle?.limits.maxSubcategories ?? 8
    const atLimit = subcategories.length >= limit

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Your activities</DrawerTitle>
                    <DrawerDescription>
                        {subcategories.length} of {Number.isFinite(limit) ? limit : '∞'} used.
                        Colours are assigned so no two activities look alike in the month grid,
                        including for colour-blind readers.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="space-y-5 overflow-y-auto px-4 pb-6">
                    {CATEGORY_LIST.map((meta) => {
                        const items = subcategories.filter((s) => s.category === meta.id)
                        if (items.length === 0) return null
                        return (
                            <div key={meta.id}>
                                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                                    {meta.label}
                                </p>
                                <ul className="space-y-1.5">
                                    {items.map((activity) => (
                                        <li
                                            key={activity.id}
                                            className="bg-card flex items-center gap-3 rounded-lg border px-3 py-2"
                                        >
                                            <span
                                                aria-hidden
                                                className="size-4 shrink-0 rounded-full ring-1 ring-black/10"
                                                style={{ backgroundColor: theme.color(activity.color) }}
                                            />
                                            <span className="flex-1 truncate text-sm font-medium">
                                                {activity.name}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Remove ${activity.name}`}
                                                disabled={remove.isPending}
                                                onClick={() => remove.mutate(activity.id)}
                                            >
                                                <Trash2 className="text-muted-foreground size-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}

                    <form
                        className="space-y-3 border-t pt-4"
                        onSubmit={(event) => {
                            event.preventDefault()
                            if (name.trim() && !atLimit) create.mutate()
                        }}
                    >
                        <div className="space-y-1.5">
                            <Label htmlFor="activity-name">New activity</Label>
                            <Input
                                id="activity-name"
                                value={name}
                                maxLength={40}
                                placeholder="e.g. Reading"
                                onChange={(event) => setName(event.target.value)}
                                disabled={atLimit}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Group</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {CATEGORY_LIST.map((meta) => (
                                    <button
                                        key={meta.id}
                                        type="button"
                                        onClick={() => setCategory(meta.id)}
                                        className={cn(
                                            'flex min-h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all',
                                            category === meta.id
                                                ? 'border-brand bg-brand-muted'
                                                : 'bg-card hover:bg-accent'
                                        )}
                                    >
                                        <span
                                            aria-hidden
                                            className="size-2.5 rounded-full"
                                            style={{ backgroundColor: theme.category(meta.id) }}
                                        />
                                        {meta.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {atLimit ? (
                            <p className="text-muted-foreground text-xs">
                                You have reached your plan&apos;s activity limit.{' '}
                                <a href="/pricing" className="text-brand underline">
                                    See Pro
                                </a>
                                .
                            </p>
                        ) : null}

                        <Button
                            type="submit"
                            variant="brand"
                            className="w-full"
                            disabled={!name.trim() || atLimit || create.isPending}
                        >
                            {create.isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Plus className="size-4" />
                            )}
                            Add activity
                        </Button>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
