// firebase/hooks/useAnalytics.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  getFleetAnalytics,
  getFuelAnalytics,
  getCostAnalytics,
} from '@/firebase/services/analytics.service';

export function useAnalytics(companyId?: string) {
  const [fleetAnalytics, setFleetAnalytics] = useState<any>(null);
  const [fuelAnalytics, setFuelAnalytics] = useState<any>(null);
  const [costAnalytics, setCostAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all analytics
  const fetchAnalytics = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const [fleet, fuel, cost] = await Promise.all([
        getFleetAnalytics(cId),
        getFuelAnalytics(cId),
        getCostAnalytics(cId),
      ]);

      setFleetAnalytics(fleet);
      setFuelAnalytics(fuel);
      setCostAnalytics(cost);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch just fleet analytics
  const fetchFleetAnalytics = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getFleetAnalytics(cId);
      setFleetAnalytics(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fleet analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch just fuel analytics
  const fetchFuelAnalytics = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getFuelAnalytics(cId);
      setFuelAnalytics(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fuel analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch just cost analytics
  const fetchCostAnalytics = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCostAnalytics(cId);
      setCostAnalytics(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cost analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchAnalytics(companyId);
    }
  }, [companyId, fetchAnalytics]);

  return {
    fleetAnalytics,
    fuelAnalytics,
    costAnalytics,
    loading,
    error,
    fetchAnalytics,
    fetchFleetAnalytics,
    fetchFuelAnalytics,
    fetchCostAnalytics,
  };
}
