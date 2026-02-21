// lib/services/auth.admin.service.ts
/**
 * Server-side authentication service using Firebase Admin SDK
 * To be configured later when needed for advanced features
 * 
 * For now, use lib/services/auth.service.ts (client-side) which handles:
 * - User signup with Firebase Auth
 * - Firestore document creation
 * - User signin and profile management
 */

// Placeholder exports - to be implemented later
export const adminSignUp = null;
export const getAdminUserByEmail = null;
export const adminUpdateUser = null;
export const adminDeleteUser = null;

export default null;

  uid: string;
}

/**
 * Create a new user using Firebase Admin SDK
 * Safe to use in API routes
 */
export async function adminSignUp(
  data: AdminSignUpData
): Promise<AdminAuthResponse> {
  try {
    // 1. Create Firebase Auth user using Admin SDK
    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.displayName,
      disabled: false,
    });

    console.log('Firebase Auth user created:', userRecord.uid);

    // 2. Create Firestore user document using Admin SDK
    const userData: Omit<User, 'id'> = {
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      status: 'active',
      companyId: data.companyId,
      phoneNumber: data.phoneNumber,
      photoURL: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Creating Firestore user document for user:', userRecord.uid);

    await adminDb.collection('users').doc(userRecord.uid).set(userData);

    console.log('Firestore user document created for user:', userRecord.uid);

    const user: User = {
      id: userRecord.uid,
      ...userData,
    };

    console.log('Admin user creation successful:', user);

    return { user, uid: userRecord.uid };
  } catch (error: any) {
    console.error('Error in adminSignUp:', error);
    throw new Error(getAdminAuthErrorMessage(error.code));
  }
}

/**
 * Sign in with email and password (client-side only)
 * Returns user document from Firestore
 */
export async function adminSignIn(
  email: string,
  password: string
): Promise<User> {
  try {
    // This should be called client-side only
    // For server-side, use Firebase Admin SDK to verify token
    throw new Error(
      'Use client-side signIn for authentication. This is for admin operations only.'
    );
  } catch (error: any) {
    console.error('Error in adminSignIn:', error);
    throw error;
  }
}

/**
 * Get user by email (admin only)
 */
export async function getAdminUserByEmail(email: string): Promise<User | null> {
  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    return {
      id: userRecord.uid,
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      status: userData.status,
      companyId: userData.companyId,
      phoneNumber: userData.phoneNumber,
      photoURL: userData.photoURL,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };
  } catch (error: any) {
    console.error('Error in getAdminUserByEmail:', error);
    return null;
  }
}

/**
 * Update user by UID (admin only)
 */
export async function adminUpdateUser(
  uid: string,
  data: Partial<User>
): Promise<User> {
  try {
    // Update Firebase Auth
    if (data.displayName || data.email) {
      await adminAuth.updateUser(uid, {
        displayName: data.displayName,
        email: data.email,
      });
    }

    // Update Firestore
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.displayName) updateData.displayName = data.displayName;
    if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
    if (data.status) updateData.status = data.status;

    await adminDb.collection('users').doc(uid).update(updateData);

    // Fetch and return updated user
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const userData = userDoc.data();

    return {
      id: uid,
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      status: userData.status,
      companyId: userData.companyId,
      phoneNumber: userData.phoneNumber,
      photoURL: userData.photoURL,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };
  } catch (error: any) {
    console.error('Error in adminUpdateUser:', error);
    throw new Error('Failed to update user');
  }
}

/**
 * Delete user (admin only)
 */
export async function adminDeleteUser(uid: string): Promise<void> {
  try {
    // Delete from Firebase Auth
    await adminAuth.deleteUser(uid);

    // Delete from Firestore
    await adminDb.collection('users').doc(uid).delete();

    console.log('User deleted:', uid);
  } catch (error: any) {
    console.error('Error in adminDeleteUser:', error);
    throw new Error('Failed to delete user');
  }
}

/**
 * Convert Firebase Admin SDK error codes to user-friendly messages
 */
function getAdminAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-exists':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/invalid-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-uid':
      return 'Invalid user ID.';
    case 'auth/user-not-found':
      return 'User not found.';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed. Please contact support.';
    case 'auth/internal-error':
      return 'Internal error. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}
