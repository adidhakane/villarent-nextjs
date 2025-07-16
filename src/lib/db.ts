import { PrismaClient } from '@prisma/client'
import { initializeDatabase } from './init-db'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbInitialized: boolean | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Initialize database with demo data if not already done
if (!globalForPrisma.dbInitialized) {
  initializeDatabase().then(() => {
    globalForPrisma.dbInitialized = true
  }).catch(console.error)
}
