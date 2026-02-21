// firebase/services/auth.service.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/firebase/config/firebaseConfig';
import { User, UserRole } from '@/types';

// ===== Type Definitions =====

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  companyName?: string; // Optional - defaults to displayName
  phoneNumber?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
}

export interface AuthResponse {
  user: User;
  firebaseUser: FirebaseUser;
}

// ===== Authentication Service Functions =====

/**
 * Sign up a new user
 * Creates Firebase Auth account, Firestore user document, and company document
 * Company ID = User ID (they are linked)
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  try {
    // 1. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    const firebaseUser = userCredential.user;
    const userId = firebaseUser.uid;
    console.log('Firebase Auth user created:', userId);

    // 2. Update Firebase Auth profile
    await updateProfile(firebaseUser, {
      displayName: data.displayName,
    });
    console.log('Firebase Auth profile updated for user:', userId);

    // 3. Create company document
    // Company ID = User ID (same user who created the company is its owner)
    const companyData = {
      id: userId,
      name: data.companyName || data.displayName || null,
      owner: userId, // Owner is the user who created it
      ownerId: userId,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      members: [userId], // Add the creator as a member
      email: null,
      phoneNumber: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      country: null,
      website: null,
      industry: null,
      taxId: null,
      registrationNumber: null,
    };

    await setDoc(doc(db, 'companies', userId), companyData);
    console.log('Firestore company document created with ID:', userId);

    // 4. Create Firestore user document
    const userData: Omit<User, 'id'> = {
      email: data.email,
      displayName: data.displayName || null,
      role: data.role,
      status: 'active',
      companyId: userId, // Use user ID as company ID
      phoneNumber: data.phoneNumber || null,
      photoURL: firebaseUser.photoURL || null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('Firestore user document created for user:', userId);

    // 5. Return user with role
    const user: User = {
      id: userId,
      ...userData,
      lastLoginAt: null,
    };
    console.log('User sign-up successful with company:', {
      userId,
      companyId: userId,
      user,
    });

    return { user, firebaseUser };
  } catch (error: any) {
    console.error('Error in signUp:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign in an existing user
 * Fetches user data from Firestore document
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
  try {
    // 1. Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    const firebaseUser = userCredential.user;
    const userId = firebaseUser.uid;

    // 2. Fetch user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      await firebaseSignOut(auth);
      throw new Error('User profile not found');
    }

    const userData = userDoc.data();

    // 3. Build user object from Firestore data
    const user: User = {
      id: userId,
      email: userData.email || firebaseUser.email || '',
      displayName: userData.displayName || firebaseUser.displayName || '',
      role: userData.role || '',
      status: userData.status || 'active',
      companyId: userData.companyId || '',
      phoneNumber: userData.phoneNumber || null,
      photoURL: userData.photoURL || null,
      lastLoginAt: userData.lastLoginAt || null,
      createdAt: userData.createdAt || new Date(),
      updatedAt: userData.updatedAt || new Date(),
    };

    return { user, firebaseUser };
  } catch (error: any) {
    console.error('Error in signIn:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error in signOut:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error in resetPassword:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Get current user with Firestore data
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser) {
      return null;
    }

    // Fetch user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();

    const user: User = {
      id: firebaseUser.uid,
      email: userData?.email || null,
      displayName: userData?.displayName || null,
      role: userData?.role || 'customer',
      status: userData?.status || 'active',
      companyId: userData?.companyId || null,
      phoneNumber: userData?.phoneNumber || null,
      photoURL: userData?.photoURL || null,
      lastLoginAt: userData?.lastLoginAt || null,
      createdAt: userData?.createdAt || null,
      updatedAt: userData?.updatedAt || null,
    };

    return user;
  } catch (error: any) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileData
): Promise<User> {
  try {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser || firebaseUser.uid !== userId) {
      throw new Error('Unauthorized');
    }

    // 1. Update Firebase Auth profile
    if (data.displayName || data.photoURL) {
      await updateProfile(firebaseUser, {
        displayName: data.displayName,
        photoURL: data.photoURL,
      });
    }

    // 2. Update Firestore user document
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (data.displayName) updateData.displayName = data.displayName;
    if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
    if (data.photoURL) updateData.photoURL = data.photoURL;

    await updateDoc(doc(db, 'users', userId), updateData);

    // 3. Fetch and return updated user
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Failed to fetch updated user');
    }

    return user;
  } catch (error: any) {
    console.error('Error in updateUserProfile:', error);
    throw new Error('Failed to update profile. Please try again.');
  }
}

/**
 * Verify user's authentication token
 */
export async function verifyAuthToken(
  idToken: string
): Promise<{ uid: string; email: string | undefined }> {
  try {
    // This should be called from API routes using Firebase Admin SDK
    // For client-side, we rely on Firebase Auth state
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      throw new Error('Not authenticated');
    }

    const token = await firebaseUser.getIdToken();

    if (token !== idToken) {
      throw new Error('Invalid token');
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || undefined,
    };
  } catch (error: any) {
    console.error('Error in verifyAuthToken:', error);
    throw new Error('Token verification failed');
  }
}

// ===== Helper Functions =====

/**
 * Convert Firebase error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed. Please contact support.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    default:
      return 'An error occurred. Please try again.';
  }
}

/**
 * Get redirect path based on user role
 */
export function getRedirectPathByRole(role: UserRole): string {
  switch (role) {
    case 'admin':
        return '/dashboard';
    case 'manager':
      return '/dashboard';
    case 'driver':
      return '/dashboard';
    case 'customer':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}
