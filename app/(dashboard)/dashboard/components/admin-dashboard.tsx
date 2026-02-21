'use client';

import { BarChart3, Users, Truck, Package } from 'lucide-react';
import Link from 'next/link';
import { useUserManagement } from '@/firebase/hooks/useUserManagement';
import { useVehicles } from '@/firebase/hooks/useVehicles';
import { useOrders } from '@/firebase/hooks/useOrders';

interface User {
  displayName: string;
  email: string;
  role: string;
  companyId?: string;
}

export default function AdminDashboard({ user }: { user: User }) {
  const { users, loading: usersLoading } = useUserManagement(user.companyId);
  const { vehicles, loading: vehiclesLoading } = useVehicles(user.companyId);
  const { orders, loading: ordersLoading } = useOrders(user.companyId);

  const isLoading = usersLoading || vehiclesLoading || ordersLoading;

  const totalUsers = users.length;
  const totalDrivers = users.filter(u => u.role === 'driver').length;
  const fleetVehicles = vehicles.length;
  const activeOrders = orders.filter(order =>
    order.status === 'pending' ||
    order.status === 'confirmed' ||
    order.status === 'picked-up' ||
    order.status === 'in-transit'
  ).length;

  const toDate = (value: any): Date => {
    if (!value) return new Date(0);
    if (value instanceof Date) return value;
    if (value.toDate) return value.toDate();
    return new Date(value);
  };

  const formatDate = (value: any): string => {
    const date = toDate(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
  };

  const recentUsers = [...users]
    .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())
    .slice(0, 2);

  const recentOrders = [...orders]
    .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())
    .slice(0, 2);

  const recentActivity = [
    ...recentUsers.map(u => ({
      id: `user-${u.id}`,
      title: `New user registered: ${u.displayName}`,
      time: formatDate(u.createdAt),
    })),
    ...recentOrders.map(o => ({
      id: `order-${o.id}`,
      title: `Order ${o.orderNumber || o.id.slice(0, 6)}: ${o.status}`,
      time: formatDate(o.createdAt),
    })),
  ]
    .sort((a, b) => toDate(b.time).getTime() - toDate(a.time).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
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
                <p className="text-4xl font-bold mt-2">{isLoading ? '—' : totalUsers}</p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Fleet Vehicles</p>
                <p className="text-4xl font-bold mt-2">{isLoading ? '—' : fleetVehicles}</p>
              </div>
              <Truck className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Drivers</p>
                <p className="text-4xl font-bold mt-2">{isLoading ? '—' : totalDrivers}</p>
              </div>
              <Users className="text-purple-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Active Orders</p>
                <p className="text-4xl font-bold mt-2">{isLoading ? '—' : activeOrders}</p>
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
            {recentActivity.length > 0 ? (
              recentActivity.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">No recent activity yet.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
