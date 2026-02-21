'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Truck,
  Users,
  Map,
  Package,
  BarChart3,
  Wrench,
  Settings,
  LogOut,
  TrendingUp,
  Calendar,
  Search,
  Clock,
  Plus,
  UserCog,
  X,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from '@/lib/services/auth.service';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  displayName: string;
  email: string;
  role: 'admin' | 'manager' | 'driver' | 'customer';
  companyId?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems: Record<string, NavItem[]> = {
    admin: [
      { label: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
      { label: 'Fleet', href: '/fleet', icon: <Truck size={20} /> },
      { label: 'Drivers', href: '/drivers', icon: <Users size={20} /> },
      { label: 'Routes', href: '/routes', icon: <Map size={20} /> },
      { label: 'Orders', href: '/orders', icon: <Package size={20} /> },
      { label: 'Analytics', href: '/analytics', icon: <BarChart3 size={20} /> },
      { label: 'Maintenance', href: '/maintenance', icon: <Wrench size={20} /> },
      { label: 'Users', href: '/users', icon: <UserCog size={20} /> },
      { label: 'Settings', href: '/settings', icon: <Settings size={20} /> },
    ],
    manager: [
      { label: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
      { label: 'Fleet', href: '/fleet', icon: <Truck size={20} /> },
      { label: 'Drivers', href: '/drivers', icon: <Users size={20} /> },
      { label: 'Routes', href: '/routes', icon: <Map size={20} /> },
      { label: 'Orders', href: '/orders', icon: <Package size={20} /> },
      { label: 'Reports', href: '/reports', icon: <BarChart3 size={20} /> },
      { label: 'Maintenance', href: '/maintenance', icon: <Wrench size={20} /> },
    ],
    driver: [
      { label: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
      { label: 'My Routes', href: '/my-routes', icon: <Map size={20} /> },
      { label: 'My Vehicle', href: '/my-vehicle', icon: <Truck size={20} /> },
      { label: 'Deliveries', href: '/deliveries', icon: <Package size={20} /> },
      { label: 'Schedule', href: '/schedule', icon: <Calendar size={20} /> },
      { label: 'Performance', href: '/performance', icon: <TrendingUp size={20} /> },
    ],
    customer: [
      { label: 'Track Shipment', href: '/track', icon: <Search size={20} /> },
      { label: 'My Orders', href: '/orders', icon: <Package size={20} /> },
      { label: 'New Order', href: '/orders/new', icon: <Plus size={20} /> },
      { label: 'History', href: '/history', icon: <Clock size={20} /> },
    ],
  };

  const items = navigationItems[user.role] || [];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black font-bold">FF</span>
            </div>
            <div>
              <p className="font-bold text-black dark:text-white">FleetFlow</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">{user.role}</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-3 flex-shrink-0">
          {/* User Info */}
          <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <p className="text-sm font-medium text-black dark:text-white truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{user.email}</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Modal Content */}
            <div className="pr-8">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <LogOut className="text-red-600 dark:text-red-400" size={24} />
              </div>
              
              <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
                Confirm Logout
              </h2>
              
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Are you sure you want to logout? You will need to sign in again to access your account.
              </p>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
