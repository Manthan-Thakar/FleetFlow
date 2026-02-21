'use client';

import { Truck, Users, MapPin, Package, Activity } from 'lucide-react';
import Link from 'next/link';

interface User {
  displayName: string;
  email: string;
  role: string;
  companyId?: string;
}

export default function ManagerDashboard({ user }: { user: User }) {
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
                <p className="text-4xl font-bold mt-2">12</p>
              </div>
              <Truck className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">In Transit</p>
                <p className="text-4xl font-bold mt-2">8</p>
              </div>
              <Activity className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Available Drivers</p>
                <p className="text-4xl font-bold mt-2">6</p>
              </div>
              <Users className="text-purple-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Pending Deliveries</p>
                <p className="text-4xl font-bold mt-2">24</p>
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                <div>
                  <p className="font-medium">Route #{1000 + i}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Driver: John Doe • 8 stops</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">In Progress</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">2.3 km remaining</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
