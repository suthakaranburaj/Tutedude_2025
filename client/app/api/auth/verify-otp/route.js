import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import OTP from '@/models/OTP'
import User from '@/models/User'

export async function POST(request) {
  try {
    await dbConnect()

    const { email, otp } = await request.json()

    // Validation
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      type: 'email_verification',
      isUsed: false
    })

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Check if OTP is still valid
    if (!otpRecord.isValid()) {
      return NextResponse.json(
        { success: false, message: 'OTP has expired' },
        { status: 400 }
      )
    }

    // Mark OTP as used
    await otpRecord.markAsUsed()

    // Update user's email verification status
    const user = await User.findOne({ email: email.toLowerCase() })
    if (user) {
      user.isEmailVerified = true
      await user.save()
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    )
  }
} 