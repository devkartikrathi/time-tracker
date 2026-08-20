import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fail, handleRouteError, ok } from '@/lib/api-response'
import { updateGoalSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
    try {
        const user = await requireUser()
        const { id } = await params
        const body = updateGoalSchema.parse(await req.json())

        const existing = await prisma.goal.findFirst({ where: { id, userId: user.id } })
        if (!existing) return fail('Goal not found', 404)

        if (body.subcategoryId) {
            const owned = await prisma.subcategory.findFirst({
                where: { id: body.subcategoryId, userId: user.id },
            })
            if (!owned) return fail('Pick one of your own activities', 400)
        }

        const updated = await prisma.goal.update({
            where: { id },
            data: {
                ...(body.name !== undefined ? { name: body.name } : {}),
                ...(body.targetHours !== undefined ? { targetHours: body.targetHours } : {}),
                ...(body.period !== undefined ? { period: body.period } : {}),
                ...(body.subcategoryId !== undefined ? { subcategoryId: body.subcategoryId } : {}),
                ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
            },
        })

        return ok(updated)
    } catch (error) {
        return handleRouteError(error, 'PATCH /api/goals/[id]')
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    try {
        const user = await requireUser()
        const { id } = await params

        const deleted = await prisma.goal.deleteMany({ where: { id, userId: user.id } })
        if (deleted.count === 0) return fail('Goal not found', 404)

        return ok({ deleted: true })
    } catch (error) {
        return handleRouteError(error, 'DELETE /api/goals/[id]')
    }
}
