// firebase/services/performance.service.ts
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
import { DriverPerformance, FleetPerformance } from '@/types';
import { cleanData } from '@/firebase/utils/firebaseDataCleaner';

/**
 * Get driver performance for a specific period
 */
export const getDriverPerformance = async (driverId: string): Promise<DriverPerformance[]> => {
  try {
    const performanceQuery = query(
      collection(db, 'performance', 'drivers', driverId),
      orderBy('startDate', 'desc')
    );

    const snapshot = await getDocs(performanceQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as DriverPerformance[];
  } catch (error: any) {
    console.error('Error fetching driver performance:', error);
    throw new Error(error.message || 'Failed to fetch driver performance');
  }
};

/**
 * Get latest driver performance
 */
export const getLatestDriverPerformance = async (driverId: string): Promise<DriverPerformance | null> => {
  try {
    const performanceQuery = query(
      collection(db, 'performance', 'drivers', driverId),
      orderBy('startDate', 'desc')
    );

    const snapshot = await getDocs(performanceQuery);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as DriverPerformance;
  } catch (error: any) {
    console.error('Error fetching latest driver performance:', error);
    throw new Error(error.message || 'Failed to fetch driver performance');
  }
};

/**
 * Get all driver performances for a company
 */
export const getCompanyDriverPerformances = async (companyId: string): Promise<DriverPerformance[]> => {
  try {
    const performanceQuery = query(
      collection(db, 'performance'),
      where('type', '==', 'driver'),
      where('companyId', '==', companyId),
      orderBy('startDate', 'desc')
    );

    const snapshot = await getDocs(performanceQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as DriverPerformance[];
  } catch (error: any) {
    console.error('Error fetching company driver performances:', error);
    throw new Error(error.message || 'Failed to fetch driver performances');
  }
};

/**
 * Create or update driver performance record
 */
export const upsertDriverPerformance = async (
  driverId: string,
  performance: Omit<DriverPerformance, 'id' | 'createdAt' | 'updatedAt'>
): Promise<DriverPerformance> => {
  try {
    const performanceId = `${driverId}_${performance.period}_${(performance.startDate instanceof Date ? performance.startDate : performance.startDate.toDate()).toISOString().split('T')[0]}`;
    const performanceData = cleanData({
      ...performance,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'performance', performanceId), performanceData, { merge: true });

    return {
      id: performanceId,
      ...performanceData,
    } as DriverPerformance;
  } catch (error: any) {
    console.error('Error upserting driver performance:', error);
    throw new Error(error.message || 'Failed to upsert driver performance');
  }
};

/**
 * Get fleet performance for a specific period
 */
export const getFleetPerformance = async (companyId: string): Promise<FleetPerformance[]> => {
  try {
    const performanceQuery = query(
      collection(db, 'performance'),
      where('type', '==', 'fleet'),
      where('companyId', '==', companyId),
      orderBy('startDate', 'desc')
    );

    const snapshot = await getDocs(performanceQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FleetPerformance[];
  } catch (error: any) {
    console.error('Error fetching fleet performance:', error);
    throw new Error(error.message || 'Failed to fetch fleet performance');
  }
};

/**
 * Get latest fleet performance
 */
export const getLatestFleetPerformance = async (companyId: string): Promise<FleetPerformance | null> => {
  try {
    const performanceQuery = query(
      collection(db, 'performance'),
      where('type', '==', 'fleet'),
      where('companyId', '==', companyId),
      orderBy('startDate', 'desc')
    );

    const snapshot = await getDocs(performanceQuery);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as FleetPerformance;
  } catch (error: any) {
    console.error('Error fetching latest fleet performance:', error);
    throw new Error(error.message || 'Failed to fetch fleet performance');
  }
};

/**
 * Create or update fleet performance record
 */
export const upsertFleetPerformance = async (
  companyId: string,
  performance: Omit<FleetPerformance, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FleetPerformance> => {
  try {
    const performanceId = `${companyId}_fleet_${performance.period}_${(performance.startDate instanceof Date ? performance.startDate : performance.startDate.toDate()).toISOString().split('T')[0]}`;
    const performanceData = cleanData({
      ...performance,
      companyId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'performance', performanceId), performanceData, { merge: true });

    return {
      id: performanceId,
      ...performanceData,
    } as FleetPerformance;
  } catch (error: any) {
    console.error('Error upserting fleet performance:', error);
    throw new Error(error.message || 'Failed to upsert fleet performance');
  }
};

/**
 * Calculate driver score based on metrics
 */
export const calculateDriverScore = (performance: DriverPerformance): number => {
  const weights = {
    onTimeDeliveryRate: 0.25,
    safetyScore: 0.25,
    customerSatisfactionRate: 0.25,
    complianceScore: 0.25,
  };

  const score =
    (performance.onTimeDeliveryRate * weights.onTimeDeliveryRate) +
    (performance.safetyScore * weights.safetyScore) +
    ((performance.customerSatisfactionRate || 0) * weights.customerSatisfactionRate) +
    (performance.complianceScore * weights.complianceScore);

  return Math.round(score * 100) / 100;
};

/**
 * Get top performers
 */
export const getTopPerformers = async (companyId: string, limit: number = 10): Promise<DriverPerformance[]> => {
  try {
    const performanceQuery = query(
      collection(db, 'performance'),
      where('type', '==', 'driver'),
      where('companyId', '==', companyId),
      orderBy('onTimeDeliveryRate', 'desc')
    );

    const snapshot = await getDocs(performanceQuery);
    const performances = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as DriverPerformance[];

    // Remove duplicates (keep latest for each driver)
    const latestByDriver = new Map<string, DriverPerformance>();
    performances.forEach(p => {
      const existing = latestByDriver.get(p.driverId);
      if (!existing || (p.startDate instanceof Date ? p.startDate : p.startDate.toDate()) > (existing.startDate instanceof Date ? existing.startDate : existing.startDate.toDate())) {
        latestByDriver.set(p.driverId, p);
      }
    });

    return Array.from(latestByDriver.values()).slice(0, limit);
  } catch (error: any) {
    console.error('Error fetching top performers:', error);
    throw new Error(error.message || 'Failed to fetch top performers');
  }
};

/**
 * Get drivers needing improvement
 */
export const getDriversNeedingImprovement = async (companyId: string, limit: number = 10): Promise<DriverPerformance[]> => {
  try {
    const performanceQuery = query(
      collection(db, 'performance'),
      where('type', '==', 'driver'),
      where('companyId', '==', companyId),
      orderBy('safetyScore', 'asc')
    );

    const snapshot = await getDocs(performanceQuery);
    const performances = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as DriverPerformance[];

    // Remove duplicates and filter those with score < 70
    const latestByDriver = new Map<string, DriverPerformance>();
    performances.forEach(p => {
      const existing = latestByDriver.get(p.driverId);
      if (!existing || (p.startDate instanceof Date ? p.startDate : p.startDate.toDate()) > (existing.startDate instanceof Date ? existing.startDate : existing.startDate.toDate())) {
        latestByDriver.set(p.driverId, p);
      }
    });

    return Array.from(latestByDriver.values())
      .filter(p => p.safetyScore < 70)
      .slice(0, limit);
  } catch (error: any) {
    console.error('Error fetching drivers needing improvement:', error);
    throw new Error(error.message || 'Failed to fetch drivers');
  }
};

/**
 * Delete performance record
 */
export const deletePerformance = async (performanceId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'performance', performanceId));
  } catch (error: any) {
    console.error('Error deleting performance record:', error);
    throw new Error(error.message || 'Failed to delete performance record');
  }
};
