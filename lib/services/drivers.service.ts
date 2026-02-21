// lib/services/drivers.service.ts
import { getIdToken } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { getFunctions, httpsCallable } from 'firebase/functions';

export interface Driver {
  id: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  companyId: string;
  role: 'driver';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  notes?: string | null;
  photoURL?: string | null;
}

export interface DriversResponse {
  drivers: Driver[];
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
 * Get all drivers for the company
 */
export async function getDrivers(
  status?: 'active' | 'inactive' | 'all',
  limit = 50,
  offset = 0
): Promise<DriversResponse> {
  const token = await getAuthToken();
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`/api/drivers?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch drivers');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get a single driver by ID
 */
export async function getDriver(driverId: string): Promise<Driver> {
  const token = await getAuthToken();

  const response = await fetch(`/api/drivers/${driverId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch driver');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Create a new driver using Firebase Cloud Function
 * This sends an email invitation and creates auth account
 */
export async function inviteDriver(
  driverName: string,
  driverEmail: string,
  companyName: string,
  managerName?: string
): Promise<{ success: boolean; message: string }> {
  const functions = getFunctions();
  const sendDriverInvite = httpsCallable(functions, 'sendDriverInvite');

  try {
    const result = await sendDriverInvite({
      driverName,
      driverEmail,
      companyName,
      managerName,
    });

    return result.data as { success: boolean; message: string };
  } catch (error: any) {
    console.error('Error inviting driver:', error);
    throw new Error(error.message || 'Failed to invite driver');
  }
}

/**
 * Update a driver
 */
export async function updateDriver(
  driverId: string,
  updates: Partial<Omit<Driver, 'id' | 'companyId' | 'role' | 'email' | 'createdAt'>>
): Promise<Driver> {
  const token = await getAuthToken();

  const response = await fetch(`/api/drivers/${driverId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update driver');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Delete a driver
 */
export async function deleteDriver(driverId: string): Promise<void> {
  const token = await getAuthToken();

  const response = await fetch(`/api/drivers/${driverId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete driver');
  }
}
