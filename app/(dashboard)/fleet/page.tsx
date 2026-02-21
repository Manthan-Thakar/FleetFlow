'use client';

import { useState } from 'react';
import { Plus, Search, Truck, Edit, Trash2, Eye, X, Calendar, Gauge, Filter } from 'lucide-react';

interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  type: 'truck' | 'van' | 'car' | 'bike';
  capacity: {
    weight: number;
    volume?: number;
  };
  status: 'active' | 'maintenance' | 'inactive' | 'retired';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  ownership: 'owned' | 'leased';
  assignedDriver?: string;
}

export default function FleetPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'truck' as Vehicle['type'],
    capacityWeight: '',
    capacityVolume: '',
    status: 'active' as Vehicle['status'],
    fuelType: 'diesel' as Vehicle['fuelType'],
    ownership: 'owned' as Vehicle['ownership'],
    fuelEfficiency: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiryDate: '',
  });

  // Mock data - Replace with actual API call
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      registrationNumber: 'MH 02 2017',
      make: 'Tata',
      model: 'Ace',
      year: 2019,
      type: 'truck',
      capacity: { weight: 1000, volume: 15 },
      status: 'active',
      fuelType: 'diesel',
      ownership: 'owned',
      assignedDriver: 'John Smith',
    },
    {
      id: '2',
      registrationNumber: 'MH 12 5678',
      make: 'Mahindra',
      model: 'Bolero',
      year: 2020,
      type: 'van',
      capacity: { weight: 800 },
      status: 'active',
      fuelType: 'diesel',
      ownership: 'leased',
    },
    {
      id: '3',
      registrationNumber: 'GJ 01 9876',
      make: 'Maruti',
      model: 'Eeco',
      year: 2021,
      type: 'van',
      capacity: { weight: 500 },
      status: 'maintenance',
      fuelType: 'petrol',
      ownership: 'owned',
    },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVehicle: Vehicle = {
      id: String(vehicles.length + 1),
      registrationNumber: formData.registrationNumber,
      make: formData.make,
      model: formData.model,
      year: formData.year,
      type: formData.type,
      capacity: {
        weight: Number(formData.capacityWeight),
        volume: formData.capacityVolume ? Number(formData.capacityVolume) : undefined,
      },
      status: formData.status,
      fuelType: formData.fuelType,
      ownership: formData.ownership,
    };

    setVehicles(prev => [...prev, newVehicle]);
    setShowAddModal(false);
    
    // Reset form
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
      fuelEfficiency: '',
      insuranceProvider: '',
      insurancePolicyNumber: '',
      insuranceExpiryDate: '',
    });
  };

  const handleDelete = () => {
    if (selectedVehicle) {
      setVehicles(prev => prev.filter(v => v.id !== selectedVehicle.id));
      setShowDeleteModal(false);
      setSelectedVehicle(null);
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

  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'retired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Vehicle['type']) => {
    switch (type) {
      case 'truck': return '🚛';
      case 'van': return '🚐';
      case 'car': return '🚗';
      case 'bike': return '🏍️';
      default: return '🚚';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Fleet</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your vehicles and fleet</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
            >
              <Plus size={20} />
              <span>Add Vehicle</span>
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
              placeholder="Search vehicles..."
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
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-black dark:text-white mb-2">Vehicle Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                >
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Total Vehicles</p>
            <p className="text-2xl font-bold text-black dark:text-white mt-1">{vehicles.length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {vehicles.filter(v => v.status === 'active').length}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">In Maintenance</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {vehicles.filter(v => v.status === 'maintenance').length}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Inactive</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">
              {vehicles.filter(v => v.status === 'inactive').length}
            </p>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              {/* Vehicle Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getTypeIcon(vehicle.type)}</div>
                  <div>
                    <h3 className="font-bold text-black dark:text-white">{vehicle.registrationNumber}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {vehicle.make} {vehicle.model}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Year:</span>
                  <span className="text-black dark:text-white font-medium">{vehicle.year}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Type:</span>
                  <span className="text-black dark:text-white font-medium capitalize">{vehicle.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Capacity:</span>
                  <span className="text-black dark:text-white font-medium">{vehicle.capacity.weight} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Fuel:</span>
                  <span className="text-black dark:text-white font-medium capitalize">{vehicle.fuelType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Ownership:</span>
                  <span className="text-black dark:text-white font-medium capitalize">{vehicle.ownership}</span>
                </div>
                {vehicle.assignedDriver && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Driver:</span>
                    <span className="text-black dark:text-white font-medium">{vehicle.assignedDriver}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button 
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setShowViewModal(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm"
                >
                  <Eye size={16} />
                  <span>View</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm">
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => {
                    setSelectedVehicle(vehicle);
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

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Truck size={48} className="mx-auto text-zinc-400 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">No vehicles found</p>
          </div>
        )}
      </main>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-3xl w-full my-8 relative">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 rounded-t-xl flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="text-white dark:text-black" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">New Vehicle Registration</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">Add a new vehicle to your fleet</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                type="button"
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex-shrink-0 ml-4"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* License Plate / Registration Number */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    License Plate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., MH 02 2017"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">The unique ID for each vehicle so you don't mix them up</p>
                </div>

                {/* Make/Model */}
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Make <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    placeholder="e.g., Tata"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">The specific name/make of the vehicle</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g., Ace"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  >
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                  </select>
                </div>

                {/* Capacity Weight */}
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Capacity (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacityWeight"
                    value={formData.capacityWeight}
                    onChange={handleInputChange}
                    placeholder="e.g., 1000"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">Max Load Capacity: How much weight the vehicle can safely carry (e.g in kg or tons)</p>
                </div>

                {/* Capacity Volume */}
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Volume (m³)
                  </label>
                  <input
                    type="number"
                    name="capacityVolume"
                    value={formData.capacityVolume}
                    onChange={handleInputChange}
                    placeholder="e.g., 15"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                {/* Status */}
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
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Fuel Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  >
                    <option value="diesel">Diesel</option>
                    <option value="petrol">Petrol</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Fuel Efficiency */}
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Fuel Efficiency (km/l)
                  </label>
                  <input
                    type="number"
                    name="fuelEfficiency"
                    value={formData.fuelEfficiency}
                    onChange={handleInputChange}
                    placeholder="e.g., 15"
                    step="0.1"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                {/* Ownership */}
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Ownership <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="ownership"
                    value={formData.ownership}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  >
                    <option value="owned">Owned</option>
                    <option value="leased">Leased</option>
                  </select>
                </div>

                {/* Insurance Section */}
                <div className="md:col-span-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center space-x-2">
                    <Calendar size={20} />
                    <span>Insurance Information</span>
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleInputChange}
                    placeholder="e.g., ICICI Lombard"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    name="insurancePolicyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., POL123456"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="insuranceExpiryDate"
                    value={formData.insuranceExpiryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex space-x-3 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-semibold shadow-lg"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Vehicle Modal */}
      {showViewModal && selectedVehicle && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowViewModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                  <span className="text-3xl">{getTypeIcon(selectedVehicle.type)}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">{selectedVehicle.registrationNumber}</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedVehicle.make} {selectedVehicle.model}</p>
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
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Registration Number</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{selectedVehicle.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedVehicle.status)}`}>
                    {selectedVehicle.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Make</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{selectedVehicle.make}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Model</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{selectedVehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Year</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{selectedVehicle.year}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Type</p>
                  <p className="text-lg font-semibold text-black dark:text-white capitalize">{selectedVehicle.type}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Capacity</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{selectedVehicle.capacity.weight} kg</p>
                </div>
                {selectedVehicle.capacity.volume && (
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Volume</p>
                    <p className="text-lg font-semibold text-black dark:text-white">{selectedVehicle.capacity.volume} m³</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Fuel Type</p>
                  <p className="text-lg font-semibold text-black dark:text-white capitalize">{selectedVehicle.fuelType}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Ownership</p>
                  <p className="text-lg font-semibold text-black dark:text-white capitalize">{selectedVehicle.ownership}</p>
                </div>
                {selectedVehicle.assignedDriver && (
                  <div className="col-span-2">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Assigned Driver</p>
                    <p className="text-lg font-semibold text-black dark:text-white">{selectedVehicle.assignedDriver}</p>
                  </div>
                )}
              </div>
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
      {showDeleteModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
                <Trash2 className="text-red-600 dark:text-red-400" size={32} />
              </div>
              
              <h2 className="text-2xl font-bold text-black dark:text-white text-center mb-2">
                Delete Vehicle?
              </h2>
              
              <p className="text-zinc-600 dark:text-zinc-400 text-center mb-2">
                Are you sure you want to delete this vehicle?
              </p>

              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold text-black dark:text-white mb-1">
                  {selectedVehicle.registrationNumber}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                </p>
              </div>

              <p className="text-sm text-red-600 dark:text-red-400 text-center mt-4">
                This action cannot be undone.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex space-x-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedVehicle(null);
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
