import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'

async function handler(req) {
  try {
    return NextResponse.json({
      success: true,
      user: req.user
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get user information' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handler) 