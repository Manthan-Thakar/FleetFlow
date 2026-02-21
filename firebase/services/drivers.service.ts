// firebase/services/drivers.service.ts
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
import { Driver, UpdateDriverData, DriverStatus } from '@/types';

/**
 * Get a single driver by ID
 */
export const getDriver = async (driverId: string): Promise<Driver> => {
  try {
    const driverDoc = await getDoc(doc(db, 'drivers', driverId));

    if (!driverDoc.exists()) {
      throw new Error('Driver not found');
    }

    return {
      id: driverDoc.id,
      ...driverDoc.data(),
    } as Driver;
  } catch (error: any) {
    console.error('Error fetching driver:', error);
    throw new Error(error.message || 'Failed to fetch driver');
  }
};

/**
 * Get all drivers for a company
 */
export const getCompanyDrivers = async (companyId: string): Promise<Driver[]> => {
  try {
    const driversQuery = query(
      collection(db, 'users'),
      where('role', '==', 'driver'),
      where('companyId', '==', companyId)
    );

    const snapshot = await getDocs(driversQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: doc.id,
        ...data,
        // Provide default values for missing driver-specific properties
        licenseNumber: data.licenseNumber || 'N/A',
        licenseType: data.licenseType || 'Commercial',
        licenseExpiry: data.licenseExpiry || new Date(),
        emergencyContact: data.emergencyContact || {
          name: 'N/A',
          phone: 'N/A',
          relationship: 'N/A',
        },
        status: data.status || 'available',
        ratings: data.ratings || {
          average: 0,
          totalReviews: 0,
          onTimeDelivery: 0,
        },
        performanceMetrics: data.performanceMetrics || {
          totalTrips: 0,
          totalDistance: 0,
          totalHours: 0,
          incidents: 0,
        },
      } as Driver;
    });
  } catch (error: any) {
    console.error('Error fetching company drivers:', error);
    throw new Error(error.message || 'Failed to fetch drivers');
  }
};

/**
 * Get drivers by status
 */
export const getDriversByStatus = async (
  companyId: string,
  status: DriverStatus
): Promise<Driver[]> => {
  try {
    const driversQuery = query(
      collection(db, 'users'),
      where('companyId', '==', companyId),
      where('role', '==', 'driver'),
      where('status', '==', status)
    );

    const snapshot = await getDocs(driversQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Driver));
  } catch (error: any) {
    console.error('Error fetching drivers by status:', error);
    throw new Error(error.message || 'Failed to fetch drivers');
  }
};

/**
 * Update driver information
 */
export const updateDriver = async (
  driverId: string,
  data: UpdateDriverData
): Promise<Driver> => {
  try {
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    // Add fields if they exist
    if (data.displayName) updateData.displayName = data.displayName;
    if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
    if (data.licenseNumber) updateData.licenseNumber = data.licenseNumber;
    if (data.licenseType) updateData.licenseType = data.licenseType;
    if (data.licenseExpiry) {
      updateData.licenseExpiry =
        typeof data.licenseExpiry === 'string'
          ? new Date(data.licenseExpiry)
          : data.licenseExpiry;
    }
    if (data.emergencyContact) updateData.emergencyContact = data.emergencyContact;
    if (data.currentVehicleId !== undefined) updateData.currentVehicleId = data.currentVehicleId;
    if (data.status) updateData.status = data.status;

    await updateDoc(doc(db, 'users', driverId), updateData);

    // Return updated driver
    return getDriver(driverId);
  } catch (error: any) {
    console.error('Error updating driver:', error);
    throw new Error(error.message || 'Failed to update driver');
  }
};

/**
 * Update driver status
 */
export const updateDriverStatus = async (
  driverId: string,
  status: DriverStatus
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', driverId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating driver status:', error);
    throw new Error(error.message || 'Failed to update driver status');
  }
};

/**
 * Assign vehicle to driver
 */
export const assignVehicleToDriver = async (
  driverId: string,
  vehicleId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'drivers', driverId), {
      currentVehicleId: vehicleId,
      status: 'available',
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
export const unassignVehicleFromDriver = async (driverId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'drivers', driverId), {
      currentVehicleId: null,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error unassigning vehicle:', error);
    throw new Error(error.message || 'Failed to unassign vehicle');
  }
};

/**
 * Update driver current location
 */
export const updateDriverLocation = async (
  driverId: string,
  latitude: number,
  longitude: number,
  address?: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'drivers', driverId), {
      currentLocation: {
        latitude,
        longitude,
        lastUpdated: serverTimestamp(),
        address: address || null,
      },
    });
  } catch (error: any) {
    console.error('Error updating driver location:', error);
    throw new Error(error.message || 'Failed to update location');
  }
};

/**
 * Update driver performance metrics
 */
export const updateDriverMetrics = async (
  driverId: string,
  metricsUpdate: Partial<{
    totalTrips: number;
    totalDistance: number;
    totalHours: number;
    incidents: number;
  }>
): Promise<void> => {
  try {
    const driver = await getDriver(driverId);
    const currentMetrics = driver.performanceMetrics;

    const updatedMetrics = {
      totalTrips: metricsUpdate.totalTrips ?? currentMetrics.totalTrips,
      totalDistance: metricsUpdate.totalDistance ?? currentMetrics.totalDistance,
      totalHours: metricsUpdate.totalHours ?? currentMetrics.totalHours,
      incidents: metricsUpdate.incidents ?? currentMetrics.incidents,
    };

    await updateDoc(doc(db, 'drivers', driverId), {
      performanceMetrics: updatedMetrics,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating driver metrics:', error);
    throw new Error(error.message || 'Failed to update metrics');
  }
};

/**
 * Update driver ratings
 */
export const updateDriverRating = async (
  driverId: string,
  rating: number,
  onTimeDeliveryPercentage?: number
): Promise<void> => {
  try {
    const driver = await getDriver(driverId);
    const currentRatings = driver.ratings;

    // Calculate new average
    const totalReviews = currentRatings.totalReviews + 1;
    const newAverage =
      (currentRatings.average * currentRatings.totalReviews + rating) / totalReviews;

    const updatedRatings = {
      average: Math.round(newAverage * 100) / 100, // Round to 2 decimals
      totalReviews,
      onTimeDelivery: onTimeDeliveryPercentage ?? currentRatings.onTimeDelivery,
    };

    await updateDoc(doc(db, 'drivers', driverId), {
      ratings: updatedRatings,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating driver rating:', error);
    throw new Error(error.message || 'Failed to update rating');
  }
};

/**
 * Delete a driver
 */
export const deleteDriver = async (driverId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'drivers', driverId));
  } catch (error: any) {
    console.error('Error deleting driver:', error);
    throw new Error(error.message || 'Failed to delete driver');
  }
};

/**
 * Check if license is expiring soon (within 30 days)
 */
export const isLicenseExpiringSoon = (expiryDate: Timestamp | Date): boolean => {
  const expiry = expiryDate instanceof Timestamp ? expiryDate.toDate() : expiryDate;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return expiry <= thirtyDaysFromNow && expiry > new Date();
};

/**
 * Check if license is expired
 */
export const isLicenseExpired = (expiryDate: Timestamp | Date): boolean => {
  const expiry = expiryDate instanceof Timestamp ? expiryDate.toDate() : expiryDate;
  return expiry < new Date();
};
