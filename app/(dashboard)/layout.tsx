'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config/firebaseConfig';
import { Loader2 } from 'lucide-react';
import Sidebar from './components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged waits for Firebase to restore the session from cache
    // before firing — this prevents the login redirect on reload.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setLoading(false);
        router.push('/login');
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          setLoading(false);
          router.push('/login');
          return;
        }
        const userData = userDoc.data();
        setUser({
          id: firebaseUser.uid,
          email: userData.email || firebaseUser.email,
          displayName: userData.displayName || firebaseUser.displayName || '',
          role: userData.role || 'customer',
          companyId: userData.companyId || null,
          photoURL: userData.photoURL || firebaseUser.photoURL || null,
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
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
  console.log('Authenticated user:', user);
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
