// firebase/hooks/usePerformance.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { DriverPerformance, FleetPerformance } from '@/types';
import {
  getDriverPerformance,
  getLatestDriverPerformance,
  getCompanyDriverPerformances,
  upsertDriverPerformance,
  getFleetPerformance,
  getLatestFleetPerformance,
  upsertFleetPerformance,
  calculateDriverScore,
  getTopPerformers,
  getDriversNeedingImprovement,
  deletePerformance,
} from '@/firebase/services/performance.service';

export function useDriverPerformance(driverId?: string) {
  const [performances, setPerformances] = useState<DriverPerformance[]>([]);
  const [latestPerformance, setLatestPerformance] = useState<DriverPerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all driver performances
  const fetchPerformances = useCallback(async (dId: string) => {
    if (!dId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getDriverPerformance(dId);
      setPerformances(data);

      if (data.length > 0) {
        setLatestPerformance(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performances');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchPerformances(driverId);
    }
  }, [driverId, fetchPerformances]);

  // Fetch latest performance
  const fetchLatestPerformance = useCallback(async (dId: string) => {
    if (!dId) return null;

    setLoading(true);
    setError(null);
    try {
      const data = await getLatestDriverPerformance(dId);
      setLatestPerformance(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch latest performance';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create or update performance
  const handleUpsertPerformance = useCallback(
    async (
      dId: string,
      performance: Omit<DriverPerformance, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await upsertDriverPerformance(dId, performance);
        setPerformances(prev => [result, ...prev]);
        setLatestPerformance(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save performance';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    performances,
    latestPerformance,
    loading,
    error,
    fetchPerformances,
    fetchLatestPerformance,
    upsertPerformance: handleUpsertPerformance,
    calculateScore: calculateDriverScore,
  };
}

export function useFleetPerformance(companyId?: string) {
  const [performances, setPerformances] = useState<FleetPerformance[]>([]);
  const [latestPerformance, setLatestPerformance] = useState<FleetPerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all fleet performances
  const fetchPerformances = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getFleetPerformance(cId);
      setPerformances(data);

      if (data.length > 0) {
        setLatestPerformance(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performances');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchPerformances(companyId);
    }
  }, [companyId, fetchPerformances]);

  // Fetch latest performance
  const fetchLatestPerformance = useCallback(async (cId: string) => {
    if (!cId) return null;

    setLoading(true);
    setError(null);
    try {
      const data = await getLatestFleetPerformance(cId);
      setLatestPerformance(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch latest performance';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create or update performance
  const handleUpsertPerformance = useCallback(
    async (
      cId: string,
      performance: Omit<FleetPerformance, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await upsertFleetPerformance(cId, performance);
        setPerformances(prev => [result, ...prev]);
        setLatestPerformance(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save performance';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    performances,
    latestPerformance,
    loading,
    error,
    fetchPerformances,
    fetchLatestPerformance,
    upsertPerformance: handleUpsertPerformance,
  };
}

export function useTopPerformers(companyId?: string, limit: number = 10) {
  const [performers, setPerformers] = useState<DriverPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopPerformers = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getTopPerformers(cId, limit);
      setPerformers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top performers');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (companyId) {
      fetchTopPerformers(companyId);
    }
  }, [companyId, fetchTopPerformers]);

  return {
    performers,
    loading,
    error,
    refetch: fetchTopPerformers,
  };
}

export function useDriversNeedingImprovement(companyId?: string, limit: number = 10) {
  const [drivers, setDrivers] = useState<DriverPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getDriversNeedingImprovement(cId, limit);
      setDrivers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (companyId) {
      fetchDrivers(companyId);
    }
  }, [companyId, fetchDrivers]);

  return {
    drivers,
    loading,
    error,
    refetch: fetchDrivers,
  };
}

export function useCompanyPerformanceOverview(companyId?: string) {
  const driverPerformances = useDriverPerformance();
  const fleetPerformances = useFleetPerformance(companyId);
  const topPerformers = useTopPerformers(companyId);
  const driversNeedingImprovement = useDriversNeedingImprovement(companyId);

  const loading =
    driverPerformances.loading ||
    fleetPerformances.loading ||
    topPerformers.loading ||
    driversNeedingImprovement.loading;

  const error =
    driverPerformances.error ||
    fleetPerformances.error ||
    topPerformers.error ||
    driversNeedingImprovement.error;

  return {
    driverPerformances: driverPerformances.latestPerformance,
    fleetPerformances: fleetPerformances.latestPerformance,
    topPerformers: topPerformers.performers,
    driversNeedingImprovement: driversNeedingImprovement.drivers,
    loading,
    error,
    refetch: async (cId: string) => {
      await fleetPerformances.fetchLatestPerformance(cId);
      await topPerformers.refetch(cId);
      await driversNeedingImprovement.refetch(cId);
    },
  };
}

// Combined performance hook for dashboard pages
export function usePerformance(companyId?: string) {
  const driverPerformances = useDriverPerformance();
  const fleetPerformances = useFleetPerformance(companyId);
  const topPerformersHook = useTopPerformers(companyId);
  const driversNeedingImprovementHook = useDriversNeedingImprovement(companyId);

  const loading =
    driverPerformances.loading ||
    fleetPerformances.loading ||
    topPerformersHook.loading ||
    driversNeedingImprovementHook.loading;

  const error =
    driverPerformances.error ||
    fleetPerformances.error ||
    topPerformersHook.error ||
    driversNeedingImprovementHook.error;

  // Calculate overall metrics
  const overall = {
    onTimeDeliveryRate:
      driverPerformances.latestPerformance?.onTimeDeliveryRate ||
      fleetPerformances.latestPerformance?.onTimeDeliveryRate ||
      0,
    fuelEfficiency:
      fleetPerformances.latestPerformance?.avgFuelEfficiency ||
      driverPerformances.latestPerformance?.fuelEfficiency ||
      0,
    safetyScore:
      driverPerformances.latestPerformance?.safetyScore ||
      0,
    averageDeliveryTime:
      fleetPerformances.latestPerformance?.avgDeliveryTime ||
      0,
  };

  return {
    driverMetrics: driverPerformances.latestPerformance,
    fleetMetrics: fleetPerformances.latestPerformance,
    topPerformers: topPerformersHook.performers,
    driversNeedingImprovement: driversNeedingImprovementHook.drivers,
    overall,
    loading,
    error,
  };
}
