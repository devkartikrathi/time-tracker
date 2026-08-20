import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleRouteError, ok } from '@/lib/api-response'
import { updateUserSchema } from '@/lib/validation'
import { limitsFor } from '@/lib/plan'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
    try {
        const user = await requireUser()
        const achievements = await prisma.achievement.findMany({
            where: { userId: user.id },
            select: { key: true, unlockedAt: true },
        })

        return ok({
            user,
            limits: limitsFor(user.plan),
            achievements: achievements.map((a) => ({
                key: a.key,
                unlockedAt: a.unlockedAt.toISOString(),
            })),
        })
    } catch (error) {
        return handleRouteError(error, 'GET /api/user')
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await requireUser()
        const body = updateUserSchema.parse(await req.json())

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),
                ...(body.weekStartsOn !== undefined ? { weekStartsOn: body.weekStartsOn } : {}),
                ...(body.reminderHour !== undefined ? { reminderHour: body.reminderHour } : {}),
                ...(body.occupation !== undefined ? { occupation: body.occupation } : {}),
                ...(body.focus !== undefined ? { focus: body.focus } : {}),
            },
        })

        return ok({
            timezone: updated.timezone,
            weekStartsOn: updated.weekStartsOn,
            reminderHour: updated.reminderHour,
        })
    } catch (error) {
        return handleRouteError(error, 'PATCH /api/user')
    }
}

/** Deletes the account and everything cascading from it. */
export async function DELETE() {
    try {
        const user = await requireUser()
        await prisma.user.delete({ where: { id: user.id } })

        return ok({ deleted: true })
    } catch (error) {
        return handleRouteError(error, 'DELETE /api/user')
    }
}
