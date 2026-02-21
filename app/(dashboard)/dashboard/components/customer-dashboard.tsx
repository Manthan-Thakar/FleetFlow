'use client';

import { Package, MapPin, TrendingUp, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

interface User {
  displayName: string;
  email: string;
  role: string;
  companyId?: string;
}

export default function CustomerDashboard({ user }: { user: User }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Welcome back, {user.displayName}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 lg:p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Total Orders</p>
                <p className="text-4xl font-bold mt-2">28</p>
              </div>
              <Package className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">In Transit</p>
                <p className="text-4xl font-bold mt-2">3</p>
              </div>
              <MapPin className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Delivered This Month</p>
                <p className="text-4xl font-bold mt-2">12</p>
              </div>
              <TrendingUp className="text-purple-600" size={32} />
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Total Spent</p>
                <p className="text-4xl font-bold mt-2">$1,245</p>
              </div>
              <Clock className="text-orange-600" size={32} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
              <Plus size={20} />
              <span>Create New Order</span>
            </button>
            <Link
              href="/track"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors font-medium"
            >
              <MapPin size={20} />
              <span>Track Shipment</span>
            </Link>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800 mb-12">
          <h2 className="text-xl font-bold mb-4">Active Orders</h2>
          <div className="space-y-3">
            {[
              { id: 'ORD-001', destination: 'New York, NY', status: 'In Transit', eta: 'Today, 5:00 PM' },
              { id: 'ORD-002', destination: 'Los Angeles, CA', status: 'In Transit', eta: 'Tomorrow, 10:00 AM' },
              { id: 'ORD-003', destination: 'Chicago, IL', status: 'In Transit', eta: 'Tomorrow, 3:00 PM' },
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-white dark:hover:bg-black/50 cursor-pointer transition-colors">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Destination: {order.destination}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{order.status}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{order.eta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-zinc-200 dark:border-zinc-700">
                <tr className="text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {[
                  { id: 'ORD-010', dest: 'Boston, MA', status: 'Delivered', amount: '$89.50', date: 'Dec 15' },
                  { id: 'ORD-009', dest: 'Seattle, WA', status: 'Delivered', amount: '$156.00', date: 'Dec 14' },
                  { id: 'ORD-008', dest: 'Denver, CO', status: 'Delivered', amount: '$124.75', date: 'Dec 13' },
                  { id: 'ORD-007', dest: 'Miami, FL', status: 'Delivered', amount: '$98.25', date: 'Dec 12' },
                ].map((order) => (
                  <tr key={order.id} className="text-sm hover:bg-white dark:hover:bg-black/40 transition-colors">
                    <td className="py-3 font-medium">{order.id}</td>
                    <td className="py-3">{order.dest}</td>
                    <td className="py-3">
                      <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3">{order.amount}</td>
                    <td className="py-3">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
