// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing credentials',
          message: 'Email and password are required',
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

    // Sign in user
    const { user } = await signIn({ email, password });

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            companyId: user.companyId,
            status: user.status,
          },
        },
        message: 'Signed in successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Signin API error:', error);

    // Return appropriate status code based on error
    const statusCode = error.message.includes('not found') ? 404 : 401;

    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed',
        message: error.message || 'Invalid email or password',
      },
      { status: statusCode }
    );
  }
}
