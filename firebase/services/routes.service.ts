// firebase/services/routes.service.ts
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
import { Route, RouteStatus } from '@/types';
import { cleanData } from '@/firebase/utils/firebaseDataCleaner';

/**
 * Get a single route by ID
 */
export const getRoute = async (routeId: string): Promise<Route> => {
  try {
    const routeDoc = await getDoc(doc(db, 'routes', routeId));

    if (!routeDoc.exists()) {
      throw new Error('Route not found');
    }

    return {
      id: routeDoc.id,
      ...routeDoc.data(),
    } as Route;
  } catch (error: any) {
    console.error('Error fetching route:', error);
    throw new Error(error.message || 'Failed to fetch route');
  }
};

/**
 * Get all routes for a company
 */
export const getCompanyRoutes = async (companyId: string): Promise<Route[]> => {
  try {
    const routesQuery = query(
      collection(db, 'routes'),
      where('companyId', '==', companyId),
      orderBy('scheduledStartTime', 'desc')
    );

    const snapshot = await getDocs(routesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Route[];
  } catch (error: any) {
    console.error('Error fetching routes:', error);
    throw new Error(error.message || 'Failed to fetch routes');
  }
};

/**
 * Get routes by status
 */
export const getRoutesByStatus = async (
  companyId: string,
  status: RouteStatus
): Promise<Route[]> => {
  try {
    const routesQuery = query(
      collection(db, 'routes'),
      where('companyId', '==', companyId),
      where('status', '==', status)
    );

    const snapshot = await getDocs(routesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Route[];
  } catch (error: any) {
    console.error('Error fetching routes by status:', error);
    throw new Error(error.message || 'Failed to fetch routes');
  }
};

/**
 * Get routes assigned to a driver
 */
export const getDriverRoutes = async (driverId: string): Promise<Route[]> => {
  try {
    const routesQuery = query(
      collection(db, 'routes'),
      where('assignedDriverId', '==', driverId)
    );

    const snapshot = await getDocs(routesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Route[];
  } catch (error: any) {
    console.error('Error fetching driver routes:', error);
    throw new Error(error.message || 'Failed to fetch driver routes');
  }
};

/**
 * Create a new route
 */
export const createRoute = async (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route> => {
  try {
    const routeId = doc(collection(db, 'routes')).id;
    const routeData = cleanData({
      ...route,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'routes', routeId), routeData);

    return {
      id: routeId,
      ...routeData,
    } as Route;
  } catch (error: any) {
    console.error('Error creating route:', error);
    throw new Error(error.message || 'Failed to create route');
  }
};

/**
 * Update a route
 */
export const updateRoute = async (
  routeId: string,
  updates: Partial<Route>
): Promise<Route> => {
  try {
    const updateData = cleanData({
      ...updates,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'routes', routeId), updateData);

    return {
      id: routeId,
      ...updates,
    } as Route;
  } catch (error: any) {
    console.error('Error updating route:', error);
    throw new Error(error.message || 'Failed to update route');
  }
};

/**
 * Update route status
 */
export const updateRouteStatus = async (
  routeId: string,
  status: RouteStatus
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'routes', routeId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating route status:', error);
    throw new Error(error.message || 'Failed to update route status');
  }
};

/**
 * Assign route to driver and vehicle
 */
export const assignRoute = async (
  routeId: string,
  driverId: string,
  vehicleId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'routes', routeId), {
      assignedDriverId: driverId,
      assignedVehicleId: vehicleId,
      status: 'planned',
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error assigning route:', error);
    throw new Error(error.message || 'Failed to assign route');
  }
};

/**
 * Start a route
 */
export const startRoute = async (routeId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'routes', routeId), {
      status: 'in-progress',
      actualStartTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error starting route:', error);
    throw new Error(error.message || 'Failed to start route');
  }
};

/**
 * Complete a route
 */
export const completeRoute = async (routeId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'routes', routeId), {
      status: 'completed',
      actualEndTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error completing route:', error);
    throw new Error(error.message || 'Failed to complete route');
  }
};

/**
 * Delete a route
 */
export const deleteRoute = async (routeId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'routes', routeId));
  } catch (error: any) {
    console.error('Error deleting route:', error);
    throw new Error(error.message || 'Failed to delete route');
  }
};

/**
 * Optimize routes using order list
 */
export const optimizeRoute = async (
  routeId: string,
  orderIds: string[],
  polyline: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'routes', routeId), {
      orders: orderIds,
      polyline,
      optimized: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error optimizing route:', error);
    throw new Error(error.message || 'Failed to optimize route');
  }
};
