'use client';

import { useState } from 'react';
import { Plus, Search, Wrench, Edit, Trash2, Eye, X, Calendar, Filter, AlertCircle, CheckCircle, Clock, XCircle, Truck, DollarSign, Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { useMaintenance } from '@/firebase/hooks/useMaintenance';
import { Maintenance } from '@/types';

interface MaintenanceLog {
  id: string;
  logId: string;
  vehicleId: string;
  vehicleName: string;
  vehicleNumber: string;
  type: 'routine' | 'repair' | 'inspection' | 'breakdown';
  category: 'engine' | 'brakes' | 'tires' | 'electrical' | 'body' | 'other';
  issueService: string;
  description: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  completedDate?: string;
  cost: {
    labor: number;
    parts: number;
    total: number;
  };
  serviceProvider: {
    name: string;
    contact?: string;
    location?: string;
  };
  mileage: number;
  performedBy?: string;
  notes?: string;
}

export default function MaintenancePage() {
  const { user } = useAuth();
  const {
    maintenanceRecords,
    loading,
    analytics,
    createMaintenance,
    deleteMaintenance,
  } = useMaintenance(user?.companyId);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicleName: '',
    vehicleNumber: '',
    issueService: '',
    type: 'repair' as MaintenanceLog['type'],
    category: 'engine' as MaintenanceLog['category'],
    description: '',
    status: 'scheduled' as MaintenanceLog['status'],
    scheduledDate: '',
    serviceProvider: '',
    serviceContact: '',
    serviceLocation: '',
    laborCost: '',
    partsCost: '',
    mileage: '',
    performedBy: '',
    notes: '',
  });

  // Use Firebase data instead of mock data
  const maintenanceLogs = maintenanceRecords as MaintenanceLog[];

  const toDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value.toDate) return value.toDate();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDate = (value: any, options?: Intl.DateTimeFormatOptions) => {
    const date = toDate(value);
    return date ? date.toLocaleDateString(undefined, options) : '—';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.companyId) return;
    
    const laborCost = parseFloat(formData.laborCost) || 0;
    const partsCost = parseFloat(formData.partsCost) || 0;
    
    const notesParts = [formData.notes, formData.issueService ? `Issue: ${formData.issueService}` : '']
      .filter(Boolean)
      .join('\n');

    try {
      await createMaintenance({
        companyId: user.companyId,
        vehicleId: formData.vehicleNumber || formData.vehicleName || 'unknown',
        type: formData.type,
        category: formData.category,
        description: formData.description,
        status: formData.status,
        priority: 'medium',
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : new Date(),
        serviceProvider: {
          name: formData.serviceProvider,
          contact: formData.serviceContact || undefined,
          location: formData.serviceLocation || undefined,
        },
        cost: {
          labor: laborCost,
          parts: partsCost,
          total: laborCost + partsCost,
          currency: 'INR',
        },
        mileage: parseFloat(formData.mileage) || 0,
        performedBy: formData.performedBy || undefined,
        notes: notesParts || undefined,
        // Extra UI fields preserved in Firestore
        vehicleName: formData.vehicleName,
        vehicleNumber: formData.vehicleNumber,
        issueService: formData.issueService,
      } as unknown as Maintenance);

      setShowNewServiceForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create maintenance record:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedLog) {
      try {
        await deleteMaintenance(selectedLog.id);
        setShowDeleteModal(false);
        setSelectedLog(null);
      } catch (error) {
        console.error('Failed to delete maintenance record:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleName: '',
      vehicleNumber: '',
      issueService: '',
      type: 'repair',
      category: 'engine',
      description: '',
      status: 'scheduled',
      scheduledDate: '',
      serviceProvider: '',
      serviceContact: '',
      serviceLocation: '',
      laborCost: '',
      partsCost: '',
      mileage: '',
      performedBy: '',
      notes: '',
    });
  };

  const filteredLogs = maintenanceLogs.filter(log => {
    const matchesSearch = 
      log.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.issueService.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.logId.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: MaintenanceLog['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: MaintenanceLog['status']) => {
    switch (status) {
      case 'scheduled': return <Clock size={16} />;
      case 'in-progress': return <AlertCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };



  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Wrench className="text-black dark:text-white" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white">Maintenance</h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">Keep your vehicles healthy and track all service records</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewServiceForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
            >
              <Plus size={20} />
              <span>New Service</span>
            </button>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <div className="mx-6 mt-6 lg:mx-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">Auto-Hide Rule:</p>
            <p>When you add a vehicle to a maintenance log, it automatically marks as "In Shop". This prevents dispatchers from accidentally assigning it to new trips while under service.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6 lg:p-8">
        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="Search by vehicle, issue, log ID..."
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
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-black dark:text-white mb-2">Service Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                >
                  <option value="all">All Types</option>
                  <option value="routine">Routine</option>
                  <option value="repair">Repair</option>
                  <option value="inspection">Inspection</option>
                  <option value="breakdown">Breakdown</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Total Logs</p>
            <p className="text-2xl font-bold text-black dark:text-white mt-1">{maintenanceLogs.length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {maintenanceLogs.filter(l => l.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {maintenanceLogs.filter(l => l.status === 'scheduled').length}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {maintenanceLogs.filter(l => l.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Maintenance Logs Table */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">Log ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">Vehicle</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">Issue/Service</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">Cost</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-black dark:text-white">#{log.logId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-black dark:text-white text-sm">{log.vehicleName}</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{log.vehicleNumber}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-black dark:text-white">{log.issueService}</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">{log.type}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1 text-sm text-black dark:text-white">
                        <Calendar size={14} className="text-zinc-400" />
                        <span>{formatDate(log.scheduledDate, { day: '2-digit', month: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <DollarSign size={14} className="text-zinc-400" />
                        <span className="text-sm font-semibold text-black dark:text-white">
                          {(log.cost.total / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        <span className="capitalize">{log.status.replace('-', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setShowViewModal(true);
                          }}
                          className="p-1 text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Wrench size={48} className="mx-auto text-zinc-400 mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">No maintenance logs found</p>
            </div>
          )}
        </div>
      </main>

      {/* New Service Form Modal */}
      {showNewServiceForm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowNewServiceForm(false);
              resetForm();
            }
          }}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-3xl w-full my-8 relative">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 rounded-t-xl flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center shrink-0">
                  <Wrench className="text-white dark:text-black" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">New Service</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">Add a new maintenance or service record</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNewServiceForm(false);
                  resetForm();
                }}
                type="button"
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors shrink-0 ml-4"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                  e.preventDefault();
                }
              }}
              className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">Vehicle Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Vehicle Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicleName"
                    value={formData.vehicleName}
                    onChange={handleInputChange}
                    placeholder="e.g., TATA Ace"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., MH 02 2017"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Current Mileage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    placeholder="e.g., 45000"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Scheduled Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                {/* Service Details */}
                <div className="md:col-span-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">Service Details</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Issue/Service <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="issueService"
                    value={formData.issueService}
                    onChange={handleInputChange}
                    placeholder="e.g., Engine Issue"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  >
                    <option value="routine">Routine</option>
                    <option value="repair">Repair</option>
                    <option value="inspection">Inspection</option>
                    <option value="breakdown">Breakdown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  >
                    <option value="engine">Engine</option>
                    <option value="brakes">Brakes</option>
                    <option value="tires">Tires</option>
                    <option value="electrical">Electrical</option>
                    <option value="body">Body</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the issue or service needed..."
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent resize-none"
                  />
                </div>

                {/* Service Provider */}
                <div className="md:col-span-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">Service Provider</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Provider Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="serviceProvider"
                    value={formData.serviceProvider}
                    onChange={handleInputChange}
                    placeholder="e.g., Auto Service Center"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="serviceContact"
                    value={formData.serviceContact}
                    onChange={handleInputChange}
                    placeholder="e.g., +1 234-567-8900"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="serviceLocation"
                    value={formData.serviceLocation}
                    onChange={handleInputChange}
                    placeholder="e.g., Mumbai"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                {/* Cost Information */}
                <div className="md:col-span-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">Cost Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Labor Cost
                  </label>
                  <input
                    type="number"
                    name="laborCost"
                    value={formData.laborCost}
                    onChange={handleInputChange}
                    placeholder="e.g., 5000"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Parts Cost
                  </label>
                  <input
                    type="number"
                    name="partsCost"
                    value={formData.partsCost}
                    onChange={handleInputChange}
                    placeholder="e.g., 5000"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                {/* Additional Information */}
                <div className="md:col-span-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">Additional Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Performed By
                  </label>
                  <input
                    type="text"
                    name="performedBy"
                    value={formData.performedBy}
                    onChange={handleInputChange}
                    placeholder="e.g., Mechanic A"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex space-x-3 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewServiceForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-semibold shadow-lg"
                >
                  Create Service Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedLog && (
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
                <div className="w-14 h-14 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                  <Wrench className="text-white dark:text-black" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">Maintenance Log #{selectedLog.logId}</h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedLog.vehicleNumber}</p>
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
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedLog.status)}`}>
                  {getStatusIcon(selectedLog.status)}
                  <span className="capitalize">{selectedLog.status.replace('-', ' ')}</span>
                </span>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white capitalize">
                  {selectedLog.type}
                </span>
              </div>

              {/* Vehicle Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-3">Vehicle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Vehicle</p>
                    <p className="text-base font-semibold text-black dark:text-white">{selectedLog.vehicleName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Registration Number</p>
                    <p className="text-base font-semibold text-black dark:text-white">{selectedLog.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Mileage</p>
                    <p className="text-base font-semibold text-black dark:text-white">{selectedLog.mileage.toLocaleString()} km</p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-3">Service Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Issue/Service</p>
                    <p className="text-base font-semibold text-black dark:text-white">{selectedLog.issueService}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Category</p>
                    <p className="text-base font-semibold text-black dark:text-white capitalize">{selectedLog.category}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Description</p>
                    <p className="text-base text-black dark:text-white">{selectedLog.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Scheduled Date</p>
                    <p className="text-base font-semibold text-black dark:text-white">
                      {formatDate(selectedLog.scheduledDate)}
                    </p>
                  </div>
                  {selectedLog.completedDate && (
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Completed Date</p>
                      <p className="text-base font-semibold text-black dark:text-white">
                        {formatDate(selectedLog.completedDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Provider */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-3">Service Provider</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Name</p>
                    <p className="text-base font-semibold text-black dark:text-white">{selectedLog.serviceProvider.name}</p>
                  </div>
                  {selectedLog.serviceProvider.contact && (
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Contact</p>
                      <p className="text-base font-semibold text-black dark:text-white">{selectedLog.serviceProvider.contact}</p>
                    </div>
                  )}
                  {selectedLog.serviceProvider.location && (
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Location</p>
                      <p className="text-base font-semibold text-black dark:text-white">{selectedLog.serviceProvider.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-black dark:text-white mb-3">Cost Breakdown</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Labor Cost</p>
                    <p className="text-xl font-bold text-black dark:text-white">₹{selectedLog.cost.labor.toLocaleString()}</p>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Parts Cost</p>
                    <p className="text-xl font-bold text-black dark:text-white">₹{selectedLog.cost.parts.toLocaleString()}</p>
                  </div>
                  <div className="bg-black dark:bg-white p-4 rounded-lg">
                    <p className="text-sm text-zinc-400 dark:text-zinc-600 mb-1">Total Cost</p>
                    <p className="text-xl font-bold text-white dark:text-black">₹{selectedLog.cost.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {(selectedLog.performedBy || selectedLog.notes) && (
                <div>
                  <h3 className="text-lg font-bold text-black dark:text-white mb-3">Additional Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedLog.performedBy && (
                      <div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Performed By</p>
                        <p className="text-base font-semibold text-black dark:text-white">{selectedLog.performedBy}</p>
                      </div>
                    )}
                    {selectedLog.notes && (
                      <div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Notes</p>
                        <p className="text-base text-black dark:text-white">{selectedLog.notes}</p>
                      </div>
                    )}
                  </div>
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
      {showDeleteModal && selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
                <Trash2 className="text-red-600 dark:text-red-400" size={32} />
              </div>
              
              <h2 className="text-2xl font-bold text-black dark:text-white text-center mb-2">
                Delete Maintenance Log?
              </h2>
              
              <p className="text-zinc-600 dark:text-zinc-400 text-center mb-2">
                Are you sure you want to delete this maintenance record?
              </p>

              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold text-black dark:text-white mb-1">
                  Log #{selectedLog.logId}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {selectedLog.vehicleNumber} - {selectedLog.issueService}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Cost: ₹{selectedLog.cost.total.toLocaleString()}
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
                  setSelectedLog(null);
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
