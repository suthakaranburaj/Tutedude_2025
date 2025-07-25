import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import { generateToken } from '@/lib/jwt'

export async function POST(request) {
  try {
    await dbConnect()

    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Your account has been deactivated' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return NextResponse.json(
        { success: false, message: 'Please verify your email address before logging in' },
        { status: 401 }
      )
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
} 