import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET ✅' : 'MISSING ❌',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET ✅' : 'MISSING ❌', 
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING ❌',
      VERCEL: process.env.VERCEL ? 'YES ✅' : 'NO ❌',
      VERCEL_URL: process.env.VERCEL_URL || 'NOT_SET'
    }

    return NextResponse.json({
      message: 'Environment Variables Check',
      environment: env,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check environment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
