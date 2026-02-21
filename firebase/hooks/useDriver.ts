// firebase/hooks/useDriver.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Driver, UpdateDriverData } from '@/types';
import {
  getDriver,
  getCompanyDrivers,
  getDriversByStatus,
  updateDriver,
  updateDriverStatus,
  assignVehicleToDriver,
  unassignVehicleFromDriver,
  updateDriverLocation,
  updateDriverMetrics,
  updateDriverRating,
  deleteDriver,
  isLicenseExpired,
  isLicenseExpiringSoon,
} from '@/firebase/services/drivers.service';

export function useDriver(driverId?: string) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch single driver
  useEffect(() => {
    if (!driverId) {
      setDriver(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getDriver(driverId)
      .then(setDriver)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load driver'))
      .finally(() => setLoading(false));
  }, [driverId]);

  // Update driver
  const handleUpdateDriver = useCallback(async (updates: UpdateDriverData) => {
    if (!driverId) throw new Error('No driver ID provided');
    
    setLoading(true);
    setError(null);
    try {
      const updated = await updateDriver(driverId, updates);
      setDriver(updated);
      return updated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update driver';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  // Update driver status
  const handleUpdateStatus = useCallback(async (status: string) => {
    if (!driverId) throw new Error('No driver ID provided');
    
    setLoading(true);
    setError(null);
    try {
      await updateDriverStatus(driverId, status as any);
      setDriver(prev => prev ? { ...prev, status: status as any } : null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  // Assign vehicle
  const handleAssignVehicle = useCallback(async (vehicleId: string) => {
    if (!driverId) throw new Error('No driver ID provided');
    
    setLoading(true);
    setError(null);
    try {
      await assignVehicleToDriver(driverId, vehicleId);
      setDriver(prev => prev ? { ...prev, currentVehicleId: vehicleId, status: 'available' } : null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to assign vehicle';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  // Unassign vehicle
  const handleUnassignVehicle = useCallback(async () => {
    if (!driverId) throw new Error('No driver ID provided');
    
    setLoading(true);
    setError(null);
    try {
      await unassignVehicleFromDriver(driverId);
      setDriver(prev => prev ? { ...prev, currentVehicleId: undefined } : null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to unassign vehicle';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  // Update location
  const handleUpdateLocation = useCallback(
    async (latitude: number, longitude: number, address?: string) => {
      if (!driverId) throw new Error('No driver ID provided');
      
      setLoading(true);
      setError(null);
      try {
        await updateDriverLocation(driverId, latitude, longitude, address);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update location';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [driverId]
  );

  // Delete driver
  const handleDeleteDriver = useCallback(async () => {
    if (!driverId) throw new Error('No driver ID provided');
    
    setLoading(true);
    setError(null);
    try {
      await deleteDriver(driverId);
      setDriver(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete driver';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  return {
    driver,
    loading,
    error,
    updateDriver: handleUpdateDriver,
    updateStatus: handleUpdateStatus,
    assignVehicle: handleAssignVehicle,
    unassignVehicle: handleUnassignVehicle,
    updateLocation: handleUpdateLocation,
    deleteDriver: handleDeleteDriver,
    isLicenseExpired: driver ? isLicenseExpired(driver.licenseExpiry) : false,
    isLicenseExpiringSoon: driver ? isLicenseExpiringSoon(driver.licenseExpiry) : false,
  };
}

// Hook for getting all company drivers
export function useCompanyDrivers(companyId?: string) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    if (!companyId) {
      setDrivers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getCompanyDrivers(companyId);
      setDrivers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return {
    drivers,
    loading,
    error,
    refetch: fetchDrivers,
  };
}

// Hook for getting drivers by status
export function useDriversByStatus(companyId?: string, status?: string) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    if (!companyId || !status) {
      setDrivers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getDriversByStatus(companyId, status as any);
      setDrivers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [companyId, status]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return {
    drivers,
    loading,
    error,
    refetch: fetchDrivers,
  };
}
