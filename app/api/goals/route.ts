import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fail, handleRouteError, ok } from '@/lib/api-response'
import { createGoalSchema } from '@/lib/validation'
import { limitsFor } from '@/lib/plan'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
    try {
        const user = await requireUser()
        const data = await prisma.goal.findMany({
            where: { userId: user.id },
            orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
        })
        return ok(data)
    } catch (error) {
        return handleRouteError(error, 'GET /api/goals')
    }
}

export async function POST(req: Request) {
    try {
        const user = await requireUser()
        const body = createGoalSchema.parse(await req.json())

        const limits = limitsFor(user.plan)
        const count = await prisma.goal.count({ where: { userId: user.id, isActive: true } })
        if (count >= limits.maxGoals) {
            return fail(`Your plan allows ${limits.maxGoals} active goals. Upgrade for more.`, 403, {
                upgradeRequired: true,
            })
        }

        // The subcategory must belong to the caller — otherwise a goal could be
        // attached to another account's activity id.
        const subcategory = await prisma.subcategory.findFirst({
            where: { id: body.subcategoryId, userId: user.id, isArchived: false },
        })
        if (!subcategory) return fail('Pick one of your own activities', 400)

        const created = await prisma.goal.create({
            data: {
                userId: user.id,
                name: body.name,
                targetHours: body.targetHours,
                period: body.period,
                category: subcategory.category,
                subcategoryId: body.subcategoryId,
            },
        })

        return ok(created, { status: 201 })
    } catch (error) {
        return handleRouteError(error, 'POST /api/goals')
    }
}
