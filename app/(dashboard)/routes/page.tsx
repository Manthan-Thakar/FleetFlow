'use client';

import { useState } from 'react';
import { Plus, Search, MapPin, Loader2, Eye, Trash2, X, Filter, Clock, Package } from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { useRoutes } from '@/firebase/hooks/useRoutes';
import { Route, RouteStatus } from '@/types';

export default function RoutesPage() {
  const { user } = useAuth();
  const { routes, loading, error, createRoute, updateRoute, deleteRoute } = useRoutes(user?.companyId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waypointCount, setWaypointCount] = useState(2);
  const [formData, setFormData] = useState({
    name: '',
    status: 'planned' as RouteStatus,
    assignedDriverId: '',
    assignedVehicleId: '',
    distance: '',
    estimatedDuration: '',
    orders: [] as string[],
    waypoints: [] as any[],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.companyId) return;

    setIsSubmitting(true);
    try {
      // Build waypoints from form inputs
      const waypoints = [];
      for (let i = 0; i < waypointCount; i++) {
        const locationInput = document.querySelector(`input[name="stop_${i}_location"]`) as HTMLInputElement;
        const durationInput = document.querySelector(`input[name="stop_${i}_duration"]`) as HTMLInputElement;
        if (locationInput?.value) {
          waypoints.push({
            address: locationInput.value,
            latitude: 0, // These would come from geocoding
            longitude: 0,
            sequenceNumber: i + 1,
            stopDuration: durationInput?.value ? parseInt(durationInput.value) : undefined,
          });
        }
      }

      // Get origin and destination from first and last waypoints
      const originLocation = waypoints[0] || { address: '', latitude: 0, longitude: 0 };
      const destinationLocation = waypoints[waypoints.length - 1] || { address: '', latitude: 0, longitude: 0 };

      await createRoute({
        companyId: user.companyId,
        name: formData.name,
        status: formData.status,
        origin: originLocation,
        destination: destinationLocation,
        waypoints: waypoints.length > 2 ? waypoints.slice(1, -1) : undefined,
        distance: parseFloat(formData.distance) || 0,
        estimatedDuration: parseFloat(formData.estimatedDuration) || 0,
        assignedDriverId: formData.assignedDriverId || undefined,
        assignedVehicleId: formData.assignedVehicleId || undefined,
        orders: formData.orders,
        optimized: false,
        scheduledStartTime: new Date(),
      } as any);

      setShowAddModal(false);
      setFormData({
        name: '',
        status: 'planned',
        assignedDriverId: '',
        assignedVehicleId: '',
        distance: '',
        estimatedDuration: '',
        orders: [],
        waypoints: [],
      });
      setWaypointCount(2);
    } catch (err) {
      console.error('Error creating route:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedRoute) {
      setIsSubmitting(true);
      try {
        await deleteRoute(selectedRoute.id);
        setShowDeleteModal(false);
        setSelectedRoute(null);
      } catch (err) {
        console.error('Error deleting route:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch =
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: RouteStatus) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Routes</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">Plan and manage delivery routes</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium">
              <Plus size={20} />
              <span>New Route</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">{error}</div>}

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
            <input type="text" placeholder="Search routes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Filter size={20} /> <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-black dark:text-white mb-2">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                <option value="all">All Status</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Total Routes</p>
            <p className="text-2xl font-bold text-black dark:text-white mt-1">{routes.length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Planned</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{routes.filter(r => r.status === 'planned').length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">In Progress</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{routes.filter(r => r.status === 'in-progress').length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{routes.filter(r => r.status === 'completed').length}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={48} className="mx-auto animate-spin text-zinc-400 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">Loading routes...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredRoutes.map((route) => (
                <div key={route.id} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-black dark:text-white">{route.name}</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{route.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(route.status)}`}>{route.status.replace('_', ' ')}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin size={16} className="text-zinc-600 dark:text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-400">{route.waypoints?.length || 0} stops</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Package size={16} className="text-zinc-600 dark:text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-400">{route.orders?.length || 0} orders</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock size={16} className="text-zinc-600 dark:text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-400">{route.estimatedDuration}h</span>
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {route.distance} km
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => { setSelectedRoute(route); setShowViewModal(true); }} className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm">
                      <Eye size={16} /> <span>View</span>
                    </button>
                    <button onClick={() => { setSelectedRoute(route); setShowDeleteModal(true); }} className="px-3 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredRoutes.length === 0 && (
              <div className="text-center py-12">
                <MapPin size={48} className="mx-auto text-zinc-400 mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400">No routes found</p>
              </div>
            )}
          </>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-3xl w-full my-8">
            <div className="sticky top-0 bg-white dark:bg-zinc-900 rounded-t-xl flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-black dark:text-white">New Route</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">Route Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Downtown Delivery Route" required className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">Description</label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Route details are automatically generated from waypoints and assignment data.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black dark:text-white mb-2">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                      <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black dark:text-white mb-2">Distance (km)</label>
                    <input type="number" name="distance" value={formData.distance} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black dark:text-white mb-2">Duration (hours)</label>
                    <input type="number" name="estimatedDuration" value={formData.estimatedDuration} onChange={handleInputChange} placeholder="0" step="0.5" className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-black dark:text-white">Route Stops</label>
                    <button
                      type="button"
                      onClick={() => setWaypointCount(waypointCount + 1)}
                      className="text-sm px-2 py-1 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      Add Stop
                    </button>
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: waypointCount }).map((_, i) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          name={`stop_${i}_location`}
                          placeholder={`Stop ${i + 1} Address`}
                          className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                        <input
                          type="text"
                          name={`stop_${i}_note`}
                          placeholder="Delivery notes (optional)"
                          className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-2 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Route'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedRoute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowViewModal(false); }}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-2xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-black dark:text-white">{selectedRoute.name}</h2>
              <button onClick={() => setShowViewModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRoute.status)}`}>{selectedRoute.status.replace('_', ' ')}</span>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Description</p>
                <p className="text-black dark:text-white">{selectedRoute.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Distance</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{selectedRoute.distance} km</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Duration</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{selectedRoute.estimatedDuration}h</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Stops</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{selectedRoute.waypoints?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Orders</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{selectedRoute.orders?.length || 0}</p>
                </div>
              </div>
              {selectedRoute.waypoints && selectedRoute.waypoints.length > 0 && (
                <div>
                  <h3 className="font-semibold text-black dark:text-white mb-3">Route Stops</h3>
                  <div className="space-y-2">
                    {selectedRoute.waypoints.map((waypoint, idx) => (
                      <div key={idx} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm">
                        <p className="font-semibold text-black dark:text-white">{waypoint.sequenceNumber}. {waypoint.address}</p>
                        {waypoint.stopDuration && <p className="text-zinc-600 dark:text-zinc-400">Duration: {waypoint.stopDuration} min</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedRoute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
                <Trash2 className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-black dark:text-white text-center mb-2">Delete Route?</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-center mb-4">This action cannot be undone.</p>
            </div>
            <div className="flex space-x-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button onClick={() => { setShowDeleteModal(false); setSelectedRoute(null); }} className="flex-1 px-6 py-2 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold">Cancel</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50">{isSubmitting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
