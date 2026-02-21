'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Truck, Zap, AlertCircle, Loader2, Eye, X } from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { usePerformance } from '@/firebase/hooks/usePerformance';
import { DriverPerformance, FleetPerformance } from '@/types';

export default function PerformancePage() {
  const { user } = useAuth();
  const { driverMetrics, fleetMetrics, loading, error, topPerformers, driversNeedingImprovement, overall } = usePerformance(user?.companyId);

  const [selectedMetric, setSelectedMetric] = useState<DriverPerformance | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">Performance</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Monitor KPIs and driver/fleet metrics</p>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">{error}</div>}

        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={48} className="mx-auto animate-spin text-zinc-400 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">Loading performance metrics...</p>
          </div>
        ) : (
          <>
            {/* Overall KPIs */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black dark:text-white mb-4">Overall KPIs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">On-Time Delivery</p>
                      <p className="text-2xl font-bold text-black dark:text-white">{overall?.onTimeDeliveryRate?.toFixed(1) || 0}%</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Fuel Efficiency</p>
                      <p className="text-2xl font-bold text-black dark:text-white">{overall?.fuelEfficiency?.toFixed(2) || 0} km/L</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Zap className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Avg Safety Score</p>
                      <p className="text-2xl font-bold text-black dark:text-white">{overall?.safetyScore?.toFixed(1) || 0}/10</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                      <AlertCircle className="text-amber-600 dark:text-amber-400" size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Orders</p>
                      <p className="text-2xl font-bold text-black dark:text-white">{fleetMetrics?.totalOrders || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Truck className="text-purple-600 dark:text-purple-400" size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fleet Performance */}
            {fleetMetrics && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-black dark:text-white mb-4">Fleet Performance</h2>
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Active Vehicles</p>
                      <p className="text-3xl font-bold text-green-600">{fleetMetrics.activeVehicles}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Total Distance</p>
                      <p className="text-3xl font-bold text-black dark:text-white">{fleetMetrics.totalDistance?.toFixed(0) || 0} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Avg Fuel Efficiency</p>
                      <p className="text-3xl font-bold text-amber-600">{fleetMetrics.avgFuelEfficiency?.toFixed(2) || 0} km/L</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Delivered Orders</p>
                      <p className="text-3xl font-bold text-blue-600">{fleetMetrics.deliveredOrders || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">On-Time Delivery Rate</p>
                      <p className="text-3xl font-bold text-green-600">{fleetMetrics.onTimeDeliveryRate?.toFixed(1) || 0}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Cost Per KM</p>
                      <p className="text-3xl font-bold text-purple-600">₹{fleetMetrics.costPerKm?.toFixed(2) || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Performers */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black dark:text-white mb-4">Top Performers</h2>
              <div className="space-y-3">
                {topPerformers && topPerformers.length > 0 ? (
                  topPerformers.map((driver, idx) => (
                    <div key={driver.driverId} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="font-bold text-green-600 dark:text-green-400">#{idx + 1}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-black dark:text-white">{driver.driverName}</p>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">Safety Score: {driver.safetyScore?.toFixed(1) || 0}/10</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{driver.onTimeDeliveryRate?.toFixed(1) || 0}%</p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">On-Time</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white dark:bg-zinc-800 p-2 rounded">
                          <p className="text-zinc-600 dark:text-zinc-400">Trips</p>
                          <p className="font-semibold text-black dark:text-white">{driver.totalTrips || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-2 rounded">
                          <p className="text-zinc-600 dark:text-zinc-400">Compliance</p>
                          <p className="font-semibold text-black dark:text-white">{driver.complianceScore?.toFixed(1) || 0}/100</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-2 rounded">
                          <p className="text-zinc-600 dark:text-zinc-400">Distance</p>
                          <p className="font-semibold text-black dark:text-white">{(driver.totalDistance || 0)?.toFixed(0)} km</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">No performance data available</div>
                )}
              </div>
            </div>

            {/* Drivers Needing Improvement */}
            <div>
              <h2 className="text-xl font-bold text-black dark:text-white mb-4">Drivers Needing Improvement</h2>
              <div className="space-y-3">
                {driversNeedingImprovement && driversNeedingImprovement.length > 0 ? (
                  driversNeedingImprovement.map((driver) => (
                    <div key={driver.driverId} className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4 hover:border-red-400 dark:hover:border-red-600 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                            </div>
                            <div>
                              <p className="font-semibold text-black dark:text-white">{driver.driverName}</p>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">Compliance: {driver.complianceScore?.toFixed(1) || 0}/100</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-600">{driver.safetyScore?.toFixed(1) || 0}/10</p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Safety</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white dark:bg-zinc-800 p-2 rounded">
                          <p className="text-zinc-600 dark:text-zinc-400">Trips</p>
                          <p className="font-semibold text-black dark:text-white">{driver.totalTrips || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-2 rounded">
                          <p className="text-zinc-600 dark:text-zinc-400">On-Time Rate</p>
                          <p className="font-semibold text-red-600">{driver.onTimeDeliveryRate?.toFixed(1) || 0}%</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-2 rounded">
                          <p className="text-zinc-600 dark:text-zinc-400">Distance</p>
                          <p className="font-semibold text-red-600">{(driver.totalDistance || 0)?.toFixed(0)} km</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">No drivers need urgent improvement</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
