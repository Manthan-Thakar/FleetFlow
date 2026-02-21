'use client';

import { useEffect, useState } from 'react';
import {
  Plus, Search, Filter, ArrowUpDown, Truck, MapPin, Package,
  Eye, Trash2, X, CheckCircle, Clock, AlertCircle, XCircle,
  Navigation, Fuel, Weight, ChevronDown, Loader2
} from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { useOrders } from '@/firebase/hooks/useOrders';
import { useVehicles } from '@/firebase/hooks/useVehicles';
import { useCompanyDrivers } from '@/firebase/hooks/useDriver';
import { Order } from '@/types';

type TripStatus = 'booked' | 'in-transit' | 'delivered' | 'cancelled';

interface Trip {
  id: string;
  tripId: string;
  fleetType: string;
  vehicleId: string;
  vehicleName: string;
  vehicleCapacity: number;
  driverId: string;
  driverName: string;
  origin: string;
  destination: string;
  cargoWeight: number;
  estimatedFuelCost: number;
  status: TripStatus;
  dispatchedAt: string;
  estimatedArrival?: string;
  completedAt?: string;
  notes?: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders, loading, analytics, createOrder } = useOrders(user?.companyId);
  const { vehicles, loading: vehiclesLoading } = useVehicles(user?.companyId);
  const { drivers, loading: driversLoading } = useCompanyDrivers(user?.companyId);
  
  const [showDispatchForm, setShowDispatchForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('dispatchedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [cargoError, setCargoError] = useState('');

  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    origin: '',
    destination: '',
    estimatedFuelCost: '',
    notes: '',
  });

  const [trips, setTrips] = useState<Trip[]>([]);

  const mapOrderStatusToTripStatus = (status: Order['status']): TripStatus => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'booked';
      case 'picked-up':
      case 'in-transit':
        return 'in-transit';
      case 'delivered':
        return 'delivered';
      case 'cancelled':
      case 'failed':
        return 'cancelled';
      default:
        return 'booked';
    }
  };

  const toIsoString = (value: any): string => {
    if (!value) return new Date().toISOString();
    if (value instanceof Date) return value.toISOString();
    if (value.toDate) return value.toDate().toISOString();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  };

  const formatDateTime = (value: any): string => {
    if (!value) return '—';
    const date = value instanceof Date ? value : value.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
  };

  useEffect(() => {
    const driverNameById = new Map(drivers.map(d => [d.id, d.displayName]));
    const vehicleById = new Map(vehicles.map(v => [v.id, v]));

    setTrips(
      orders.map(order => {
        const vehicle = order.assignedVehicleId ? vehicleById.get(order.assignedVehicleId) : undefined;
        return {
          id: order.id,
          tripId: order.orderNumber || `TRP-${order.id.slice(0, 6).toUpperCase()}`,
          fleetType: vehicle?.type || '',
          vehicleId: order.assignedVehicleId || '',
          vehicleName: vehicle?.registrationNumber || '',
          vehicleCapacity: vehicle?.capacity?.weight || 0,
          driverId: order.assignedDriverId || '',
          driverName: order.assignedDriverId ? (driverNameById.get(order.assignedDriverId) || '') : '',
          origin: order.pickupLocation?.address || '',
          destination: order.deliveryLocation?.address || '',
          cargoWeight: order.totalWeight || 0,
          estimatedFuelCost: order.pricing?.totalPrice || 0,
          status: mapOrderStatusToTripStatus(order.status),
          dispatchedAt: toIsoString(order.createdAt),
          notes: order.specialInstructions || undefined,
        };
      })
    );
  }, [orders, drivers, vehicles]);

  const getStatusConfig = (status: TripStatus) => {
    switch (status) {
      case 'booked':
        return { label: 'Booked', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <Clock size={12} /> };
      case 'in-transit':
        return { label: 'On Way', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Navigation size={12} /> };
      case 'delivered':
        return { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle size={12} /> };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle size={12} /> };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'cargoWeight' || name === 'vehicleId') {
      const vehicleId = name === 'vehicleId' ? value : formData.vehicleId;
      const cargoWeightVal = name === 'cargoWeight' ? parseFloat(value) : parseFloat(formData.cargoWeight);
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle && cargoWeightVal > (vehicle.capacity?.weight || 0)) {
        setCargoError(`Too heavy! This vehicle's max capacity is ${(vehicle.capacity?.weight || 0).toLocaleString()} kg.`);
      } else {
        setCargoError('');
      }
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cargoError) return;
    if (!user?.companyId || !user.id) return;

    const vehicle = vehicles.find(v => v.id === formData.vehicleId);
    const driver = drivers.find(d => d.id === formData.driverId);

    const now = new Date();
    const orderNumber = `TRP-${String(orders.length + 1).padStart(3, '0')}`;
    const cargoWeight = parseFloat(formData.cargoWeight) || 0;
    const estimatedFuelCost = parseFloat(formData.estimatedFuelCost) || 0;

    try {
      await createOrder({
        companyId: user.companyId,
        orderNumber,
        customerId: user.id,
        customerName: user.displayName || 'Company User',
        customerPhone: user.phoneNumber || 'N/A',
        customerEmail: user.email || undefined,
        pickupLocation: {
          address: formData.origin,
          latitude: 0,
          longitude: 0,
        },
        deliveryLocation: {
          address: formData.destination,
          latitude: 0,
          longitude: 0,
        },
        items: [
          {
            name: 'Cargo',
            description: formData.notes || undefined,
            quantity: 1,
            weight: cargoWeight,
          },
        ],
        totalWeight: cargoWeight,
        totalValue: 0,
        status: 'confirmed',
        priority: 'medium',
        assignedVehicleId: formData.vehicleId || undefined,
        assignedDriverId: formData.driverId || undefined,
        tracking: [
          {
            status: 'confirmed',
            timestamp: now,
            updatedBy: user.id,
            notes: 'Trip created',
          },
        ],
        pricing: {
          basePrice: estimatedFuelCost,
          totalPrice: estimatedFuelCost,
          currency: 'INR',
        },
        paymentStatus: 'pending',
        specialInstructions: formData.notes || undefined,
      });

      setShowDispatchForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  const handleDelete = () => {
    if (selectedTrip) {
      setTrips(prev => prev.filter(t => t.id !== selectedTrip.id));
      setShowDeleteModal(false);
      setSelectedTrip(null);
    }
  };

  const resetForm = () => {
    setFormData({ vehicleId: '', driverId: '', cargoWeight: '', origin: '', destination: '', estimatedFuelCost: '', notes: '' });
    setCargoError('');
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filteredTrips = trips
    .filter(trip => {
      const matchesSearch =
        trip.tripId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.fleetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.driverName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let valA: string | number = a[sortField as keyof Trip] as string | number ?? '';
      let valB: string | number = b[sortField as keyof Trip] as string | number ?? '';
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const SortButton = ({ field, label }: { field: string; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left text-sm font-semibold text-black dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300"
    >
      <span>{label}</span>
      <ArrowUpDown size={14} className={sortField === field ? 'text-black dark:text-white' : 'text-zinc-400'} />
    </button>
  );

  const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Trip Dispatcher</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">Book, dispatch, and track trips</p>
            </div>
            <button
              onClick={() => { setShowDispatchForm(true); resetForm(); }}
              className="flex items-center space-x-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-semibold shadow-lg"
            >
              <Plus size={20} />
              <span>New Trip</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Trips</p>
            <p className="text-3xl font-bold text-black dark:text-white">{trips.length}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Booked</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{trips.filter(t => t.status === 'booked').length}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">In Transit</p>
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{trips.filter(t => t.status === 'in-transit').length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Delivered</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">{trips.filter(t => t.status === 'delivered').length}</p>
          </div>
        </div>

        {/* Search + Filter toolbar */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search trips, vehicles, drivers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2.5 border rounded-lg transition-colors font-medium ${
              showFilters
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                : 'border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button
            onClick={() => handleSort('dispatchedAt')}
            className="flex items-center space-x-2 px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium"
          >
            <ArrowUpDown size={18} />
            <span>Sort by Date</span>
          </button>
        </div>

        {/* Status filter pills */}
        {showFilters && (
          <div className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Trips' },
              { key: 'booked', label: 'Booked' },
              { key: 'in-transit', label: 'In Transit' },
              { key: 'delivered', label: 'Delivered' },
              { key: 'cancelled', label: 'Cancelled' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === opt.key
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Trips Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-4 py-4 text-left text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase">#</th>
                <th className="px-4 py-4 text-left"><SortButton field="fleetType" label="Trip Fleet Type" /></th>
                <th className="px-4 py-4 text-left"><SortButton field="driverName" label="Driver" /></th>
                <th className="px-4 py-4 text-left"><SortButton field="origin" label="Origin" /></th>
                <th className="px-4 py-4 text-left"><SortButton field="destination" label="Destination" /></th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-black dark:text-white">Cargo</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-black dark:text-white">Fuel Est.</th>
                <th className="px-4 py-4 text-left"><SortButton field="status" label="Status" /></th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip, idx) => {
                const statusCfg = getStatusConfig(trip.status);
                return (
                  <tr key={trip.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-4 text-sm text-zinc-500 dark:text-zinc-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-black dark:bg-white rounded-lg flex items-center justify-center shrink-0">
                          <Truck className="text-white dark:text-black" size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-black dark:text-white text-sm">{trip.fleetType}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{trip.tripId} · {trip.vehicleName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-black dark:text-white">{trip.driverName}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1 text-sm text-black dark:text-white">
                        <MapPin size={13} className="text-zinc-400 shrink-0" />
                        <span>{trip.origin}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1 text-sm text-black dark:text-white">
                        <Navigation size={13} className="text-zinc-400 shrink-0" />
                        <span>{trip.destination}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-black dark:text-white">{trip.cargoWeight.toLocaleString()} kg</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-black dark:text-white">₹{trip.estimatedFuelCost.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.icon}
                        <span>{statusCfg.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => { setSelectedTrip(trip); setShowViewModal(true); }}
                          className="p-2 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => { setSelectedTrip(trip); setShowDeleteModal(true); }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTrips.length === 0 && (
            <div className="text-center py-16">
              <Truck size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">No trips found</p>
              <p className="text-zinc-400 dark:text-zinc-600 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>

      {/* ── New Trip / Dispatch Form Modal ── */}
      {showDispatchForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4"
          onClick={e => { if (e.target === e.currentTarget) { setShowDispatchForm(false); resetForm(); } }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-2xl w-full my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 rounded-t-xl z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                  <Truck className="text-white dark:text-black" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">New Trip Form</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Confirm & dispatch a trip</p>
                </div>
              </div>
              <button
                onClick={() => { setShowDispatchForm(false); resetForm(); }}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleDispatch} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Select Vehicle */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Select Vehicle <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="vehicleId"
                      value={formData.vehicleId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white appearance-none"
                    >
                      <option value="">-- Select a vehicle --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.registrationNumber} (max {(v.capacity?.weight || 0).toLocaleString()} kg)</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  </div>
                  {selectedVehicle && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                      Capacity: <span className="font-semibold">{(selectedVehicle.capacity?.weight || 0).toLocaleString()} kg</span>
                    </p>
                  )}
                </div>

                {/* Cargo Weight */}
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    <span className="flex items-center space-x-1"><Weight size={14} /><span>Cargo Weight (kg)</span></span>
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    name="cargoWeight"
                    value={formData.cargoWeight}
                    onChange={handleInputChange}
                    placeholder="e.g., 2000"
                    min={1}
                    required
                    className={`w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white ${
                      cargoError ? 'border-red-500 dark:border-red-500' : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                  />
                  {cargoError && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center space-x-1">
                      <AlertCircle size={12} /><span>{cargoError}</span>
                    </p>
                  )}
                </div>

                {/* Select Driver */}
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Select Driver <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="driverId"
                      value={formData.driverId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white appearance-none"
                    >
                      <option value="">-- Select a driver --</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.displayName}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* Origin */}
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    <span className="flex items-center space-x-1"><MapPin size={14} /><span>Origin Address</span></span>
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="e.g., Mumbai"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    <span className="flex items-center space-x-1"><Navigation size={14} /><span>Destination</span></span>
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="e.g., Pune"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                {/* Estimated Fuel Cost */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    <span className="flex items-center space-x-1"><Fuel size={14} /><span>Estimated Fuel Cost (₹)</span></span>
                  </label>
                  <input
                    type="number"
                    name="estimatedFuelCost"
                    value={formData.estimatedFuelCost}
                    onChange={handleInputChange}
                    placeholder="e.g., 4500"
                    min={0}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional instructions..."
                    rows={2}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex space-x-3 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setShowDispatchForm(false); resetForm(); }}
                  className="flex-1 px-5 py-3 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!cargoError}
                  className="flex-1 flex items-center justify-center space-x-2 px-5 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={18} />
                  <span>Confirm & Dispatch Trip</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Trip Modal ── */}
      {showViewModal && selectedTrip && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowViewModal(false); }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                  <Truck className="text-white dark:text-black" size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black dark:text-white">{selectedTrip.tripId}</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{selectedTrip.fleetType}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusConfig(selectedTrip.status).color}`}>
                  {getStatusConfig(selectedTrip.status).icon}
                  <span>{getStatusConfig(selectedTrip.status).label}</span>
                </span>
              </div>

              {/* Route */}
              <div>
                <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Route</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">From</p>
                    <p className="font-semibold text-black dark:text-white">{selectedTrip.origin}</p>
                  </div>
                  <Navigation size={20} className="text-zinc-400 shrink-0" />
                  <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">To</p>
                    <p className="font-semibold text-black dark:text-white">{selectedTrip.destination}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle & Driver */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Vehicle</h3>
                  <p className="font-semibold text-black dark:text-white">{selectedTrip.vehicleName}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Cap: {selectedTrip.vehicleCapacity.toLocaleString()} kg</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Driver</h3>
                  <p className="font-semibold text-black dark:text-white">{selectedTrip.driverName}</p>
                </div>
              </div>

              {/* Cargo & Fuel */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 flex items-center space-x-1"><Weight size={12} /><span>Cargo Weight</span></p>
                  <p className="text-xl font-bold text-black dark:text-white">{selectedTrip.cargoWeight.toLocaleString()} kg</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {Math.round((selectedTrip.cargoWeight / selectedTrip.vehicleCapacity) * 100)}% capacity
                  </p>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 flex items-center space-x-1"><Fuel size={12} /><span>Fuel Est.</span></p>
                  <p className="text-xl font-bold text-black dark:text-white">₹{selectedTrip.estimatedFuelCost.toLocaleString()}</p>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Dispatched</span>
                    <span className="text-black dark:text-white font-medium">{formatDateTime(selectedTrip.dispatchedAt)}</span>
                  </div>
                  {selectedTrip.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">Completed</span>
                      <span className="text-black dark:text-white font-medium">{formatDateTime(selectedTrip.completedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedTrip.notes && (
                <div>
                  <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Notes</h3>
                  <p className="text-black dark:text-white text-sm">{selectedTrip.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteModal && selectedTrip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
              <Trash2 className="text-red-600 dark:text-red-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-black dark:text-white text-center mb-2">Delete Trip?</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-center mb-4">This action cannot be undone.</p>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mb-6 text-sm">
              <p className="font-semibold text-black dark:text-white">{selectedTrip.tripId} — {selectedTrip.fleetType}</p>
              <p className="text-zinc-500 dark:text-zinc-400">{selectedTrip.origin} → {selectedTrip.destination}</p>
              <p className="text-zinc-500 dark:text-zinc-400">Driver: {selectedTrip.driverName}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedTrip(null); }}
                className="flex-1 px-5 py-3 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
