import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fail, handleRouteError, ok } from '@/lib/api-response'
import { updateSubcategorySchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Next.js 16: route params arrive as a Promise.
type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
    try {
        const user = await requireUser()
        const { id } = await params
        const body = updateSubcategorySchema.parse(await req.json())

        // Scope the write to the caller. Matching on id alone would let any
        // signed-in user edit another account's activities.
        const existing = await prisma.subcategory.findFirst({
            where: { id, userId: user.id },
        })
        if (!existing) return fail('Activity not found', 404)

        const updated = await prisma.subcategory.update({
            where: { id },
            data: {
                ...(body.name !== undefined ? { name: body.name } : {}),
                ...(body.color !== undefined ? { color: body.color } : {}),
                ...(body.category !== undefined ? { category: body.category } : {}),
                ...(body.icon !== undefined ? { icon: body.icon } : {}),
                ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
                ...(body.isArchived !== undefined ? { isArchived: body.isArchived } : {}),
            },
        })

        return ok(updated)
    } catch (error) {
        return handleRouteError(error, 'PATCH /api/subcategories/[id]')
    }
}

/**
 * Archives rather than destroys.
 *
 * Logged hours reference a subcategory by id inside the day's JSON, which no
 * foreign key protects. A hard delete would leave every historical cell that
 * used this activity pointing at nothing, silently rewriting the user's past.
 * Archiving hides it from the picker and keeps the history readable.
 */
export async function DELETE(_req: Request, { params }: Params) {
    try {
        const user = await requireUser()
        const { id } = await params

        const existing = await prisma.subcategory.findFirst({
            where: { id, userId: user.id },
        })
        if (!existing) return fail('Activity not found', 404)

        const [archived] = await prisma.$transaction([
            prisma.subcategory.update({
                where: { id },
                data: { isArchived: true },
            }),
            // Goals pointing at an archived activity can no longer make
            // progress, so they are retired alongside it.
            prisma.goal.updateMany({
                where: { subcategoryId: id, userId: user.id },
                data: { isActive: false },
            }),
        ])

        return ok(archived)
    } catch (error) {
        return handleRouteError(error, 'DELETE /api/subcategories/[id]')
    }
}
