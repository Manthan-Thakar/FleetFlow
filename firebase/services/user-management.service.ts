// firebase/services/user-management.service.ts
import { db } from '@/firebase/config/firebaseConfig';
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  collection,
  where,
  serverTimestamp,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import { User, UserRole, UserStatus, UserProfile, TeamMember, TeamStats } from '@/types';
import { cleanData } from '@/firebase/utils/firebaseDataCleaner';

/**
 * Get a single user by ID
 */
export const getUserById = async (userId: string): Promise<User> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    return {
      id: userDoc.id,
      ...userDoc.data(),
    } as User;
  } catch (error: any) {
    console.error('Error fetching user:', error);
    throw new Error(error.message || 'Failed to fetch user');
  }
};

/**
 * Get all users in a company
 */
export const getCompanyUsers = async (companyId: string): Promise<User[]> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('companyId', '==', companyId)
    );

    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error: any) {
    console.error('Error fetching company users:', error);
    throw new Error(error.message || 'Failed to fetch company users');
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (companyId: string, role: UserRole): Promise<User[]> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('companyId', '==', companyId),
      where('role', '==', role)
    );

    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error: any) {
    console.error('Error fetching users by role:', error);
    throw new Error(error.message || 'Failed to fetch users');
  }
};

/**
 * Get users by status
 */
export const getUsersByStatus = async (companyId: string, status: UserStatus): Promise<User[]> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('companyId', '==', companyId),
      where('status', '==', status)
    );

    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error: any) {
    console.error('Error fetching users by status:', error);
    throw new Error(error.message || 'Failed to fetch users');
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  try {
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doc(db, 'users', userId), updateData);

    return {
      id: userId,
      ...updates,
    } as User;
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    throw new Error(error.message || 'Failed to update user profile');
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    throw new Error(error.message || 'Failed to update user role');
  }
};

/**
 * Update user status
 */
export const updateUserStatus = async (userId: string, status: UserStatus): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating user status:', error);
    throw new Error(error.message || 'Failed to update user status');
  }
};

/**
 * Update user last login
 */
export const updateUserLastLogin = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      lastLoginAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating last login:', error);
    throw new Error(error.message || 'Failed to update last login');
  }
};

/**
 * Mark profile as complete
 */
export const markProfileComplete = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      isProfileComplete: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error marking profile complete:', error);
    throw new Error(error.message || 'Failed to mark profile complete');
  }
};

/**
 * Deactivate user
 */
export const deactivateUser = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status: 'inactive',
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error deactivating user:', error);
    throw new Error(error.message || 'Failed to deactivate user');
  }
};

/**
 * Reactivate user
 */
export const reactivateUser = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status: 'active',
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error reactivating user:', error);
    throw new Error(error.message || 'Failed to reactivate user');
  }
};

/**
 * Suspend user
 */
export const suspendUser = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status: 'suspended',
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error suspending user:', error);
    throw new Error(error.message || 'Failed to suspend user');
  }
};

/** * Add a new team member
 */
export const addMember = async (
  member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TeamMember> => {
  try {
    const memberId = doc(collection(db, 'users')).id;
    const memberData = cleanData({
      ...member,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'users', memberId), memberData);

    return {
      id: memberId,
      ...memberData,
    } as TeamMember;
  } catch (error: any) {
    console.error('Error adding member:', error);
    throw new Error(error.message || 'Failed to add team member');
  }
};

/** * Delete user
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw new Error(error.message || 'Failed to delete user');
  }
};

/**
 * Get team statistics
 */
export const getTeamStats = async (companyId: string): Promise<TeamStats> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('companyId', '==', companyId)
    );

    const snapshot = await getDocs(usersQuery);
    const users = snapshot.docs.map(doc => doc.data()) as User[];

    const stats: TeamStats = {
      totalAdmins: users.filter(u => u.role === 'admin').length,
      totalManagers: users.filter(u => u.role === 'manager').length,
      totalDrivers: users.filter(u => u.role === 'driver').length,
      totalCustomers: users.filter(u => u.role === 'customer').length,
      activeUsers: users.filter(u => u.status === 'active').length,
      inactiveUsers: users.filter(u => u.status === 'inactive').length,
    };

    return stats;
  } catch (error: any) {
    console.error('Error fetching team stats:', error);
    throw new Error(error.message || 'Failed to fetch team statistics');
  }
};

/**
 * Get team members (excluding current user)
 */
export const getTeamMembers = async (companyId: string, currentUserId?: string): Promise<TeamMember[]> => {
  try {
    const users = await getCompanyUsers(companyId);

    return users
      .filter(u => !currentUserId || u.id !== currentUserId)
      .map(u => ({
        id: u.id,
        name: u.displayName,
        email: u.email,
        role: u.role,
        status: u.status,
        joinDate: u.createdAt,
        phoneNumber: u.phoneNumber,
      })) as TeamMember[];
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    throw new Error(error.message || 'Failed to fetch team members');
  }
};

/**
 * Search users by email or name
 */
export const searchUsers = async (companyId: string, searchTerm: string): Promise<User[]> => {
  try {
    const allUsers = await getCompanyUsers(companyId);

    const term = searchTerm.toLowerCase();
    return allUsers.filter(
      u =>
        u.displayName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  } catch (error: any) {
    console.error('Error searching users:', error);
    throw new Error(error.message || 'Failed to search users');
  }
};

/**
 * Get admin users in company
 */
export const getAdmins = async (companyId: string): Promise<User[]> => {
  try {
    return await getUsersByRole(companyId, 'admin');
  } catch (error: any) {
    console.error('Error fetching admins:', error);
    throw new Error(error.message || 'Failed to fetch admins');
  }
};

/**
 * Check if user is admin
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const user = await getUserById(userId);
    return user.role === 'admin';
  } catch (error: any) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Check if user has permission
 */
export const hasUserPermission = async (userId: string, requiredRole: UserRole[] | UserRole): Promise<boolean> => {
  try {
    const user = await getUserById(userId);
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
  } catch (error: any) {
    console.error('Error checking user permission:', error);
    return false;
  }
};

/**
 * Get user profile with extended info
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const user = await getUserById(userId);
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      companyId: user.companyId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as UserProfile;
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
