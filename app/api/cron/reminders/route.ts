import webpush from 'web-push'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Daily reminder fan-out, driven by a Vercel cron (see vercel.json).
 *
 * Runs hourly and sends only to users whose configured reminder hour matches
 * the current hour *in their own timezone*, so one hourly job covers every
 * region without scheduling per-timezone crons.
 */
export async function GET(req: Request) {
    // Vercel signs cron invocations with CRON_SECRET; without this check the
    // endpoint would let anyone trigger a push to the whole user base.
    const secret = process.env.CRON_SECRET
    const auth = req.headers.get('authorization')
    if (!secret || auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    if (!publicKey || !privateKey) {
        return NextResponse.json({ skipped: 'VAPID keys not configured' })
    }

    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT ?? 'mailto:hello@example.com',
        publicKey,
        privateKey
    )

    const candidates = await prisma.user.findMany({
        where: { reminderHour: { not: null }, pushSubscriptions: { some: {} } },
        select: {
            id: true,
            timezone: true,
            reminderHour: true,
            currentStreak: true,
            lastLoggedDate: true,
            pushSubscriptions: true,
        },
    })

    const now = new Date()
    let sent = 0
    let pruned = 0

    for (const user of candidates) {
        const localHour = hourInTimezone(now, user.timezone)
        if (localHour !== user.reminderHour) continue

        const localDate = dateInTimezone(now, user.timezone)
        // Nothing to nag about if they have already logged today.
        if (user.lastLoggedDate === localDate) continue

        const body =
            user.currentStreak > 0
                ? `Your ${user.currentStreak}-day streak is still alive. Log today to keep it.`
                : 'How did today actually go? It takes about twenty seconds.'

        for (const sub of user.pushSubscriptions) {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth },
                    },
                    JSON.stringify({ title: 'Chronos', body, url: '/app' })
                )
                sent += 1
            } catch (error) {
                // 404/410 means the browser dropped the subscription — clean it
                // up so it is not retried every hour forever.
                const status = (error as { statusCode?: number }).statusCode
                if (status === 404 || status === 410) {
                    await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
                    pruned += 1
                }
            }
        }
    }

    return NextResponse.json({ sent, pruned, checked: candidates.length })
}

function hourInTimezone(date: Date, timeZone: string): number {
    try {
        return Number(
            new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hour12: false }).format(date)
        )
    } catch {
        return date.getUTCHours()
    }
}

function dateInTimezone(date: Date, timeZone: string): string {
    try {
        // en-CA formats as YYYY-MM-DD, matching our day-key format.
        return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date)
    } catch {
        return date.toISOString().slice(0, 10)
    }
}
