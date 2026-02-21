// lib/services/auth.service.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
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
  Timestamp,
  collection,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User, Company } from '@/types';

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
}

export interface CompanyData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  email: string;
  website?: string;
  taxId?: string;
  registrationNumber?: string;
  industry?: string;
  description?: string;
}

export class AuthService {
  /**
   * Sign up a new user (Step 1: Create user)
   */
  static async signUp(data: SignUpData): Promise<{ user: FirebaseUser; userId: string }> {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: data.displayName,
      });

      // Create user document in Firestore
      const userDoc: Omit<User, 'id'> = {
        email: data.email,
        displayName: data.displayName,
        role: 'admin',
        status: 'active',
        companyId: '', // Will be set in step 2
        isProfileComplete: false,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        lastLoginAt: serverTimestamp() as Timestamp,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);

      return { user: firebaseUser, userId: firebaseUser.uid };
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Complete profile with company details (Step 2)
   */
  static async completeProfile(
    userId: string,
    companyData: CompanyData
  ): Promise<{ companyId: string }> {
    try {
      // Create a new company document reference with auto-generated ID
      const companiesRef = collection(db, 'companies');
      const companyRef = doc(companiesRef);
      const companyId = companyRef.id;

      const company: Omit<Company, 'id'> = {
        ...companyData,
        adminUserId: userId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(companyRef, company);

      // Update user document with company reference
      await updateDoc(doc(db, 'users', userId), {
        companyId: companyId,
        isProfileComplete: true,
        updatedAt: serverTimestamp(),
      });

      return { companyId };
    } catch (error: any) {
      console.error('Error completing profile:', error);
      throw new Error('Failed to create company profile. Please try again.');
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Update last login time
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLoginAt: serverTimestamp(),
      });

      return userCredential.user;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Get user profile from Firestore
   */
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to load user profile.');
    }
  }

  /**
   * Get company profile from Firestore
   */
  static async getCompanyProfile(companyId: string): Promise<Company | null> {
    try {
      const companyDoc = await getDoc(doc(db, 'companies', companyId));
      if (companyDoc.exists()) {
        return { id: companyDoc.id, ...companyDoc.data() } as Company;
      }
      return null;
    } catch (error: any) {
      console.error('Error getting company profile:', error);
      throw new Error('Failed to load company profile.');
    }
  }

  /**
   * Get user-friendly error messages
   */
  private static getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}
