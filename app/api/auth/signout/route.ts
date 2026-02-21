// app/api/auth/signout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    await signOut();

    return NextResponse.json(
      {
        success: true,
        message: 'Signed out successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Signout API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Signout failed',
        message: error.message || 'An error occurred during signout',
      },
      { status: 500 }
    );
  }
}
