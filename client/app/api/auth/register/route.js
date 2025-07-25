import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'

export async function POST(request) {
  try {
    await dbConnect()

    const { name, email, phone, password } = await request.json()

    // Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      isEmailVerified: false
    })

    await user.save()

    return NextResponse.json(
      { 
        success: true, 
        message: 'User registered successfully. Please verify your email with the OTP sent to your email address.' 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
} 