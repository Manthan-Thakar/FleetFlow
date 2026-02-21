// firebase/hooks/useVehicles.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Vehicle, VehicleStatus } from '@/types';
import {
  getVehicle,
  getCompanyVehicles,
  getVehiclesByStatus,
  getDriverVehicles,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  assignVehicleToDriver,
  unassignVehicleFromDriver,
  updateVehicleLocation,
  deleteVehicle,
} from '@/firebase/services/vehicles.service';

export function useVehicles(companyId?: string) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch company vehicles
  const fetchVehicles = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCompanyVehicles(cId);
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchVehicles(companyId);
    }
  }, [companyId, fetchVehicles]);

  // Create vehicle
  const handleCreateVehicle = useCallback(
    async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);
      try {
        const newVehicle = await createVehicle(vehicleData);
        setVehicles(prev => [newVehicle, ...prev]);
        return newVehicle;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create vehicle';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update vehicle
  const handleUpdateVehicle = useCallback(
    async (vehicleId: string, updates: Partial<Vehicle>) => {
      setLoading(true);
      setError(null);
      try {
        await updateVehicle(vehicleId, updates);
        setVehicles(prev =>
          prev.map(v => (v.id === vehicleId ? { ...v, ...updates } : v))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update vehicle';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update vehicle status
  const handleUpdateStatus = useCallback(
    async (vehicleId: string, status: VehicleStatus) => {
      setLoading(true);
      setError(null);
      try {
        await updateVehicleStatus(vehicleId, status);
        setVehicles(prev =>
          prev.map(v => (v.id === vehicleId ? { ...v, status } : v))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update vehicle status';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Assign vehicle to driver
  const handleAssignToDriver = useCallback(
    async (vehicleId: string, driverId: string) => {
      setLoading(true);
      setError(null);
      try {
        await assignVehicleToDriver(vehicleId, driverId);
        setVehicles(prev =>
          prev.map(v =>
            v.id === vehicleId ? { ...v, assignedDriverId: driverId } : v
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to assign vehicle';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Unassign vehicle from driver
  const handleUnassignDriver = useCallback(
    async (vehicleId: string) => {
      setLoading(true);
      setError(null);
      try {
        await unassignVehicleFromDriver(vehicleId);
        setVehicles(prev =>
          prev.map(v => (v.id === vehicleId ? { ...v, assignedDriverId: undefined } : v))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to unassign vehicle';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update vehicle location
  const handleUpdateLocation = useCallback(
    async (vehicleId: string, latitude: number, longitude: number, address?: string) => {
      setLoading(true);
      setError(null);
      try {
        await updateVehicleLocation(vehicleId, latitude, longitude, address);
        setVehicles(prev =>
          prev.map(v =>
            v.id === vehicleId
              ? {
                  ...v,
                  location: { latitude, longitude, lastUpdated: new Date(), address },
                }
              : v
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update location';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete vehicle
  const handleDeleteVehicle = useCallback(
    async (vehicleId: string) => {
      setLoading(true);
      setError(null);
      try {
        await deleteVehicle(vehicleId);
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete vehicle';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get vehicles by status
  const getVehiclesByStatusFilter = useCallback(
    async (cId: string, status: VehicleStatus) => {
      try {
        return await getVehiclesByStatus(cId, status);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch vehicles';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Get driver vehicles
  const getDriverVehiclesData = useCallback(
    async (driverId: string) => {
      try {
        return await getDriverVehicles(driverId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch driver vehicles';
        setError(message);
        throw err;
      }
    },
    []
  );

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    createVehicle: handleCreateVehicle,
    updateVehicle: handleUpdateVehicle,
    updateStatus: handleUpdateStatus,
    assignToDriver: handleAssignToDriver,
    unassignDriver: handleUnassignDriver,
    updateLocation: handleUpdateLocation,
    deleteVehicle: handleDeleteVehicle,
    getVehiclesByStatus: getVehiclesByStatusFilter,
    getDriverVehicles: getDriverVehiclesData,
  };
}

// Single vehicle hook
export function useVehicle(vehicleId?: string) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId) {
      setVehicle(null);
      return;
    }

    setLoading(true);
    getVehicle(vehicleId)
      .then(setVehicle)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load vehicle'))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  return { vehicle, loading, error };
}
