import { NextResponse } from 'next/server'
import { getDatabaseUserId } from '@/lib/user-init'
import { getCategoryEnum } from '@/lib/constants'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const userId = await getDatabaseUserId()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const data = await prisma.subcategory.findMany({
            where: { userId }
        })

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Error fetching subcategories:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getDatabaseUserId()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { category, name, color } = body

        const created = await prisma.subcategory.create({
            data: {
                category: getCategoryEnum(category),
                name,
                color,
                userId
            }
        })
        return NextResponse.json({ data: created })
    } catch (error) {
        console.error('Error creating subcategory:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}


