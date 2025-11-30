import { NextResponse } from 'next/server'
import { initializeUser } from '@/lib/user-init'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET daily tasks for a date range
export async function GET(req: Request) {
    try {
        // Initialize user to ensure they exist in the database
        const user = await initializeUser()
        if (!user) {
            console.error('GET /api/daily-tasks: User not authenticated')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.id
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
            console.log(`Fetching daily tasks for user ${userId} from ${startDate} to ${endDate}`)
        } else if (date) {
            // Single date query
            whereClause.date = date
            console.log(`Fetching daily task for user ${userId} on ${date}`)
        } else {
            console.log(`Fetching all daily tasks for user ${userId}`)
        }

        const dailyTasks = await prisma.dailyTask.findMany({
            where: whereClause,
            orderBy: { date: 'asc' }
        })

        return NextResponse.json({ data: dailyTasks })
    } catch (error) {
        console.error('Error fetching daily tasks:', error)

        if (process.env.NODE_ENV === 'development') {
            return NextResponse.json({
                error: 'Server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500 })
        }

        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// POST/CREATE daily task
export async function POST(req: Request) {
    try {
        // Initialize user to ensure they exist in the database
        const user = await initializeUser()
        if (!user) {
            console.error('POST /api/daily-tasks: User not authenticated')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.id
        const body = await req.json()
        const { date, hours, wellBeingTags = [] } = body

        // Validate required fields
        if (!date) {
            console.error('POST /api/daily-tasks: Missing required field - date')
            return NextResponse.json({ error: 'Date is required' }, { status: 400 })
        }

        // Initialize hours array with 24 null values if not provided
        const hoursArray = hours || Array(24).fill(null)

        // Validate hours array
        if (!Array.isArray(hoursArray) || hoursArray.length !== 24) {
            console.error('POST /api/daily-tasks: Invalid hours array length')
            return NextResponse.json({ error: 'Hours must be an array of 24 elements' }, { status: 400 })
        }

        const created = await prisma.dailyTask.create({
            data: {
                userId,
                date,
                hours: hoursArray,
                wellBeingTags
            }
        })

        console.log(`Created daily task for user ${userId} on ${date}`)
        return NextResponse.json({ data: created })
    } catch (error) {
        console.error('Error creating daily task:', error)

        if (process.env.NODE_ENV === 'development') {
            return NextResponse.json({
                error: 'Server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500 })
        }

        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// PUT/UPDATE daily task
export async function PUT(req: Request) {
    try {
        // Initialize user to ensure they exist in the database
        const user = await initializeUser()
        if (!user) {
            console.error('PUT /api/daily-tasks: User not authenticated')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.id

        const body = await req.json()
        const { date, hours, wellBeingTags } = body

        // Validate required fields
        if (!date) {
            console.error('PUT /api/daily-tasks: Missing required field - date')
            return NextResponse.json({ error: 'Date is required' }, { status: 400 })
        }

        if (!hours || !Array.isArray(hours)) {
            console.error('PUT /api/daily-tasks: Invalid hours data')
            return NextResponse.json({ error: 'Hours must be an array' }, { status: 400 })
        }

        // Use safer approach: find existing record first, then update or create
        const existingDailyTask = await prisma.dailyTask.findUnique({
            where: {
                userId_date: {
                    userId,
                    date
                }
            }
        })

        let result
        if (existingDailyTask) {
            // Update existing record
            result = await prisma.dailyTask.update({
                where: {
                    userId_date: {
                        userId,
                        date
                    }
                },
                data: {
                    hours: hours,
                    wellBeingTags: wellBeingTags || []
                }
            })
            console.log(`Updated daily task for user ${userId} on ${date}`)
        } else {
            // Create new record
            result = await prisma.dailyTask.create({
                data: {
                    userId,
                    date,
                    hours: hours || Array(24).fill(null),
                    wellBeingTags: wellBeingTags || []
                }
            })
            console.log(`Created daily task for user ${userId} on ${date}`)
        }

        return NextResponse.json({ data: result })
    } catch (error) {
        console.error('Error updating daily task:', error)

        // Provide more detailed error information in development
        if (process.env.NODE_ENV === 'development') {
            return NextResponse.json({
                error: 'Server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500 })
        }

        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
