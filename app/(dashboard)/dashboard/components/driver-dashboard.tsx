'use client';

import { MapPin, Package, Clock, Star, Navigation, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useOrders } from '@/firebase/hooks/useOrders';
import { useRoutes } from '@/firebase/hooks/useRoutes';
import { useDriver } from '@/firebase/hooks/useDriver';
import { useDriverPerformance } from '@/firebase/hooks/usePerformance';
import type { User } from '@/types';

export default function DriverDashboard({ user }: { user: User }) {
  const { orders, loading: ordersLoading } = useOrders(user.companyId);
  const { routes, loading: routesLoading } = useRoutes(user.companyId);
  const { driver, loading: driverLoading } = useDriver(user.id as string);
  const { latestPerformance, loading: performanceLoading } = useDriverPerformance(user.id as string);

  const isLoading = ordersLoading || routesLoading || driverLoading || performanceLoading;

  const toDate = (value: any): Date => {
    if (!value) return new Date(0);
    if (value instanceof Date) return value;
    if (value.toDate) return value.toDate();
    return new Date(value);
  };

  const driverOrders = orders.filter(order => order.assignedDriverId === user.id);
  const deliveries = [...driverOrders]
    .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())
    .slice(0, 4);

  const driverRoutes = routes.filter(route => route.assignedDriverId === user.id);
  const activeRoute = driverRoutes.find(route => route.status === 'in-progress') || driverRoutes[0];

  const completedDeliveries = driverOrders.filter(order => order.status === 'delivered').length;
  const totalDeliveries = driverOrders.length;
  const completionRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0;

  const onTimeRate = latestPerformance?.onTimeDeliveryRate ?? 0;
  const totalTrips = latestPerformance?.totalTrips ?? totalDeliveries;
  const distanceThisMonth = latestPerformance?.totalDistance ?? 0;
  const avgRating = driver?.ratings?.average ?? 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
          <h1 className="text-3xl font-bold">Driver Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Welcome, {user.displayName}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 lg:p-8">
        {/* Current Route Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Current Route</p>
              <Navigation className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">{activeRoute?.name || (isLoading ? 'Loading...' : 'No active route')}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {activeRoute ? `${(activeRoute.waypoints?.length || 0) + 2} stops planned` : '—'}
            </p>
            <div className="mt-4 p-3 bg-white dark:bg-black/30 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium">
                Status: <span className="text-green-600">{activeRoute?.status || '—'}</span>
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/10 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Deliveries Today</p>
              <Package className="text-orange-600" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">{isLoading ? '—' : `${completedDeliveries} / ${totalDeliveries}`}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Completed deliveries</p>
            <div className="mt-4 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${completionRate.toFixed(1)}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Earnings Today</p>
              <Star className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">{isLoading ? '—' : `${avgRating.toFixed(1)}★`}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Rating (avg)</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/deliveries"
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <MapPin className="text-blue-600 mb-4" size={32} />
              <h3 className="font-semibold mb-2">Deliveries</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">See assigned deliveries and statuses</p>
            </Link>

            <Link
              href="/schedule"
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <Navigation className="text-green-600 mb-4" size={32} />
              <h3 className="font-semibold mb-2">Schedule</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Review upcoming shifts</p>
            </Link>
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800 mb-12">
          <h2 className="text-xl font-bold mb-4">Today's Deliveries</h2>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <Loader2 className="animate-spin" size={16} /> Loading deliveries...
              </div>
            ) : deliveries.length > 0 ? (
              deliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <div>
                    <p className="font-medium">{delivery.customerName}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{delivery.deliveryLocation?.address || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium text-sm ${
                      delivery.status === 'delivered' ? 'text-green-600' :
                      delivery.status === 'in-transit' ? 'text-blue-600' :
                      'text-orange-600'
                    }`}>
                      {delivery.status}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{delivery.orderNumber}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">No deliveries assigned yet.</div>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">On-Time Rate</p>
            <p className="text-3xl font-bold mt-2">{isLoading ? '—' : `${onTimeRate.toFixed(1)}%`}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Total Trips</p>
            <p className="text-3xl font-bold mt-2">{isLoading ? '—' : totalTrips}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Distance This Month</p>
            <p className="text-3xl font-bold mt-2">{isLoading ? '—' : `${distanceThisMonth.toFixed(0)} km`}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Average Rating</p>
            <p className="text-3xl font-bold mt-2">{isLoading ? '—' : `${avgRating.toFixed(1)}★`}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
