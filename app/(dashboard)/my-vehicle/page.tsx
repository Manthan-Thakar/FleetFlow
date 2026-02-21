'use client';

import { useState, useEffect } from 'react';
import { Truck, Loader2, AlertCircle, Zap, Weight, Gauge, Calendar, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { useDriver } from '@/firebase/hooks/useDriver';
import { useVehicles } from '@/firebase/hooks/useVehicles';
import { Vehicle } from '@/types';

export default function MyVehiclePage() {
  const { user } = useAuth();
  const [driverId, setDriverId] = useState<string | undefined>();
  const { driver } = useDriver(driverId);
  const { vehicles, loading } = useVehicles(user?.companyId);

  // Get driver ID from user's metadata if user is a driver
  useEffect(() => {
    if (user?.role === 'driver' && user?.id) {
      setDriverId(user.id);
    }
  }, [user]);

  // Get the vehicle assigned to the current driver
  const assignedVehicle = vehicles.find(v => v.assignedDriverId === driverId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'maintenance':
        return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'inactive':
        return 'bg-zinc-50 dark:bg-zinc-900/20 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800';
      case 'retired':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-zinc-50 dark:bg-zinc-900/20 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'truck':
        return '🚚';
      case 'van':
        return '🚐';
      case 'car':
        return '🚗';
      case 'bike':
        return '🏍️';
      default:
        return '🚗';
    }
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
          <h1 className="text-3xl font-bold text-black dark:text-white">My Vehicle</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">View details of your assigned vehicle</p>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={48} className="mx-auto animate-spin text-zinc-400 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">Loading vehicle information...</p>
          </div>
        ) : !assignedVehicle ? (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <Truck className="mx-auto text-zinc-400 mb-4" size={48} />
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">No vehicle assigned yet</p>
            <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2">Contact your manager to get a vehicle assigned to you</p>
          </div>
        ) : (
          <div className="max-w-4xl">
            {/* Main Vehicle Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-6xl">{getTypeIcon(assignedVehicle.type)}</span>
                    <div>
                      <h2 className="text-3xl font-bold text-black dark:text-white">
                        {assignedVehicle.make} {assignedVehicle.model}
                      </h2>
                      <p className="text-zinc-600 dark:text-zinc-400">Year: {assignedVehicle.year}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(assignedVehicle.status)}`}>
                  {assignedVehicle.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Registration Number</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{assignedVehicle.registrationNumber}</p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Vehicle Type</p>
                  <p className="text-lg font-semibold text-black dark:text-white capitalize">{assignedVehicle.type}</p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Fuel Type</p>
                  <p className="text-lg font-semibold text-black dark:text-white capitalize">{assignedVehicle.fuelType}</p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Ownership</p>
                  <p className="text-lg font-semibold text-black dark:text-white capitalize">{assignedVehicle.ownership}</p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Fuel Efficiency</p>
                  <p className="text-lg font-semibold text-black dark:text-white">
                    {assignedVehicle.fuelEfficiency || 'N/A'} km/L
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Capacity</p>
                  <p className="text-lg font-semibold text-black dark:text-white">
                    {assignedVehicle.capacity.weight} kg
                    {assignedVehicle.capacity.volume && ` / ${assignedVehicle.capacity.volume} m³`}
                  </p>
                </div>
              </div>

              {/* Capacity Details */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Capacity Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Weight className="text-blue-600 dark:text-blue-400 mt-1" size={20} />
                    <div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Max Weight</p>
                      <p className="text-lg font-semibold text-black dark:text-white">{assignedVehicle.capacity.weight} kg</p>
                    </div>
                  </div>

                  {assignedVehicle.capacity.volume && (
                    <div className="flex items-start gap-3">
                      <Gauge className="text-blue-600 dark:text-blue-400 mt-1" size={20} />
                      <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Max Volume</p>
                        <p className="text-lg font-semibold text-black dark:text-white">{assignedVehicle.capacity.volume} m³</p>
                      </div>
                    </div>
                  )}

                  {assignedVehicle.capacity.passengers && (
                    <div className="flex items-start gap-3">
                      <Truck className="text-blue-600 dark:text-blue-400 mt-1" size={20} />
                      <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Passengers</p>
                        <p className="text-lg font-semibold text-black dark:text-white">{assignedVehicle.capacity.passengers}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Information */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Insurance Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Insurance Provider</p>
                    <p className="text-lg font-semibold text-black dark:text-white">{assignedVehicle.insurance.provider || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Policy Number</p>
                    <p className="text-lg font-semibold text-black dark:text-white">{assignedVehicle.insurance.policyNumber || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Expiry Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="text-amber-600 dark:text-amber-400" size={20} />
                      <p className="text-lg font-semibold text-black dark:text-white">
                        {(assignedVehicle.insurance.expiryDate instanceof Date ? assignedVehicle.insurance.expiryDate : assignedVehicle.insurance.expiryDate.toDate()).toLocaleDateString()}
                      </p>
                      {(assignedVehicle.insurance.expiryDate instanceof Date ? assignedVehicle.insurance.expiryDate : assignedVehicle.insurance.expiryDate.toDate()) < new Date() && (
                        <span className="ml-2 px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">
                          Expired
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Location */}
              {assignedVehicle.location && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Current Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Address</p>
                      <p className="text-lg font-semibold text-black dark:text-white">{assignedVehicle.location.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Coordinates</p>
                      <p className="text-sm font-mono text-black dark:text-white">
                        {assignedVehicle.location.latitude}, {assignedVehicle.location.longitude}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Report Issue
              </button>
              <button className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-black dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                View Maintenance History
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
