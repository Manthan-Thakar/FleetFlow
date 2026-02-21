// firebase/services/schedule.service.ts
import { db } from '@/firebase/config/firebaseConfig';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  collection,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Shift, ShiftStatus, ScheduleWeek } from '@/types';
import { cleanData } from '@/firebase/utils/firebaseDataCleaner';

/**
 * Get a single shift by ID
 */
export const getShift = async (shiftId: string): Promise<Shift> => {
  try {
    const shiftDoc = await getDoc(doc(db, 'shifts', shiftId));

    if (!shiftDoc.exists()) {
      throw new Error('Shift not found');
    }

    return {
      id: shiftDoc.id,
      ...shiftDoc.data(),
    } as Shift;
  } catch (error: any) {
    console.error('Error fetching shift:', error);
    throw new Error(error.message || 'Failed to fetch shift');
  }
};

/**
 * Get all shifts for a driver
 */
export const getDriverShifts = async (driverId: string): Promise<Shift[]> => {
  try {
    const shiftsQuery = query(
      collection(db, 'shifts'),
      where('driverId', '==', driverId),
      orderBy('startTime', 'desc')
    );

    const snapshot = await getDocs(shiftsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Shift[];
  } catch (error: any) {
    console.error('Error fetching driver shifts:', error);
    throw new Error(error.message || 'Failed to fetch driver shifts');
  }
};

/**
 * Get company schedule
 */
export const getCompanySchedule = async (companyId: string): Promise<Shift[]> => {
  try {
    const shiftsQuery = query(
      collection(db, 'shifts'),
      where('companyId', '==', companyId),
      orderBy('startTime', 'desc')
    );

    const snapshot = await getDocs(shiftsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Shift[];
  } catch (error: any) {
    console.error('Error fetching company schedule:', error);
    throw new Error(error.message || 'Failed to fetch company schedule');
  }
};

/**
 * Get shifts by status
 */
export const getShiftsByStatus = async (
  companyId: string,
  status: ShiftStatus
): Promise<Shift[]> => {
  try {
    const shiftsQuery = query(
      collection(db, 'shifts'),
      where('companyId', '==', companyId),
      where('status', '==', status)
    );

    const snapshot = await getDocs(shiftsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Shift[];
  } catch (error: any) {
    console.error('Error fetching shifts by status:', error);
    throw new Error(error.message || 'Failed to fetch shifts');
  }
};

/**
 * Get weekly schedule for a driver
 */
export const getWeeklySchedule = async (
  driverId: string,
  weekStart: Date
): Promise<Shift[]> => {
  try {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const shiftsQuery = query(
      collection(db, 'shifts'),
      where('driverId', '==', driverId),
      where('startTime', '>=', weekStart),
      where('startTime', '<', weekEnd),
      orderBy('startTime', 'asc')
    );

    const snapshot = await getDocs(shiftsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Shift[];
  } catch (error: any) {
    console.error('Error fetching weekly schedule:', error);
    throw new Error(error.message || 'Failed to fetch weekly schedule');
  }
};

/**
 * Create a new shift
 */
export const createShift = async (shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shift> => {
  try {
    const shiftId = doc(collection(db, 'shifts')).id;
    const shiftData = cleanData({
      ...shift,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'shifts', shiftId), shiftData);

    return {
      id: shiftId,
      ...shiftData,
    } as Shift;
  } catch (error: any) {
    console.error('Error creating shift:', error);
    throw new Error(error.message || 'Failed to create shift');
  }
};

/**
 * Update a shift
 */
export const updateShift = async (
  shiftId: string,
  updates: Partial<Shift>
): Promise<Shift> => {
  try {
    const updateData = cleanData({
      ...updates,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'shifts', shiftId), updateData);

    return {
      id: shiftId,
      ...updates,
    } as Shift;
  } catch (error: any) {
    console.error('Error updating shift:', error);
    throw new Error(error.message || 'Failed to update shift');
  }
};

/**
 * Update shift status
 */
export const updateShiftStatus = async (
  shiftId: string,
  status: ShiftStatus
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === 'in-progress') {
      updateData.actualStartTime = serverTimestamp();
    } else if (status === 'completed') {
      updateData.actualEndTime = serverTimestamp();
    }

    await updateDoc(doc(db, 'shifts', shiftId), updateData);
  } catch (error: any) {
    console.error('Error updating shift status:', error);
    throw new Error(error.message || 'Failed to update shift status');
  }
};

/**
 * Start a shift
 */
export const startShift = async (shiftId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'shifts', shiftId), {
      status: 'in-progress',
      actualStartTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error starting shift:', error);
    throw new Error(error.message || 'Failed to start shift');
  }
};

/**
 * End a shift
 */
export const endShift = async (shiftId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'shifts', shiftId), {
      status: 'completed',
      actualEndTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error ending shift:', error);
    throw new Error(error.message || 'Failed to end shift');
  }
};

/**
 * Cancel a shift
 */
export const cancelShift = async (shiftId: string, reason?: string): Promise<void> => {
  try {
    const updateData: any = {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    };

    if (reason) {
      updateData.notes = reason;
    }

    await updateDoc(doc(db, 'shifts', shiftId), updateData);
  } catch (error: any) {
    console.error('Error cancelling shift:', error);
    throw new Error(error.message || 'Failed to cancel shift');
  }
};

/**
 * Delete a shift
 */
export const deleteShift = async (shiftId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'shifts', shiftId));
  } catch (error: any) {
    console.error('Error deleting shift:', error);
    throw new Error(error.message || 'Failed to delete shift');
  }
};

/**
 * Bulk create shifts for drivers
 */
export const bulkCreateShifts = async (shifts: Array<Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Shift[]> => {
  try {
    const createdShifts: Shift[] = [];

    for (const shift of shifts) {
      const shiftId = doc(collection(db, 'shifts')).id;
      const shiftData = {
        ...shift,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'shifts', shiftId), shiftData);
      createdShifts.push({
        id: shiftId,
        ...shiftData,
      } as Shift);
    }

    return createdShifts;
  } catch (error: any) {
    console.error('Error bulk creating shifts:', error);
    throw new Error(error.message || 'Failed to create shifts');
  }
};
