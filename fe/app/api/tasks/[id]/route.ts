import { NextResponse } from 'next/server'
import { getDatabaseUserId } from '@/lib/user-init'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getDatabaseUserId()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await prisma.task.delete({ where: { id: params.id } })
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('Error deleting task:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}


