import { NextResponse } from 'next/server'
import { getDatabaseUserId } from '@/lib/user-init'
import { prisma } from '@/lib/prisma'
import type { HourData } from '@/types/timeTracking'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// GET daily tasks for a date range
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

        const dailyTasks = await prisma.dailyTask.findMany({
            where: whereClause,
            orderBy: { date: 'asc' }
        })

        return NextResponse.json({ data: dailyTasks })
    } catch (error) {
        console.error('Error fetching daily tasks:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// POST/CREATE daily task
export async function POST(req: Request) {
    try {
        const userId = await getDatabaseUserId()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { date, hours, wellBeingTags = [] } = body

        // Initialize hours array with 24 null values if not provided
        const hoursArray = hours || Array(24).fill(null)

        const created = await prisma.dailyTask.create({
            data: {
                userId,
                date,
                hours: hoursArray,
                wellBeingTags
            }
        })

        return NextResponse.json({ data: created })
    } catch (error) {
        console.error('Error creating daily task:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// PUT/UPDATE daily task
export async function PUT(req: Request) {
    try {
        const userId = await getDatabaseUserId()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { date, hours, wellBeingTags } = body

        // Upsert: update if exists, create if doesn't
        const updated = await prisma.dailyTask.upsert({
            where: {
                userId_date: {
                    userId,
                    date
                }
            },
            update: {
                hours: hours,
                wellBeingTags: wellBeingTags || []
            },
            create: {
                userId,
                date,
                hours: hours || Array(24).fill(null),
                wellBeingTags: wellBeingTags || []
            }
        })

        return NextResponse.json({ data: updated })
    } catch (error) {
        console.error('Error updating daily task:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
