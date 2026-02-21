// firebase/hooks/useOrders.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Order } from '@/types';
import {
  getCompanyOrders,
  getOrdersByStatus,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderAnalytics,
} from '@/firebase/services/orders.service';

export function useOrders(companyId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Fetch all orders
  const fetchOrders = useCallback(async (cId: string) => {
    if (!cId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCompanyOrders(cId);
      setOrders(data);

      // Fetch analytics
      const analyticsData = await getOrderAnalytics(cId);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch orders by status
  const fetchOrdersByStatus = useCallback(async (cId: string, status: Order['status']) => {
    if (!cId) return [];

    setLoading(true);
    setError(null);
    try {
      const data = await getOrdersByStatus(cId, status);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create order
  const handleCreateOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newOrder = await createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);

      // Update analytics
      if (companyId) {
        const analyticsData = await getOrderAnalytics(companyId);
        setAnalytics(analyticsData);
      }

      return newOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create order';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Update order
  const handleUpdateOrder = useCallback(async (orderId: string, updates: Partial<Order>) => {
    setLoading(true);
    setError(null);
    try {
      await updateOrder(orderId, updates);
      setOrders(prev =>
        prev.map(order => (order.id === orderId ? { ...order, ...updates } : order))
      );

      // Update analytics
      if (companyId) {
        const analyticsData = await getOrderAnalytics(companyId);
        setAnalytics(analyticsData);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Delete order
  const handleDeleteOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteOrder(orderId);
      setOrders(prev => prev.filter(order => order.id !== orderId));

      // Update analytics
      if (companyId) {
        const analyticsData = await getOrderAnalytics(companyId);
        setAnalytics(analyticsData);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete order';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchOrders(companyId);
    }
  }, [companyId, fetchOrders]);

  return {
    orders,
    loading,
    error,
    analytics,
    fetchOrders,
    fetchOrdersByStatus,
    createOrder: handleCreateOrder,
    updateOrder: handleUpdateOrder,
    deleteOrder: handleDeleteOrder,
  };
}
