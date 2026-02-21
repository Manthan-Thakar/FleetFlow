// app/api/auth/signup/route.ts
// Note: Signup is handled client-side using the auth.service.ts signUp() function
// This route is kept as a placeholder for future extensions (e.g., additional validation, webhooks, etc)

import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { email, password, displayName, role, companyName } = body;

    if (!email || !password || !displayName || !role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Email, password, display name, and role are required',
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

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Weak password',
          message: 'Password must be at least 6 characters long',
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = ['admin', 'manager', 'driver', 'customer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid role',
          message: 'Role must be one of: admin, manager, driver, customer',
        },
        { status: 400 }
      );
    }

    // Validation passed - client should use auth.service.ts signUp() function
    return NextResponse.json(
      {
        success: true,
        message: 'Validation passed. Use auth.service.ts signUp() function on the client to complete signup.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Signup validation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        message: error.message || 'An error occurred during validation',
      },
      { status: 500 }
    );
  }
}
