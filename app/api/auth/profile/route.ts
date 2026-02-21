// app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createErrorResponse, createSuccessResponse } from '@/lib/middleware/auth.middleware';
import { updateUserProfile } from '@/lib/services/auth.service';
import { adminDb } from '@/lib/firebase/admin';

/**
 * GET /api/auth/profile
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }

    const { user } = authResult;

    // Fetch full user profile from Firestore
    const userDoc = await adminDb.collection('users').doc(user.uid).get();

    if (!userDoc.exists) {
      return createErrorResponse('User not found', 'User profile does not exist', 404);
    }

    const userData = userDoc.data();

    return createSuccessResponse(
      {
        user: {
          id: user.uid || '',
          email: user.email || '',
          displayName: userData?.displayName || '',
          role: userData?.role || 'admin',
          companyId: userData?.companyId || '',
          phoneNumber: userData?.phoneNumber || null,
          photoURL: userData?.photoURL || null,
          status: userData?.status  || 'active',
          createdAt: userData?.createdAt,
          updatedAt: userData?.updatedAt,
        },
      },
      'Profile fetched successfully'
    );
  } catch (error: any) {
    console.error('Get profile error:', error);
    return createErrorResponse(
      'Failed to fetch profile',
      error.message || 'An error occurred',
      500
    );
  }
}

/**
 * PUT /api/auth/profile
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }

    const { user } = authResult;

    // Parse request body
    const body = await request.json();
    const { displayName, phoneNumber, photoURL } = body;

    // Validate at least one field is provided
    if (!displayName && !phoneNumber && !photoURL) {
      return createErrorResponse(
        'Invalid request',
        'At least one field (displayName, phoneNumber, or photoURL) is required',
        400
      );
    }

    // Update user profile using Admin SDK
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (displayName !== undefined) updateData.displayName = displayName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    await adminDb.collection('users').doc(user.uid).update(updateData);

    // Fetch updated profile
    const updatedDoc = await adminDb.collection('users').doc(user.uid).get();
    const updatedData = updatedDoc.data();

    return createSuccessResponse(
      {
        user: {
          id: user.uid,
          email: user.email,
          displayName: updatedData?.displayName,
          role: updatedData?.role,
          companyId: updatedData?.companyId,
          phoneNumber: updatedData?.phoneNumber,
          photoURL: updatedData?.photoURL,
          status: updatedData?.status,
        },
      },
      'Profile updated successfully'
    );
  } catch (error: any) {
    console.error('Update profile error:', error);
    return createErrorResponse(
      'Failed to update profile',
      error.message || 'An error occurred',
      500
    );
  }
}
