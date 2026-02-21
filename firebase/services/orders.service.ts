// firebase/services/orders.service.ts
import { db } from '@/firebase/config/firebaseConfig';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  collection,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Order } from '@/types';
import { cleanData } from '@/firebase/utils/firebaseDataCleaner';

/**
 * Get all orders for a company
 */
export const getCompanyOrders = async (companyId: string): Promise<Order[]> => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error: any) {
    console.error('Error fetching company orders:', error);
    throw new Error(error.message || 'Failed to fetch orders');
  }
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (
  companyId: string,
  status: Order['status']
): Promise<Order[]> => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('companyId', '==', companyId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error: any) {
    console.error('Error fetching orders by status:', error);
    throw new Error(error.message || 'Failed to fetch orders');
  }
};

/**
 * Get single order
 */
export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (!orderDoc.exists()) return null;

    return {
      id: orderDoc.id,
      ...orderDoc.data(),
    } as Order;
  } catch (error: any) {
    console.error('Error fetching order:', error);
    throw new Error(error.message || 'Failed to fetch order');
  }
};

/**
 * Create new order
 */
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
  try {
    const orderId = doc(collection(db, 'orders')).id;
    const cleanedData = cleanData({
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'orders', orderId), cleanedData);

    return {
      id: orderId,
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Order;
  } catch (error: any) {
    console.error('Error creating order:', error);
    throw new Error(error.message || 'Failed to create order');
  }
};

/**
 * Update order
 */
export const updateOrder = async (
  orderId: string,
  updates: Partial<Order>
): Promise<void> => {
  try {
    const cleanedUpdates = cleanData({
      ...updates,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'orders', orderId), cleanedUpdates);
  } catch (error: any) {
    console.error('Error updating order:', error);
    throw new Error(error.message || 'Failed to update order');
  }
};

/**
 * Delete order
 */
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error: any) {
    console.error('Error deleting order:', error);
    throw new Error(error.message || 'Failed to delete order');
  }
};

/**
 * Get order analytics
 */
export const getOrderAnalytics = async (companyId: string) => {
  try {
    const orders = await getCompanyOrders(companyId);

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const failedOrders = orders.filter(o => o.status === 'failed').length;
    const inTransitOrders = orders.filter(o => o.status === 'in-transit').length;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.pricing?.totalPrice || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      deliveredOrders,
      pendingOrders,
      failedOrders,
      inTransitOrders,
      totalRevenue,
      avgOrderValue,
      successRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0,
    };
  } catch (error: any) {
    console.error('Error fetching order analytics:', error);
    throw new Error(error.message || 'Failed to fetch order analytics');
  }
};
