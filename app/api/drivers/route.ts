// app/api/drivers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createErrorResponse, createSuccessResponse } from '@/lib/middleware/auth.middleware';
import { adminDb } from '@/lib/firebase/admin';

/**
 * GET /api/drivers
 * List all drivers for a company
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;

    // Get user's company
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      return createErrorResponse('User not found', 'User profile does not exist', 404);
    }

    const userData = userDoc.data();
    const companyId = userData?.companyId;

    if (!companyId) {
      return createErrorResponse('Company not found', 'User is not associated with a company', 400);
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'inactive', 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query - fetch from users collection where role is driver
    let query: any = adminDb.collection('users')
      .where('companyId', '==', companyId)
      .where('role', '==', 'driver');

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Get total count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Get paginated results
    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const drivers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return createSuccessResponse(
      { drivers, total, limit, offset },
      'Drivers fetched successfully'
    );
  } catch (error: any) {
    console.error('Get drivers error:', error);
    return createErrorResponse('Server error', error.message, 500);
  }
}
