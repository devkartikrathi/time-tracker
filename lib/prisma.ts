import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@/prisma/generated/prisma/client'

// Prisma 7 requires an explicit driver adapter. PrismaNeon speaks Neon's
// serverless HTTP/WebSocket protocol, which avoids exhausting connections
// when many short-lived serverless functions run concurrently.
const createClient = () => {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        throw new Error('DATABASE_URL is not set')
    }
    return new PrismaClient({
        adapter: new PrismaNeon({ connectionString }),
    })
}

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
