// lib/middleware/auth.middleware.ts
/**
 * Authentication middleware for protecting API routes
 * Currently simplified - token verification will use Firebase Admin SDK when configured
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/types';

// ===== Type Definitions =====

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email?: string;
    role?: UserRole;
    companyId?: string;
  };
}

export interface AuthMiddlewareOptions {
  allowedRoles?: UserRole[];
  requireCompanyId?: boolean;
}

// ===== Authentication Middleware =====

/**
 * Extract and validate Authorization header
 * Returns the token or throws an error
 * Note: Full validation requires Firebase Admin SDK to be configured
 */
export async function verifyAuthToken(request: NextRequest) {
  try {
    // Get Authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }

    // Extract token
    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      throw new Error('No token provided');
    }

    // Token extracted successfully
    // Full verification (checking expiration and signature) requires Firebase Admin SDK
    // For now, client-side handles token management
    return { idToken };
  } catch (error: any) {
    console.error('Token extraction error:', error);
    throw new Error('Invalid Authorization header');
  }
}

/**
 * Get authenticated user data from request header
 * For now, client should pass user data in headers
 * When Admin SDK is configured, this will verify the token and fetch from Firestore
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Try to get user data from custom headers (client should include them)
    const userId = request.headers.get('X-User-ID');
    const userEmail = request.headers.get('X-User-Email');
    const userRole = request.headers.get('X-User-Role') as UserRole | null;
    const companyId = request.headers.get('X-Company-ID');

    if (!userId) {
      throw new Error('User ID not found');
    }

    return {
      uid: userId,
      email: userEmail || '',
      role: userRole || 'customer',
      companyId: companyId || '',
      status: 'active',
    };
  } catch (error: any) {
    console.error('Get authenticated user error:', error);
    throw error;
  }
}

/**
 * Middleware to require authentication
 * Returns authenticated user or error response
 */
export async function requireAuth(
  request: NextRequest
): Promise<
  { user: Awaited<ReturnType<typeof getAuthenticatedUser>> } | NextResponse
> {
  try {
    const user = await getAuthenticatedUser(request);

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: 'Account inactive',
          message: `Your account is ${user.status}. Please contact administrator.`,
        },
        { status: 403 }
      );
    }

    return { user };
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: error.message || 'Authentication required',
      },
      { status: 401 }
    );
  }
}

/**
 * Middleware to require specific roles
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<
  { user: Awaited<ReturnType<typeof getAuthenticatedUser>> } | NextResponse
> {
  const authResult = await requireAuth(request);

  // If auth failed, return the error response
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Check if user has required role
  if (!allowedRoles.includes(user.role as UserRole)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
      },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(request: NextRequest) {
  return requireRole(request, ['admin']);
}

/**
 * Middleware to require manager or admin role
 */
export async function requireManager(request: NextRequest) {
  return requireRole(request, ['admin', 'manager']);
}

/**
 * Middleware to check if user belongs to same company
 */
export async function requireSameCompany(
  request: NextRequest,
  companyId: string
): Promise<
  { user: Awaited<ReturnType<typeof getAuthenticatedUser>> } | NextResponse
> {
  const authResult = await requireAuth(request);

  // If auth failed, return the error response
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Admin can access all companies
  if (user.role === 'admin') {
    return { user };
  }

  // Check if user belongs to the same company
  if (user.companyId !== companyId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'You do not have access to this company data',
      },
      { status: 403 }
    );
  }

  return { user };
}

// ===== Helper Functions =====

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split('Bearer ')[1] || null;
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string,
  message: string,
  status: number = 500
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
    },
    { status }
  );
}

/**
 * Create standardized success response
 */
export function createSuccessResponse(
  data: any,
  message: string = 'Success',
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}
