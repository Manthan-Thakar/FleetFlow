'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Truck, Trash2, Eye, X, Filter, Car, Bike, Bus, Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { useVehicles } from '@/firebase/hooks/useVehicles';
import { Vehicle, VehicleStatus } from '@/types';

export default function FleetPage() {
  const { user } = useAuth();
  const { vehicles, loading, error, createVehicle, deleteVehicle } = useVehicles(user?.companyId);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'truck' as Vehicle['type'],
    capacityWeight: '',
    capacityVolume: '',
    status: 'active' as VehicleStatus,
    fuelType: 'diesel' as Vehicle['fuelType'],
    ownership: 'owned' as Vehicle['ownership'],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.companyId) return;

    setIsSubmitting(true);
    try {
      await createVehicle({
        companyId: user.companyId,
        registrationNumber: formData.registrationNumber,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        type: formData.type,
        capacity: {
          weight: Number(formData.capacityWeight),
          volume: formData.capacityVolume ? Number(formData.capacityVolume) : null,
        },
        status: formData.status,
        fuelType: formData.fuelType,
        ownership: formData.ownership,
        insurance: {
          provider: '',
          policyNumber: '',
          expiryDate: new Date(),
        },
      } as any);

      setShowAddModal(false);
      setFormData({
        registrationNumber: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        type: 'truck',
        capacityWeight: '',
        capacityVolume: '',
        status: 'active',
        fuelType: 'diesel',
        ownership: 'owned',
      });
    } catch (err) {
      console.error('Error creating vehicle:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedVehicle) {
      setIsSubmitting(true);
      try {
        await deleteVehicle(selectedVehicle.id);
        setShowDeleteModal(false);
        setSelectedVehicle(null);
      } catch (err) {
        console.error('Error deleting vehicle:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'retired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Vehicle['type']) => {
    const iconProps = { size: 24 };
    switch (type) {
      case 'truck': return <Truck {...iconProps} />;
      case 'van': return <Bus {...iconProps} />;
      case 'car': return <Car {...iconProps} />;
      case 'bike': return <Bike {...iconProps} />;
      default: return <Truck {...iconProps} />;
    }
  };

  if(!user) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Fleet</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your vehicles and fleet</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium">
              <Plus size={20} />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">{error}</div>}

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
            <input type="text" placeholder="Search vehicles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Filter size={20} /> <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-black dark:text-white mb-2">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-black dark:text-white mb-2">Vehicle Type</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                  <option value="all">All Types</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-black dark:text-white mt-1">{vehicles.length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{vehicles.filter(v => v.status === 'active').length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Maintenance</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{vehicles.filter(v => v.status === 'maintenance').length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Inactive</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">{vehicles.filter(v => v.status === 'inactive').length}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={48} className="mx-auto animate-spin text-zinc-400 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">Loading vehicles...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                        <div className="text-white dark:text-black">{getTypeIcon(vehicle.type)}</div>
                      </div>
                      <div>
                        <h3 className="font-bold text-black dark:text-white">{vehicle.registrationNumber}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{vehicle.make} {vehicle.model}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(vehicle.status)}`}>{vehicle.status}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm"><span className="text-zinc-600 dark:text-zinc-400">Year:</span><span className="text-black dark:text-white font-medium">{vehicle.year}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-zinc-600 dark:text-zinc-400">Type:</span><span className="text-black dark:text-white font-medium capitalize">{vehicle.type}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-zinc-600 dark:text-zinc-400">Capacity:</span><span className="text-black dark:text-white font-medium">{vehicle.capacity.weight} kg</span></div>
                    <div className="flex justify-between text-sm"><span className="text-zinc-600 dark:text-zinc-400">Fuel:</span><span className="text-black dark:text-white font-medium capitalize">{vehicle.fuelType}</span></div>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => { setSelectedVehicle(vehicle); setShowViewModal(true); }} className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm">
                      <Eye size={16} /> <span>View</span>
                    </button>
                    <button onClick={() => { setSelectedVehicle(vehicle); setShowDeleteModal(true); }} className="px-3 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredVehicles.length === 0 && (
              <div className="text-center py-12">
                <Truck size={48} className="mx-auto text-zinc-400 mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400">No vehicles found</p>
              </div>
            )}
          </>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-2xl w-full my-8">
            <div className="sticky top-0 bg-white dark:bg-zinc-900 rounded-t-xl flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-black dark:text-white">New Vehicle</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} placeholder="License Plate" required className="col-span-1 md:col-span-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                <input type="text" name="make" value={formData.make} onChange={handleInputChange} placeholder="Make" required className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                <input type="text" name="model" value={formData.model} onChange={handleInputChange} placeholder="Model" required className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                <input type="number" name="year" value={formData.year} onChange={handleInputChange} required className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                <select name="type" value={formData.type} onChange={handleInputChange} required className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                </select>
                <input type="number" name="capacityWeight" value={formData.capacityWeight} onChange={handleInputChange} placeholder="Capacity (kg)" required className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                <select name="status" value={formData.status} onChange={handleInputChange} required className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                  <option value="retired">Retired</option>
                </select>
                <select name="fuelType" value={formData.fuelType} onChange={handleInputChange} required className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Petrol</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <select name="ownership" value={formData.ownership} onChange={handleInputChange} required className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                  <option value="owned">Owned</option>
                  <option value="leased">Leased</option>
                </select>
              </div>

              <div className="flex space-x-3 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-2 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowViewModal(false); }}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-black dark:text-white">{selectedVehicle.registrationNumber}</h2>
              <button onClick={() => setShowViewModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><X size={24} /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div><p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Make</p><p className="text-lg font-semibold text-black dark:text-white">{selectedVehicle.make}</p></div>
                <div><p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Model</p><p className="text-lg font-semibold text-black dark:text-white">{selectedVehicle.model}</p></div>
                <div><p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Year</p><p className="text-lg font-semibold text-black dark:text-white">{selectedVehicle.year}</p></div>
                <div><p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Type</p><p className="text-lg font-semibold text-black dark:text-white capitalize">{selectedVehicle.type}</p></div>
                <div><p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Status</p><span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedVehicle.status)}`}>{selectedVehicle.status}</span></div>
                <div><p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Capacity</p><p className="text-lg font-semibold text-black dark:text-white">{selectedVehicle.capacity.weight} kg</p></div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
                <Trash2 className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-black dark:text-white text-center mb-2">Delete Vehicle?</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-center mb-4">Are you sure? This can't be undone.</p>
            </div>
            <div className="flex space-x-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button onClick={() => { setShowDeleteModal(false); setSelectedVehicle(null); }} className="flex-1 px-6 py-2 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold">Cancel</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50">{isSubmitting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
