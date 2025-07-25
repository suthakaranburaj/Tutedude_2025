import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import OTP from '@/models/OTP'
import { sendEmail, generateOTPEmail } from '@/lib/email'

export async function POST(request) {
  try {
    await dbConnect()

    const { email } = await request.json()

    // Validation
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: email.toLowerCase() })

    // Save new OTP
    const otpRecord = new OTP({
      email: email.toLowerCase(),
      otp,
      type: 'email_verification',
      expiresAt
    })

    await otpRecord.save()

    // Send email
    const { html, text } = generateOTPEmail(otp, email.split('@')[0])
    
    await sendEmail(
      email,
      'Email Verification - Hackathon Template',
      html,
      text
    )

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your email address'
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    )
  }
} 