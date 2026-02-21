'use client';

import { Truck, Users, MapPin, Package, Activity } from 'lucide-react';
import Link from 'next/link';
import { useVehicles } from '@/firebase/hooks/useVehicles';
import { useOrders } from '@/firebase/hooks/useOrders';
import { useRoutes } from '@/firebase/hooks/useRoutes';
import { useCompanyDrivers } from '@/firebase/hooks/useDriver';

interface User {
  displayName: string;
  email: string;
  role: string;
  companyId?: string;
}

export default function ManagerDashboard({ user }: { user: User }) {
  const { vehicles, loading: vehiclesLoading } = useVehicles(user.companyId);
  const { orders, loading: ordersLoading } = useOrders(user.companyId);
  const { routes, loading: routesLoading } = useRoutes(user.companyId);
  const { drivers, loading: driversLoading } = useCompanyDrivers(user.companyId);

  const isLoading = vehiclesLoading || ordersLoading || routesLoading || driversLoading;

  const availableVehicles = vehicles.filter(vehicle => vehicle.status === 'active').length;
  const inTransitOrders = orders.filter(order => order.status === 'in-transit').length;
  const availableDrivers = drivers.filter(driver => driver.status === 'available').length;
  const pendingDeliveries = orders.filter(order => order.status === 'pending' || order.status === 'confirmed').length;

  const driverNameById = new Map(drivers.map(driver => [driver.id, driver.displayName]));
  const activeRoutes = routes.filter(route => route.status === 'in-progress').slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
          <h1 className="text-3xl font-bold">Fleet Manager Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Welcome back, {user.displayName}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 lg:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Available Vehicles</p>
                <p className="text-4xl font-bold mt-2">{isLoading ? '—' : availableVehicles}</p>
              </div>
              <Truck className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">In Transit</p>
                <p className="text-4xl font-bold mt-2">{isLoading ? '—' : inTransitOrders}</p>
              </div>
              <Activity className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Available Drivers</p>
                <p className="text-4xl font-bold mt-2">{isLoading ? '—' : availableDrivers}</p>
              </div>
              <Users className="text-purple-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Pending Deliveries</p>
                <p className="text-4xl font-bold mt-2">{isLoading ? '—' : pendingDeliveries}</p>
              </div>
              <Package className="text-orange-600" size={32} />
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Fleet Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/drivers"
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-8 hover:shadow-lg transition-shadow"
            >
              <Users className="text-blue-600 mb-4" size={40} />
              <h3 className="text-xl font-semibold mb-2">Drivers</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Assign tasks, track drivers, manage status</p>
              <p className="text-blue-600 font-medium mt-4">View All →</p>
            </Link>

            <Link
              href="/fleet"
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-8 hover:shadow-lg transition-shadow"
            >
              <Truck className="text-green-600 mb-4" size={40} />
              <h3 className="text-xl font-semibold mb-2">Vehicles</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Monitor fleet, track maintenance, allocate vehicles</p>
              <p className="text-green-600 font-medium mt-4">View All →</p>
            </Link>

            <Link
              href="/routes"
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-8 hover:shadow-lg transition-shadow"
            >
              <MapPin className="text-purple-600 mb-4" size={40} />
              <h3 className="text-xl font-semibold mb-2">Routes</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Plan routes, optimize paths, track progress</p>
              <p className="text-purple-600 font-medium mt-4">View All →</p>
            </Link>

            <Link
              href="/orders"
              className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-8 hover:shadow-lg transition-shadow"
            >
              <Package className="text-orange-600 mb-4" size={40} />
              <h3 className="text-xl font-semibold mb-2">Orders</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Create orders, assign to drivers, track status</p>
              <p className="text-orange-600 font-medium mt-4">View All →</p>
            </Link>
          </div>
        </div>

        {/* Active Routes */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold mb-4">Active Routes</h2>
          <div className="space-y-3">
            {activeRoutes.length > 0 ? (
              activeRoutes.map(route => (
                <div key={route.id} className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                  <div>
                    <p className="font-medium">{route.name}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Driver: {route.assignedDriverId ? (driverNameById.get(route.assignedDriverId) || 'Unassigned') : 'Unassigned'} • Stops: {(route.waypoints?.length || 0) + 2}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">In Progress</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{route.distance.toFixed(1)} km</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">No active routes right now.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
