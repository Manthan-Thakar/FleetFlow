'use client';

import { QueryClient, QueryClientProvider as TanstackQueryProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config/firebaseConfig';

const queryClient = new QueryClient();

function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is authenticated, fetch their data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const userRole = userData?.role || 'customer';

            // Navigate to appropriate dashboard based on role
            // Avoid navigating if already on the correct page
            if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') {
              switch (userRole) {
                case 'admin':
                  router.push('/dashboard');
                  break;
                case 'manager':
                  router.push('/dashboard');
                  break;
                case 'driver':
                  router.push('/dashboard/routes');
                  break;
                case 'customer':
                  router.push('/dashboard/orders');
                  break;
                default:
                  router.push('/dashboard/orders');
              }
            }
          }
        } else {
          // User is not authenticated
          // Redirect to login if on protected routes
          if (pathname?.startsWith('/dashboard')) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}

export function QueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TanstackQueryProvider client={queryClient}>
        {children}
      </TanstackQueryProvider>
    </AuthProvider>
  );
}
