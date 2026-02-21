// firebase/hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/firebase/config/firebaseConfig';
import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  getCurrentUser,
  SignUpData,
  SignInData,
} from '@/firebase/services/auth.service';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const user: User = {
              id: firebaseUser.uid,
              email: userData.email || null,
              displayName: userData.displayName || null,
              role: userData.role,
              status: userData.status || 'active',
              companyId: userData.companyId || null,
              phoneNumber: userData.phoneNumber || null,
              photoURL: userData.photoURL || null,
              lastLoginAt: userData.lastLoginAt || null,
              createdAt: userData.createdAt || null,
              updatedAt: userData.updatedAt || null,
              isProfileComplete: userData.isProfileComplete || false,
            };
            setAuthState({
              user,
              firebaseUser,
              loading: false,
              error: null,
            });
          } else {
            setAuthState({
              user: null,
              firebaseUser: null,
              loading: false,
              error: 'User profile not found',
            });
          }
        } catch (error) {
          setAuthState({
            user: null,
            firebaseUser,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load profile',
          });
        }
      } else {
        setAuthState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignUp = useCallback(async (data: SignUpData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await signUp(data);
      // onAuthStateChange will handle the state update
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      }));
      throw error;
    }
  }, []);

  const handleSignIn = useCallback(async (data: SignInData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await signIn(data);
      // onAuthStateChange will handle the state update
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }));
      throw error;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await signOut();
      // onAuthStateChange will handle the state update
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }));
      throw error;
    }
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    user: authState.user,
    firebaseUser: authState.firebaseUser,
    loading: authState.loading,
    error: authState.error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
  };
}
