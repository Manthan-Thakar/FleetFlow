// app/api/managers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createErrorResponse, createSuccessResponse } from '@/lib/middleware/auth.middleware';
import { adminDb } from '@/lib/firebase/admin';

/**
 * GET /api/managers/[id]
 * Get a specific manager
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const managerId = params.id;

    // Get manager document from users collection
    const managerDoc = await adminDb.collection('users').doc(managerId).get();
    if (!managerDoc.exists) {
      return createErrorResponse('Not found', 'Manager not found', 404);
    }

    const managerData = managerDoc.data();

    // Verify it's actually a manager
    if (managerData?.role !== 'manager') {
      return createErrorResponse('Not found', 'User is not a manager', 404);
    }

    // Verify user's company matches manager's company
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.companyId !== managerData?.companyId) {
      return createErrorResponse(
        'Unauthorized',
        'You do not have access to this manager',
        403
      );
    }

    // Verify authorization (admin only)
    if (userData?.role !== 'admin') {
      return createErrorResponse(
        'Unauthorized',
        'Only admin can view manager details',
        403
      );
    }

    return createSuccessResponse(
      { id: managerId, ...managerData },
      'Manager fetched successfully'
    );
  } catch (error: any) {
    console.error('Get manager error:', error);
    return createErrorResponse('Server error', error.message, 500);
  }
}

/**
 * PUT /api/managers/[id]
 * Update a manager
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const managerId = params.id;
    const body = await request.json();

    // Get manager document from users collection
    const managerDoc = await adminDb.collection('users').doc(managerId).get();
    if (!managerDoc.exists) {
      return createErrorResponse('Not found', 'Manager not found', 404);
    }

    const managerData = managerDoc.data();

    // Verify it's actually a manager
    if (managerData?.role !== 'manager') {
      return createErrorResponse('Not found', 'User is not a manager', 404);
    }

    // Verify user's company matches manager's company
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.companyId !== managerData?.companyId) {
      return createErrorResponse(
        'Unauthorized',
        'You do not have access to this manager',
        403
      );
    }

    // Verify authorization (admin only)
    if (userData?.role !== 'admin') {
      return createErrorResponse(
        'Unauthorized',
        'Only admin can update managers',
        403
      );
    }

    // Prepare update data - allow updating these fields only
    const updateData: any = {};
    const allowedFields = ['displayName', 'phoneNumber', 'status', 'notes'];

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Don't allow changing company or role
    if ('companyId' in body || 'role' in body) {
      return createErrorResponse(
        'Validation error',
        'Cannot change manager company or role',
        400
      );
    }

    updateData.updatedAt = new Date();

    // Update manager document in users collection
    await adminDb.collection('users').doc(managerId).update(updateData);

    // Return updated manager
    const updatedDoc = await adminDb.collection('users').doc(managerId).get();
    return createSuccessResponse(
      { id: managerId, ...updatedDoc.data() },
      'Manager updated successfully'
    );
  } catch (error: any) {
    console.error('Update manager error:', error);
    return createErrorResponse('Server error', error.message, 500);
  }
}

/**
 * DELETE /api/managers/[id]
 * Delete a manager
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const managerId = params.id;

    // Get manager document from users collection
    const managerDoc = await adminDb.collection('users').doc(managerId).get();
    if (!managerDoc.exists) {
      return createErrorResponse('Not found', 'Manager not found', 404);
    }

    const managerData = managerDoc.data();

    // Verify it's actually a manager
    if (managerData?.role !== 'manager') {
      return createErrorResponse('Not found', 'User is not a manager', 404);
    }

    // Verify user's company matches manager's company
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData?.companyId !== managerData?.companyId) {
      return createErrorResponse(
        'Unauthorized',
        'You do not have access to this manager',
        403
      );
    }

    // Verify authorization (admin only)
    if (userData?.role !== 'admin') {
      return createErrorResponse(
        'Unauthorized',
        'Only admin can delete managers',
        403
      );
    }

    // Delete manager document from users collection
    await adminDb.collection('users').doc(managerId).delete();

    return createSuccessResponse(
      { id: managerId },
      'Manager deleted successfully'
    );
  } catch (error: any) {
    console.error('Delete manager error:', error);
    return createErrorResponse('Server error', error.message, 500);
  }
}
