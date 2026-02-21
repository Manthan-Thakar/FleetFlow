// firebase/hooks/useSchedule.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Shift, ShiftStatus } from '@/types';
import {
  getShift,
  getDriverShifts,
  getCompanySchedule,
  getShiftsByStatus,
  getWeeklySchedule,
  createShift,
  updateShift,
  updateShiftStatus,
  startShift,
  endShift,
  cancelShift,
  deleteShift,
  bulkCreateShifts,
} from '@/firebase/services/schedule.service';

export function useSchedule(companyId?: string) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch company schedule
  const fetchSchedule = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCompanySchedule(cId);
      setShifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchSchedule(companyId);
    }
  }, [companyId, fetchSchedule]);

  // Create shift
  const handleCreateShift = useCallback(
    async (shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);
      try {
        const newShift = await createShift(shiftData);
        setShifts(prev => [newShift, ...prev]);
        return newShift;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create shift';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Bulk create shifts
  const handleBulkCreateShifts = useCallback(
    async (shiftsData: Array<Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>>) => {
      setLoading(true);
      setError(null);
      try {
        const newShifts = await bulkCreateShifts(shiftsData);
        setShifts(prev => [...newShifts, ...prev]);
        return newShifts;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create shifts';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update shift
  const handleUpdateShift = useCallback(
    async (shiftId: string, updates: Partial<Shift>) => {
      setLoading(true);
      setError(null);
      try {
        await updateShift(shiftId, updates);
        setShifts(prev =>
          prev.map(s => (s.id === shiftId ? { ...s, ...updates } : s))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update shift';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update shift status
  const handleUpdateStatus = useCallback(
    async (shiftId: string, status: ShiftStatus) => {
      setLoading(true);
      setError(null);
      try {
        await updateShiftStatus(shiftId, status);
        setShifts(prev =>
          prev.map(s => (s.id === shiftId ? { ...s, status } : s))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update shift status';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Start shift
  const handleStartShift = useCallback(
    async (shiftId: string) => {
      setLoading(true);
      setError(null);
      try {
        await startShift(shiftId);
        setShifts(prev =>
          prev.map(s =>
            s.id === shiftId ? { ...s, status: 'in-progress' as ShiftStatus } : s
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start shift';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // End shift
  const handleEndShift = useCallback(
    async (shiftId: string) => {
      setLoading(true);
      setError(null);
      try {
        await endShift(shiftId);
        setShifts(prev =>
          prev.map(s =>
            s.id === shiftId ? { ...s, status: 'completed' as ShiftStatus } : s
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to end shift';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Cancel shift
  const handleCancelShift = useCallback(
    async (shiftId: string, reason?: string) => {
      setLoading(true);
      setError(null);
      try {
        await cancelShift(shiftId, reason);
        setShifts(prev =>
          prev.map(s =>
            s.id === shiftId ? { ...s, status: 'cancelled' as ShiftStatus } : s
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to cancel shift';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete shift
  const handleDeleteShift = useCallback(
    async (shiftId: string) => {
      setLoading(true);
      setError(null);
      try {
        await deleteShift(shiftId);
        setShifts(prev => prev.filter(s => s.id !== shiftId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete shift';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get shifts by status
  const getShiftsByStatusFilter = useCallback(
    async (cId: string, status: ShiftStatus) => {
      try {
        return await getShiftsByStatus(cId, status);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch shifts';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Get driver shifts
  const getDriverShiftsData = useCallback(
    async (driverId: string) => {
      try {
        return await getDriverShifts(driverId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch driver shifts';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Get weekly schedule
  const getWeeklyScheduleData = useCallback(
    async (driverId: string, weekStart: Date) => {
      try {
        return await getWeeklySchedule(driverId, weekStart);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch weekly schedule';
        setError(message);
        throw err;
      }
    },
    []
  );

  return {
    shifts,
    loading,
    error,
    fetchSchedule,
    createShift: handleCreateShift,
    bulkCreateShifts: handleBulkCreateShifts,
    updateShift: handleUpdateShift,
    updateStatus: handleUpdateStatus,
    startShift: handleStartShift,
    endShift: handleEndShift,
    cancelShift: handleCancelShift,
    deleteShift: handleDeleteShift,
    getShiftsByStatus: getShiftsByStatusFilter,
    getDriverShifts: getDriverShiftsData,
    getWeeklySchedule: getWeeklyScheduleData,
  };
}

// Single shift hook
export function useShift(shiftId?: string) {
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shiftId) {
      setShift(null);
      return;
    }

    setLoading(true);
    getShift(shiftId)
      .then(setShift)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load shift'))
      .finally(() => setLoading(false));
  }, [shiftId]);

  return { shift, loading, error };
}
