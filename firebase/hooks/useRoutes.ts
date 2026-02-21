// firebase/hooks/useRoutes.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Route, RouteStatus } from '@/types';
import {
  getRoute,
  getCompanyRoutes,
  getRoutesByStatus,
  getDriverRoutes,
  createRoute,
  updateRoute,
  updateRouteStatus,
  assignRoute,
  startRoute,
  completeRoute,
  deleteRoute,
  optimizeRoute,
} from '@/firebase/services/routes.service';

export function useRoutes(companyId?: string) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch company routes
  const fetchRoutes = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCompanyRoutes(cId);
      setRoutes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchRoutes(companyId);
    }
  }, [companyId, fetchRoutes]);

  // Create route
  const handleCreateRoute = useCallback(
    async (routeData: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);
      try {
        const newRoute = await createRoute(routeData);
        setRoutes(prev => [newRoute, ...prev]);
        return newRoute;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create route';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update route
  const handleUpdateRoute = useCallback(
    async (routeId: string, updates: Partial<Route>) => {
      setLoading(true);
      setError(null);
      try {
        await updateRoute(routeId, updates);
        setRoutes(prev =>
          prev.map(r => (r.id === routeId ? { ...r, ...updates } : r))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update route';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update route status
  const handleUpdateStatus = useCallback(
    async (routeId: string, status: RouteStatus) => {
      setLoading(true);
      setError(null);
      try {
        await updateRouteStatus(routeId, status);
        setRoutes(prev =>
          prev.map(r => (r.id === routeId ? { ...r, status } : r))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update route status';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Assign route
  const handleAssignRoute = useCallback(
    async (routeId: string, driverId: string, vehicleId: string) => {
      setLoading(true);
      setError(null);
      try {
        await assignRoute(routeId, driverId, vehicleId);
        setRoutes(prev =>
          prev.map(r =>
            r.id === routeId
              ? { ...r, assignedDriverId: driverId, assignedVehicleId: vehicleId, status: 'planned' }
              : r
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to assign route';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Start route
  const handleStartRoute = useCallback(
    async (routeId: string) => {
      setLoading(true);
      setError(null);
      try {
        await startRoute(routeId);
        setRoutes(prev =>
          prev.map(r =>
            r.id === routeId ? { ...r, status: 'in-progress' as RouteStatus } : r
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start route';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Complete route
  const handleCompleteRoute = useCallback(
    async (routeId: string) => {
      setLoading(true);
      setError(null);
      try {
        await completeRoute(routeId);
        setRoutes(prev =>
          prev.map(r =>
            r.id === routeId ? { ...r, status: 'completed' as RouteStatus } : r
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to complete route';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete route
  const handleDeleteRoute = useCallback(
    async (routeId: string) => {
      setLoading(true);
      setError(null);
      try {
        await deleteRoute(routeId);
        setRoutes(prev => prev.filter(r => r.id !== routeId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete route';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get routes by status
  const getRoutesByStatusFilter = useCallback(
    async (cId: string, status: RouteStatus) => {
      try {
        return await getRoutesByStatus(cId, status);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch routes';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Get driver routes
  const getDriverRoutesData = useCallback(
    async (driverId: string) => {
      try {
        return await getDriverRoutes(driverId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch driver routes';
        setError(message);
        throw err;
      }
    },
    []
  );

  return {
    routes,
    loading,
    error,
    fetchRoutes,
    createRoute: handleCreateRoute,
    updateRoute: handleUpdateRoute,
    updateStatus: handleUpdateStatus,
    assignRoute: handleAssignRoute,
    startRoute: handleStartRoute,
    completeRoute: handleCompleteRoute,
    deleteRoute: handleDeleteRoute,
    getRoutesByStatus: getRoutesByStatusFilter,
    getDriverRoutes: getDriverRoutesData,
  };
}

// Single route hook
export function useRoute(routeId?: string) {
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!routeId) {
      setRoute(null);
      return;
    }

    setLoading(true);
    getRoute(routeId)
      .then(setRoute)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load route'))
      .finally(() => setLoading(false));
  }, [routeId]);

  return { route, loading, error };
}
