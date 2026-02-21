// firebase/hooks/useUserManagement.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { User, UserRole, UserStatus, TeamMember, TeamStats } from '@/types';
import {
  getUserById,
  getCompanyUsers,
  getUsersByRole,
  getUsersByStatus,
  updateUserProfile,
  updateUserRole,
  updateUserStatus,
  updateUserLastLogin,
  markProfileComplete,
  deactivateUser,
  reactivateUser,
  suspendUser,
  deleteUser,
  getTeamStats,
  getTeamMembers,
  searchUsers,
  getAdmins,
  isUserAdmin,
  hasUserPermission,
  getUserProfile,
  addMember,
} from '@/firebase/services/user-management.service';

export function useUserManagement(companyId?: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all company users
  const fetchUsers = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCompanyUsers(cId);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch team statistics
  const fetchTeamStats = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const stats = await getTeamStats(cId);
      setTeamStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchUsers(companyId);
      fetchTeamStats(companyId);
    }
  }, [companyId, fetchUsers, fetchTeamStats]);

  // Update user profile
  const handleUpdateProfile = useCallback(
    async (userId: string, updates: Partial<User>) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await updateUserProfile(userId, updates);
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, ...updates } : u))
        );
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update user';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update user role
  const handleUpdateRole = useCallback(
    async (userId: string, role: UserRole) => {
      setLoading(true);
      setError(null);
      try {
        await updateUserRole(userId, role);
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, role } : u))
        );
        await fetchTeamStats(companyId || '');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update user role';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId, fetchTeamStats]
  );

  // Update user status
  const handleUpdateStatus = useCallback(
    async (userId: string, status: UserStatus) => {
      setLoading(true);
      setError(null);
      try {
        await updateUserStatus(userId, status);
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, status } : u))
        );
        await fetchTeamStats(companyId || '');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update user status';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId, fetchTeamStats]
  );

  // Deactivate user
  const handleDeactivateUser = useCallback(
    async (userId: string) => {
      setLoading(true);
      setError(null);
      try {
        await deactivateUser(userId);
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, status: 'inactive' } : u))
        );
        await fetchTeamStats(companyId || '');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to deactivate user';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId, fetchTeamStats]
  );

  // Reactivate user
  const handleReactivateUser = useCallback(
    async (userId: string) => {
      setLoading(true);
      setError(null);
      try {
        await reactivateUser(userId);
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, status: 'active' } : u))
        );
        await fetchTeamStats(companyId || '');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reactivate user';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId, fetchTeamStats]
  );

  // Suspend user
  const handleSuspendUser = useCallback(
    async (userId: string) => {
      setLoading(true);
      setError(null);
      try {
        await suspendUser(userId);
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, status: 'suspended' } : u))
        );
        await fetchTeamStats(companyId || '');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to suspend user';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId, fetchTeamStats]
  );

  // Delete user
  const handleDeleteUser = useCallback(
    async (userId: string) => {
      setLoading(true);
      setError(null);
      try {
        await deleteUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        await fetchTeamStats(companyId || '');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete user';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId, fetchTeamStats]
  );

  // Add member
  const handleAddMember = useCallback(
    async (memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);
      try {
        const newMember = await addMember(memberData);
        setUsers(prev => [...prev, newMember as any]);
        await fetchTeamStats(companyId || '');
        return newMember;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add member';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId, fetchTeamStats]
  );

  // Delete member
  const handleDeleteMember = useCallback(
    async (memberId: string) => {
      setLoading(true);
      setError(null);
      try {
        await deleteUser(memberId);
        setUsers(prev => prev.filter(u => u.id !== memberId));
        await fetchTeamStats(companyId || '');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete member';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [companyId, fetchTeamStats]
  );

  // Search users
  const handleSearchUsers = useCallback(
    async (cId: string, searchTerm: string) => {
      try {
        return await searchUsers(cId, searchTerm);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to search users';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Get users by role
  const getUsersByRoleFilter = useCallback(
    async (cId: string, role: UserRole) => {
      try {
        return await getUsersByRole(cId, role);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch users';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Get users by status
  const getUsersByStatusFilter = useCallback(
    async (cId: string, status: UserStatus) => {
      try {
        return await getUsersByStatus(cId, status);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch users';
        setError(message);
        throw err;
      }
    },
    []
  );

  return {
    users,
    members: users.filter(u => u.role !== 'admin'),
    teamStats,
    loading,
    error,
    fetchUsers,
    fetchTeamStats,
    updateProfile: handleUpdateProfile,
    updateRole: handleUpdateRole,
    updateStatus: handleUpdateStatus,
    deactivateUser: handleDeactivateUser,
    reactivateUser: handleReactivateUser,
    suspendUser: handleSuspendUser,
    deleteUser: handleDeleteUser,
    addMember: handleAddMember,
    deleteMember: handleDeleteMember,
    searchUsers: handleSearchUsers,
    getUsersByRole: getUsersByRoleFilter,
    getUsersByStatus: getUsersByStatusFilter,
  };
}

// Single user hook
export function useUser(userId?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    setLoading(true);
    getUserById(userId)
      .then(setUser)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load user'))
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}

// Team members hook
export function useTeamMembers(companyId?: string, currentUserId?: string) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getTeamMembers(cId, currentUserId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (companyId) {
      fetchMembers(companyId);
    }
  }, [companyId, fetchMembers]);

  return { members, loading, error, refetch: fetchMembers };
}

// Check permission hook
export function usePermission(userId?: string, requiredRole?: UserRole | UserRole[]) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !requiredRole) {
      setHasPermission(false);
      return;
    }

    setLoading(true);
    hasUserPermission(userId, requiredRole)
      .then(setHasPermission)
      .finally(() => setLoading(false));
  }, [userId, requiredRole]);

  return { hasPermission, loading };
}
