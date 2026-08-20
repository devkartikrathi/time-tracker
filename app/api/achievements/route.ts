import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleRouteError, ok } from '@/lib/api-response'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
    try {
        const user = await requireUser()
        const rows = await prisma.achievement.findMany({
            where: { userId: user.id },
            orderBy: { unlockedAt: 'desc' },
        })
        return ok(
            rows.map((row) => ({ key: row.key, unlockedAt: row.unlockedAt.toISOString() }))
        )
    } catch (error) {
        return handleRouteError(error, 'GET /api/achievements')
    }
}
