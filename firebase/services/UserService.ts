// firebase/services/UserService.ts
import { db } from '@/firebase/config/firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phoneNumber: string | null;
  role: 'admin' | 'manager' | 'driver' | 'customer';
  companyId: string;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
  photoURL: string | null;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  notes?: string | null;
}

export class UserService {
  /**
   * Get user by ID
   */
  static async getUser(userId: string): Promise<UserProfile> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    return {
      id: userSnap.id,
      ...userSnap.data(),
    } as UserProfile;
  }

  /**
   * Get all users for a company
   */
  static async getUsersByCompany(
    companyId: string,
    options?: {
      role?: string;
      status?: string;
      limitCount?: number;
    }
  ): Promise<UserProfile[]> {
    const constraints: QueryConstraint[] = [
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc'),
    ];

    if (options?.role) {
      constraints.push(where('role', '==', options.role));
    }

    if (options?.status) {
      constraints.push(where('status', '==', options.status));
    }

    if (options?.limitCount) {
      constraints.push(limit(options.limitCount));
    }

    const usersQuery = query(collection(db, 'users'), ...constraints);
    const usersSnap = await getDocs(usersQuery);

    return usersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as UserProfile[];
  }

  /**
   * Update user profile
   */
  static async updateUser(
    userId: string,
    data: Partial<Omit<UserProfile, 'id' | 'email' | 'role' | 'companyId' | 'createdAt'>>
  ): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(companyId: string, role: string): Promise<UserProfile[]> {
    return this.getUsersByCompany(companyId, { role });
  }

  /**
   * Update user status
   */
  static async updateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<void> {
    await this.updateUser(userId, { status });
  }
}
