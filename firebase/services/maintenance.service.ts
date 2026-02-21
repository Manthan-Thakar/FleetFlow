// firebase/services/maintenance.service.ts
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
import { Maintenance } from '@/types';
import { cleanData } from '@/firebase/utils/firebaseDataCleaner';

/**
 * Get all maintenance records for a company
 */
export const getCompanyMaintenance = async (companyId: string): Promise<Maintenance[]> => {
  try {
    const maintenanceQuery = query(
      collection(db, 'maintenance'),
      where('companyId', '==', companyId),
      orderBy('scheduledDate', 'desc')
    );

    const snapshot = await getDocs(maintenanceQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Maintenance[];
  } catch (error: any) {
    console.error('Error fetching maintenance records:', error);
    throw new Error(error.message || 'Failed to fetch maintenance records');
  }
};

/**
 * Get maintenance records for a specific vehicle
 */
export const getVehicleMaintenance = async (vehicleId: string): Promise<Maintenance[]> => {
  try {
    const maintenanceQuery = query(
      collection(db, 'maintenance'),
      where('vehicleId', '==', vehicleId),
      orderBy('scheduledDate', 'desc')
    );

    const snapshot = await getDocs(maintenanceQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Maintenance[];
  } catch (error: any) {
    console.error('Error fetching vehicle maintenance:', error);
    throw new Error(error.message || 'Failed to fetch vehicle maintenance');
  }
};

/**
 * Get maintenance records by status
 */
export const getMaintenanceByStatus = async (
  companyId: string,
  status: Maintenance['status']
): Promise<Maintenance[]> => {
  try {
    const maintenanceQuery = query(
      collection(db, 'maintenance'),
      where('companyId', '==', companyId),
      where('status', '==', status),
      orderBy('scheduledDate', 'desc')
    );

    const snapshot = await getDocs(maintenanceQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Maintenance[];
  } catch (error: any) {
    console.error('Error fetching maintenance by status:', error);
    throw new Error(error.message || 'Failed to fetch maintenance');
  }
};

/**
 * Get single maintenance record
 */
export const getMaintenance = async (maintenanceId: string): Promise<Maintenance | null> => {
  try {
    const maintenanceDoc = await getDoc(doc(db, 'maintenance', maintenanceId));
    if (!maintenanceDoc.exists()) return null;

    return {
      id: maintenanceDoc.id,
      ...maintenanceDoc.data(),
    } as Maintenance;
  } catch (error: any) {
    console.error('Error fetching maintenance:', error);
    throw new Error(error.message || 'Failed to fetch maintenance');
  }
};

/**
 * Create new maintenance record
 */
export const createMaintenance = async (
  maintenanceData: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Maintenance> => {
  try {
    const maintenanceId = doc(collection(db, 'maintenance')).id;
    const cleanedData = cleanData({
      ...maintenanceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'maintenance', maintenanceId), cleanedData);

    return {
      id: maintenanceId,
      ...maintenanceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Maintenance;
  } catch (error: any) {
    console.error('Error creating maintenance record:', error);
    throw new Error(error.message || 'Failed to create maintenance record');
  }
};

/**
 * Update maintenance record
 */
export const updateMaintenance = async (
  maintenanceId: string,
  updates: Partial<Maintenance>
): Promise<void> => {
  try {
    const cleanedUpdates = cleanData({
      ...updates,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'maintenance', maintenanceId), cleanedUpdates);
  } catch (error: any) {
    console.error('Error updating maintenance:', error);
    throw new Error(error.message || 'Failed to update maintenance');
  }
};

/**
 * Delete maintenance record
 */
export const deleteMaintenance = async (maintenanceId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'maintenance', maintenanceId));
  } catch (error: any) {
    console.error('Error deleting maintenance:', error);
    throw new Error(error.message || 'Failed to delete maintenance');
  }
};

/**
 * Get maintenance analytics
 */
export const getMaintenanceAnalytics = async (companyId: string) => {
  try {
    const maintenanceRecords = await getCompanyMaintenance(companyId);

    const totalRecords = maintenanceRecords.length;
    const scheduledCount = maintenanceRecords.filter(m => m.status === 'scheduled').length;
    const inProgressCount = maintenanceRecords.filter(m => m.status === 'in-progress').length;
    const completedCount = maintenanceRecords.filter(m => m.status === 'completed').length;
    const cancelledCount = maintenanceRecords.filter(m => m.status === 'cancelled').length;

    const totalCost = maintenanceRecords.reduce((sum, m) => sum + (m.cost?.total || 0), 0);
    const avgCost = totalRecords > 0 ? totalCost / totalRecords : 0;

    const routineCount = maintenanceRecords.filter(m => m.type === 'routine').length;
    const repairCount = maintenanceRecords.filter(m => m.type === 'repair').length;
    const inspectionCount = maintenanceRecords.filter(m => m.type === 'inspection').length;

    return {
      totalRecords,
      scheduledCount,
      inProgressCount,
      completedCount,
      cancelledCount,
      totalCost,
      avgCost,
      routineCount,
      repairCount,
      inspectionCount,
      completionRate: totalRecords > 0 ? (completedCount / totalRecords) * 100 : 0,
    };
  } catch (error: any) {
    console.error('Error fetching maintenance analytics:', error);
    throw new Error(error.message || 'Failed to fetch maintenance analytics');
  }
};
