import { NextResponse } from 'next/server'
import { getDatabaseUserId } from '@/lib/user-init'
import { getCategoryEnum } from '@/lib/constants'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getDatabaseUserId()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { name, targetHours, category, subcategoryId, isActive } = body

        if (!subcategoryId) {
            return NextResponse.json({ error: 'Subcategory is required for goals' }, { status: 400 })
        }

        const updated = await prisma.goal.update({
            where: { id: params.id },
            data: {
                name,
                targetHours,
                category: getCategoryEnum(category),
                subcategoryId,
                isActive
            }
        })
        return NextResponse.json({ data: updated })
    } catch (error) {
        console.error('Error updating goal:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getDatabaseUserId()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await prisma.goal.delete({ where: { id: params.id } })
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('Error deleting goal:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}


