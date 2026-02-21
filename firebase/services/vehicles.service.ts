// firebase/services/vehicles.service.ts
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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Vehicle, VehicleStatus } from '@/types';
import { cleanData } from '@/firebase/utils/firebaseDataCleaner';

/**
 * Get a single vehicle by ID
 */
export const getVehicle = async (vehicleId: string): Promise<Vehicle> => {
  try {
    const vehicleDoc = await getDoc(doc(db, 'vehicles', vehicleId));

    if (!vehicleDoc.exists()) {
      throw new Error('Vehicle not found');
    }

    return {
      id: vehicleDoc.id,
      ...vehicleDoc.data(),
    } as Vehicle;
  } catch (error: any) {
    console.error('Error fetching vehicle:', error);
    throw new Error(error.message || 'Failed to fetch vehicle');
  }
};

/**
 * Get all vehicles for a company
 */
export const getCompanyVehicles = async (companyId: string): Promise<Vehicle[]> => {
  try {
    const vehiclesQuery = query(
      collection(db, 'vehicles'),
      where('companyId', '==', companyId)
    );

    const snapshot = await getDocs(vehiclesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Vehicle[];
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    throw new Error(error.message || 'Failed to fetch vehicles');
  }
};

/**
 * Get vehicles by status
 */
export const getVehiclesByStatus = async (
  companyId: string,
  status: VehicleStatus
): Promise<Vehicle[]> => {
  try {
    const vehiclesQuery = query(
      collection(db, 'vehicles'),
      where('companyId', '==', companyId),
      where('status', '==', status)
    );

    const snapshot = await getDocs(vehiclesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Vehicle[];
  } catch (error: any) {
    console.error('Error fetching vehicles by status:', error);
    throw new Error(error.message || 'Failed to fetch vehicles');
  }
};

/**
 * Get vehicles assigned to a driver
 */
export const getDriverVehicles = async (driverId: string): Promise<Vehicle[]> => {
  try {
    const vehiclesQuery = query(
      collection(db, 'vehicles'),
      where('assignedDriverId', '==', driverId)
    );

    const snapshot = await getDocs(vehiclesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Vehicle[];
  } catch (error: any) {
    console.error('Error fetching driver vehicles:', error);
    throw new Error(error.message || 'Failed to fetch driver vehicles');
  }
};

/**
 * Create a new vehicle
 */
export const createVehicle = async (
  vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Vehicle> => {
  try {
    const vehicleId = doc(collection(db, 'vehicles')).id;
    const vehicleData = cleanData({
      ...vehicle,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'vehicles', vehicleId), vehicleData);

    return {
      id: vehicleId,
      ...vehicleData,
    } as Vehicle;
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    throw new Error(error.message || 'Failed to create vehicle');
  }
};

/**
 * Update a vehicle
 */
export const updateVehicle = async (
  vehicleId: string,
  updates: Partial<Vehicle>
): Promise<Vehicle> => {
  try {
    const updateData = cleanData({
      ...updates,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'vehicles', vehicleId), updateData);

    return {
      id: vehicleId,
      ...updates,
    } as Vehicle;
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    throw new Error(error.message || 'Failed to update vehicle');
  }
};

/**
 * Update vehicle status
 */
export const updateVehicleStatus = async (
  vehicleId: string,
  status: VehicleStatus
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'vehicles', vehicleId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating vehicle status:', error);
    throw new Error(error.message || 'Failed to update vehicle status');
  }
};

/**
 * Assign vehicle to driver
 */
export const assignVehicleToDriver = async (
  vehicleId: string,
  driverId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'vehicles', vehicleId), {
      assignedDriverId: driverId,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error assigning vehicle:', error);
    throw new Error(error.message || 'Failed to assign vehicle');
  }
};

/**
 * Unassign vehicle from driver
 */
export const unassignVehicleFromDriver = async (vehicleId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'vehicles', vehicleId), {
      assignedDriverId: null,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error unassigning vehicle:', error);
    throw new Error(error.message || 'Failed to unassign vehicle');
  }
};

/**
 * Update vehicle location
 */
export const updateVehicleLocation = async (
  vehicleId: string,
  latitude: number,
  longitude: number,
  address?: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'vehicles', vehicleId), {
      location: {
        latitude,
        longitude,
        lastUpdated: serverTimestamp(),
        address,
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating vehicle location:', error);
    throw new Error(error.message || 'Failed to update vehicle location');
  }
};

/**
 * Delete a vehicle
 */
export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'vehicles', vehicleId));
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    throw new Error(error.message || 'Failed to delete vehicle');
  }
};
