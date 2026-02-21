// lib/hooks/use-auth.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  signIn as signInService,
  signUp as signUpService,
  signOut as signOutService,
  getCurrentUser,
  getRedirectPathByRole,
  type SignInData,
  type SignUpData,
} from '@/lib/services/auth.service';
import { User } from '@/types';

// ===== Query Keys =====
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'current-user'] as const,
  verify: () => [...authKeys.all, 'verify'] as const,
};

// ===== useCurrentUser Hook =====
/**
 * Hook to get the current authenticated user
 * Automatically refetches on window focus
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
  });
}

// ===== useSignIn Hook =====
/**
 * Hook to sign in a user
 * Redirects to appropriate dashboard on success
 */
export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SignInData) => {
      return await signInService(data);
    },
    onSuccess: (data) => {
      // Update the current user cache
      queryClient.setQueryData(authKeys.currentUser(), data.user);

      // Invalidate all queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['auth'] });

      // Redirect based on user role
      const redirectPath = getRedirectPathByRole(data.user.role);
      router.push(redirectPath);
    },
    onError: (error: Error) => {
      console.error('Sign in error:', error);
    },
  });
}

// ===== useSignUp Hook =====
/**
 * Hook to sign up a new user
 * Redirects to appropriate dashboard on success
 */
export function useSignUp() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SignUpData) => {
      return await signUpService(data);
    },
    onSuccess: (data) => {
      // Update the current user cache
      queryClient.setQueryData(authKeys.currentUser(), data.user);

      // Invalidate all queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });

      // Redirect based on user role
      const redirectPath = getRedirectPathByRole(data.user.role);
      router.push(redirectPath);
    },
    onError: (error: Error) => {
      console.error('Sign up error:', error);
    },
  });
}

// ===== useSignOut Hook =====
/**
 * Hook to sign out the current user
 * Redirects to login page on success
 */
export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOutService,
    onSuccess: () => {
      // Clear all cached queries
      queryClient.clear();

      // Redirect to login
      router.push('/login');
    },
    onError: (error: Error) => {
      console.error('Sign out error:', error);
    },
  });
}

// ===== useResetPassword Hook =====
/**
 * Hook to send password reset email
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      return data;
    },
    onError: (error: Error) => {
      console.error('Reset password error:', error);
    },
  });
}

// ===== useAuthCheck Hook =====
/**
 * Hook to check if user is authenticated
 * Useful for protected routes
 */
export function useAuthCheck() {
  const { data: user, isLoading, error } = useCurrentUser();

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
    error,
  };
}

// ===== useRequireAuth Hook =====
/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthCheck();

  if (!isLoading && !isAuthenticated) {
    router.push(redirectTo);
  }

  return { isLoading, user };
}

// ===== useRequireRole Hook =====
/**
 * Hook to require specific role
 * Redirects if user doesn't have the required role
 */
export function useRequireRole(
  allowedRoles: User['role'][],
  redirectTo: string = '/dashboard'
) {
  const router = useRouter();
  const { user, isLoading } = useAuthCheck();

  if (!isLoading && user && !allowedRoles.includes(user.role)) {
    router.push(redirectTo);
  }

  return { isLoading, user };
}

// ===== Helper Hooks =====

/**
 * Hook to check if user has specific role
 */
export function useHasRole(role: User['role']) {
  const { user } = useCurrentUser();
  return user?.role === role;
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin() {
  return useHasRole('admin');
}

/**
 * Hook to check if user is manager or admin
 */
export function useIsManager() {
  const { user } = useCurrentUser();
  return user?.role === 'manager' || user?.role === 'admin';
}

/**
 * Hook to check if user is driver
 */
export function useIsDriver() {
  return useHasRole('driver');
}

/**
 * Hook to check if user is customer
 */
export function useIsCustomer() {
  return useHasRole('customer');
}
