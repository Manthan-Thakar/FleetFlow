'use client';

import { useState } from 'react';
import { Package, Search, Loader2, Eye, X, Filter, MapPin, Phone, Calendar, DollarSign, Truck, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { useOrders } from '@/firebase/hooks/useOrders';
import { Order } from '@/types';

export default function DeliveriesPage() {
  const { user } = useAuth();
  const { orders, loading, analytics } = useOrders(user?.companyId);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Order | null>(null);

  // Use Firebase data instead of mock data
  const deliveries = orders as any[];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="text-green-600 dark:text-green-400" size={20} />;
      case 'in-transit':
        return <Truck className="text-blue-600 dark:text-blue-400" size={20} />;
      case 'pending':
        return <Clock className="text-amber-600 dark:text-amber-400" size={20} />;
      case 'failed':
        return <AlertCircle className="text-red-600 dark:text-red-400" size={20} />;
      default:
        return <Package className="text-zinc-600 dark:text-zinc-400" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'in-transit':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'pending':
        return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'failed':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-zinc-50 dark:bg-zinc-900/20 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      default:
        return 'bg-zinc-100 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-400';
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch =
      delivery.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customerPhone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (delivery: any) => {
    setSelectedDelivery(delivery);
    setShowDetailModal(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">Deliveries</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Track and manage delivery orders</p>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1">
            <input
              type="text"
                placeholder="Search by order number, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-black dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-black dark:text-white">{deliveries.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
            <p className="text-xs text-green-600 dark:text-green-400 mb-1">Delivered</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
              {deliveries.filter(d => d.status === 'delivered').length}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">In Transit</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              {deliveries.filter(d => d.status === 'in-transit').length}
            </p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Pending</p>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">
              {deliveries.filter(d => d.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Deliveries List */}
        {filteredDeliveries.length === 0 ? (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <Package className="mx-auto text-zinc-400 mb-4" size={48} />
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">No deliveries found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(delivery.status)}
                        <h3 className="text-lg font-semibold text-black dark:text-white">{delivery.orderNumber}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(delivery.priority)}`}>
                        {delivery.priority}
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400">{delivery.customerName}</p>
                  </div>
                  <button
                    onClick={() => handleViewDetails(delivery)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Eye size={20} className="text-zinc-600 dark:text-zinc-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-zinc-600 dark:text-zinc-400" />
                    <span className="text-zinc-600 dark:text-zinc-400 truncate">{delivery.deliveryLocation.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package size={16} className="text-zinc-600 dark:text-zinc-400" />
                    <span className="text-zinc-600 dark:text-zinc-400">{delivery.items.length} items</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={16} className="text-zinc-600 dark:text-zinc-400" />
                    <span className="text-zinc-600 dark:text-zinc-400">${delivery.pricing.totalPrice}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-zinc-600 dark:text-zinc-400" />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {new Date(delivery.scheduledDeliveryTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-black dark:text-white">{selectedDelivery.orderNumber}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Priority */}
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedDelivery.status)}`}>
                  {selectedDelivery.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedDelivery.priority)}`}>
                  {selectedDelivery.priority}
                </span>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-black dark:text-white">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Name</p>
                    <p className="font-semibold text-black dark:text-white">{selectedDelivery.customerName}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone size={14} className="text-zinc-600 dark:text-zinc-400" />
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Phone</p>
                    </div>
                    <p className="font-semibold text-black dark:text-white">{selectedDelivery.customerPhone}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 md:col-span-2">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Email</p>
                    <p className="font-semibold text-black dark:text-white">{selectedDelivery.customerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-3">
                <h3 className="font-semibold text-black dark:text-white">Delivery Route</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-blue-600 dark:text-blue-400 mt-1" size={20} />
                      <div className="flex-1">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Pickup Location</p>
                        <p className="font-semibold text-black dark:text-white">{selectedDelivery.pickupLocation.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-green-600 dark:text-green-400 mt-1" size={20} />
                      <div className="flex-1">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">Delivery Location</p>
                        <p className="font-semibold text-black dark:text-white">{selectedDelivery.deliveryLocation.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h3 className="font-semibold text-black dark:text-white">Items</h3>
                <div className="space-y-2">
                  {selectedDelivery.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-black dark:text-white">{item.name}</p>
                        <span className="text-xs bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white px-2 py-1 rounded">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {item.weight && (
                          <p className="text-zinc-600 dark:text-zinc-400">Weight: {item.weight} kg</p>
                        )}
                        {item.value && (
                          <p className="text-zinc-600 dark:text-zinc-400">Value: ${item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing and Timing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Total Price</p>
                  <p className="text-2xl font-bold text-black dark:text-white">${selectedDelivery.pricing.totalPrice}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Scheduled Delivery</p>
                  <p className="text-lg font-semibold text-black dark:text-white">
                    {new Date(selectedDelivery.scheduledDeliveryTime).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
