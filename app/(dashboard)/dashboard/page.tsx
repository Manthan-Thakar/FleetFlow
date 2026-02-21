'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/firebase/services/auth.service';
import { Loader2 } from 'lucide-react';
import AdminDashboard from './components/admin-dashboard';
import ManagerDashboard from './components/manager-dashboard';
import DriverDashboard from './components/driver-dashboard';
import CustomerDashboard from './components/customer-dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-black dark:text-white" size={48} />
          <p className="text-zinc-600 dark:text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Render role-based dashboard */}
      {user.role === 'admin' && <AdminDashboard user={user} />}
      {user.role === 'manager' && <ManagerDashboard user={user} />}
      {user.role === 'driver' && <DriverDashboard user={user} />}
      {user.role === 'customer' && <CustomerDashboard user={user} />}
    </>
  );
}
