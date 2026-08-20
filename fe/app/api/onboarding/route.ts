import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleRouteError, ok } from '@/lib/api-response'
import { onboardingSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
    try {
        const user = await requireUser()
        const body = onboardingSchema.parse(await req.json())

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                occupation: body.occupation,
                age: body.age,
                focus: body.focus,
                timezone: body.timezone ?? user.timezone,
                // Recorded explicitly rather than inferred from whether the
                // three profile fields happen to be non-null.
                onboardingCompleted: true,
                onboardedAt: new Date(),
            },
        })

        return ok({
            onboardingCompleted: true,
            occupation: updated.occupation,
            focus: updated.focus,
        })
    } catch (error) {
        return handleRouteError(error, 'POST /api/onboarding')
    }
}
