import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fail, handleRouteError, ok } from '@/lib/api-response'
import { pushSubscriptionSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
    try {
        const user = await requireUser()
        const body = pushSubscriptionSchema.parse(await req.json())

        // Endpoints are unique per device; upserting lets the same device
        // re-register after a service worker update without duplicating rows.
        const saved = await prisma.pushSubscription.upsert({
            where: { endpoint: body.endpoint },
            update: { userId: user.id, p256dh: body.keys.p256dh, auth: body.keys.auth },
            create: {
                userId: user.id,
                endpoint: body.endpoint,
                p256dh: body.keys.p256dh,
                auth: body.keys.auth,
            },
        })

        return ok({ id: saved.id })
    } catch (error) {
        return handleRouteError(error, 'POST /api/push/subscribe')
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await requireUser()
        const endpoint = new URL(req.url).searchParams.get('endpoint')
        if (!endpoint) return fail('An endpoint is required', 400)

        await prisma.pushSubscription.deleteMany({ where: { userId: user.id, endpoint } })
        return ok({ deleted: true })
    } catch (error) {
        return handleRouteError(error, 'DELETE /api/push/subscribe')
    }
}
