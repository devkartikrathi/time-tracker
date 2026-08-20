'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    BookOpen,
    Brain,
    CalendarCheck,
    CircleCheckBig,
    Download,
    Flame,
    Hourglass,
    Lock,
    Scale,
    Settings2,
    Smile,
    Sparkles,
    Sunrise,
    Target,
    Trophy,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ManageActivities } from '@/components/app/manage-activities'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { api, ApiError } from '@/lib/api-client'
import { queryKeys, useUserBundle } from '@/hooks/use-tracker'
import { detectTimezone, formatHourLong } from '@/lib/date'
import { cn } from '@/lib/utils'

const ACHIEVEMENT_ICONS: Record<string, typeof Trophy> = {
    sparkles: Sparkles,
    'circle-check-big': CircleCheckBig,
    flame: Flame,
    trophy: Trophy,
    'calendar-check': CalendarCheck,
    hourglass: Hourglass,
    scale: Scale,
    sunrise: Sunrise,
    target: Target,
    smile: Smile,
    brain: Brain,
    'book-open': BookOpen,
}

export default function YouPage() {
    const queryClient = useQueryClient()
    const { data } = useUserBundle()
    const [manageOpen, setManageOpen] = useState(false)
    const [enablingPush, setEnablingPush] = useState(false)

    const user = data?.user
    const limits = data?.limits
    const unlocked = new Set((data?.achievements ?? []).map((a) => a.key))

    const updateUser = useMutation({
        mutationFn: (body: Record<string, unknown>) => api.updateUser(body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.user }),
        onError: () => toast.error('Could not save that'),
    })

    const enablePush = async (enabled: boolean) => {
        if (!enabled) {
            updateUser.mutate({ reminderHour: null })
            toast.success('Reminders off')
            return
        }

        setEnablingPush(true)
        try {
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            if (!vapidKey) {
                toast.error('Reminders are not configured on this deployment yet')
                return
            }

            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                toast.error('Notifications were blocked in your browser settings')
                return
            }

            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            })

            await api.subscribePush(subscription.toJSON())
            updateUser.mutate({ reminderHour: 21, timezone: detectTimezone() })
            toast.success('Reminders on', { description: 'You will get a nudge at 9pm.' })
        } catch (error) {
            toast.error(
                error instanceof ApiError ? error.message : 'Could not turn on reminders'
            )
        } finally {
            setEnablingPush(false)
        }
    }

    const exportData = async (format: 'csv' | 'json') => {
        try {
            const res = await fetch(`/api/export?format=${format}`)
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                toast.error(body.error ?? 'Export failed')
                return
            }
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `chronos-export.${format}`
            link.click()
            URL.revokeObjectURL(url)
        } catch {
            toast.error('Export failed')
        }
    }

    return (
        <div className="space-y-5">
            <header>
                <h1 className="text-lg font-semibold tracking-tight">
                    {user?.firstName ? `Hey, ${user.firstName}` : 'Your account'}
                </h1>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
            </header>

            <div className="grid grid-cols-2 gap-2">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Flame className="text-brand size-4" />
                            <span className="text-xl font-semibold tabular-nums">
                                {user?.currentStreak ?? 0}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-xs">Current streak</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Trophy className="text-brand size-4" />
                            <span className="text-xl font-semibold tabular-nums">
                                {user?.longestStreak ?? 0}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-xs">Longest streak</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {ACHIEVEMENTS.map((achievement) => {
                            const has = unlocked.has(achievement.key)
                            const Icon = ACHIEVEMENT_ICONS[achievement.icon] ?? Trophy
                            return (
                                <li
                                    key={achievement.key}
                                    className={cn(
                                        'rounded-lg border p-3 transition-colors',
                                        has ? 'bg-card' : 'bg-muted/40 opacity-60'
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'mb-1.5 size-4',
                                            has ? 'text-brand' : 'text-muted-foreground'
                                        )}
                                    />
                                    <p className="text-xs font-medium leading-tight">
                                        {achievement.name}
                                    </p>
                                    <p className="text-muted-foreground mt-0.5 text-[11px] leading-tight">
                                        {achievement.description}
                                    </p>
                                </li>
                            )
                        })}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setManageOpen(true)}>
                        <Settings2 className="size-4" />
                        Manage activities
                    </Button>

                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <Label htmlFor="reminders" className="text-sm">
                                Daily reminder
                            </Label>
                            <p className="text-muted-foreground text-xs">
                                A nudge to log your day before you forget it.
                            </p>
                        </div>
                        <Switch
                            id="reminders"
                            checked={user?.reminderHour != null}
                            disabled={enablingPush}
                            onCheckedChange={enablePush}
                        />
                    </div>

                    {user?.reminderHour != null && (
                        <div className="space-y-1.5">
                            <Label>Remind me at</Label>
                            <Select
                                value={String(user.reminderHour)}
                                onValueChange={(value) =>
                                    updateUser.mutate({ reminderHour: Number(value) })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 24 }, (_, hour) => (
                                        <SelectItem key={hour} value={String(hour)}>
                                            {formatHourLong(hour)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Your data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-muted-foreground text-xs">
                        Everything you log is yours. Take it with you whenever you like.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => exportData('csv')}
                        >
                            {limits?.export ? (
                                <Download className="size-4" />
                            ) : (
                                <Lock className="size-4" />
                            )}
                            CSV
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => exportData('json')}
                        >
                            {limits?.export ? (
                                <Download className="size-4" />
                            ) : (
                                <Lock className="size-4" />
                            )}
                            JSON
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {user?.plan === 'FREE' && (
                <Card className="border-brand/40">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium">You are on the free plan</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                            Pro unlocks unlimited history, exports, deeper AI reads and more
                            activities.
                        </p>
                        <Button asChild variant="brand" size="sm" className="mt-3 w-full">
                            <Link href="/pricing">See Pro</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            <ManageActivities open={manageOpen} onOpenChange={setManageOpen} />
        </div>
    )
}

/**
 * The Push API wants the VAPID key as a Uint8Array, but it is distributed as
 * URL-safe base64.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw = atob(base64)
    // Backed by an explicit ArrayBuffer: the Push API's BufferSource will not
    // accept the SharedArrayBuffer-compatible default.
    const output = new Uint8Array(new ArrayBuffer(raw.length))
    for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
    return output
}
