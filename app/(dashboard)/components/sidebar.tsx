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
  ChevronDown,
  Menu,
  X,
  TrendingUp,
  Calendar,
  Search,
  Clock,
  Plus,
  UserCog,
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
  const [isOpen, setIsOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static top-0 left-0 h-screen w-64 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out z-40 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black font-bold">FF</span>
            </div>
            <div className="hidden sm:block">
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
              onClick={() => setIsOpen(false)}
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
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
          {/* User Info */}
          <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <p className="text-sm font-medium text-black dark:text-white truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{user.email}</p>
          </div>

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <span>Account</span>
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 first:rounded-t-lg"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 last:rounded-b-lg flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Logout Button (Mobile) */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
