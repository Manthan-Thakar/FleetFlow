// firebase/hooks/useMaintenance.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Maintenance } from '@/types';
import {
  getCompanyMaintenance,
  getVehicleMaintenance,
  getMaintenanceByStatus,
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceAnalytics,
} from '@/firebase/services/maintenance.service';

export function useMaintenance(companyId?: string) {
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Fetch all maintenance records
  const fetchMaintenance = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCompanyMaintenance(cId);
      setMaintenanceRecords(data);

      // Fetch analytics
      const analyticsData = await getMaintenanceAnalytics(cId);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch maintenance records');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch vehicle maintenance
  const fetchVehicleMaintenance = useCallback(async (vehicleId: string) => {
    if (!vehicleId) return [];

    setLoading(true);
    setError(null);
    try {
      const data = await getVehicleMaintenance(vehicleId);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicle maintenance');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch maintenance by status
  const fetchMaintenanceByStatus = useCallback(async (cId: string, status: Maintenance['status']) => {
    if (!cId) return [];

    setLoading(true);
    setError(null);
    try {
      const data = await getMaintenanceByStatus(cId, status);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch maintenance');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create maintenance record
  const handleCreateMaintenance = useCallback(async (maintenanceData: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newRecord = await createMaintenance(maintenanceData);
      setMaintenanceRecords(prev => [newRecord, ...prev]);

      // Update analytics
      if (companyId) {
        const analyticsData = await getMaintenanceAnalytics(companyId);
        setAnalytics(analyticsData);
      }

      return newRecord;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create maintenance record';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Update maintenance record
  const handleUpdateMaintenance = useCallback(async (maintenanceId: string, updates: Partial<Maintenance>) => {
    setLoading(true);
    setError(null);
    try {
      await updateMaintenance(maintenanceId, updates);
      setMaintenanceRecords(prev =>
        prev.map(record => (record.id === maintenanceId ? { ...record, ...updates } : record))
      );

      // Update analytics
      if (companyId) {
        const analyticsData = await getMaintenanceAnalytics(companyId);
        setAnalytics(analyticsData);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update maintenance record';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Delete maintenance record
  const handleDeleteMaintenance = useCallback(async (maintenanceId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteMaintenance(maintenanceId);
      setMaintenanceRecords(prev => prev.filter(record => record.id !== maintenanceId));

      // Update analytics
      if (companyId) {
        const analyticsData = await getMaintenanceAnalytics(companyId);
        setAnalytics(analyticsData);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete maintenance record';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchMaintenance(companyId);
    }
  }, [companyId, fetchMaintenance]);

  return {
    maintenanceRecords,
    loading,
    error,
    analytics,
    fetchMaintenance,
    fetchVehicleMaintenance,
    fetchMaintenanceByStatus,
    createMaintenance: handleCreateMaintenance,
    updateMaintenance: handleUpdateMaintenance,
    deleteMaintenance: handleDeleteMaintenance,
  };
}
