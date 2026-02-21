// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing email',
          message: 'Email address is required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email',
          message: 'Please provide a valid email address',
        },
        { status: 400 }
      );
    }

    // Send password reset email
    await resetPassword(email);

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Reset password API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Password reset failed',
        message: error.message || 'Failed to send password reset email',
      },
      { status: 500 }
    );
  }
}
