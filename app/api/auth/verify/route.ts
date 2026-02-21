// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/services/auth.service';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
          message: 'User is not signed in',
        },
        { status: 401 }
      );
    }

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
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
          },
        },
        message: 'User verified',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Verify API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Verification failed',
        message: error.message || 'Failed to verify user',
      },
      { status: 500 }
    );
  }
}
