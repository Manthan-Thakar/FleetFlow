// firebase/hooks/useUser.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserService, UserProfile } from '@/firebase/services/UserService';

export function useUser(userId?: string) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    UserService.getUser(userId)
      .then(setUser)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load user'))
      .finally(() => setLoading(false));
  }, [userId]);

  const updateUser = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId) throw new Error('No user ID provided');
    
    setLoading(true);
    setError(null);
    try {
      await UserService.updateUser(userId, updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const deleteUser = useCallback(async () => {
    if (!userId) throw new Error('No user ID provided');
    
    setLoading(true);
    setError(null);
    try {
      await UserService.deleteUser(userId);
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    user,
    loading,
    error,
    updateUser,
    deleteUser,
  };
}

export function useUsers(companyId?: string, role?: string) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!companyId) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetchedUsers = role
        ? await UserService.getUsersByRole(companyId, role)
        : await UserService.getUsersByCompany(companyId);
      setUsers(fetchedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [companyId, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
}
