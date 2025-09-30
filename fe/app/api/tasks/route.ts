import { NextResponse } from 'next/server'
import { getDatabaseUserId } from '@/lib/user-init'
import { getCategoryEnum } from '@/lib/constants'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// GET tasks for a specific date (YYYY-MM-DD)
export async function GET(req: Request) {
    try {
        const userId = await getDatabaseUserId()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const url = new URL(req.url)
        const date = url.searchParams.get('date') || ''
        const startDate = url.searchParams.get('startDate') || ''
        const endDate = url.searchParams.get('endDate') || ''

        let whereClause: any = { userId }

        if (startDate && endDate) {
            // Date range query for MonthlyGrid
            whereClause.date = {
                gte: startDate,
                lte: endDate
            }
        } else if (date) {
            // Single date query
            whereClause.date = date
        }

        const tasks = await prisma.task.findMany({
            where: whereClause,
            orderBy: [{ date: 'asc' }, { hour: 'asc' }],
            include: {
                subcategory: true
            }
        })
        return NextResponse.json({ data: tasks })
    } catch (error) {
        console.error('Error fetching tasks:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getDatabaseUserId()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { date, hour, taskName, duration, wellBeingTags, category, subcategoryId } = body

        const created = await prisma.task.upsert({
            where: { userId_date_hour: { userId, date, hour } },
            update: {
                taskName,
                duration,
                wellBeingTags,
                category: getCategoryEnum(category),
                subcategoryId
            },
            create: {
                userId,
                date,
                hour,
                taskName,
                duration,
                wellBeingTags,
                category: getCategoryEnum(category),
                subcategoryId
            },
        })
        return NextResponse.json({ data: created })
    } catch (error) {
        console.error('Error creating/updating task:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}


