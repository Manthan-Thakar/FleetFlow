// firebase/hooks/useCompany.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { CompanyService, Company } from '@/firebase/services/CompanyService';

export function useCompany(companyId?: string) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    if (!companyId) {
      setCompany(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetchedCompany = await CompanyService.getCompany(companyId);
      setCompany(fetchedCompany);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const updateCompany = useCallback(async (updates: Partial<Company>) => {
    if (!companyId) throw new Error('No company ID provided');
    
    setLoading(true);
    setError(null);
    try {
      await CompanyService.updateCompany(companyId, updates);
      setCompany(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const updateSettings = useCallback(async (settings: Company['settings']) => {
    if (!companyId) throw new Error('No company ID provided');
    
    setLoading(true);
    setError(null);
    try {
      await CompanyService.updateCompanySettings(companyId, settings);
      setCompany(prev => prev ? { ...prev, settings } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const updateLogo = useCallback(async (logoURL: string) => {
    if (!companyId) throw new Error('No company ID provided');
    
    setLoading(true);
    setError(null);
    try {
      await CompanyService.updateCompanyLogo(companyId, logoURL);
      setCompany(prev => prev ? { ...prev, logoURL } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update logo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  return {
    company,
    loading,
    error,
    refetch: fetchCompany,
    updateCompany,
    updateSettings,
    updateLogo,
  };
}
