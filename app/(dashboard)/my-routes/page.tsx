'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, Package, Loader2, Eye, X, Phone, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { useDriver } from '@/firebase/hooks/useDriver';
import { useRoutes } from '@/firebase/hooks/useRoutes';
import { Route } from '@/types';

export default function MyRoutesPage() {
  const { user } = useAuth();
  const [driverId, setDriverId] = useState<string | undefined>();
  const { driver } = useDriver(driverId);
  const { routes, loading } = useRoutes(user?.companyId);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get driver ID from user's metadata if user is a driver
  useEffect(() => {
    if (user?.role === 'driver' && user?.id) {
      setDriverId(user.id);
    }
  }, [user]);

  // Filter routes assigned to current driver
  const myRoutes = routes.filter(route => route.assignedDriverId === driverId);

  const filteredRoutes = myRoutes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'in-progress':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'planned':
        return 'bg-zinc-50 dark:bg-zinc-900/20 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800';
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-zinc-50 dark:bg-zinc-900/20 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800';
    }
  };

  const handleViewDetails = (route: Route) => {
    setSelectedRoute(route);
    setShowDetailModal(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">My Routes</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your assigned routes</p>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {/* Search Bar */}
        <div className="mb-8 flex items-center gap-3">
          <input
            type="text"
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={48} className="mx-auto animate-spin text-zinc-400 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">Loading your routes...</p>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <MapPin className="mx-auto text-zinc-400 mb-4" size={48} />
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">No routes assigned yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-black dark:text-white">{route.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(route.status)}`}>
                        {route.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDetails(route)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Eye size={20} className="text-zinc-600 dark:text-zinc-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Distance</p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {(route.distance || 0).toFixed(2)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Duration</p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {Math.floor((route.estimatedDuration || 0) / 60)}h {(route.estimatedDuration || 0) % 60}m
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Waypoints</p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {route.waypoints?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Packages</p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {route.orders?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedRoute && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black dark:text-white">{selectedRoute.name}</h2>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedRoute.status)}`}>
                    {selectedRoute.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Total Distance</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{(selectedRoute.distance || 0).toFixed(2)} km</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Estimated Duration</p>
                  <p className="text-lg font-semibold text-black dark:text-white">
                    {Math.floor((selectedRoute.estimatedDuration || 0) / 60)}h {(selectedRoute.estimatedDuration || 0) % 60}m
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Packages</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{selectedRoute.orders?.length || 0}</p>
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-3">
                <h3 className="font-semibold text-black dark:text-white">Route Locations</h3>
                <div className="space-y-3">
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-blue-600 dark:text-blue-400 mt-1" size={20} />
                      <div className="flex-1">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Origin</p>
                        <p className="text-black dark:text-white font-medium">{selectedRoute.origin?.address}</p>
                      </div>
                    </div>
                  </div>

                  {selectedRoute.waypoints && selectedRoute.waypoints.length > 0 && (
                    <div className="space-y-2">
                      {selectedRoute.waypoints.map((waypoint, idx) => (
                        <div key={idx} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="text-amber-600 dark:text-amber-400 mt-1" size={20} />
                            <div className="flex-1">
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Stop {waypoint.sequenceNumber}</p>
                              <p className="text-black dark:text-white font-medium">{waypoint.address}</p>
                              {waypoint.stopDuration && (
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Duration: {waypoint.stopDuration} min</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-green-600 dark:text-green-400 mt-1" size={20} />
                      <div className="flex-1">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Destination</p>
                        <p className="text-black dark:text-white font-medium">{selectedRoute.destination?.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders */}
              {selectedRoute.orders && selectedRoute.orders.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-black dark:text-white">Orders</h3>
                  <div className="space-y-2">
                    {selectedRoute.orders.map((orderId, idx) => (
                      <div key={idx} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 flex items-center gap-3">
                        <Package size={18} className="text-zinc-600 dark:text-zinc-400" />
                        <span className="text-sm text-black dark:text-white font-medium">{orderId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
