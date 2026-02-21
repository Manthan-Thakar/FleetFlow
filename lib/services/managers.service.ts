// lib/services/managers.service.ts
import { getIdToken } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { getFunctions, httpsCallable } from 'firebase/functions';

export interface Manager {
  id: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  companyId: string;
  role: 'manager';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  notes?: string | null;
  photoURL?: string | null;
}

export interface ManagersResponse {
  managers: Manager[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Get auth token for API requests
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return await getIdToken(user);
}

/**
 * Get all managers for the company (admin only)
 */
export async function getManagers(
  status?: 'active' | 'inactive' | 'all',
  limit = 50,
  offset = 0
): Promise<ManagersResponse> {
  const token = await getAuthToken();
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`/api/managers?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch managers');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get a single manager by ID
 */
export async function getManager(managerId: string): Promise<Manager> {
  const token = await getAuthToken();

  const response = await fetch(`/api/managers/${managerId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch manager');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Invite a new manager using Firebase Cloud Function
 * This sends an email invitation and creates auth account
 */
export async function inviteManager(
  managerName: string,
  managerEmail: string,
  companyName: string,
  adminName?: string
): Promise<{ success: boolean; message: string }> {
  const functions = getFunctions();
  const sendManagerInvite = httpsCallable(functions, 'sendManagerInvite');

  try {
    const result = await sendManagerInvite({
      managerName,
      managerEmail,
      companyName,
      adminName,
    });

    return result.data as { success: boolean; message: string };
  } catch (error: any) {
    console.error('Error inviting manager:', error);
    throw new Error(error.message || 'Failed to invite manager');
  }
}

/**
 * Update a manager
 */
export async function updateManager(
  managerId: string,
  updates: Partial<Omit<Manager, 'id' | 'companyId' | 'role' | 'email' | 'createdAt'>>
): Promise<Manager> {
  const token = await getAuthToken();

  const response = await fetch(`/api/managers/${managerId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update manager');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Delete a manager
 */
export async function deleteManager(managerId: string): Promise<void> {
  const token = await getAuthToken();

  const response = await fetch(`/api/managers/${managerId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete manager');
  }
}
