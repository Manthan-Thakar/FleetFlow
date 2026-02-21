'use client';

import { MapPin, Package, Clock, Star, Navigation } from 'lucide-react';
import Link from 'next/link';

interface User {
  displayName: string;
  email: string;
  role: string;
  companyId?: string;
}

export default function DriverDashboard({ user }: { user: User }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4">
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
            <p className="text-3xl font-bold mb-2">Route #1001</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">8 deliveries planned</p>
            <div className="mt-4 p-3 bg-white dark:bg-black/30 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium">Status: <span className="text-green-600">In Progress</span></p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/10 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Deliveries Today</p>
              <Package className="text-orange-600" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">5 / 8</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Completed deliveries</p>
            <div className="mt-4 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '62.5%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Earnings Today</p>
              <Star className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">$245.50</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Rating: 4.8 / 5.0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/my-routes"
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <MapPin className="text-blue-600 mb-4" size={32} />
              <h3 className="font-semibold mb-2">View My Route</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Check route details and navigation</p>
            </Link>

            <Link
              href="/my-vehicle"
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <Navigation className="text-green-600 mb-4" size={32} />
              <h3 className="font-semibold mb-2">My Vehicle</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">View assigned vehicle details</p>
            </Link>
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800 mb-12">
          <h2 className="text-xl font-bold mb-4">Today's Deliveries</h2>
          <div className="space-y-3">
            {[
              { id: 1, customer: 'Acme Corp', address: '123 Main St', status: 'Delivered', time: '10:30 AM' },
              { id: 2, customer: 'Tech Solutions', address: '456 Oak Ave', status: 'Delivered', time: '11:15 AM' },
              { id: 3, customer: 'Global Logistics', address: '789 Pine Rd', status: 'In Transit', time: 'Just arrived' },
              { id: 4, customer: 'FastShip Co', address: '321 Elm St', status: 'Pending', time: '2:00 PM' },
            ].map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <div>
                  <p className="font-medium">{delivery.customer}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{delivery.address}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium text-sm ${
                    delivery.status === 'Delivered' ? 'text-green-600' :
                    delivery.status === 'In Transit' ? 'text-blue-600' :
                    'text-orange-600'
                  }`}>
                    {delivery.status}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{delivery.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">On-Time Rate</p>
            <p className="text-3xl font-bold mt-2">96%</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Total Trips</p>
            <p className="text-3xl font-bold mt-2">342</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Distance This Month</p>
            <p className="text-3xl font-bold mt-2">2,450 km</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Average Rating</p>
            <p className="text-3xl font-bold mt-2">4.8★</p>
          </div>
        </div>
      </main>
    </div>
  );
}
