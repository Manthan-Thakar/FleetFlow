'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  User,
  X,
  Phone,
  MapPin,
  Calendar,
  Star,
  Award,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { inviteDriver } from '@/firebase/services/invite.service';
import { getCompanyDrivers } from '@/firebase/services/drivers.service';
import { InviteDriverData, Driver } from '@/types';
import { updateDriver, deleteDriver } from '@/firebase/services/drivers.service';

export default function DriversPage() {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    licenseNumber: '',
    licenseType: 'car',
    licenseExpiry: '',
    status: 'available' as Driver['status'],
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  });

  // Fetch drivers from Firestore
  useEffect(() => {
    const fetchDrivers = async () => {
      if (!user?.companyId) return;
      
      setLoadingDrivers(true);
      try {
        const fetchedDrivers = await getCompanyDrivers(user.companyId);
        setDrivers(fetchedDrivers);
      } catch (err) {
        console.error('Error fetching drivers:', err);
        setError('Failed to load drivers');
      } finally {
        setLoadingDrivers(false);
      }
    };

    fetchDrivers();
  }, [user?.companyId]);

  const refreshDrivers = async () => {
    if (!user?.companyId) return;
    
    try {
      const fetchedDrivers = await getCompanyDrivers(user.companyId);
      setDrivers(fetchedDrivers);
    } catch (err) {
      console.error('Error refreshing drivers:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!user?.companyId) {
        throw new Error('Company information not found');
      }

      const inviteData: InviteDriverData = {
        driverName: formData.name,
        driverEmail: formData.email,
        companyId: user.companyId,
        companyName: user.companyId, // Update with actual company name when available
        managerName: user.displayName,
        phoneNumber: formData.phoneNumber,
        licenseNumber: formData.licenseNumber,
        licenseType: formData.licenseType,
        licenseExpiry: formData.licenseExpiry,
        status: formData.status,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship,
        },
      };

      const response = await inviteDriver(inviteData);
      
      if (response.success) {
        setSuccess('Driver invited successfully!');
        setShowAddModal(false);
        resetForm();
        // Refresh the drivers list after successful invitation
        await refreshDrivers();
      } else {
        setError(response.error || 'Failed to invite driver');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite driver');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!selectedDriver) {
        throw new Error('No driver selected');
      }

      // Update driver via service
      const updatedDriver = await updateDriver(selectedDriver.id, {
        displayName: formData.name,
        phoneNumber: formData.phoneNumber,
        licenseNumber: formData.licenseNumber,
        licenseType: formData.licenseType,
        licenseExpiry: formData.licenseExpiry ? new Date(formData.licenseExpiry) : undefined,
        status: formData.status,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship,
        },
      });

      setSuccess('Driver updated successfully!');
      setShowEditModal(false);
      setSelectedDriver(null);
      resetForm();
      // Refresh the drivers list
      await refreshDrivers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update driver');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedDriver) {
      setLoading(true);
      try {
        await deleteDriver(selectedDriver.id);
        setSuccess('Driver deleted successfully!');
        setShowDeleteModal(false);
        setSelectedDriver(null);
        // Refresh the drivers list
        await refreshDrivers();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete driver');
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditModal = (driver: Driver) => {
    setSelectedDriver(driver);
    
    // Convert date to string format for the input
    let licenseExpiryString = '';
    if (driver.licenseExpiry) {
      try {
        let dateObj: Date;
        if (driver.licenseExpiry instanceof Date) {
          dateObj = driver.licenseExpiry;
        } else if (driver.licenseExpiry.toDate && typeof driver.licenseExpiry.toDate === 'function') {
          dateObj = driver.licenseExpiry.toDate();
        } else {
          dateObj = new Date(driver.licenseExpiry as any);
        }
        licenseExpiryString = dateObj.toISOString().split('T')[0];
      } catch (error) {
        licenseExpiryString = '';
      }
    }

    setFormData({
      name: driver.displayName,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      licenseType: driver.licenseType,
      licenseExpiry: licenseExpiryString,
      status: driver.status,
      emergencyContactName: driver.emergencyContact.name,
      emergencyContactPhone: driver.emergencyContact.phone,
      emergencyContactRelationship: driver.emergencyContact.relationship,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      licenseNumber: '',
      licenseType: 'car',
      licenseExpiry: '',
      status: 'available',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
    });
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = "";
    
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter || "";
    
    return  matchesStatus;
  });

  const getStatusColor = (status: Driver['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'on-trip': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'off-duty': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      if (date.toDate && typeof date.toDate === 'function') {
        // Firestore Timestamp
        return date.toDate().toLocaleDateString();
      } else if (date instanceof Date) {
        return date.toLocaleDateString();
      } else if (typeof date === 'string') {
        return new Date(date).toLocaleDateString();
      }
    } catch (error) {
      return 'Invalid date';
    }
    return 'N/A';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Drivers</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your drivers and their assignments</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
            >
              <Plus size={20} />
              <span>Add Driver</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 lg:p-8">
        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-black dark:text-white mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="on-trip">On Trip</option>
                  <option value="off-duty">Off Duty</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Total Drivers</p>
            <p className="text-2xl font-bold text-black dark:text-white mt-1">{drivers.length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Available</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {drivers.filter(d => d.status === 'available').length}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">On Trip</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {drivers.filter(d => d.status === 'on-trip').length}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Off Duty</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">
              {drivers.filter(d => d.status === 'off-duty').length}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loadingDrivers && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-black dark:text-white mx-auto mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">Loading drivers...</p>
            </div>
          </div>
        )}

        {/* Drivers Grid */}
        {!loadingDrivers && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              {/* Driver Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center">
                    <User className="text-white dark:text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-black dark:text-white">{driver.displayName}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{driver.licenseNumber}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(driver.status)}`}>
                  {driver.status}
                </span>
              </div>

              {/* Driver Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <Phone size={16} className="text-zinc-400 mr-2" />
                  <span className="text-black dark:text-white">{driver.phoneNumber}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar size={16} className="text-zinc-400 mr-2" />
                  <span className="text-black dark:text-white">License Expiry: {formatDate(driver.licenseExpiry)}</span>
                </div>
                {driver.currentVehicleId && (
                  <div className="flex items-center text-sm">
                    <MapPin size={16} className="text-zinc-400 mr-2" />
                    <span className="text-black dark:text-white">Vehicle: {driver.currentVehicleId}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Star size={16} className="text-yellow-500 mr-2" />
                  <span className="text-black dark:text-white">{driver.ratings.average.toFixed(1)} ({driver.ratings.totalReviews} reviews)</span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Trips</p>
                  <p className="font-semibold text-black dark:text-white">{driver.performanceMetrics.totalTrips}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Distance</p>
                  <p className="font-semibold text-black dark:text-white">{driver.performanceMetrics.totalDistance.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Hours</p>
                  <p className="font-semibold text-black dark:text-white">{driver.performanceMetrics.totalHours}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Incidents</p>
                  <p className="font-semibold text-black dark:text-white">{driver.performanceMetrics.incidents}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => {
                    setSelectedDriver(driver);
                    setShowViewModal(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm"
                >
                  <Eye size={16} />
                  <span>View</span>
                </button>
                <button
                  onClick={() => openEditModal(driver)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedDriver(driver);
                    setShowDeleteModal(true);
                  }}
                  className="px-3 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {filteredDrivers.length === 0 && !loadingDrivers && (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-zinc-400 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">No drivers found</p>
          </div>
        )}
      </main>

      {/* Add/Edit Driver Modal */}
      {(showAddModal || showEditModal) && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
              setShowEditModal(false);
              resetForm();
            }
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-3xl w-full my-8 relative">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 rounded-t-xl flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center shrink-0">
                  <User className="text-white dark:text-black" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">
                    {showEditModal ? 'Edit Driver' : 'Add New Driver'}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {showEditModal ? 'Update driver information' : 'Add a new driver to your fleet'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                type="button"
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors shrink-0 ml-4"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={showEditModal ? handleEdit : handleSubmit} className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">Personal Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., John Smith"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g., john@example.com"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., +1 234-567-8900"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="on-trip">On Trip</option>
                    <option value="off-duty">Off Duty</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* License Information */}
                <div className="md:col-span-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">License Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., DL12345678"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    License Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="licenseType"
                    value={formData.licenseType}
                    onChange={handleInputChange}
                    placeholder="e.g., Commercial"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    License Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="licenseExpiry"
                    value={formData.licenseExpiry}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="md:col-span-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">Emergency Contact</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    placeholder="e.g., Jane Smith"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    placeholder="e.g., +1 234-567-8901"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={handleInputChange}
                    placeholder="e.g., Spouse"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex space-x-3 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{showEditModal ? 'Update Driver' : 'Add Driver'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Driver Modal */}
      {showViewModal && selectedDriver && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowViewModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <User className="text-white dark:text-black" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">{selectedDriver.displayName}</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedDriver.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Status Badge */}
              <div className="mb-6">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedDriver.status)}`}>
                  {selectedDriver.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Phone Number</p>
                    <p className="text-base font-semibold text-black dark:text-white">{selectedDriver.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Email</p>
                    <p className="text-base font-semibold text-black dark:text-white">{selectedDriver.email}</p>
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-3">License Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">License Number</p>
                    <p className="text-base font-semibold text-black dark:text-white">{selectedDriver.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">License Type</p>
                    <p className="text-base font-semibold text-black dark:text-white">{selectedDriver.licenseType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Expiry Date</p>
                    <p className="text-base font-semibold text-black dark:text-white">
                      {formatDate(selectedDriver.licenseExpiry)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Name</p>
                    <p className="text-base font-semibold text-black dark:text-white">{selectedDriver.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Phone</p>
                    <p className="text-base font-semibold text-black dark:text-white">{selectedDriver.emergencyContact.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Relationship</p>
                    <p className="text-base font-semibold text-black dark:text-white">{selectedDriver.emergencyContact.relationship}</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-center">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Trips</p>
                    <p className="text-2xl font-bold text-black dark:text-white">{selectedDriver.performanceMetrics.totalTrips}</p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-center">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Distance</p>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      {selectedDriver.performanceMetrics.totalDistance.toLocaleString()} km
                    </p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-center">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Hours</p>
                    <p className="text-2xl font-bold text-black dark:text-white">{selectedDriver.performanceMetrics.totalHours}</p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-center">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Incidents</p>
                    <p className="text-2xl font-bold text-black dark:text-white">{selectedDriver.performanceMetrics.incidents}</p>
                  </div>
                </div>
              </div>

              {/* Ratings */}
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white mb-3">Ratings & Reviews</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Average Rating</p>
                    <div className="flex items-center space-x-2">
                      <Star className="text-yellow-500" size={20} fill="currentColor" />
                      <p className="text-2xl font-bold text-black dark:text-white">{selectedDriver.ratings.average.toFixed(1)}</p>
                    </div>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Reviews</p>
                    <p className="text-2xl font-bold text-black dark:text-white">{selectedDriver.ratings.totalReviews}</p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">On-Time Delivery</p>
                    <p className="text-2xl font-bold text-black dark:text-white">{selectedDriver.ratings.onTimeDelivery}%</p>
                  </div>
                </div>
              </div>

              {selectedDriver.currentVehicleId && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    <strong>Currently assigned to:</strong> {selectedDriver.currentVehicleId}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
                <Trash2 className="text-red-600 dark:text-red-400" size={32} />
              </div>
              
              <h2 className="text-2xl font-bold text-black dark:text-white text-center mb-2">
                Delete Driver?
              </h2>
              
              <p className="text-zinc-600 dark:text-zinc-400 text-center mb-2">
                Are you sure you want to delete this driver?
              </p>

              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold text-black dark:text-white mb-1">
                  {selectedDriver.displayName}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {selectedDriver.email}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  License: {selectedDriver.licenseNumber}
                </p>
              </div>

              <p className="text-sm text-red-600 dark:text-red-400 text-center mt-4">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDriver(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
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
