'use client';

import { BarChart3, Users, Truck, Package } from 'lucide-react';
import Link from 'next/link';

interface User {
  displayName: string;
  email: string;
  role: string;
  companyId?: string;
}

export default function AdminDashboard({ user }: { user: User }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Total Users</p>
                <p className="text-4xl font-bold mt-2">24</p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Fleet Vehicles</p>
                <p className="text-4xl font-bold mt-2">42</p>
              </div>
              <Truck className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Drivers</p>
                <p className="text-4xl font-bold mt-2">18</p>
              </div>
              <Users className="text-purple-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Active Orders</p>
                <p className="text-4xl font-bold mt-2">156</p>
              </div>
              <Package className="text-orange-600" size={32} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/drivers"
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <Users className="text-blue-600 mb-4" size={32} />
              <h3 className="font-semibold mb-2">Manage Drivers</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Add, edit, and manage driver profiles</p>
            </Link>

            <Link
              href="/fleet"
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <Truck className="text-green-600 mb-4" size={32} />
              <h3 className="font-semibold mb-2">Manage Fleet</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Monitor vehicles and maintenance</p>
            </Link>

            <Link
              href="/analytics"
              className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <BarChart3 className="text-purple-600 mb-4" size={32} />
              <h3 className="font-semibold mb-2">View Analytics</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Check system performance and reports</p>
            </Link>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
              <div>
                <p className="font-medium">New driver registered: John Smith</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
              <div>
                <p className="font-medium">Vehicle maintenance scheduled</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
              <div>
                <p className="font-medium">System backup completed</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
