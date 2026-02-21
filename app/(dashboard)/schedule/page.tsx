'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Loader2, Eye, Trash2, X, Filter, Calendar, Clock, Users } from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { useSchedule } from '@/firebase/hooks/useSchedule';
import { Shift, ShiftStatus } from '@/types';

export default function SchedulePage() {
  const { user } = useAuth();
  const { shifts, loading, error, createShift, updateShift, deleteShift } = useSchedule(user?.companyId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    driverId: '',
    startTime: '09:00',
    endTime: '17:00',
    date: new Date().toISOString().split('T')[0],
    status: 'scheduled' as ShiftStatus,
    notes: '',
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
      const [startHour, startMin] = formData.startTime.split(':');
      const [endHour, endMin] = formData.endTime.split(':');
      
      const startDate = new Date(formData.date);
      startDate.setHours(parseInt(startHour), parseInt(startMin), 0);
      
      const endDate = new Date(formData.date);
      endDate.setHours(parseInt(endHour), parseInt(endMin), 0);

      await createShift({
        companyId: user.companyId,
        driverId: formData.driverId,
        startTime: startDate,
        endTime: endDate,
        status: formData.status,
        notes: formData.notes,
        createdAt: new Date(),
      } as any);

      setShowAddModal(false);
      setFormData({
        driverId: '',
        startTime: '09:00',
        endTime: '17:00',
        date: new Date().toISOString().split('T')[0],
        status: 'scheduled',
        notes: '',
      });
    } catch (err) {
      console.error('Error creating shift:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedShift) {
      setIsSubmitting(true);
      try {
        await deleteShift(selectedShift.id);
        setShowDeleteModal(false);
        setSelectedShift(null);
      } catch (err) {
        console.error('Error deleting shift:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = formData.driverId === '' || shift.driverId === formData.driverId;
    return matchesSearch;
  });

  const getStatusColor = (status: ShiftStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWeekDays = () => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(start.getTime() + i * 24 * 60 * 60 * 1000));
    }
    return days;
  };

  const toDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value.toDate) return value.toDate();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatTime = (date: Date | any) => {
    const d = toDate(date);
    if (!d) return '—';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date | any) => {
    const d = toDate(date);
    if (!d) return '—';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const weekDays = getWeekDays();

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 pl-16 lg:pl-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Schedule</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage driver shifts and work schedules</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium">
              <Plus size={20} />
              <span>Add Shift</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">{error}</div>}

        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'week' ? 'bg-black dark:bg-white text-white dark:text-black' : 'border border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'day' ? 'bg-black dark:bg-white text-white dark:text-black' : 'border border-zinc-300 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              Day
            </button>
          </div>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Total Shifts</p>
            <p className="text-2xl font-bold text-black dark:text-white mt-1">{shifts.length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{shifts.filter(s => s.status === 'scheduled').length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">In Progress</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{shifts.filter(s => s.status === 'in_progress').length}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{shifts.filter(s => s.status === 'completed').length}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={48} className="mx-auto animate-spin text-zinc-400 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">Loading schedule...</p>
          </div>
        ) : viewMode === 'week' ? (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
            <div className="grid grid-cols-8 min-w-max">
              <div className="p-4 border-r border-zinc-200 dark:border-zinc-800 font-semibold text-black dark:text-white">Time</div>
              {weekDays.map((day, i) => (
                <div key={i} className="p-4 border-r border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="font-semibold text-black dark:text-white text-sm">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-8 min-w-max border-t border-zinc-200 dark:border-zinc-800">
              {Array.from({ length: 24 }).map((_, hour) => (
                <div key={hour} className="border-r border-zinc-200 dark:border-zinc-800 p-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {hour}:00
                </div>
              ))}
              {weekDays.map((day, dayIdx) => (
                <div key={dayIdx} className="border-r border-zinc-200 dark:border-zinc-800 relative">
                  {filteredShifts
                    .filter((shift) => {
                      const shiftDate = toDate(shift.startTime);
                      if (!shiftDate) return false;
                      return shiftDate.toDateString() === day.toDateString();
                    })
                    .map((shift) => {
                      const shiftStart = toDate(shift.startTime);
                      const shiftEnd = toDate(shift.endTime);
                      if (!shiftStart || !shiftEnd) return null;
                      const startHour = shiftStart.getHours();
                      const duration = (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);
                      return (
                        <div
                          key={shift.id}
                          onClick={() => {
                            setSelectedShift(shift);
                            setShowViewModal(true);
                          }}
                          style={{ top: `${startHour * 40}px`, height: `${duration * 40}px` }}
                          className={`absolute left-0 right-0 p-1 text-xs font-semibold cursor-pointer rounded mx-1 ${getStatusColor(shift.status)} `}
                        >
                          <p className="truncate">{formatTime(shift.startTime)}</p>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShifts
              .filter((shift) => {
                const shiftDate = toDate(shift.startTime);
                return shiftDate ? shiftDate.toDateString() === selectedDate.toDateString() : false;
              })
              .map((shift) => (
                <div key={shift.id} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-black dark:text-white">Driver #{shift.driverId.slice(0, 8)}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                          <Clock size={16} /> {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shift.status)}`}>{shift.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex space-x-2 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => { setSelectedShift(shift); setShowViewModal(true); }} className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm">
                      <Eye size={16} /> <span>View</span>
                    </button>
                    <button onClick={() => { setSelectedShift(shift); setShowDeleteModal(true); }} className="px-3 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            {filteredShifts.filter((shift) => {
              const shiftDate = toDate(shift.startTime);
              return shiftDate ? shiftDate.toDateString() === selectedDate.toDateString() : false;
            }).length === 0 && (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-zinc-400 mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400">No shifts scheduled for this day</p>
              </div>
            )}
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-black dark:text-white">New Shift</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">Driver ID *</label>
                  <input type="text" name="driverId" value={formData.driverId} onChange={handleInputChange} placeholder="Enter driver ID" required className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">Date *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} required className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-black dark:text-white mb-2">Start Time</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black dark:text-white mb-2">End Time</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} required className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black dark:text-white mb-2">Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Add shift notes..." rows={3} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
                </div>
              </div>

              <div className="flex space-x-3 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-2 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedShift && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-black dark:text-white">Shift Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Driver ID</p>
                <p className="text-lg font-semibold text-black dark:text-white">{selectedShift.driverId}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Start Time</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{formatTime(selectedShift.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">End Time</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{formatTime(selectedShift.endTime)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Date</p>
                <p className="text-lg font-semibold text-black dark:text-white">{formatDate(selectedShift.startTime)}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedShift.status)}`}>{selectedShift.status.replace('_', ' ')}</span>
              </div>
              {selectedShift.notes && (
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Notes</p>
                  <p className="text-black dark:text-white">{selectedShift.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedShift && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
                <Trash2 className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-black dark:text-white text-center mb-2">Delete Shift?</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-center mb-4">This action cannot be undone.</p>
            </div>
            <div className="flex space-x-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
              <button onClick={() => { setShowDeleteModal(false); setSelectedShift(null); }} className="flex-1 px-6 py-2 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold">Cancel</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50">{isSubmitting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
