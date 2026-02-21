// app/api/drivers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createErrorResponse, createSuccessResponse } from '@/lib/middleware/auth.middleware';
import { adminDb } from '@/lib/firebase/admin';

/**
 * GET /api/drivers/[id]
 * Get a specific driver
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const driverId = params.id;

    // Get driver document from users collection
    const driverDoc = await adminDb.collection('users').doc(driverId).get();
    if (!driverDoc.exists) {
      return createErrorResponse('Not found', 'Driver not found', 404);
    }

    const driverData = driverDoc.data();

    // Verify it's actually a driver
    if (driverData?.role !== 'driver') {
      return createErrorResponse('Not found', 'User is not a driver', 404);
    }

    // Verify user's company matches driver's company
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.companyId !== driverData?.companyId) {
      return createErrorResponse(
        'Unauthorized',
        'You do not have access to this driver',
        403
      );
    }

    return createSuccessResponse(
      { id: driverId, ...driverData },
      'Driver fetched successfully'
    );
  } catch (error: any) {
    console.error('Get driver error:', error);
    return createErrorResponse('Server error', error.message, 500);
  }
}

/**
 * PUT /api/drivers/[id]
 * Update a driver
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const driverId = params.id;
    const body = await request.json();

    // Get driver document from users collection
    const driverDoc = await adminDb.collection('users').doc(driverId).get();
    if (!driverDoc.exists) {
      return createErrorResponse('Not found', 'Driver not found', 404);
    }

    const driverData = driverDoc.data();

    // Verify it's actually a driver
    if (driverData?.role !== 'driver') {
      return createErrorResponse('Not found', 'User is not a driver', 404);
    }

    // Verify user's company matches driver's company
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.companyId !== driverData?.companyId) {
      return createErrorResponse(
        'Unauthorized',
        'You do not have access to this driver',
        403
      );
    }

    // Verify authorization (admin or manager only)
    if (userData?.role !== 'admin' && userData?.role !== 'manager') {
      return createErrorResponse(
        'Unauthorized',
        'Only admin or manager can update drivers',
        403
      );
    }

    // Prepare update data - allow updating these fields only
    const updateData: any = {};
    const allowedFields = ['displayName', 'phoneNumber', 'licenseNumber', 'licenseExpiry', 'status', 'notes'];

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Don't allow changing company or role
    if ('companyId' in body || 'role' in body) {
      return createErrorResponse(
        'Validation error',
        'Cannot change driver company or role',
        400
      );
    }

    updateData.updatedAt = new Date();

    // Update driver document in users collection
    await adminDb.collection('users').doc(driverId).update(updateData);

    // Return updated driver
    const updatedDoc = await adminDb.collection('users').doc(driverId).get();
    return createSuccessResponse(
      { id: driverId, ...updatedDoc.data() },
      'Driver updated successfully'
    );
  } catch (error: any) {
    console.error('Update driver error:', error);
    return createErrorResponse('Server error', error.message, 500);
  }
}

/**
 * DELETE /api/drivers/[id]
 * Delete a driver
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const driverId = params.id;

    // Get driver document from users collection
    const driverDoc = await adminDb.collection('users').doc(driverId).get();
    if (!driverDoc.exists) {
      return createErrorResponse('Not found', 'Driver not found', 404);
    }

    const driverData = driverDoc.data();

    // Verify it's actually a driver
    if (driverData?.role !== 'driver') {
      return createErrorResponse('Not found', 'User is not a driver', 404);
    }

    // Verify user's company matches driver's company
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.companyId !== driverData?.companyId) {
      return createErrorResponse(
        'Unauthorized',
        'You do not have access to this driver',
        403
      );
    }

    // Verify authorization (admin only)
    if (userData?.role !== 'admin') {
      return createErrorResponse(
        'Unauthorized',
        'Only admin can delete drivers',
        403
      );
    }

    // Delete driver document from users collection
    await adminDb.collection('users').doc(driverId).delete();

    return createSuccessResponse(
      { id: driverId },
      'Driver deleted successfully'
    );
  } catch (error: any) {
    console.error('Delete driver error:', error);
    return createErrorResponse('Server error', error.message, 500);
  }
}
