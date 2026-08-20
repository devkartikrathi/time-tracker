import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fail, handleRouteError, ok } from '@/lib/api-response'
import { createSubcategorySchema } from '@/lib/validation'
import { limitsFor } from '@/lib/plan'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
    try {
        const user = await requireUser()
        const data = await prisma.subcategory.findMany({
            where: { userId: user.id, isArchived: false },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        })
        return ok(data)
    } catch (error) {
        return handleRouteError(error, 'GET /api/subcategories')
    }
}

export async function POST(req: Request) {
    try {
        const user = await requireUser()
        const body = createSubcategorySchema.parse(await req.json())

        const limits = limitsFor(user.plan)
        const count = await prisma.subcategory.count({
            where: { userId: user.id, isArchived: false },
        })

        if (count >= limits.maxSubcategories) {
            return fail(
                `Your plan allows ${limits.maxSubcategories} activities. Upgrade for more.`,
                403,
                { upgradeRequired: true }
            )
        }

        const duplicate = await prisma.subcategory.findFirst({
            where: {
                userId: user.id,
                isArchived: false,
                name: { equals: body.name, mode: 'insensitive' },
            },
        })
        if (duplicate) return fail(`You already have an activity called "${body.name}"`, 409)

        const created = await prisma.subcategory.create({
            data: {
                userId: user.id,
                name: body.name,
                color: body.color,
                category: body.category,
                icon: body.icon ?? null,
                sortOrder: count,
            },
        })

        return ok(created, { status: 201 })
    } catch (error) {
        return handleRouteError(error, 'POST /api/subcategories')
    }
}
